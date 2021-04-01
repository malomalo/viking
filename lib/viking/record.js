import * as Errors from './errors';
import EventBus from './eventBus';
import {each, result, uniqueId, isEqual, deepAssign} from './support';
import { Name } from './record/name';
// import { Reflection } from './model/reflection';
// import { BelongsToReflection } from './model/reflections/belongs_to_reflection';
// import { HasAndBelongsToManyReflection } from './model/reflections/has_and_belongs_to_many_reflection';
// import { HasManyReflection } from './model/reflections/has_many_reflection';
// import { HasOneReflection } from './model/reflections/has_one_reflection';
import Types from './record/types';
import Relation from './record/relation';
import { Connection } from './record/connection';
import * as string from './support/string';
import { Reflection } from './record/reflection';


// export interface IModelAttributes {
//     [propName: string]: any;
// }
//
// export interface IModelOptions {
// }
//
// export interface IModelSchema {
//     [propName: string]: {
//         type?: string;
//         array?: boolean;
//         default?: any;
//     };
// }

// Viking.Record
// ------------
//
// Viking.Model is an extension of [Backbone.Model](http://backbonejs.org/#Model).
// It adds naming, relationships, data type coercions, selection, and modifies
// sync to work with [Ruby on Rails](http://rubyonrails.org/) out of the box.
//
// Events
// ------
//  | event                 | arguments    | description |
//  | -----                 | -----------  | ----------- |
//  |onadd|association|record is about to be added to an association
//  |added|association|record has been added to an association
//  |onremove|association|record is about to be removed from an association
//  |removed|association|record has been removed from an association
//  |invalid|errors|record has failed to save because it is invalid
//  | onsave                 | record, changes | record has successfully saved |
//  | saved                 | record, changes | record has successfully saved |
//  | saved:[attribute]     | record, oldValue, newValue |
//  | changed                | record, changes |
//  | changed:[attribute]    | record, oldValue, newValue |
//  |ondestroy||record is about to request to destroy
//  |destroyed||record has successfully destroed to api
//  | *                     | event_name, record, ...arguments |
export default class Record extends EventBus {

    static connection = null; // : Connection | null = null;
    static namespace = null;
    static associations = [];//: (typeof Reflection)[] = [];
    static descendants = [];

    static abstract = true//: boolean = true;
    static primaryKey = 'id'//: string = 'id';
    static schema; //: IModelSchema;
    static cidPrefix = 'm';//: string = 'm';

    // inheritanceAttribute is the attirbutes used for STI
    static inheritanceAttribute = 'type';//: string | boolean = 'type';

    static _modelName;//: Name | undefined;

    static path;//: undefined | string;
    
    static initializeAssociations() {
        if (!this.hasOwnProperty('_associations')) {
            this._associations = {};
            this.associations.forEach((association) => {
                association = new association.reflection(...association.args);
                this._associations[association.name] = association;
            });
        }
    }
    
    static reflectOnAssociation(name) {
        this.initializeAssociations();
        return this._associations[name];
    }
    
    static reflectOnAllAssociations() {
        this.initializeAssociations();
        return Object.values(this._associations);
    }

    static getInheritanceAttribute() {
        if (this.hasOwnProperty('inheritanceAttribute')) {
            return this.inheritanceAttribute;
        } else {
            return 'type';
        }
    }

    // static modelName(): Name
    static modelName() {
        if (!this._modelName) {
            this._modelName = new Name(this, this.name, {
                namespace: this.namespace
            });
        }
        return this._modelName;
    }

    // static baseModel(): any
    static baseClass() {
        if (
             (this.__proto__.hasOwnProperty('abstract') && this.__proto__.abstract)
             ||
             this.__proto__.getInheritanceAttribute() === false
            ) {
            return this;
        } else {
            return this.__proto__.baseClass();
            // this.baseClass.descendants.push(this);
        }
    }

