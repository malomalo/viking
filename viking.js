//     Viking.js 0.2.0
//
//     (c) 2012-2013 Jonathan Bracy, 42Floors Inc.
//     Viking.js may be freely distributed under the MIT license.
//     http://vikingjs.com

// Initial Setup
// -------------

// Setup the Viking namespace
Viking = {};
Viking.NameError = function (message) {
  this.name = "Viking.NameError";
  this.message = message;
};

Viking.NameError.prototype = Error.prototype;
// CSRF Support for Ajax Request
// -----------------------------

// Set a callback for all AJAX request to set the CSRF Token header
// if the meta tag is present.
jQuery(document).ajaxSend(function(event, xhr, settings) {
    var token = jQuery('meta[name="csrf-token"]').attr('content');
    if (token) { xhr.setRequestHeader('X-CSRF-Token', token); }
});
// Viking.Support
// -------------
//
// Viking.Support is a collection of utility classes and standard library
// extensions that were found useful for the Viking framework. These
// additions reside in this package so they can be loaded as needed
// in Javascript projects outside of Viking.
// Calls `to_param` on all its elements and joins the result with slashes.
// This is used by url_for in Viking Pack.
Array.prototype.toParam = function() {
	return _.map(this, function(e) { return e.toParam(); }).join('/');
}

// Converts an array into a string suitable for use as a URL query string,
// using the given key as the param name.
Array.prototype.toQuery = function(key) {
	var prefix = key + "[]";
	return _.map(this, function(value) { return value === null ? escape(prefix) + '=' : value.toQuery(prefix) }).join('&');
}
// Alias of to_s.
Boolean.prototype.toParam = Boolean.prototype.toString;

Boolean.prototype.toQuery = function(key) {
	return escape(key.toParam()) + "=" + escape(this.toParam());
}
// strftime relies on https://github.com/samsonjs/strftime. It supports
// standard specifiers from C as well as some other extensions from Ruby.
Date.prototype.strftime = function(fmt) {
    return strftime(fmt, this);
};

// Since IE8 does not support new Dates with the ISO 8601 format we'll add
// supoprt for it
(function(){
    var d = new Date('2011-06-02T09:34:29+02:00');
    if(!d || +d !== 1307000069000) {
        Date.fromISO = function(s) {
            var i, day, tz, regex, match;
            
            regex = /^(\d{4}\-\d\d\-\d\d([tT ][\d:\.]*)?)([zZ]|([+\-])(\d\d):(\d\d))?$/;
            match = regex.exec(s) || [];
            
            if(match[1]){
                day = match[1].split(/\D/);
                for( i= 0; i < day.length; i++) {
                    day[i] = parseInt(day[i], 10) || 0;
                }
                day[1] -= 1;
                day = new Date(Date.UTC.apply(Date, day));
                if(!day.getDate()) { return NaN; }
                if(match[5]){
                    tz = (parseInt(match[5], 10)*60);
                    if(match[6]) { tz += parseInt(match[6], 10); }
                    if(match[4] === '+') { tz*= -1; }
                    if(tz) { day.setUTCMinutes(day.getUTCMinutes()+ tz); }
                }
                return day;
            }

            return NaN;
        };
    } else {
        Date.fromISO = function(s){
            return new Date(s);
        };
    }
}());

// Alias of to_s.
Date.prototype.toParam = Date.prototype.toJSON;

Date.prototype.toQuery = function(key) {
	return escape(key.toParam()) + "=" + escape(this.toParam());
}
// ordinalize returns the ordinal string corresponding to integer:
//
//     (1).ordinalize()    // => '1st'
//     (2).ordinalize()    // => '2nd'
//     (53).ordinalize()   // => '53rd'
//     (2009).ordinalize() // => '2009th'
//     (-134).ordinalize() // => '-134th'
Number.prototype.ordinalize = function() {
    var abs = Math.abs(this);
    
    if (abs % 100 >= 11 && abs % 100 <= 13) {
        return this + 'th';
    }
    
    abs = abs % 10;
    if (abs === 1) { return this + 'st'; }
    if (abs === 2) { return this + 'nd'; }
    if (abs === 3) { return this + 'rd'; }
    
    return this + 'th';
};

