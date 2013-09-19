// Viking.Model
// ------------
//
// Viking.Model is an extension of [Backbone.Model](http://backbonejs.org/#Model).
// It adds naming, relationships, data type coerions, selection, and modifies
// sync to work with [Ruby on Rails](http://rubyonrails.org/) out of the box.
Viking.Model = Backbone.Model.extend({
    
    constructor: function () {
        // Initialize the object as a Backbone Model
        Backbone.Model.apply(this, arguments);
        
        // Add a helper reference to get the model name from an model instance.
        this.modelName = this.constructor.modelName;
        
        // Initialize any `hasMany` relationships to empty collections if
        // they are not defined yet.
        var rel, i;
        if (this.hasMany) {
            for (i = 0; i < this.hasMany.length; i++) {
                rel = Viking.Model.getRelationshipDetails('hasMany', this.hasMany[i]);
                if(!this.attributes[rel.key]) {
                    this.attributes[rel.key] = new rel.type();
                }
            }
        }
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

        if (this.belongsTo) {
            for (i = 0; i < this.belongsTo.length; i++) {
                rel = Viking.Model.getRelationshipDetails('belongsTo', this.belongsTo[i]);
                if (attrs[rel.key] && !(attrs[rel.key] instanceof rel.type)) {
                    attrs[rel.key] = new rel.type(attrs[rel.key]);
                }
            }
        }

        if (this.hasMany) {
            for (i = 0; i < this.hasMany.length; i++) {
                rel = Viking.Model.getRelationshipDetails('hasMany', this.hasMany[i]);
                if (attrs[rel.key] && !(attrs[rel.key] instanceof rel.type)) {
                    attrs[rel.key] = new rel.type(attrs[rel.key]);
                }
            }
        }

        _.each(this.coercions, function (type, key) {
            if (attrs[key] || attrs[key] === false) {
                klass = window[type];
                
                if (klass === Date) {
                    if (typeof attrs[key] === 'string' || typeof attrs[key] === 'number') {
                        attrs[key] = Date.fromISO(attrs[key]);
                    } else if (!(attrs[key] instanceof Date)) {
                        throw new TypeError(typeof attrs[key] + " can't be coerced into " + type);
                    }
                    
                } else if (klass == String) {
                    if (typeof attrs[key] !== 'string') {
                        attrs[key] = String(attrs[key]);
                    }
                    
                } else if (klass == Number) {
                    if (typeof attrs[key] !== 'number') {
                        attrs[key] = Number(attrs[key]);
                    }
                
                // TODO: not sure about this
                } else if (klass == JSON) {
                    if (typeof attrs[key] === 'object') {
                        attrs[key] = new Viking.Model(attrs[key]);
                        attrs[key].modelName = key;
                    } else {
                        throw new TypeError("Coercion of " + type + " unsupported");
                    }
                    
                } else {
                    throw new TypeError("Coercion of " + type + " unsupported");
                }
            }
        });

        return attrs;
    },
    
    toJSON: function (options) {
        var rel, i;
        var data = _.clone(this.attributes);

        if (this.belongsTo) {
            for (i = 0; i < this.belongsTo.length; i++) {
                rel = Viking.Model.getRelationshipDetails('belongsTo', this.belongsTo[i]);

                if (data[rel.key]) {
                    data[rel.key+'_attributes'] = data[rel.key].toJSON();
                    delete data[rel.key];
                } else if (data[rel.key] === null) {
                    data[rel.key+'_attributes'] = null;
                    delete data[rel.key];
                }
            }
        }

        if (this.hasMany) {
            for (i = 0; i < this.hasMany.length; i++) {
                rel = Viking.Model.getRelationshipDetails('hasMany', this.hasMany[i]);

                if (data[rel.key]) {
                    data[rel.key + '_attributes'] = data[rel.key].toJSON();
                    delete data[rel.key];
                }
            }
        }

        _.each(this.coercions, function (type, key) {
            if (data[key]) {
                if (type === 'Date') {
                    data[key] = data[key].toISOString();
                } else if (type === 'JSON') {
                    data[key] = data[key].toJSON();
                } else if (type !== 'Number' && type !== 'String') {
                    throw new TypeError("Coercion of " + type + " unsupported");
                }
            }
        });

        return data;
    }
    
}, {
    
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
        var child = Backbone.Model.extend.call(this, protoProps, staticProps);
        if(typeof name === 'string') { child.modelName = name; }
        return child;
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
    },
    
	// Used internally by Viking to translate relation arguments to key and
	// Model
    //
    // - type: either 'hasMany' or 'belongsTo'
    // - key:  the key of how the assoication is accessed on the model
    // - options (optional):
    //     - model: model to use
    //     - collection: collection to use
    getRelationshipDetails: function (type, key, options) {
		// Handle both `type, key, options` and `type, [key, options]` style arguments
        if (_.isArray(key)) {
            options = key[1];
            key = key[0];
        }

        var relation = {
            key: key
        };

        if(type === 'hasMany') {
            if (options && options.collection) {
                relation.type = window[options.collection];
            } else if (options && options.model) {
                relation.type = window[options.model + 'Collection'];                
            } else {
                relation.type = window[relation.key.camelize(true).replace(/s$/, '') + 'Collection'];
            }
        } else if (type === 'belongsTo' || type === 'hasOne') {
            if (options && options.model) {
                relation.type = window[options.model];
            } else {
                relation.type = window[relation.key.camelize()];
            }
        }


        return relation;
    }
    
});