    // Generates the `urlRoot` based off of the class name.
    static urlRoot() {
        if (this.path) {
            return this.path;
        } else {
            return "/" + this.baseClass().modelName().plural;
        }
    }

    // static all(): Relation
    static all() {
        return new Relation(this);
    }

    // static limit(number: number): Relation
    static limit(number) {
        return new Relation(this).limit(number);
    }
    
    // static where(query: any): Relation
    static where(query) {
        return new Relation(this).where(query);
    }
    
    // static where(query: any): Relation
    static sum(...args) {
        return new Relation(this).sum(...args);
    }
    
    // static where(query: any): Relation
    static count(...args) {
        return new Relation(this).count(...args);
    }
    
    // Instantiate a new instance of the appropriate class.
    //
    // For example, `Post.all()` may return Comments, Messages, and Emails
    // by storing the record's subclass in a +type+ attribute. By calling
    // `instantiate` instead of `new`, finder methods ensure they get new
    // instances of the appropriate class for each record.
    //
    // See `ActiveRecord::Inheritance#discriminate_class_for_record` to see
    // how this "single-table" inheritance mapping is implemented.
    static instantiate(attributes) {
        let record = new this(attributes);
        record.persist()
        return record;
    }

    // Find a record by id. Accepts success and error callbacks in the options
    // hash, which are both passed (model, response, options) as arguments.
    //
    // Find returns the model, however it most likely won't have fetched the
    // data	from the server if you immediately try to use attributes of the
    // model.
    //
    // static async find(id)
    static async find(id) {
        return this.where({ [this.primaryKey]: id }).first();
    }

    static async first() {
        return this.all().first();
    }

    static async last() {
        return this.all().last();
    }

    static async forEach(callback) {
        return this.all().forEach(callback);
    }
    
    static includes(...args) {
        return this.all().includes(...args);
    }
    
    static limit(limit) {
        return this.all().limit(limit);
    }

    // Create a model with +attributes+. Options are the
    // same as Viking.Model#save
    static async create(attributes, options = {}) {
      var model = new this(attributes);
      await model.save(options);
      return model;
    }

    static async create$(attributes, options = {}) {
      var model = new this(attributes);
      await model.save$(options);
      return model;
    }

    cid = uniqueId(this.constructor.cidPrefix);//: string 
    inheritanceAttribute = this.constructor.getInheritanceAttribute(); //: string | boolean
    attributes = {};//: { [propName: string]: any; }
    _new_record = true;//: boolean
    _destroyed  = false;
    _changes = {};// : any
    _associations = {};//: { [propName: string]: any; }
    errors = {};
    
    // Add a helper reference to get the model name from an model instance.
    modelName;//: Name | undefined;
    baseClass;//: any;
    
    // constructor(attributes?: IModelAttributes, options?: IModelOptions)
    constructor(attributes, options) {
        super();
        
        if (this.constructor !== Record) {
            this.modelName = this.constructor.modelName();
            this.baseClass = this.constructor.baseClass();
        } else {
            this.modelName = undefined;
            this.baseClass = undefined;
        }

//         if (this.baseModel && this.modelName && this.inheritanceAttribute) {
//             if (this.baseModel === this.constructor && this.baseModel.descendants.length > 0) {
//                 attrs[this.inheritanceAttribute] = this.modelName.name;
//             } else if (_.contains(this.baseModel.descendants, this.constructor)) {
//                 attrs[this.inheritanceAttribute] = this.modelName.name;
//             }
//         }
        this.constructor.reflectOnAllAssociations().forEach((association) => {
            this._associations[association.name] = association.attachTo(this);
        });
        
        each(this.constructor.schema, (key, options) => {
            if(!Object.getPrototypeOf(this).hasOwnProperty(key)){
                Object.defineProperty(this, key, {
                    enumerable: true,
                    get: () => { return this.readAttribute(key); },
                    set: (value) => { this.setAttributes({ [key]: value }); }
                });
            }
        });
        
        this.setAttributes(this.defaults());
        this._changes = {};
        
        this.setAttributesAndAssociations(attributes);
    }