// Alias of to_s.
Number.prototype.toParam = Number.prototype.toString;

Number.prototype.toQuery = function(key) {
	return escape(key.toParam()) + "=" + escape(this.toParam());
}
// Returns a string representation of the receiver suitable for use as a URL
// query string:
// 
// {name: 'David', nationality: 'Danish'}.toParam()
// // => "name=David&nationality=Danish"
// An optional namespace can be passed to enclose the param names:
// 
// {name: 'David', nationality: 'Danish'}.toParam('user')
// // => "user[name]=David&user[nationality]=Danish"
//
// The string pairs “key=value” that conform the query string are sorted
// lexicographically in ascending order.
Object.defineProperty(Object.prototype, 'toParam', {
	value: function(namespace) {
		return _.map(this, function(value, key) {
			var namespaceWithKey = (namespace ? (namespace + "[" + key + "]") : key);
		
			if (value !== null) {
				return value.toQuery(namespaceWithKey)
			} else {
				return escape(namespaceWithKey) + "=";
			}
		
		}).join('&');
	},
	writable: true,
	configureable: true,
	enumerable: false
});

// Converts an object into a string suitable for use as a URL query string,
// using the given key as the param name.
//
// Note: This method is defined as a default implementation for all Objects for
// Object#toQuery to work.
Object.defineProperty(Object.prototype, 'toQuery', {
	value: Object.prototype.toParam,
	writable: true,
	configureable: true,
	enumerable: false
});
// Converts the first character to uppercase
String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

// Converts the first character to lowercase
String.prototype.anticapitalize = function() {
    return this.charAt(0).toLowerCase() + this.slice(1);
};

