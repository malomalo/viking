import * as Backbone from 'backbone';
import * as _ from 'underscore';

import { urlError } from './errors';
import { Name } from './model/name';
import { Reflection } from './model/reflection';
import { BelongsToReflection } from './model/reflections/belongs_to_reflection';
import { HasAndBelongsToManyReflection } from './model/reflections/has_and_belongs_to_many_reflection';
import { HasManyReflection } from './model/reflections/has_many_reflection';
import { HasOneReflection } from './model/reflections/has_one_reflection';
import { Type } from './model/type';
import * as string from './support/string';
import { sync } from './sync';

// Viking.Model
// ------------
//
// Viking.Model is an extension of [Backbone.Model](http://backbonejs.org/#Model).
// It adds naming, relationships, data type coercions, selection, and modifies
// sync to work with [Ruby on Rails](http://rubyonrails.org/) out of the box.
export const Model = Backbone.Model.extend({

    abstract: true,

    // inheritanceAttribute is the attirbutes used for STI
    inheritanceAttribute: 'type',

    defaults: function () {
        var dflts = {};

        _.each(this.schema, function (options, key) {
            if (options['default']) {
                dflts[key] = options['default'];
            }
        });

        return dflts;
    },

    // Below is the same code from the Backbone.Model function
    // except where there are comments
    constructor: function (attributes, options) {
        var attrs = attributes || {};
        options || (options = {});
        this.cid = _.uniqueId('c');
        this.attributes = {};

        attrs = _.defaults({}, attrs, _.result(this, 'defaults'));

        if (this.inheritanceAttribute) {
            if (attrs[this.inheritanceAttribute] && this.constructor.modelName.name !== attrs[this.inheritanceAttribute]) {
                // OPTIMIZE:  Mutating the [[Prototype]] of an object, no matter how
                // this is accomplished, is strongly discouraged, because it is very
                // slow and unavoidably slows down subsequent execution in modern
                // JavaScript implementations
                // Ideas: Move to Model.new(...) method of initializing models
                const type = string.constantize(
                    string.camelize(attrs[this.inheritanceAttribute])
                );
                this.constructor = type;
                this.__proto__ = type.prototype;
            }
        }

        // Add a helper reference to get the model name from an model instance.
        this.modelName = this.constructor.modelName;
        this.baseModel = this.constructor.baseModel;

        if (this.baseModel && this.modelName && this.inheritanceAttribute) {
            if (this.baseModel === this.constructor && this.baseModel.descendants.length > 0) {
                attrs[this.inheritanceAttribute] = this.modelName.name;
            } else if (_.contains(this.baseModel.descendants, this.constructor)) {
                attrs[this.inheritanceAttribute] = this.modelName.name;
            }
        }

        // Set up associations
        this.associations = this.constructor.associations;
        this.reflectOnAssociation = this.constructor.reflectOnAssociation;
        this.reflectOnAssociations = this.constructor.reflectOnAssociations;

        // Initialize any `hasMany` relationships to empty collections
        this.reflectOnAssociations('hasMany').forEach((association) => {
            this.attributes[association.name] = new (association.collection())();
        });

        if (options.collection) { this.collection = options.collection; }
        if (options.parse) { attrs = this.parse(attrs, options) || {}; }

        this.set(attrs, options);
        this.changed = {};
        this.initialize.call(this, attributes, options);
    },

    coerceAttributes: function (attrs) {
        var that = this;
        _.each(this.associations, function (association: any) {
            var Type;
            var polymorphic = association.options.polymorphic;

            if (!attrs[association.name]) { return; }

            if (polymorphic && (attrs[association.name] instanceof Model)) {
                // TODO: remove setting the id?
                attrs[association.name + '_id'] = attrs[association.name].id;
                attrs[association.name + '_type'] = attrs[association.name].modelName.name;
            } else if (polymorphic && attrs[association.name + '_type']) {
                Type = string.constantize(string.camelize(attrs[association.name + '_type']));
                attrs[association.name] = new Type(attrs[association.name]);
            } else if (!(attrs[association.name] instanceof association.klass())) {
                Type = association.klass();
                attrs[association.name] = new Type(attrs[association.name]);
            }
        });

        _.each(this.schema, function (options, key) {
            if (attrs[key] || attrs[key] === false) {
                var tmp, klass;

                klass = Type.registry[options['type']];

                if (klass) {
                    if (options['array']) {
                        tmp = [];
                        _.each(attrs[key], function (value) {
                            tmp.push(klass.load(value, key));
                        });
                        attrs[key] = tmp;
                    } else {
                        attrs[key] = klass.load(attrs[key], key);
                        if (attrs[key] instanceof Model) {
                            that.listenTo(attrs[key], 'change', function () {
                                that.trigger('change', arguments);
                            })
                        }
                    }
                } else {
                    throw new TypeError("Coercion of " + options['type'] + " unsupported");
                }
            }
        });

        return attrs;
    },

    // TODO: testme
    errorsOn: function (attribute) {
        if (this.validationError) {
            return this.validationError[attribute];
        }

        return false;
    },

    // Returns string to use for params names. This is the key attributes from
    // the model will be namespaced under when saving to the server
    paramRoot: function () {
        return this.baseModel.modelName.paramKey;
    },

    // Overwrite Backbone.Model#save so that we can catch errors when a save
    // fails.
    save: function (key, val, options) {
        var attrs, method, xhr, attributes = this.attributes;

        // Handle both `"key", value` and `{key: value}` -style arguments.
        if (key == null || typeof key === 'object') {
            attrs = key;
            options = val;
        } else {
            (attrs = {})[key] = val;
        }

        options = _.extend({ validate: true }, options);

        // If we're not waiting and attributes exist, save acts as
        // `set(attr).save(null, opts)` with validation. Otherwise, check if
        // the model will be valid when the attributes, if any, are set.
        if (attrs && !options.wait) {
            if (!this.set(attrs, options)) { return false; }
        } else {
            if (!this._validate(attrs, options)) { return false; }
        }

        // Set temporary attributes if `{wait: true}`.
        if (attrs && options.wait) {
            this.attributes = _.extend({}, attributes, attrs);
        }

        // After a successful server-side save, the client is (optionally)
        // updated with the server-side state.
        if (options.parse === void 0) { options.parse = true; }
        var model = this;
        var success = options.success;
        options.success = function (resp) {
            // Ensure attributes are restored during synchronous saves.
            model.attributes = attributes;
            var serverAttrs = model.parse(resp, options);
            if (options.wait) { serverAttrs = _.extend(attrs || {}, serverAttrs); }
            if (_.isObject(serverAttrs) && !model.set(serverAttrs, options)) {
                return false;
            }
            if (success) { success(model, resp, options); }
            model.trigger('sync', model, resp, options);
        };

        // replacing #wrapError(this, options) with custom error handling to
        // catch and throw invalid events
        var error = options.error;
        options.error = function (resp) {
            if (resp.status === 400) {
                var errors = JSON.parse(resp.responseText).errors;
                if (options.invalid) {
                    options.invalid(model, errors, options);
                }
                model.setErrors(errors, options);
            } else {
                if (error) { error(model, resp, options); }
                model.trigger('error', model, resp, options);
            }
        };

        method = this.isNew() ? 'create' : (options.patch ? 'patch' : 'update');
        if (method === 'patch') { options.attrs = attrs; }
        xhr = this.sync(method, this, options);

        // Restore attributes.
        if (attrs && options.wait) { this.attributes = attributes; }

        return xhr;
    },

    // select(options)
    // select(value[, options])
    //
    // When the model is part of a collection and you want to select a single
    // or multiple items from a collection. If a model is selected
    // `model.selected` will be set `true`, otherwise it will be `false`.
    //
    // If you pass `true` or `false` as the first paramater to `select` it will
    // select the model if true, or unselect if it is false.
    //
    // By default any other models in the collection with be unselected. To
    // prevent other models in the collection from being unselected you can
    // pass `{multiple: true}` as an option.
    //
    // The `selected` and `unselected` events are fired when appropriate.
    select: function (value, options) {

        // Handle both `value[, options]` and `options` -style arguments.
        if (value === undefined || typeof value === 'object') {
            options = value;
            value = true;
        }

        if (value === true) {
            if (this.collection) {
                this.collection.select(this, options);
            } else {
                this.selected = true;
            }
        } else {
            if (this.selected) {
                this.selected = false;
                this.trigger('unselected', this);
            }
        }
    },

    set: function (key, val, options) {
        if (key === null) { return this; }

        // Handle both `"key", value` and `{key: value}` -style arguments.
        var attrs;
        if (typeof key === 'object') {
            attrs = key;
            options = val;
        } else {
            (attrs = {})[key] = val;
        }

        options || (options = {});

        if (this.inheritanceAttribute && attrs[this.inheritanceAttribute] && this.constructor.modelName.name !== attrs.type) {
            // OPTIMIZE:  Mutating the [[Prototype]] of an object, no matter how
            // this is accomplished, is strongly discouraged, because it is very
            // slow and unavoidably slows down subsequent execution in modern
            // JavaScript implementations
            // Ideas: Move to Model.new(...) method of initializing models
            const type = string.constantize(string.camelize(attrs[this.inheritanceAttribute]));
            this.constructor = type;
            this.__proto__ = type.prototype;
            this.modelName = type.modelName;

            // TODO: move to function, used in Model.new
            // TODO: probably move to a becomes method
            // Set up associations
            this.associations = this.constructor.associations;
            this.reflectOnAssociation = this.constructor.reflectOnAssociation;
            this.reflectOnAssociations = this.constructor.reflectOnAssociations;

            // Initialize any `hasMany` relationships to empty collections
            _.each(this.reflectOnAssociations('hasMany'), (association: any) => {
                if (!this.attributes[association.name]) {
                    this.attributes[association.name] = new (association.collection())();
                }
            });
        }

        this.coerceAttributes(attrs);
        _.each(attrs, (value: any, key: string) => {
            var association = this.reflectOnAssociation(key);
            if (association && association.macro === 'hasMany') {
                if (!value) {
                    this.attributes[key].set([]);
                } else {
                    this.attributes[key].set(value.models);
                    _.each(value.models, (model: any) => {
                        model.collection = this.attributes[key];
                    });
                }

                delete attrs[key];
            } else if (association && association.macro == 'belongsTo') {
                if (!value) {
                    options.unset ? delete this.attributes[key + '_id'] : this.attributes[key + '_id'] = value;
                } else {
                    this.attributes[key + '_id'] = value.id;
                }
            }
        });

        return Backbone.Model.prototype.set.call(this, attrs, options);
    },

    setErrors: function (errors, options) {
        if (_.size(errors) === 0) { return; }

        var model = this;
        this.validationError = errors;

        model.trigger('invalid', this, errors, options);
    },

    // Override [Backbone.Model#sync](http://backbonejs.org/#Model-sync).
    // [Ruby on Rails](http://rubyonrails.org/) expects the attributes to be
    // namespaced
    sync: function (method, model, options: any = {}) {
        if (!options.data && (method === 'create' || method === 'update' || method === 'patch')) {
            options.contentType = 'application/json';
            options.data = {};
            options.data[_.result(model, 'paramRoot')] = (options.attrs || model.toJSON(options));
            options.data = JSON.stringify(options.data);
        }

        return sync.call(this, method, model, options);
    },

    // similar to Rails as_json method
    toJSON: function (options) {
        var data = _.clone(this.attributes);

        if (options === undefined) { options = {}; }

        if (options.include) {
            if (typeof options.include === 'string') {
                var key = options.include;
                options.include = {};
                options.include[key] = {};
            } else if (_.isArray(options.include)) {
                var array = options.include;
                options.include = {};
                _.each(array, function (key: string) {
                    options.include[key] = {};
                });
            }
        } else {
            options.include = {};
        }

        _.each(this.associations, function (association: any) {
            if (!options.include[association.name]) {
                delete data[association.name];
                if (association.macro === 'belongsTo' && data[association.name + '_id'] === undefined) {
                    delete data[association.name + '_id'];
                }
            } else if (association.macro === 'belongsTo' || association.macro === 'hasOne') {
                if (data[association.name]) {
                    data[association.name + '_attributes'] = data[association.name].toJSON(options.include[association.name]);
                    delete data[association.name];
                    delete data[association.name + '_id'];
                } else if (data[association.name] === null) {
                    data[association.name + '_attributes'] = null;
                    delete data[association.name];
                    delete data[association.name + '_id'];
                }
            } else if (association.macro === 'hasMany') {
                if (data[association.name]) {
                    data[association.name + '_attributes'] = data[association.name].toJSON(options.include[association.name]);
                    delete data[association.name];
                }
            }
        });

        _.each(this.schema, function (options: any, key: string) {
            if (data[key] || data[key] === false) {
                var tmp, klass;

                klass = Type.registry[options.type];

                if (klass) {
                    if (options.array) {
                        tmp = [];
                        _.each(data[key], function (value) {
                            tmp.push(klass.dump(value, key));
                        });
                        data[key] = tmp;
                    } else {
                        data[key] = klass.dump(data[key], key);
                    }
                } else {
                    throw new TypeError("Coercion of " + options.type + " unsupported");
                }
            }
        });

        return data;
    },

    // Returns a string representing the object's key suitable for use in URLs,
    // or nil if `#isNew` is true.
    toParam: function () {
        return this.isNew() ? null : this.get('id');
    },

    // Saves the record with the updated_at and any attributes passed in to the
    // current time.
    //
    // The JSON response is expected to return an JSON object with the attribute
    // name and the new time. Any other attributes returned in the JSON will be
    // updated on the Model as well
    //
    // TODO:
    // Note that `#touch` must be used on a persisted object, or else an
    // Viking.Model.RecordError will be thrown.
    touch: function (columns, options) {
        var now = new Date();

        var attrs = {
            updated_at: now
        }

        options = _.extend({ patch: true }, options);

        if (_.isArray(columns)) {
            _.each(columns, function (column) {
                attrs[column] = now;
            });
        } else if (columns) {
            attrs[columns] = now;
        }

        return this.save(attrs, options);
    },

    // Opposite of #select. Triggers the `unselected` event.
    unselect: function (options) {
        this.select(false, options);
    },

    updateAttribute: function (key, value, options) {
        var data = {};
        data[key] = value;

        return this.updateAttributes(data, options);
    },

    updateAttributes: function (data, options) {
        options || (options = {});
        options.patch = true;

        return this.save(data, options);
    },

    // Default URL for the model's representation on the server
    url: function () {
        var base =
            _.result(this, 'urlRoot') ||
            _.result(this.collection, 'url') ||
            urlError();

        if (this.isNew()) return base;

        return base.replace(/([^\/])$/, '$1/') + this.toParam();
    },

    // Alias for `::urlRoot`
    urlRoot: function () {
        return this.constructor.urlRoot();
    },

}, {

        associations: [],

        // Overide the default extend method to support passing in the modelName
        // and support STI
        //
        // The modelName is used for generating urls and relationships.
        //
        // If a Model is extended further is acts simlar to ActiveRecords STI.
        //
        // `name` is optional, and must be a string
        extend: function (name, protoProps, staticProps) {
            if (typeof name !== 'string') {
                staticProps = protoProps;
                protoProps = name;
                name = '';
            }
            protoProps || (protoProps = {});

            var child = Backbone.Model.extend.call(this, protoProps, staticProps);

            if (typeof name === 'string') {
                child.modelName = new Name(name);
            }

            child.associations = {};
            child.descendants = [];
            child.inheritanceAttribute = (protoProps.inheritanceAttribute === undefined) ? this.prototype.inheritanceAttribute : protoProps.inheritanceAttribute;

            if (child.inheritanceAttribute === false || (this.prototype.hasOwnProperty('abstract') && this.prototype.abstract)) {
                child.baseModel = child;
            } else {
                child.baseModel.descendants.push(child);
            }

            let that = this.prototype;
            ['belongsTo', 'hasOne', 'hasMany', 'hasAndBelongsToMany'].forEach((macro) => {
                _.each((protoProps[macro] || []).concat(that[macro] || []), (name: string) => {
                    let options;

                    // Handle both `type, key, options` and `type, [key, options]` style arguments
                    if (_.isArray(name)) {
                        options = name[1];
                        name = name[0];
                    }

                    if (!child.associations[name]) {
                        let reflectionClass = {
                            'belongsTo': BelongsToReflection,
                            'hasOne': HasOneReflection,
                            'hasMany': HasManyReflection,
                            'hasAndBelongsToMany': HasAndBelongsToManyReflection
                        }[macro];

                        child.associations[name] = new reflectionClass(name, options);
                    }
                });
            });

            if (this.prototype.schema && protoProps.schema) {
                _.each(this.prototype.schema, function (value, key) {
                    if (!child.prototype.schema[key]) {
                        child.prototype.schema[key] = value;
                    }
                });
            }


            return child;
        },

        // Create a model with +attributes+. Options are the 
        // same as Viking.Model#save
        create: function (attributes, options) {
            var model = new this(attributes);
            model.save(null, options);
            return model;
        },

        // Find or create model by attributes. Accepts success callbacks in the
        // options hash, which is passed (model) as arguments.
        //
        // findOrCreateBy returns the model, however it most likely won't have fetched
        // the data	from the server if you immediately try to use attributes of the
        // model.
        findOrCreateBy: function (attributes, options) {
            var klass = this;
            klass.where(attributes).fetch({
                success: function (modelCollection) {
                    var model = modelCollection.models[0];
                    if (model) {
                        if (options && options.success) options.success(model);
                    } else {
                        klass.create(attributes, options);
                    }
                }
            });
        },

        // Find model by id. Accepts success and error callbacks in the options
        // hash, which are both passed (model, response, options) as arguments.
        //
        // Find returns the model, however it most likely won't have fetched the
        // data	from the server if you immediately try to use attributes of the
        // model.
        find: function (id, options) {
            var model = new this({ id: id });
            model.fetch(options);
            return model;
        },

        reflectOnAssociation: function (name) {
            return this.associations[name];
        },

        reflectOnAssociations: function (macro) {
            var associations = _.values(this.associations);
            if (macro) {
                associations = _.select(associations, function (a) {
                    return a.macro === macro;
                });
            }

            return associations;
        },

        // Generates the `urlRoot` based off of the model name.
        urlRoot: function () {
            if (this.prototype.hasOwnProperty('urlRoot')) {
                return _.result(this.prototype, 'urlRoot')
            } else if (this.baseModel.prototype.hasOwnProperty('urlRoot')) {
                return _.result(this.baseModel.prototype, 'urlRoot')
            } else {
                return "/" + this.baseModel.modelName.plural;
            }
        },

        // Returns a unfetched collection with the predicate set to the query
        where: function (options) {
            // TODO: Move to modelName as well?
            var Collection = string.constantize(this.modelName.name + 'Collection');

            return new Collection(undefined, { predicate: options });
        }

    }
);

export {
    Name,
    Reflection,
    BelongsToReflection,
    HasAndBelongsToManyReflection,
    HasManyReflection,
    HasOneReflection,
    Type
}; 