    // Alias for `::urlRoot`
    // urlRoot: string | (() => string) = () => {
    urlRoot() {
        return result(this.constructor, 'urlRoot');
    }


    defaults() {
        let dflts = {};
        each(this.constructor.schema, (key, options) => {
            if (options.default) {
                dflts[key] = options.default;
            }
        });

        return dflts;
    }

    // Get the value of an attribute.
    //
    // readAttribute(attributeName: string)
    readAttribute(attributeName) {
        return this.attributes[attributeName];
    }

    // Returns true if the given attribute is in the attributes hash, otherwise false.
    //
    // hasAttribute(attributeName: string)
    hasAttribute(attributeName) {
        return attributeName in this.attributes;
    }

    // Returns string to use for params names. This is the key attributes from
    // the model will be namespaced under when saving to the server
    paramRoot() {
        if (this.baseClass) {
            return this.baseClass.modelName().paramKey;
        }
    }

    isPersisted() {
        return !(this._new_record || this._destroyed);
    }

    persist() {
        this._new_record = false;
        this._changes = {};
    }

    isNewRecord() {
        return this._new_record;
    }
    
    destroyed() {
        return this._destroyed
    }

    clone() {
        const clone = new this.constructor(this.attributes)
        clone._new_record = this._new_record
        clone._destroyed = this._destroyed
        clone._changes = this._changes
        return clone;
    }

    changes() {
        return this._changes;
    }
    
    changedAttributes() {
        return Object.keys(this._changes);
    }

    hasChanged(attributeName) {
        if (attributeName) {
            return (attributeName in this._changes);
        } else {
            return (Object.keys(this._changes).length > 0);
        }
    }
    
    setAttributesAndAssociations(attributes) {
        // // TODO optimize this by not modifying attributes
        // attributes = Object.assign({}, attributes);
        // let association_attributes = {};
        // each(attributes, (key, value) => {
        //     if (this._associations.hasOwnProperty(key)) {
        //         this._associations[key].instantiate(value);
        //         delete attributes[key];
        //     }
        // });

        this.setAttributes(attributes);
    }
    
    setAttribute(attribute, value) {
        return this.setAttributes({
            [attribute]: value
        })
    }

    coerceAttributes(attributes, callback) {
        let schema = this.constructor.schema;
        
        each(attributes, (key, value) => {
            let coercedValue = undefined;

            if (schema && schema[key] && schema[key].type) {
                if (schema[key].array) {
                    if (value === null || value === undefined) {
                        coercedValue = null;
                    } else {
                        coercedValue = value.map((v) => Types.registry[schema[key].type].load(v));
                    }
                } else if (Types.registry[schema[key].type]) {
                    coercedValue = Types.registry[schema[key].type].load(value);
                } else {
                    throw new TypeError("Coercion of " + schema[key].type + " unsupported");
                }
            } else {
                coercedValue = value;
                // throw new TypeError("Coercion of " + options.type + " unsupported");
            }

            callback(key, coercedValue);
        });
    }
    
