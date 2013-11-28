// Viking.Model
// ------------
//
// Viking.Model is an extension of [Backbone.Model](http://backbonejs.org/#Model).
// It adds naming, relationships, data type coerions, selection, and modifies
// sync to work with [Ruby on Rails](http://rubyonrails.org/) out of the box.
Viking.Model = Backbone.Model.extend({

    // Below is the same code from the Backbone.Model function
    // except where there are comments
    constructor: function (attributes, options) {
        var attrs = attributes || {};
        options || (options = {});
        this.cid = _.uniqueId('c');
        this.attributes = {};
        
        // Add a helper reference to get the model name from an model instance.
        this.modelName = this.constructor.modelName;
        
        // Set up associations
        this.associations = this.constructor.associations;
        this.reflect_on_association = this.constructor.reflect_on_association;
        this.reflect_on_associations = this.constructor.reflect_on_associations;
        
        // Initialize any `hasMany` relationships to empty collections
        _.each(this.reflect_on_associations('hasMany'), function(association) {
            this.attributes[association.name] = new (association.collection())();
        }, this);
        
        if (options.collection) { this.collection = options.collection; }
        if (options.parse) { attrs = this.parse(attrs, options) || {}; }
        attrs = _.defaults({}, attrs, _.result(this, 'defaults'));
        this.set(attrs, options);
        this.changed = {};
        this.initialize.call(this, attributes, options);
    },
    
    // When the model is part of a collection and you want to select a single
    // or multiple items from a collection. If a model is selected 
    // `model.selected` will be set `true`, otherwise it will be `false`.
    //
    // By default any other models in the collection with be unselected. To
    // prevent other models in the collection from being unselected you can
    // pass `true`.
    //
    // The `selected` and `unselected` events are fired when appropriate.
    select: function(multiple) {
        if (this.collection) {
            this.collection.select(this, multiple);
        } else {
            this.selected = true;
        }
    },
    
    // Opposite of #select. Triggers the `unselected` event.
    unselect: function() {
        if(this.selected) {
            this.selected = false;
            this.trigger('unselected', this);
        }
    },
    
    // TODO: overwrite url to use toParam()
    
    // Alias for `::urlRoot`
    urlRoot: function() {
        return this.constructor.urlRoot();
    },
    
    // Returns string to use for params names. This is the key attributes from
    // the model will be namespaced under when saving to the server
    paramRoot: function() {
        return this.modelName.underscore();
    },
    
    // Returns a string representing the object’s key suitable for use in URLs,
    // or nil if `#isNew` is true.
    toParam: function() {
        return this.isNew() ? null : this.get('id');
    },
    
    set: function (key, val, options) {
        var attrs;
        if (key === null) { return this; }
        
        // Handle both `"key", value` and `{key: value}` -style arguments.
        if (typeof key === 'object') {
            attrs = key;
            options = val;
        } else {
            (attrs = {})[key] = val;
        }
        
        this.coerceAttributes(attrs);
        _.each(attrs, function(value, key) {
            var association = this.reflect_on_association(key);
            if (association && association.macro === 'hasMany') {
                this.attributes[key].set(value.models);
                delete attrs[key];
            }
        }, this);
        
        return Backbone.Model.prototype.set.call(this, attrs, options);
    },
    
    // Override [Backbone.Model#sync](http://backbonejs.org/#Model-sync).
    // [Ruby on Rails](http://rubyonrails.org/) expects the attributes to be
    // namespaced
    sync: function(method, model, options) {
        options || (options = {});
        
        if (!options.data && (method === 'create' || method === 'update' || method === 'patch')) {
            options.contentType = 'application/json';
            options.data = {};
            options.data[_.result(model, 'paramRoot')] = (options.attrs || model.toJSON(options));
            options.data = JSON.stringify(options.data);
        }

        return Backbone.sync.call(this, method, model, options);
    },
    
    coerceAttributes: function(attrs) {
        var rel, i, type, klass;
        
        _.each(this.associations, function(association) {
            var Type = association.klass();
            
            if (attrs[association.name] && !(attrs[association.name] instanceof Type)) {
                attrs[association.name] = new Type(attrs[association.name]);
            }
        });

        _.each(this.coercions, function (type, key) {
            if (attrs[key] || attrs[key] === false) {
                klass = Viking.Coercions[type];
                
                if (klass) {
                    attrs[key] = klass.load(attrs[key], key);
                } else {
                    throw new TypeError("Coercion of " + type + " unsupported");
                }
            }
        });

        return attrs;
    },
    
    // similar to Rails as_json method
    toJSON: function (options) {
        var rel, i, klass;
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
                _.each(array, function(key) {
                    options.include[key] = {};
                });
            }
        } else {
            options.include = {};
        }
        
        _.each(this.associations, function(association) {
            if (!options.include[association.name]) {
                delete data[association.name];
            } else if (association.macro === 'belongsTo' || association.macro === 'hasOne') {
                if (data[association.name]) {
                    data[association.name+'_attributes'] = data[association.name].toJSON(options.include[association.name]);
                    delete data[association.name];
                } else if (data[association.name] === null) {
                    data[association.name+'_attributes'] = null;
                    delete data[association.name];
                }
            } else if (association.macro === 'hasMany') {
                if (data[association.name]) {
                    data[association.name + '_attributes'] = data[association.name].toJSON(options.include[association.name]);
                    delete data[association.name];
                }
            }
        });

        _.each(this.coercions, function (type, key) {
            if (data[key] || data[key] === false) {
                klass = Viking.Coercions[type];

                if (klass) {
                    data[key] = klass.dump(data[key], key);
                } else {
                    throw new TypeError("Coercion of " + type + " unsupported");
                }
            }
        });

        return data;
    },
    
    // Overwrite Backbone.Model#save so that we can catch errors when a save
    // fails.
    save: function(key, val, options) {
        var attrs, method, xhr, attributes = this.attributes;
        var model = this;
        
        // Handle both `"key", value` and `{key: value}` -style arguments.
        if (key === null || typeof key === 'object') {
          attrs = key;
          options = val;
        } else {
          (attrs = {})[key] = val;
        }

        // If we're not waiting and attributes exist, save acts as `set(attr).save(null, opts)`.
        if (attrs && (!options || !options.wait) && !this.set(attrs, options)) {
            return false;
        }

        options = _.extend({validate: true}, options);

        // Do not persist invalid models.
        if (!this._validate(attrs, options)) {
            return false;
        }

        // Set temporary attributes if `{wait: true}`.
        if (attrs && options.wait) {
          this.attributes = _.extend({}, attributes, attrs);
        }

        // After a successful server-side save, the client is (optionally)
        // updated with the server-side state.
        if (options.parse === undefined) {
            options.parse = true;
        }
        
        var success = options.success;
        options.success = function(resp) {
          // Ensure attributes are restored during synchronous saves.
          model.attributes = attributes;
          var serverAttrs = model.parse(resp, options);
          if (options.wait) {
              serverAttrs = _.extend(attrs || {}, serverAttrs);
          }
          
          if (_.isObject(serverAttrs) && !model.set(serverAttrs, options)) {
            return false;
          }
          
          if (success) {
              success(model, resp, options);
          }
          
          model.trigger('sync', model, resp, options);
        };
        
        // replacing #wrapError(this, options) with custom error handling to
        // catch and throw invalid events
        var error = options.error;
        options.error = function(resp) {
            if (resp.status === 400) {
                var errors = JSON.parse(resp.responseText).errors;
                if (options.invalid) {
                    options.invalid(model, errors, options);
                }
                model.setErrors(errors, options);
            } else {
                if (error) {
                    error(model, resp, options);
                }
                model.trigger('error', model, resp, options);
            }
        };

        method = this.isNew() ? 'create' : (options.patch ? 'patch' : 'update');
        if (method === 'patch') {
            options.attrs = attrs;
        }
        xhr = this.sync(method, this, options);

        // Restore attributes.
        if (attrs && options.wait) {
            this.attributes = attributes;
        }

        return xhr;
    },
    
    setErrors: function(errors, options) {
        if(_.size(errors) === 0) { return; }
        
        var model = this;
        this.validationError = errors;
        
        model.trigger('invalid', this, errors, options);
    },
    
    // TODO: testme
    errorsOn: function(attribute) {
        if (this.validationError) {
            return this.validationError[attribute];
        }
        
        return false;
    }
    
}, {
    
    associations: [],
    
    // TODO: test support not passing in name and just protoProps & staticProps
    // Overide the default extend method to support passing in the model name
    // to be used for url generation and replationships.
    //
    // `name` is optional, and must be a string
    extend: function(name, protoProps, staticProps) {
        if(typeof name !== 'string') {
            staticProps = protoProps;
            protoProps = name;
        }
        protoProps || (protoProps = {});
                
        var child = Backbone.Model.extend.call(this, protoProps, staticProps);
        
        if(typeof name === 'string') { child.modelName = name; }
        
        child.associations = {};
        _.each(['hasMany', 'belongsTo'], function(macro) {
            _.each(protoProps[macro], function(name) {
                var options;
                
                // Handle both `type, key, options` and `type, [key, options]` style arguments
                if (_.isArray(name)) {
                    options = name[1];
                    name = name[0];
                }
                
                child.associations[name] = new Viking.AssociationReflection(macro, name, options);
            });
        });
        
        return child;
    },
    
    reflect_on_associations: function(macro) {
        var associations = _.values(this.associations);
        if (macro) {
            associations = _.select(associations, function(a) {
                return a.macro === macro;
            });
        }
        
        return associations;
    },
    
    reflect_on_association: function(name) {
        return this.associations[name];
    },
    
    // Generates the `urlRoot` based off of the model name.
    urlRoot: function() {
        return "/" + this.modelName.pluralize();
    },

	// Find model by id. Accepts success and error callbacks in the options
	// hash, which are both passed (model, response, options) as arguments.
	//
	// Find returns the model, however it most likely won't have fetched the
	// data	from the server if you immediately try to use attributes of the
	// model.
    find: function(id, options) {
		var model = new this({id: id});
		model.fetch(options);
		return model;
    }
    
});