// Capitalizes all the words and replaces some characters in the string to
// create a nicer looking title. titleize is meant for creating pretty output.
String.prototype.titleize = function() {
    return this.underscore().humanize().replace(/\b('?[a-z])/g, function(m){ return m.toUpperCase(); });
};

// Capitalizes the first word and turns underscores into spaces and strips a
// trailing “_id”, if any. Like titleize, this is meant for creating pretty output.
String.prototype.humanize = function() {
    var result = this.toLowerCase().replace(/_id$/, '').replace(/_/g, ' ');
    result = result.replace(/([a-z\d]*)/g, function(m) { return m.toLowerCase(); });
    return result.capitalize();
};

// Makes an underscored, lowercase form from the expression in the string.
//
// Changes ‘::’ to ‘/’ to convert namespaces to paths.
//
// Examples:
// 
//     "ActiveModel".underscore         # => "active_model"
//     "ActiveModel::Errors".underscore # => "active_model/errors"
//
// As a rule of thumb you can think of underscore as the inverse of camelize,
// though there are cases where that does not hold:
//
//     "SSLError".underscore().camelize() # => "SslError"
String.prototype.underscore = function() {
    var result = this.replace('::', '/');
    result = result.replace(/([A-Z\d]+)([A-Z][a-z])/g, "$1_$2");
    result = result.replace(/([a-z\d])([A-Z])/g, "$1_$2");
    return result.replace('-','_').toLowerCase();
};

// By default, #camelize converts strings to UpperCamelCase. If the argument
// to camelize is set to `false` then #camelize produces lowerCamelCase.
//
// \#camelize will also convert "/" to "::" which is useful for converting
// paths to namespaces.
//
// Examples:
//
//     "active_model".camelize               // => "ActiveModel"
//     "active_model".camelize(true)         // => "ActiveModel"
//     "active_model".camelize(false)        // => "activeModel"
//     "active_model/errors".camelize        // => "ActiveModel::Errors"
//     "active_model/errors".camelize(false) // => "activeModel::Errors"
//
// As a rule of thumb you can think of camelize as the inverse of underscore,
// though there are cases where that does not hold:
//
//     "SSLError".underscore().camelize()   // => "SslError"
String.prototype.camelize = function(uppercase_first_letter) {
    var result = uppercase_first_letter === undefined || uppercase_first_letter ? this.capitalize() : this.anticapitalize();
    result = result.replace(/(_|(\/))([a-z\d]*)/g, function(_a, _b, first, rest) { return (first || '') + rest.capitalize(); });
    return result.replace('/', '::');
};

// Convert a string to a boolean value. If the argument to #booleanize is
// passed if the string is not 'true' or 'false' it will return the argument.
//
// Examples:
//
//     "true".booleanize()       // => true
//     "false".booleanize()      // => false
//     "other".booleanize()      // => false
//     "other".booleanize(true)  // => true
String.prototype.booleanize = function(defaultTo) {
    if(this.toString() === 'true') { return true; }
    if (this.toString() === 'false') { return false; }
    
    return (defaultTo === undefined ? false : defaultTo);
};

// Replaces underscores with dashes.
//
// Example:
//
//     "puni_puni"  // => "puni-puni"
String.prototype.dasherize = function() {
    return this.replace('_','-');
};

// Replaces special characters in a string so that it may be used as part of
// a "pretty" URL.
//
// Example:
//
//     "Donald E. Knuth".parameterize() // => 'donald-e-knuth'
String.prototype.parameterize = function(seperator) {
    return this.toLowerCase().replace(/[^a-z0-9\-_]+/g, seperator || '-');
};

// Add Underscore.inflection#pluralize function on the String object
String.prototype.pluralize = function(count, includeNumber) {
    return _.pluralize(this, count, includeNumber);
};

// Add Underscore.inflection#singularize function on the String object
String.prototype.singularize = function() {
    return _.singularize(this);
};

// Tries to find a variable with the name specified in context of `context`.
// `context` defaults to the `window` variable.
//
// Examples:
//     'Module'.constantize     # => Module
//     'Test.Unit'.constantize  # => Test.Unit
//     'Unit'.constantize(Test) # => Test.Unit
//
// Viking.NameError is raised when the variable is unknown.
String.prototype.constantize = function(context) {
	if(!context) { context = window; }
	var name = this;
	
	return _.reduce(this.split('.'), function(context, name){
		var v = context[name];
		if (!v) { throw new Viking.NameError("uninitialized variable "+name); }
		return v;
	}, context);	
};

// If `length` is greater than the length of the string, returns a new String
// of length `length` with the string right justified and padded with padString;
// otherwise, returns string
String.prototype.rjust = function(length, padString) {
    if (!padString) { padString = ' '; }
    
    var padding = '';
    var paddingLength = length - this.length;

    while (padding.length < paddingLength) {
        if (paddingLength - padding.length < padString.length) {
            padding = padding + padString.slice(0, paddingLength - padding.length);
        } else {
            padding = padding + padString;
        }
    }

    return padding + this;
}

// If `length` is greater than the length of the string, returns a new String
// of length `length` with the string left justified and padded with padString;
// otherwise, returns string
String.prototype.ljust = function(length, padString) {
    if (!padString) { padString = ' '; }
    
    var padding = '';
    var paddingLength = length - this.length;

    while (padding.length < paddingLength) {
        if (paddingLength - padding.length < padString.length) {
            padding = padding + padString.slice(0, paddingLength - padding.length);
        } else {
            padding = padding + padString;
        }
    }

    return this + padding;
}

// Alias of to_s.
String.prototype.toParam = String.prototype.toString;

String.prototype.toQuery = function(key) {
	return escape(key.toParam()) + "=" + escape(this.toParam());
}







// Viking.config
// -------------
//
// Helper method to configure defatults on an Viking Object.
//
// Example:
//
//     Viking.configure(Viking.Cursor, {per_page: 40});
//     Viking.configure(Viking.Cursor, 'per_page', 5); // per_page is 5 by defatult
Viking.config = function (obj, key, val) {
    var attrs;
    
    if (typeof key === 'object') {
      attrs = key;
    } else {
      (attrs = {})[key] = val;
    }
    
    return _.extend(obj.prototype.defaults, attrs);
};
// Used internally by Viking to translate relation arguments to key and
// Model
//
// - macro: either 'hasMany', 'belongsTo', or 'hasOne'
// - :name =>  the name of the assoication
// - options (optional):
//     - model: model to use
//     - collection: collection to use
Viking.AssociationReflection = function (macro, name, options) {
    options || (options = {});
    
    this.name = name;
    this.macro = macro;
    this.options = options;

    if(macro === 'hasMany') {
        if (options.collection) {
            this.collectionName = options.collection;
        } else if (options.model) {
            this.collectionName = (options.model + 'Collection');
        } else {
            this.collectionName = (this.name.singularize().capitalize() + 'Collection');
        }
    } else if (macro === 'belongsTo' || macro === 'hasOne') {
        if (options.model) {
            this.modelName = options.model;
        } else {
            this.modelName = name.capitalize();
        }
    } else {
        throw new TypeError("Unkown Macro " + macro);
    }
};

Viking.AssociationReflection.prototype = {
    klass: function() {
        if (this.macro === 'hasMany') {
            return this.collection();
        }
        
        return this.model();
    },
    
    model: function() {
        return this.modelName.constantize();
    },
    
    collection: function() {
        return this.collectionName.constantize();
    }
};
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
    select: function(value, options) {

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

    // Opposite of #select. Triggers the `unselected` event.
    unselect: function(options) {
        this.select(false, options);
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
		_.each(value.models, function(model) {
		  model.collection = this.attributes[key];
	        }, this);
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

        if (options.data == null && (method === 'create' || method === 'update' || method === 'patch')) {
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
    },
    
    // PUTs to `/models/:id/touch` with the intention that the server sets the
    // updated_at/on attributes to the current time.
    //
    // The JSON response is expected to return an JSON object with the attribute
    // name and the new time. Any other attributes returned in the JSON will be
    // updated on the Model as well
    //
    // If name is passed as an option it is passed as `name` paramater in the
    // request
    //
    // TODO:
    // Note that `#touch` must be used on a persisted object, or else an
    // Viking.Model.RecordError will be thrown.
    touch: function(name, options) {
        _.defaults(options || (options = {}), {
            type: 'PUT',
            url: _.result(this, 'url') + '/touch',
        });
        
        if (name) {
            options.contentType = 'application/json';
            options.data = JSON.stringify({name: name});
        } else {
            options.data = '';
        }
        
        return this.save(null, options);
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
    
    // Returns a unfetched collection with the predicate set to the query
    where: function(options) {
        var Collection = (this.modelName.capitalize() + 'Collection').constantize();
        
        return new Collection(undefined, {predicate: options});
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
// Viking.Collection
// -----------------
//
// Viking.Collection is an extension of [Backbone.Collection](http://backbonejs.org/#Collection).
// It adds predicates, selection, and modifies fetch to cancel any current
// request if a new fetch is triggered.
Viking.Collection = Backbone.Collection.extend({
    
    // Set the default model to a generic Viking.Model
    model: Viking.Model,

    constructor: function(models, options) {
        Backbone.Collection.apply(this, arguments);
        
        if(options && options.predicate) {
            this.setPredicate(options.predicate, {silent: true});
        }
        if(options && options.order) {
            this.order(options.order);
        }

    },
    
    url: function() {
        return "/" + this.model.modelName.underscore().pluralize();
    },
    paramRoot: function() {
        return this.model.modelName.underscore().pluralize();
    },
    
    // If a predicate is set it's paramaters will be passed under the
    // `where` key when querying the server. #predicateChanged is
    // set as a callback on the `change` event for the predicate
    //
    // #setPredicate accepts either attributes to instaniate a
    // Viking.Predicate or an instanceof a Viking.Predicate
    //
    // To remove a predeicate call `#setPredicate` with a falsey value.
    //
    // Calling #setPredicate and setting it the same object that is currently
    // the predicate will not trigger a #predicateChanged call
    setPredicate: function(predicate, options) {
        if (this.predicate === predicate) { return false; }
        
        if(this.predicate) { this.stopListening(this.predicate); }
        
        if(predicate) {
            if(!(predicate instanceof Viking.Predicate)) {
                predicate = new Viking.Predicate(predicate);
            }
            this.predicate = predicate;
            this.listenTo(predicate, 'change', this.predicateChanged);
            if(!(options && options.silent)) { this.predicateChanged(); }
        } else if (this.predicate) {
            delete this.predicate;
            if(!(options && options.silent)) { this.predicateChanged(); }
        }
    },
    
    // Called when the predicate is changed. Having this being called
    // when the predicate changes instead of just `fetch` allows sub
    // collections to overwrite what happens when it changes. An example
    // of this would be the `Viking.PaginatedCollection`
    predicateChanged: function(predicate, options) {
        this.fetch();
    },

    // Sets `'selected'` to `true` on the `model`. By default all other models
    // will be unselected. If `{multiple: true}` is passed as an option the other
    // models will not be unselected. Triggers the `selected` event on the
    // collection. If the model is already selected the `selected` event is
    // not triggered
    select: function(model, options) {
        options || (options = {});
        
        if(!options.multiple) {
            this.clearSelected(model);
        }
        if(!model.selected) {
            model.selected = true;
            model.trigger('selected', this.selected());
        }
    },
    
    // returns all the models where `selected` == true
    selected: function() {
        return this.filter(function(m) { return m.selected; });
    },
    
    // Sets `'selected'` to `false` on all models
    clearSelected: function(exceptModel) {
        if(exceptModel instanceof Backbone.Model) {
            exceptModel = exceptModel.cid;
        }
        this.each(function(m) {
            if(m.cid !== exceptModel) {
                m.unselect();
            }
        });
    },
    
    // Override the default Backbone.Collection#fetch to cancel any current
    // fetch request if fetch is called again. For example when the predicate
    // changes 3 times, if the first 2 request don't return before the 3rd is
    // sent they will be canceled and only the last one will finish and update
    // the collection. You won't get the collection being updated 3 times.
    fetch: function(options) {
        options || (options = {});
        
        var complete = options.complete;
        options.complete = _.bind(function() {
            delete this.xhr;
            if(complete) { complete(); }
        }, this);
        
        if (this.xhr) { this.xhr.abort(); }
        this.xhr = Backbone.Collection.prototype.fetch.call(this, options);
    },
    
	// TODO: testme?
    sync: function(method, model, options) {
        if(method === 'read' && this.predicate) {
            options.data || (options.data = {});
            options.data.where = this.predicate.attributes;
        }
        if(method === 'read' && this.ordering) {
            options.data || (options.data = {});
            options.data.order = this.ordering;
        }
        return Backbone.sync.call(this, method, model, options);
    },

	// order('size') 							=> [{'size': 'asc'}]
	// order('size', 'id') 						=> [{'size': 'asc'}, {'id': 'asc'}]
	// order('listings.size') 					=> [{'listings.size': 'asc'}]
	// order('listings.size', 'properties.id') 	=> [{'listings.size': 'asc'}, {'properties.id': 'asc'}]
	// order({size: 'asc'}) 					=> [{'size': 'asc'}]
	// order({size: 'desc'}) 					=> [{'size': 'desc'}]
	// order({'listings.size': 'desc'}) 		=> [{'listings.size': 'desc'}]
	// order({size: 'asc'}, {size: 'desc'})		=> [{'size': 'asc'}, {'id': 'desc'}]
	order: function(order) {
		var ordering;
		
		if (order === null) {
			ordering = null;
		} else {
			ordering = (_.isArray(order) ? order : arguments);
			ordering = _.map(ordering, function(order) {
				var normalized_order;
			
				if(typeof order === 'string') {
					normalized_order = {};
					normalized_order[order] = 'asc';
				} else {
					normalized_order = order;
				}
			
				return normalized_order;
			});
		}
		
		this.ordering = ordering;
		return this;
	}
    
});
Viking.Coercions = {};
Viking.Coercions.Boolean = {
    load: function(value) {
        if (typeof value === 'string') {
            value = (value === 'true')
        }

        return !!value;
    },

    dump: function(value) {
        return value;
    }
};
Viking.Coercions.Date = {
    load: function(value) {
        if (typeof value === 'string' || typeof value === 'number') {
            return Date.fromISO(value);
        }

        if (!(value instanceof Date)) {
            throw new TypeError(typeof value + " can't be coerced into Date");
        }

        return value;
    },

    dump: function(value) {
        return value.toISOString();
    }
};
Viking.Coercions.JSON = {
    load: function(value, key) {
        if (typeof value === 'object') {
            var model = new Viking.Model(value);
            model.modelName = key;
            return model;
        }

        throw new TypeError(typeof value + " can't be coerced into JSON");
    },

    dump: function(value) {
        if (value instanceof Viking.Model) {
            return value.toJSON();
        }

        return value;
    }
};
Viking.Coercions.Number = {
    load: function(value) {
        if (typeof value === 'string') {
            value = value.replace(/\,/g, '');
        }

        return Number(value);
    },

    dump: function(value) {
        if (typeof value === 'string') {
            value = value.replace(/\,/g, '');
        }

        return Number(value);
    }
};
Viking.Coercions.String = {
    load: function(value) {
        if (typeof value !== 'string' && value !== undefined && value !== null) {
            return String(value);
        }

        return value;
    },

    dump: function(value) {
        if (typeof value !== 'string' && value !== undefined && value !== null) {
            return String(value);
        }

        return value;
    }
};
// Viking.View
// -----------
//
// Viking.View is a simple extension of [Backbone.View](http://backbonejs.org/#View).
// When a Viking.View is extended events the parent events get merged in with
// the child events. When a Viking.View is instantiated the parent initalizers
// are also automatically called, first the parent's initalizer then the
// child's. 
Viking.View = Backbone.View.extend({    
}, {
    
    extend: function(protoProps, staticProps) {
		if(protoProps && protoProps.events && this.prototype.events) {
			_.defaults(protoProps.events, this.prototype.events);
		}
		
		if(protoProps && protoProps.initialize && this.prototype.initialize) {
			var parentInitialize = this.prototype.initialize;
			protoProps.initialize = _.wrap(protoProps.initialize, function(childInitialize, arguments) {
				parentInitialize.apply(this, arguments);
				childInitialize.apply(this, arguments);
			});
		}
		
		return Backbone.View.extend.call(this, protoProps, staticProps);
    }
});
Backbone.Model.prototype.updateAttribute = function (key, value, options){
    var data = {};
    data[key] = value;
    this.updateAttributes(data, options);
};

Backbone.Model.prototype.updateAttributes = function (data, options) {
    options.patch = true;
    this.save(data, options);
};
Viking.PaginatedCollection = Viking.Collection.extend({
    constructor: function(models, options) {
        Viking.Collection.apply(this, arguments);
        this.cursor = ((options && options.cursor) || new Viking.Cursor());
        this.listenTo(this.cursor, 'change', function() {
            if(this.cursor.requiresRefresh()) {
                this.cursorChanged.apply(this, arguments);
            }
        });
    },
    
    predicateChanged: function(predicate, options) {
        this.cursor.reset({silent: true});
        this.cursorChanged();
    },
    
    cursorChanged: function(cursor, options) {
        this.fetch();
    },
    
    parse: function(attrs, xhr) {
        var cursor_keys = ['page', 'per_page', 'offset', 'total', 'total_pages', 'count'];
        var cursor_attrs = _.pick(attrs, cursor_keys);
        _.each(cursor_attrs, function(v, k) {
            cursor_attrs[k] = parseInt(v, 10);
        });

        this.cursor.set(cursor_attrs);
        return attrs[this.paramRoot()];
    },
    
    sync: function(method, model, options) {
        if(method === 'read') {
            options.data || (options.data = {});
            options.data.page = model.cursor.get('page');
            options.data.per_page = model.cursor.get('per_page');
            options.data.offset = model.cursor.get('offset');
        }
        return Viking.Collection.prototype.sync.call(this, method, model, options);
    }
    
});
Viking.Controller = Backbone.Model;
Viking.Predicate = Backbone.Model;
Viking.Cursor = Backbone.Model.extend({
    defaults: {
        page: 1,
        offset: 0,
        per_page: 25,
        total: undefined,
        total_pages: undefined
    },
    
    reset: function(options) {
        this.set({
            page: 1,
            offset: 0,
            total: undefined,
            total_pages: undefined
        }, {silent: true});
        if(!(options && options.silent) && this.requiresRefresh()) {
            this.trigger('reset', this, options);
        }
    },
    
    incrementPage: function(options) {
        this.set('page', this.get('page') + 1, options);
    },
    
    decrementPage: function(options) {
        this.set('page', this.get('page') - 1, options);
    },
    
    goToPage: function(pageNumber, options) {
        this.set('page', pageNumber, options);
    },
    
    requiresRefresh: function() {
        var changedAttributes = this.changedAttributes();
        if(changedAttributes) {
            var triggers = ['page', 'offset', 'per_page'];
            return (_.intersection(_.keys(changedAttributes), triggers).length > 0);
        }
        
        return false;
    }
    
});
Viking.Router = Backbone.Router.extend({

    route: function (route, name, callback) {
        var router, controller, action;

        if (!_.isRegExp(route)) {
            if (/^r\/.*\/$/.test(route)) {
                route = new RegExp(route.slice(2, -1));
            } else {
                route = this._routeToRegExp(route);
            }
        }

        if (_.isFunction(name)) {
            callback = name;
            name = '';
        } else if (_.isString(name) && name.match(/^(\w+)#(\w+)$/)) {
            controller = /^(\w+)#(\w+)$/.exec(name);
            action = controller[2];
            controller = controller[1];
            callback = {controller: controller, action: action};
        } else if (_.isObject(name)) {
            // TODO: maybe this should be Controller::action since it's not
            // an instance method
            controller = /^(\w+)#(\w+)$/.exec(name.to);
            action = controller[2];
            controller = controller[1];
            name = name.name;

            callback = {controller: controller, action: action};
        }

        if (!callback) { callback = this[name]; }

        router = this;
        Backbone.history.route(route, function (fragment) {
			var Controller;
            var args = router._extractParameters(route, fragment);
			var current_controller = Viking.controller;
			Viking.controller = undefined;

			if (!callback) { return; }
			
			if (_.isFunction(callback)) {
				callback.apply(router, args);
			} else if (window[callback.controller]) {
				Controller = window[callback.controller];
				
				if (Controller.__super__ === Viking.Controller.prototype) {
					if ( !(current_controller instanceof Controller) ) {
						Viking.controller = new Controller();
					} else {
						Viking.controller = current_controller;
					}
				} else {
					Viking.controller = Controller;
				}
				
				if (Viking.controller && Viking.controller[callback.action]) {
					Viking.controller[callback.action].apply(Viking.controller, args);
				}
			}
			
            router.trigger.apply(router, ['route:' + name].concat(args));
            router.trigger('route', name, args);
            Backbone.history.trigger('route', router, name, args);
        });
        return this;
    },

    start: function () {
        return Backbone.history.start({pushState: true});
    },

    stop: function () {
        Backbone.history.stop();
    },

    navigate: function (fragment, args) {
        var root_url = window.location.protocol + '//' + window.location.host;
        if (fragment.indexOf(root_url) === 0) { fragment = fragment.replace(root_url, ''); }

        Backbone.Router.prototype.navigate.call(this, fragment, args);
    }

});















//