    // setAttributes(attributes: object)
    setAttributes(attributes) {
        let changes = {};
        // let chaning = this._changing;
        // this._changing = true;

        // if (!chaning) {
        //     this._previousAttributes = _.clone(this.attributes);
        //     this.changed = {};
        // }

        // let current = this.attributes;
        // let changed = this.changed;
        // let prev = this._previousAttributes;
        this.coerceAttributes(attributes, (key, value) => {
            if (this._associations.hasOwnProperty(key)) {
                if (value instanceof Record) {
                    console.log(this._associations[key]);
                    this._associations[key].setTarget(value);
                } else {
                    this._associations[key].instantiate(value);
                }
            } else if (!(key in this.attributes) || !isEqual(this.attributes[key], value)) {
                changes[key] = [this.attributes[key], value];
                
                if (this._changes[key]) {
                    if (isEqual(this._changes[key][0], value)) {
                        delete this._changes[key];
                    } else {
                        this._changes[key][1] = value;
                    }
                } else {
                    this._changes[key] = [ this.attributes[key] || null, value ];
                }
                this.attributes[key] = value;
            }
        });

        // TODO: if id not defined in schema add?
        // if (this.constructor.primaryKey in attributes) {
        //     this.id = this.readAttribute(this.constructor.primaryKey);
        // }

        // Trigger all relevant attribute changes.
        each(changes, (key, values) => {
            this.dispatchEvent('changed:' + key, this, ...values);
        });


        // You might be wondering why there's a `while` loop here. Changes can
        // be recursively nested within `"change"` events.
        // if (changing) { return this; }
            // while (this._pending) {
            //     options = this._pending;
            //     this._pending = false;
                if(Object.keys(changes).length > 0) {
                    this.dispatchEvent('changed', this, changes); //, options
                }
            // }

        // this._pending = false;
        // this._changing = false;
        return this;
    }

    primaryKey() {
        return this.readAttribute(this.constructor.primaryKey);
    }
    // set(key: string, value: any, options?: any);
    // set(key: object, options?: any);
    // set(key, value, options) {

    // }

    // Returns a string representing the object's key suitable for use in URLs,
    // or nil if `#isNew` is true.
    toParam() {
        // return this.isNewRecord() ? null : this.readAttribute('id');
        return this.readAttribute(this.constructor.primaryKey);
        // string.parameterize
    }

    // Default URL for the model's representation on the server
    // url(): string {
    url() {
        let base = result(this, 'urlRoot');

        if (!base) {
            throw new Error('A "urlRoot" property or function must be specified');
        }

        // if (this.isNewRecord()) {
        //     return base;
        // }

        return base.replace(/([^\/])$/, '$1/') + encodeURIComponent(this.toParam());
    }

    asJSON() {
        let json = {};
        let schema = this.constructor.schema;
        
        each(this.attributes, (key, value) => {
            if (schema && schema[key] && schema[key].type) {
                if (schema[key].array) {
                    if (value === null || value === undefined) {
                        json[key] = null;
                    } else {
                        json[key] = value.map(Types.registry[schema[key].type].dump);
                    }
                } else if (Types.registry[schema[key].type]) {
                    json[key] = Types.registry[schema[key].type].dump(value);
                } else {
                    throw new TypeError("Coercion of " + schema[key].type + " unsupported");
                }
            } else {
                json[key] = value;
            }
        });
        
        return json;
    }
    
    async save$(options = {}) {
        let saved = await this.save();
        
        if (!saved) {
            throw new Errors.RecordNotSaved("Failed to save the record");
        }
    }
    
    async save(options = {}) {
        if (!this.constructor.connection) {
            throw new Errors.ConnectionNotEstablished();
        }

        let method = this.isNewRecord() ? 'post' : 'put';
        let path   = this.isNewRecord() ? result(this, 'urlRoot') : this.url();
        
        let body = {};
        let schema = this.constructor.schema;
        each(this.changedAttributes(), (key) => {
            let value = this.attributes[key];
            if (schema && schema[key] && schema[key].type) {
                if (schema[key].array) {
                    if (value === null || value === undefined) {
                        body[key] = null;
                    } else {
                        body[key] = value.map(Types.registry[schema[key].type].dump);
                    }
                } else if (Types.registry[schema[key].type]) {
                    body[key] = Types.registry[schema[key].type].dump(value);
                } else {
                    throw new TypeError("Coercion of " + schema[key].type + " unsupported");
                }
            } else {
                body[key] = value;
            }
        });
        
        options.body = deepAssign({ [this.modelName.singular]: body }, options.body)
        options.success = (response) => {
            this.setAttributes(response);
            let savedChanges = {};
            deepAssign(savedChanges, this._changes);
            this.persist();
            this.dispatchEvent('saved', savedChanges, options);
            each(savedChanges, (key, value) => {
                this.dispatchEvent('saved:'+key, value[0], value[1]);
            });
            return true;
        }
        options.error = (request, error_callback) => {
            if (request.status === 400 && request.getResponseHeader('Content-Type').startsWith('application/json')) {
                this.errors = JSON.parse(request.responseText).errors;
                this.dispatchEvent('invalid', this.errors, options);
                return false;
            }
        }

        this.dispatchEvent('onsave', this.changedAttributes(), options)
        return await this.constructor.connection[method](path, options);

        // options.error = function (resp) {
        //     if (resp.status === 400) {
        //         var errors = JSON.parse(resp.responseText).errors;
        //         if (options.invalid) {
        //             options.invalid(model, errors, options);
        //         }
        //         model.setErrors(errors, options);
        //     } else {
        //         if (error) { error(model, resp, options); }
        //         model.trigger('error', model, resp, options);
        //     }
        // };
        //
        // method = this.isNew() ? 'create' : (options.patch ? 'patch' : 'update');
        // if (method === 'patch') { options.attrs = attrs; }
        // xhr = this.sync(method, this, options);
        //
        // // Restore attributes.
        // if (attrs && options.wait) { this.attributes = attributes; }
        //
        // return xhr;
    }
    
    async destroy(options = {}) {
        if (!this.constructor.connection) {
            throw new Errors.ConnectionNotEstablished();
        }

        if (this.isNewRecord() || this.destroyed()) {
            // ... raise error
        }
        
        this.dispatchEvent('ondestroy', this, options)
        await this.constructor.connection.delete(this.url()).then(() => {
            this.dispatchEvent('destroyed', this, options)
        });
        this._destroyed = true;
    }
    
    //     setErrors: function (errors, options) {
    //         if (_.size(errors) === 0) { return; }

    //         var model = this;
    //         this.validationError = errors;

    //         model.trigger('invalid', this, errors, options);
    //     },
    
    association(name) {
        return this._associations[name]
    }
}


// export const Model = Backbone.Model.extend({


//     constructor: function (attributes, options) {


//         if (this.inheritanceAttribute) {
//             if (attrs[this.inheritanceAttribute] && this.constructor.modelName.name !== attrs[this.inheritanceAttribute]) {
//                 // OPTIMIZE:  Mutating the [[Prototype]] of an object, no matter how
//                 // this is accomplished, is strongly discouraged, because it is very
//                 // slow and unavoidably slows down subsequent execution in modern
//                 // JavaScript implementations
//                 // Ideas: Move to Model.new(...) method of initializing models
//                 const type = string.constantize(
//                     string.camelize(attrs[this.inheritanceAttribute])
//                 );
//                 this.constructor = type;
//                 this.__proto__ = type.prototype;
//             }
//         }

//         // Set up associations
//         this.associations = this.constructor.associations;
//         this.reflectOnAssociation = this.constructor.reflectOnAssociation;
//         this.reflectOnAssociations = this.constructor.reflectOnAssociations;

//         // Initialize any `hasMany` relationships to empty collections
//         this.reflectOnAssociations('hasMany').forEach((association) => {
//             this.attributes[association.name] = new (association.collection())();
//         });

//         if (options.collection) { this.collection = options.collection; }
//         if (options.parse) { attrs = this.parse(attrs, options) || {}; }

//         this.set(attrs, options);
//         this.changed = {};
//         this.initialize.call(this, attributes, options);
//     },


//     // TODO: testme
//     errorsOn: function (attribute) {
//         if (this.validationError) {
//             return this.validationError[attribute];
//         }

//         return false;
//     },



//     // select(options)
//     // select(value[, options])
//     //
//     // When the model is part of a collection and you want to select a single
//     // or multiple items from a collection. If a model is selected
//     // `model.selected` will be set `true`, otherwise it will be `false`.
//     //
//     // If you pass `true` or `false` as the first paramater to `select` it will
//     // select the model if true, or unselect if it is false.
//     //
//     // By default any other models in the collection with be unselected. To
//     // prevent other models in the collection from being unselected you can
//     // pass `{multiple: true}` as an option.
//     //
//     // The `selected` and `unselected` events are fired when appropriate.
//     select: function (value, options) {

//         // Handle both `value[, options]` and `options` -style arguments.
//         if (value === undefined || typeof value === 'object') {
//             options = value;
//             value = true;
//         }

//         if (value === true) {
//             if (this.collection) {
//                 this.collection.select(this, options);
//             } else {
//                 this.selected = true;
//             }
//         } else {
//             if (this.selected) {
//                 this.selected = false;
//                 this.trigger('unselected', this);
//             }
//         }
//     },


//     // Override [Backbone.Model#sync](http://backbonejs.org/#Model-sync).
//     // [Ruby on Rails](http://rubyonrails.org/) expects the attributes to be
//     // namespaced
//     sync: function (method, model, options: any = {}) {
//         if (!options.data && (method === 'create' || method === 'update' || method === 'patch')) {
//             options.contentType = 'application/json';
//             options.data = {};
//             options.data[_.result(model, 'paramRoot')] = (options.attrs || model.toJSON(options));
//             options.data = JSON.stringify(options.data);
//         }

//         return sync.call(this, method, model, options);
//     },

//     // similar to Rails as_json method
//     toJSON: function (options) {
//         var data = _.clone(this.attributes);

//         if (options === undefined) { options = {}; }

//         if (options.include) {
//             if (typeof options.include === 'string') {
//                 var key = options.include;
//                 options.include = {};
//                 options.include[key] = {};
//             } else if (_.isArray(options.include)) {
//                 var array = options.include;
//                 options.include = {};
//                 _.each(array, function (key: string) {
//                     options.include[key] = {};
//                 });
//             }
//         } else {
//             options.include = {};
//         }

//         _.each(this.associations, function (association: any) {
//             if (!options.include[association.name]) {
//                 delete data[association.name];
//                 if (association.macro === 'belongsTo' && data[association.name + '_id'] === undefined) {
//                     delete data[association.name + '_id'];
//                 }
//             } else if (association.macro === 'belongsTo' || association.macro === 'hasOne') {
//                 if (data[association.name]) {
//                     data[association.name + '_attributes'] = data[association.name].toJSON(options.include[association.name]);
//                     delete data[association.name];
//                     delete data[association.name + '_id'];
//                 } else if (data[association.name] === null) {
//                     data[association.name + '_attributes'] = null;
//                     delete data[association.name];
//                     delete data[association.name + '_id'];
//                 }
//             } else if (association.macro === 'hasMany') {
//                 if (data[association.name]) {
//                     data[association.name + '_attributes'] = data[association.name].toJSON(options.include[association.name]);
//                     delete data[association.name];
//                 }
//             }
//         });

//         _.each(this.schema, function (options: any, key: string) {
//             if (data[key] || data[key] === false) {
//                 var tmp, klass;

//                 klass = Type.registry[options.type];

//                 if (klass) {
//                     if (options.array) {
//                         tmp = [];
//                         _.each(data[key], function (value) {
//                             tmp.push(klass.dump(value, key));
//                         });
//                         data[key] = tmp;
//                     } else {
//                         data[key] = klass.dump(data[key], key);
//                     }
//                 } else {
//                     throw new TypeError("Coercion of " + options.type + " unsupported");
//                 }
//             }
//         });

//         return data;
//     },

//     // Saves the record with the updated_at and any attributes passed in to the
//     // current time.
//     //
//     // The JSON response is expected to return an JSON object with the attribute
//     // name and the new time. Any other attributes returned in the JSON will be
//     // updated on the Model as well
//     //
//     // TODO:
//     // Note that `#touch` must be used on a persisted object, or else an
//     // Viking.Model.RecordError will be thrown.
//     touch: function (columns, options) {
//         var now = new Date();

//         var attrs = {
//             updated_at: now
//         }

//         options = _.extend({ patch: true }, options);

//         if (_.isArray(columns)) {
//             _.each(columns, function (column) {
//                 attrs[column] = now;
//             });
//         } else if (columns) {
//             attrs[columns] = now;
//         }

//         return this.save(attrs, options);
//     },

//     // Opposite of #select. Triggers the `unselected` event.
//     unselect: function (options) {
//         this.select(false, options);
//     },

//     updateAttribute: function (key, value, options) {
//         var data = {};
//         data[key] = value;

//         return this.updateAttributes(data, options);
//     },

//     updateAttributes: function (data, options) {
//         options || (options = {});
//         options.patch = true;

//         return this.save(data, options);
//     },

// }, {

//         associations: [],

//         // Overide the default extend method to support passing in the modelName
//         // and support STI
//         //
//         // The modelName is used for generating urls and relationships.
//         //
//         // If a Model is extended further is acts simlar to ActiveRecords STI.
//         //
//         // `name` is optional, and must be a string
//         extend: function (name, protoProps: any = {}, staticProps: any = {}) {
//             if (typeof name !== 'string') {
//                 staticProps = protoProps;
//                 protoProps = name || {};
//                 name = '';
//             }

//             var child = Backbone.Model.extend.call(this, protoProps, staticProps);

//             if (typeof name === 'string') {
//                 child.modelName = new Name(name);
//             }

//             child.associations = {};
//             child.descendants = [];
//             child.inheritanceAttribute = (protoProps.inheritanceAttribute === undefined) ? this.prototype.inheritanceAttribute : protoProps.inheritanceAttribute;

//             if (child.inheritanceAttribute === false || (this.prototype.hasOwnProperty('abstract') && this.prototype.abstract)) {
//                 child.baseModel = child;
//             } else {
//                 child.baseModel.descendants.push(child);
//             }

//             let that = this.prototype;
//             ['belongsTo', 'hasOne', 'hasMany', 'hasAndBelongsToMany'].forEach((macro) => {
//                 _.each((protoProps[macro] || []).concat(that[macro] || []), (name: string) => {
//                     let options;

//                     // Handle both `type, key, options` and `type, [key, options]` style arguments
//                     if (_.isArray(name)) {
//                         options = name[1];
//                         name = name[0];
//                     }

//                     if (!child.associations[name]) {
//                         let reflectionClass = {
//                             'belongsTo': BelongsToReflection,
//                             'hasOne': HasOneReflection,
//                             'hasMany': HasManyReflection,
//                             'hasAndBelongsToMany': HasAndBelongsToManyReflection
//                         }[macro];

//                         child.associations[name] = new reflectionClass(name, options);
//                     }
//                 });
//             });

//             if (this.prototype.schema && protoProps.schema) {
//                 _.each(this.prototype.schema, function (value, key) {
//                     if (!child.prototype.schema[key]) {
//                         child.prototype.schema[key] = value;
//                     }
//                 });
//             }

//             return child;
//         },


//         // Find or create model by attributes. Accepts success callbacks in the
//         // options hash, which is passed (model) as arguments.
//         //
//         // findOrCreateBy returns the model, however it most likely won't have fetched
//         // the data	from the server if you immediately try to use attributes of the
//         // model.
//         findOrCreateBy: function (attributes, options) {
//             var klass = this;
//             klass.where(attributes).fetch({
//                 success: function (modelCollection) {
//                     var model = modelCollection.models[0];
//                     if (model) {
//                         if (options && options.success) options.success(model);
//                     } else {
//                         klass.create(attributes, options);
//                     }
//                 }
//             });
//         },



//         reflectOnAssociations: function (macro) {
//             var associations = _.values(this.associations);
//             if (macro) {
//                 associations = _.select(associations, function (a) {
//                     return a.macro === macro;
//                 });
//             }

//             return associations;
//         },


//     }
// );
