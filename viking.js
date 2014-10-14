//     Viking.js 0.7.0
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

Viking.ArgumentError = function (message) {
  this.name = "Viking.ArgumentError";
  this.message = message ? message : 'Insufficient arguments';
};

Viking.ArgumentError.prototype = Error.prototype;
// Viking.Support
// -------------
//
// Viking.Support is a collection of utility classes and standard library
// extensions that were found useful for the Viking framework. These
// additions reside in this package so they can be loaded as needed
// in Javascript projects outside of Viking.
// Calls `to_param` on all its elements and joins the result with slashes.
// This is used by url_for in Viking Pack.
Object.defineProperty(Array.prototype, 'toParam', {
    value: function() {
        return _.map(this, function(e) { return e.toParam(); }).join('/');
    },
    writable: true,
    configureable: true,
    enumerable: false
});


// Converts an array into a string suitable for use as a URL query string,
// using the given key as the param name.
Object.defineProperty(Array.prototype, 'toQuery', {
    value: function (key) {
        var prefix = key + "[]";
        return _.map(this, function(value) { return value === null ? escape(prefix) + '=' : value.toQuery(prefix); }).join('&');
    },
    writable: true,
    configureable: true,
    enumerable: false
});
// Alias of to_s.
Boolean.prototype.toParam = Boolean.prototype.toString;

Boolean.prototype.toQuery = function(key) {
	return escape(key.toParam()) + "=" + escape(this.toParam());
};
// strftime relies on https://github.com/samsonjs/strftime. It supports
// standard specifiers from C as well as some other extensions from Ruby.
Date.prototype.strftime = function(fmt) {
    return strftime(fmt, this);
};

// TODO: move to depedency for old browsers
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
};
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
};
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
// The string pairs "key=value" that conform the query string are sorted
// lexicographically in ascending order.
Object.defineProperty(Object.prototype, 'toParam', {
    value: function(namespace) {
        return _.map(this, function(value, key) {
            var namespaceWithKey = (namespace ? (namespace + "[" + key + "]") : key);

            if (value !== null && value !== undefined) {
                return value.toQuery(namespaceWithKey);
            }

            return escape(namespaceWithKey) + "=";

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
// trailing "_id", if any. Like titleize, this is meant for creating pretty output.
String.prototype.humanize = function() {
    var result = this.toLowerCase().replace(/_id$/, '').replace(/_/g, ' ');
    result = result.replace(/([a-z\d]*)/g, function(m) { return m.toLowerCase(); });
    return result.capitalize();
};

// Makes an underscored, lowercase form from the expression in the string.
//
// Changes '::' to '/' to convert namespaces to paths.
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
};

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
};

// Alias of to_s.
String.prototype.toParam = String.prototype.toString;

String.prototype.toQuery = function(key) {
	return escape(key.toParam()) + "=" + escape(this.toParam());
};







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
// Viking.sync
// -------------
// Override Backbone.sync to process data for the ajax request with 
// +toParam()+ as opposed to letting jQuery automatically call $.param().
(function () {

    Viking.sync = function(method, model, options) {
      var type = methodMap[method];

      // Default options, unless specified.
      _.defaults(options || (options = {}), {
        emulateHTTP: Backbone.emulateHTTP,
        emulateJSON: Backbone.emulateJSON
      });

      // Default JSON-request options.
      var params = {type: type, dataType: 'json'};

      // Ensure that we have a URL.
      if (!options.url) {
        params.url = _.result(model, 'url') || urlError();
      }

      // Ensure that we have the appropriate request data.
      if (options.data == null && model && (method === 'create' || method === 'update' || method === 'patch')) {
        params.contentType = 'application/json';
        params.data = JSON.stringify(options.attrs || model.toJSON(options));
      }

      // For older servers, emulate JSON by encoding the request into an HTML-form.
      if (options.emulateJSON) {
        params.contentType = 'application/x-www-form-urlencoded';
        params.data = params.data ? {model: params.data} : {};
      }

      // For older servers, emulate HTTP by mimicking the HTTP method with `_method`
      // And an `X-HTTP-Method-Override` header.
      if (options.emulateHTTP && (type === 'PUT' || type === 'DELETE' || type === 'PATCH')) {
        params.type = 'POST';
        if (options.emulateJSON) params.data._method = type;
        var beforeSend = options.beforeSend;
        options.beforeSend = function(xhr) {
          xhr.setRequestHeader('X-HTTP-Method-Override', type);
          if (beforeSend) return beforeSend.apply(this, arguments);
        };
      }
      
      // Don't process data on a non-GET request.
      if (params.type !== 'GET' && !options.emulateJSON) {
        params.processData = false;
      } else if (options.data && typeof options.data === 'object') {
        options.data = options.data.toParam();
      }

      // If we're sending a `PATCH` request, and we're in an old Internet Explorer
      // that still has ActiveX enabled by default, override jQuery to use that
      // for XHR instead. Remove this line when jQuery supports `PATCH` on IE8.
      if (params.type === 'PATCH' && noXhrPatch) {
        params.xhr = function() {
          return new ActiveXObject("Microsoft.XMLHTTP");
        };
      }

      // Make the request, allowing the user to override any Ajax options.
      var xhr = options.xhr = Backbone.ajax(_.extend(params, options));
      model.trigger('request', model, xhr, options);
      return xhr;
    };

    var noXhrPatch =
      typeof window !== 'undefined' && !!window.ActiveXObject &&
        !(window.XMLHttpRequest && (new XMLHttpRequest).dispatchEvent);

    // Map from CRUD to HTTP for our default `Backbone.sync` implementation.
    var methodMap = {
      'create': 'POST',
      'update': 'PUT',
      'patch':  'PATCH',
      'delete': 'DELETE',
      'read':   'GET'
    };

}());
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
            this.collectionName = (this.name.singularize().camelize() + 'Collection');
        }
    } else if (macro === 'belongsTo' || macro === 'hasOne') {
        if (!options.polymorphic) {
            this.modelName = options.model ? options.model : name.camelize();
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

    // inheritanceAttribute is the attirbutes used for STI
    inheritanceAttribute: 'type',
    
    // Below is the same code from the Backbone.Model function
    // except where there are comments
    constructor: function (attributes, options) {
        var attrs = attributes || {};
        options || (options = {});
        this.cid = _.uniqueId('c');
        this.attributes = {};
        attrs = _.defaults({}, attrs, _.result(this, 'defaults'));
        
        if (this.inheritanceAttribute) {
            if (attrs[this.inheritanceAttribute] && this.constructor.modelName !== attrs[this.inheritanceAttribute]) {
                // OPTIMIZE:  Mutating the [[Prototype]] of an object, no matter how
                // this is accomplished, is strongly discouraged, because it is very
                // slow and unavoidably slows down subsequent execution in modern
                // JavaScript implementations
                // Ideas: Move to Model.new(...) method of initializing models
                var type = attrs[this.inheritanceAttribute].camelize().constantize();
                this.constructor = type;
                this.__proto__ = type.prototype;
            }
        }
        
        // Add a helper reference to get the model name from an model instance.
        this.modelName = this.constructor.modelName;
        this.baseModel = this.constructor.baseModel;

        if (this.baseModel && this.inheritanceAttribute) {
            if (this.baseModel == this.constructor && this.baseModel.descendants.length > 0) {
                attrs[this.inheritanceAttribute] = this.modelName;
            } else if (_.contains(this.baseModel.descendants, this.constructor)) {
                attrs[this.inheritanceAttribute] = this.modelName;
            }
        }

        // Set up associations
        this.associations = this.constructor.associations;
        this.reflectOnAssociation = this.constructor.reflectOnAssociation;
        this.reflectOnAssociations = this.constructor.reflectOnAssociations;

        // Initialize any `hasMany` relationships to empty collections
        _.each(this.reflectOnAssociations('hasMany'), function(association) {
            this.attributes[association.name] = new (association.collection())();
        }, this);

        if (options.collection) { this.collection = options.collection; }
        if (options.parse) { attrs = this.parse(attrs, options) || {}; }
        
        this.set(attrs, options);
        this.changed = {};
        this.initialize.call(this, attributes, options);
    }
    
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
    extend: function(name, protoProps, staticProps) {
        if(typeof name !== 'string') {
            staticProps = protoProps;
            protoProps = name;
        }
        protoProps || (protoProps = {});

        var child = Backbone.Model.extend.call(this, protoProps, staticProps);

        if(typeof name === 'string') { child.modelName = name; }

        child.associations = {};
        child.descendants = [];
        child.inheritanceAttribute = (protoProps.inheritanceAttribute === undefined) ? this.prototype.inheritanceAttribute : protoProps.inheritanceAttribute;
        
        if (child.inheritanceAttribute === false || this === Viking.Model) {
            child.baseModel = child;
        } else {
            child.baseModel.descendants.push(child);
        }
        
        _.each(['hasMany', 'belongsTo'], function(macro) {
            _.each((protoProps[macro] || []).concat(this[macro] || []), function(name) {
                var options;

                // Handle both `type, key, options` and `type, [key, options]` style arguments
                if (_.isArray(name)) {
                    options = name[1];
                    name = name[0];
                }

                if (!child.associations[name]) {
                    child.associations[name] = new Viking.AssociationReflection(macro, name, options);
                }
            });
        }, this.prototype);
        
        if (this.prototype.coercions && protoProps.coercions) {
            _.each(this.prototype.coercions, function(value, key) {
                if(!child.prototype.coercions[key]) {
                    child.prototype.coercions[key] = value;
                }
            });
        }

        
        return child;
    }

});
// Find model by id. Accepts success and error callbacks in the options
// hash, which are both passed (model, response, options) as arguments.
//
// Find returns the model, however it most likely won't have fetched the
// data	from the server if you immediately try to use attributes of the
// model.
Viking.Model.find = function(id, options) {
	var model = new this({id: id});
	model.fetch(options);
	return model;
};
Viking.Model.reflectOnAssociation = function(name) {
    return this.associations[name];
}
Viking.Model.reflectOnAssociations = function(macro) {
    var associations = _.values(this.associations);
    if (macro) {
        associations = _.select(associations, function(a) {
            return a.macro === macro;
        });
    }

    return associations;
}
// Generates the `urlRoot` based off of the model name.
Viking.Model.urlRoot = function() {
    return "/" + this.baseModel.modelName.pluralize();
};
// Returns a unfetched collection with the predicate set to the query
Viking.Model.where = function(options) {
    var Collection = (this.modelName.capitalize() + 'Collection').constantize();
    
    return new Collection(undefined, {predicate: options});
};
Viking.Model.prototype.coerceAttributes = function(attrs) {
    
    _.each(this.associations, function(association) {
        var polymorphic = association.options.polymorphic;
        
        if (!attrs[association.name]) return;
        
        if (polymorphic && (attrs[association.name] instanceof Viking.Model)) {
            // TODO: remove setting the id?
            attrs[association.name + '_id'] = attrs[association.name].id;
            attrs[association.name + '_type'] = attrs[association.name].modelName;
        } else if (polymorphic && attrs[association.name + '_type']) {
            var Type = attrs[association.name + '_type'].camelize().constantize();
            attrs[association.name] = new Type(attrs[association.name]);
        } else if (!(attrs[association.name] instanceof association.klass())) {
            var Type = association.klass();
            attrs[association.name] = new Type(attrs[association.name]);
        }
    });

    _.each(this.coercions, function (type, key) {
        if (attrs[key] || attrs[key] === false) {
            var tmp, klass, options;
            
            if (_.isArray(type)) {
                options = type[1];
                type = type[0];
            } else {
                options = {};
            }
            
            klass = Viking.Coercions[type];
            
            if (klass) {
                if (options.array) {
                    tmp = [];
                    _.each(attrs[key], function(value) {
                        tmp.push(klass.load(value, key));
                    });
                    attrs[key] = tmp;
                } else {
                    attrs[key] = klass.load(attrs[key], key);
                }
            } else {
                throw new TypeError("Coercion of " + type + " unsupported");
            }
        }
    });

    return attrs;
    
};
// TODO: testme
Viking.Model.prototype.errorsOn = function(attribute) {
    if (this.validationError) {
        return this.validationError[attribute];
    }

    return false;
};
// Returns string to use for params names. This is the key attributes from
// the model will be namespaced under when saving to the server
Viking.Model.prototype.paramRoot = function() {
    return this.baseModel.modelName.underscore();
};
// Overwrite Backbone.Model#save so that we can catch errors when a save
// fails.
Viking.Model.prototype.save = function(key, val, options) {
    var attrs, method, xhr, attributes = this.attributes;

    // Handle both `"key", value` and `{key: value}` -style arguments.
    if (key == null || typeof key === 'object') {
      attrs = key;
      options = val;
    } else {
      (attrs = {})[key] = val;
    }

    options = _.extend({validate: true}, options);

    // If we're not waiting and attributes exist, save acts as
    // `set(attr).save(null, opts)` with validation. Otherwise, check if
    // the model will be valid when the attributes, if any, are set.
    if (attrs && !options.wait) {
      if (!this.set(attrs, options)) return false;
    } else {
      if (!this._validate(attrs, options)) return false;
    }

    // Set temporary attributes if `{wait: true}`.
    if (attrs && options.wait) {
      this.attributes = _.extend({}, attributes, attrs);
    }

    // After a successful server-side save, the client is (optionally)
    // updated with the server-side state.
    if (options.parse === void 0) options.parse = true;
    var model = this;
    var success = options.success;
    options.success = function(resp) {
      // Ensure attributes are restored during synchronous saves.
      model.attributes = attributes;
      var serverAttrs = model.parse(resp, options);
      if (options.wait) serverAttrs = _.extend(attrs || {}, serverAttrs);
      if (_.isObject(serverAttrs) && !model.set(serverAttrs, options)) {
        return false;
      }
      if (success) success(model, resp, options);
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
            if (error) error(model, resp, options);
            model.trigger('error', model, resp, options);
        }
    };

    method = this.isNew() ? 'create' : (options.patch ? 'patch' : 'update');
    if (method === 'patch') options.attrs = attrs;
    xhr = this.sync(method, this, options);

    // Restore attributes.
    if (attrs && options.wait) this.attributes = attributes;

    return xhr;
}
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
Viking.Model.prototype.select = function(value, options) {

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
};
Viking.Model.prototype.set = function (key, val, options) {
    var attrs;
    if (key === null) { return this; }

    // Handle both `"key", value` and `{key: value}` -style arguments.
    if (typeof key === 'object') {
        attrs = key;
        options = val;
    } else {
        (attrs = {})[key] = val;
    }

    if (this.inheritanceAttribute && attrs[this.inheritanceAttribute] && this.constructor.modelName !== attrs.type) {
        // OPTIMIZE:  Mutating the [[Prototype]] of an object, no matter how
        // this is accomplished, is strongly discouraged, because it is very
        // slow and unavoidably slows down subsequent execution in modern
        // JavaScript implementations
        // Ideas: Move to Model.new(...) method of initializing models
        var type = attrs[this.inheritanceAttribute].camelize().constantize();
        this.constructor = type;
        this.__proto__ = type.prototype;
		this.modelName = type.modelName
        
        // TODO: move to function, used in Model.new
        // TODO: probably move to a becomes method
        // Set up associations
        this.associations = this.constructor.associations;
        this.reflectOnAssociation = this.constructor.reflectOnAssociation;
        this.reflectOnAssociations = this.constructor.reflectOnAssociations;

        // Initialize any `hasMany` relationships to empty collections
        _.each(this.reflectOnAssociations('hasMany'), function(association) {
            if (!this.attributes[association.name]) {
                this.attributes[association.name] = new (association.collection())();
            }
        }, this);
    }

    this.coerceAttributes(attrs);
    _.each(attrs, function(value, key) {
        var association = this.reflectOnAssociation(key);
        if (association && association.macro === 'hasMany') {
            if (!value) {
                this.attributes[key].set([]);
            } else {
                this.attributes[key].set(value.models);
                _.each(value.models, function(model) {
                    model.collection = this.attributes[key];
                }, this);
            }

            delete attrs[key];
        }
    }, this);
    
    return Backbone.Model.prototype.set.call(this, attrs, options);
};
Viking.Model.prototype.setErrors = function(errors, options) {
    if(_.size(errors) === 0) { return; }

    var model = this;
    this.validationError = errors;

    model.trigger('invalid', this, errors, options);
};
// Override [Backbone.Model#sync](http://backbonejs.org/#Model-sync).
// [Ruby on Rails](http://rubyonrails.org/) expects the attributes to be
// namespaced
Viking.Model.prototype.sync = function(method, model, options) {
    options || (options = {});

    if (options.data == null && (method === 'create' || method === 'update' || method === 'patch')) {
        options.contentType = 'application/json';
        options.data = {};
        options.data[_.result(model, 'paramRoot')] = (options.attrs || model.toJSON(options));
        options.data = JSON.stringify(options.data);
    }

    return Viking.sync.call(this, method, model, options);
};
// similar to Rails as_json method
Viking.Model.prototype.toJSON = function (options) {
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
            var tmp, klass, options;
            
            // TODO: this and coercison.js do the same transformation, run at
            // inital load like relations?
            if (_.isArray(type)) {
                options = type[1];
                type = type[0];
            } else {
                options = {};
            }
            
            klass = Viking.Coercions[type];

            if (klass) {
                if (options.array) {
                    tmp = [];
                    _.each(data[key], function(value) {
                        tmp.push(klass.dump(value, key));
                    });
                    data[key] = tmp;
                } else {
                    data[key] = klass.dump(data[key], key);
                }
            } else {
                throw new TypeError("Coercion of " + type + " unsupported");
            }
        }
    });

    return data;
};
// Returns a string representing the object's key suitable for use in URLs,
// or nil if `#isNew` is true.
Viking.Model.prototype.toParam = function() {
    return this.isNew() ? null : this.get('id');
};
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
Viking.Model.prototype.touch = function(name, options) {

    // TODO move to extend and extend a new object so not writing to old options
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
};
// Opposite of #select. Triggers the `unselected` event.
Viking.Model.prototype.unselect = function(options) {
    this.select(false, options);
};
// TODO: test return
Viking.Model.prototype.updateAttribute = function (key, value, options) {
    var data = {};
    data[key] = value;
    
    return this.updateAttributes(data, options);
};
// TODO: test return
Viking.Model.prototype.updateAttributes = function (data, options) {
    options || (options = {});
    options.patch = true;
    
    return this.save(data, options);
};
// Default URL for the model's representation on the server
Viking.Model.prototype.url = function() {
    var base =
      _.result(this, 'urlRoot') ||
      _.result(this.collection, 'url') ||
      urlError();

    if (this.isNew()) return base;
        
    return base.replace(/([^\/])$/, '$1/') + this.toParam();
};
// Alias for `::urlRoot`
Viking.Model.prototype.urlRoot = function() {
    return this.constructor.urlRoot();
};
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
        Backbone.Collection.call(this, models, options);
        
        if(options && options.predicate) {
            this.setPredicate(options.predicate, {silent: true});
        }
        if(options && options.order) {
            this.order(options.order, {silent: true});
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
        
        return Viking.sync.apply(this, arguments);
    },

    // If a order is set it's paramaters will be passed under the
    // `order` key when querying the server. #orderChanged is
    // set as a callback when the ordering is changed.
    //
    // `#order` accepts key(s) or object(s) specifiying the keys and direction of
    // ordering
    //
    // To remove the ordering call `#order` with a falsey value.
    //
    // If the last arguments has the `silent` key it it. It will be considered
    // as options
    //
    // Examples
    // --------
    //
    // order('size')                            => [{'size': 'asc'}]
    // order(['size', 'id'])                      => [{'size': 'asc'}, {'id': 'asc'}]
    // order('listings.size')                   => [{'listings.size': 'asc'}]
    // order(['listings.size', 'properties.id'])  => [{'listings.size': 'asc'}, {'properties.id': 'asc'}]
    // order({size: 'asc'})                     => [{'size': 'asc'}]
    // order([{size: 'desc'}])                    => [{'size': 'desc'}]
    // order({'listings.size': 'desc'})         => [{'listings.size': 'desc'}]
    // order([{size: 'asc'}, {size: 'desc'}])     => [{'size': 'asc'}, {'id': 'desc'}]
    // order({size: 'asc'}, {silent: true})     => [{'size': 'asc'}]
    order: function(order, options) {
        options || (options = {});
        order = (_.isArray(order) ? order : [order]);
        
        order = _.map(order, function(o) {
            var normalized_order;
            
            if(typeof o === 'string') {
                normalized_order = {};
                normalized_order[o] = 'asc';
            } else {
                normalized_order = o;
            }
            
            return normalized_order;
        });
        
        if (order.length === 1 && !order[0]) {
            this.ordering = undefined;
            if (!options.silent) { this.orderChanged(order); }
            return;
        }
        
        if (this.ordering) {
            var orderingEqual = _.find( _.map(this.ordering, function(el, i) { return _.isEqual(el, order[i]); }), function (el) { return el; } );
            if (!orderingEqual) {
                this.ordering = order;
                if (!options.silent) { this.orderChanged(order); }
            }
            return;
        }
        
        this.ordering = order;
        if (!options.silent) { this.orderChanged(order); }
    },
    
    // Called when the order is changed. Having this being called
    // when the predicate changes instead of just `fetch` allows sub
    // collections to overwrite what happens when it changes, similar to
    // #predicateChanged
    orderChanged: function(order) {
        this.fetch();
    }
    
});
Viking.Coercions = {};
Viking.Coercions.Boolean = {
    load: function(value) {
        if (typeof value === 'string') {
            value = (value === 'true');
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
			var AnonModel = Viking.Model.extend({
				inheritanceAttribute: false
			});
            var model = new AnonModel(value);
            model.modelName = key;
            model.baseModel = model;
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
			
			if (value.trim() === '') {
				return null;
			}
        }

        return Number(value);
    },

    dump: function(value) {
		return value;
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
// Viking.View is a framework fro handling view template lookup and rendering.
// It provides view helpers that assisst when building HTML forms and more.
Viking.View = Backbone.View.extend({

    template : undefined,

    renderTemplate : function(locals) {
        return Viking.View.Helpers.render(this.template, locals);
    }

}, {

    templates    : {},

    // Override the original extend function to support merging events
    extend: function(protoProps, staticProps) {
        if (protoProps  && protoProps.events) {
            _.defaults(protoProps.events, this.prototype.events);
        }

        return Backbone.View.extend.call(this, protoProps, staticProps);
    }
});

Viking.View.Helpers = {};








(function () {
    var booleanAttributes = ['disabled', 'readonly', 'multiple', 'checked',
        'autobuffer', 'autoplay', 'controls', 'loop', 'selected', 'hidden',
        'scoped', 'async', 'defer', 'reversed', 'ismap', 'seemless', 'muted',
        'required', 'autofocus', 'novalidate', 'formnovalidate', 'open',
        'pubdate', 'itemscope'];
    
    Viking.View.tagOption = function (key, value, escape) {
        if (_.isArray(value)) { value = value.join(" "); }
        if (escape) { value = _.escape(value); }
    
        return key + '="' + value + '"';
    };

    Viking.View.dataTagOption = function (key, value, escape) {
        key = "data-" + key;
        if (_.isObject(value)) { value = JSON.stringify(value); }
    
        return Viking.View.tagOption(key, value, escape);
    };

    Viking.View.tagOptions = function (options, escape) {
        if (options === undefined) { return ""; }
        if (escape === undefined) { escape = true; }
    
        var attrs = [];
        _.each(options, function(value, key) {
            if (key === "data" && _.isObject(value)) {
                // TODO testme
                _.each(value, function(value, key) {
                    attrs.push(Viking.View.dataTagOption(key, value, escape));
                });
            } else if (value === true && _.contains(booleanAttributes, key)) {
                attrs.push(key);
            } else if (value !== null && value !== undefined) {
                attrs.push(Viking.View.tagOption(key, value, escape));
            }
        });

        if (attrs.length === 0) {
           return '';
        }
        
        return " " + attrs.sort().join(' ');
    };
    
    // see http://www.w3.org/TR/html4/types.html#type-name
    Viking.View.sanitizeToId = function (name) {
        return name.replace(/[^\-a-zA-Z0-9:.]/g, "_").replace(/_+/g, '_').replace(/_+$/, '').replace(/_+/g, '_');
    };

    // TODO: move to model_helpers?
    Viking.View.tagNameForModelAttribute = function (model, attribute, options) {
        options || (options = {});
        
        var value = model.get(attribute);
        var name;
        if (options.namespace) {
            name = options.namespace + '[' + model.baseModel.modelName + '][' + attribute + ']';
        } else {
            name = model.baseModel.modelName + '[' + attribute + ']';
        }
        
         if (value instanceof Viking.Collection || _.isArray(value)) {
             name = name + '[]';
         }
     
         return name;
    };

    // TODO: move to model_helpers?
    Viking.View.addErrorClassToOptions = function(model, attribute, options) {
        if (model.errorsOn(attribute)) {
            if (options['class']) {
                options['class'] = options['class'] + ' error';
            } else {
                options['class'] = 'error';
            }
        }
    };

    // TODO: move to model_helpers?
    // TODO: testme
    Viking.View.methodOrAttribute = function (model, funcOrAttribute) {
        if (typeof funcOrAttribute !== 'function') {
            if (model[funcOrAttribute]) {
                return _.result(model, funcOrAttribute);
            }
            
            return model.get(funcOrAttribute);
        }

        return funcOrAttribute(model);
    };
    
}());
// tag(name, [options = {}, escape = true])
// ========================================
//
// Returns an empty HTML tag of type `name` add HTML attributes by passing
// an attributes hash to `options`. Set escape to `false` to disable attribute
// value escaping.
//
// Arguments
// ---------
// - Use `true` with boolean attributes that can render with no value, like `disabled` and `readonly`.
// - HTML5 data-* attributes can be set with a single data key pointing to a hash of sub-attributes.
// - Values are encoded to JSON, with the exception of strings and symbols.
//
// Examples
// --------
//
//   tag("br")
//   // => <br>
//
//   tag("input", {type: 'text', disabled: true})
//   // => <input type="text" disabled="disabled" />
//
//   tag("img", {src: "open & shut.png"})
//   // => <img src="open &amp; shut.png" />
//   
//   tag("img", {src: "open &amp; shut.png"}, false, false)
//   // => <img src="open &amp; shut.png" />
//   
//   tag("div", {data: {name: 'Stephen', city_state: ["Chicago", "IL"]}})
//   // => <div data-name="Stephen" data-city_state="[&quot;Chicago&quot;,&quot;IL&quot;]" />
Viking.View.Helpers.tag = function (name, options, escape) {
    return "<" + name + Viking.View.tagOptions(options, escape) + ">";
};
// contentTag(name, [content], [options], [escape=true], [&block])
// ================================================================
//
// Returns an HTML block tag of type name surrounding the content. Add HTML
// attributes by passing an attributes hash to options. Instead of passing the
// content as an argument, you can also use a function in which case, you pass
// your options as the second parameter. Set escape to false to disable attribute
// value escaping.
//
// Examples
//
//   contentTag("p", "Hello world & all!")
//   // => <p>Hello world &amp; all!</p>
//
//   contentTag("p", "Hello world & all!", false)
//   // => <p>Hello world & all!</p>
//
//   contentTag("div", contentTag("p", "Hello world!"), {class: "strong"})
//   // => <div class="strong"><p>Hello world!</p></div>
//
//   contentTag("select", options, {multiple: true})
//   // => <select multiple="multiple">...options...</select>
//   
//   contentTag("div", {class: "strong"}, function() {
//      return "Hello world!";
//   });
//   // => <div class="strong">Hello world!</div>
Viking.View.Helpers.contentTag = function (name, content, options, escape) {
    var tmp;

    // Handle `name, content`, `name, content, options`,
    // `name, content, options, escape`, `name, content, escape`, `name, block`,
    // `name, options, block`, `name, options, escape, block`, && `name, escape, block`
    // style arguments
    if (typeof content === "boolean") {
        escape = content;
        content = options;
        options = undefined;
    } else if (typeof content === 'object') {
        if (typeof options === 'function') {
            tmp = options;
            options = content;
            content = tmp;
        } else if (typeof options === 'boolean') {
            tmp = content;
            content = escape;
            escape = options;
            options = tmp;
        }
    } else if (typeof options === 'boolean') {
        escape = options;
        options = undefined;
    }
    if (typeof content === 'function') {
        content = content();
    }
    if (escape || escape === undefined) {
        content = _.escape(content);
    }

    return "<" + name + Viking.View.tagOptions(options, escape) + ">" + content + "</" + name + ">";
};
// buttonTag(content, options), buttonTag(options, block)
// ========================================================
//
// Creates a button element that defines a submit button, reset button or a
// generic button which can be used in JavaScript, for example. You can use
// the button tag as a regular submit tag but it isn't supported in legacy
// browsers. However, the button tag allows richer labels such as images and
// emphasis.
//
// Options
// -------
//      - disabled: If true, the user will not be able to use this input.
//      - Any other key creates standard HTML attributes for the tag
//
// Examples
// --------
//   buttonTag("Button")
//   // => <button name="button" type="submit">Button</button>
//   
//   buttonTag("Checkout", { :disabled => true })
//   // => <button disabled name="button" type="submit">Checkout</button>
//   
//   buttonTag({type: "button"}, function() {
//      return "Ask me!";
//   });
//   // <button name="button" type="button"><strong>Ask me!</strong></button>
Viking.View.Helpers.buttonTag = function (content, options) {
    var tmp;

    // Handle `content, options` && `options` style arguments
    if (typeof content === 'object') {
        tmp = options;
        options = content;
        content = tmp;
    } else if (options === undefined) {
        options = {}; 
    }

    _.defaults(options, {name: 'button', type: 'submit'});
    return Viking.View.Helpers.contentTag('button', content, options);
};
// checkBoxTag(name, value="1", checked=false, options)
// ======================================================
//
// Creates a check box form input tag.
//
// Options
// -------
//      - disabled: If true, the user will not be able to use this input.
//      - Any other key creates standard HTML attributes for the tag
//
// Examples
// --------
//   checkBoxTag('accept')
//   // => <input name="accept" type="checkbox" value="1" />
//   
//   checkBoxTag('rock', 'rock music')
//   // => <input name="rock" type="checkbox" value="rock music" />
//   
//   checkBoxTag('receive_email', 'yes', true)
//   // => <input checked="checked" name="receive_email" type="checkbox" value="yes" />
//   
//   checkBoxTag('tos', 'yes', false, class: 'accept_tos')
//   // => <input class="accept_tos" name="tos" type="checkbox" value="yes" />
//   
//   checkBoxTag('eula', 'accepted', false, disabled: true)
//   // => <input disabled="disabled" name="eula" type="checkbox" value="accepted" />
Viking.View.Helpers.checkBoxTag = function (name, value, checked, options) {
    if (value === undefined) { value = "1"; }
    if (options === undefined) { options = {}; }
    if (checked === true) { options.checked = true; }

    _.defaults(options, {
        type: "checkbox",
        value: value,
        id: Viking.View.sanitizeToId(name),
        name: name
    });

    return Viking.View.Helpers.tag("input", options);
};
// textFieldTag(name, [value], [options])
// ======================================
//
// Creates a standard text field. Returns the duplicated String.
//
// Arguments
// ---------
// name:    The name of the input
// value:   The value of the input
// options: A object with any of the following:
//      - disabled: If set to true, the user will not be able to use this input
//      - size: The number of visible characters that will fit in the input
//      - maxlength: The maximum number of characters that the browser will
//                   allow the user to enter
//      - placehoder: The text contained in the field by default, which is
//                    removed when the field receives focus
//      - Any other key creates standard HTML attributes for the tag
//
// Examples
// --------
//
//   textFieldTag('name')
//   // => <input name="name" type="text" />
//   
//   textFieldTag('query', 'Enter your search')
//   // => <input name="query" value="Enter your search" type="text" />
//   
//   textFieldTag('search', {placeholder: 'Enter search term...'})
//   // => <input name="search" placeholder="Enter search term..." type="text" />
//   
//   textFieldTag('request', {class: 'special_input'})
//   // => <input class="special_input" name="request" type="text" />
//   
//   textFieldTag('address', '', {size: 75})
//   // => <input name="address" size="75" value="" type="text" />
//   
//   textFieldTag('zip', {maxlength: 5})
//   // => <input maxlength="5" name="zip" type="text" />
//   
//   textFieldTag('payment_amount', '$0.00', {disabled: true})
//   // => <input disabled="disabled" name="payment_amount" value="$0.00" type="text" />
//   
//   textFieldTag('ip', '0.0.0.0', {maxlength: 15, size: 20, class: "ip-input"})
//   // => <input class="ip-input" maxlength="15" name="ip" size="20" value="0.0.0.0" type="text" />
Viking.View.Helpers.textFieldTag = function (name, value, options) {

    // Handle both `name, value` && `name, options` style arguments
    if (value !== null && typeof value === 'object' && !(value instanceof Backbone.Model)) {
        options = value;
        value = undefined;
    }

    return Viking.View.Helpers.tag('input', _.extend({
        type:  'text',
        id: Viking.View.sanitizeToId(name),
        name:  name,
        value: value
    }, options));
};
// hiddenFieldTag(name, value = nil, options = {})
// ===============================================
//
// Creates a hidden form input field used to transmit data that would be lost
// due to HTTP's statelessness or data that should be hidden from the user.
//
// Options
// -------
//      - Any key creates standard HTML attributes for the tag
//
// Examples
// --------
//   hiddenFieldTag('tags_list')
//   // => <input name="tags_list" type="hidden">
//   
//   hiddenFieldTag('token', 'VUBJKB23UIVI1UU1VOBVI@')
//   // => <input name="token" type="hidden" value="VUBJKB23UIVI1UU1VOBVI@">
Viking.View.Helpers.hiddenFieldTag = function (name, value, options) {
    if (options === undefined) { options = {}; }
    _.defaults(options, {type: "hidden", id: null});

    return Viking.View.Helpers.textFieldTag(name, value, options);
};
// formTag([options], [content])
// formTag([content], [options])
// =============================
//
// ==== Options
// * <tt>:action</tt> - The url the action of the form should be set to.
// * <tt>:multipart</tt> - If set to true, the enctype is set to "multipart/form-data".
// * <tt>:method</tt> - The method to use when submitting the form, usually either "get" or "post".
//   If "patch", "put", "delete", or another verb is used, a hidden input with name <tt>_method</tt>
//   is added to simulate the verb over post. The default is "POST". Only set if
//   :action is passed as an option.
//
// ==== Examples
//   formTag();
//   // => <form>
//
//   formTag({action: '/posts'});
//   // => <form action="/posts" method="post">
//
//   formTag({action: '/posts/1', method: "put"});
//   // => <form action="/posts/1" method="post"><input name="_method" type="hidden" value="put" />
//
//   formTag({action: '/upload', multipart: true});
//   // => <form action="/upload" method="post" enctype="multipart/form-data">
//
//   formTag({action: '/posts'}, function() {
//      return submitTag('Save');
//   });
//   // => <form action="/posts" method="post"><input type="submit" name="commit" value="Save" /></form>
Viking.View.Helpers.formTag = function (options, content) {
    var tmp, methodOverride = '';
    
    if (typeof options === 'function' || typeof options == 'string') {
        tmp = content;
        content = options;
        options = tmp;
    }
    options || (options = {});
    
    if (options.action && !options.method) {
        options.method = 'post';
    } else if (options.method && options.method !== 'get' && options.method !== 'post') {
        methodOverride = Viking.View.Helpers.hiddenFieldTag('_method', options.method);
        options.method = 'post'
    }
    
    if (options.multipart) {
        options.enctype="multipart/form-data";
        delete options.multipart;
    }
    

    if(typeof content !== "undefined") {
        content = methodOverride + (typeof content === 'function' ? content() : content);

        return Viking.View.Helpers.contentTag('form', content, options, false);
    }

    return Viking.View.Helpers.tag('form', options, false) + methodOverride;
};
// numberFieldTag(name, value = nil, options = {})
// ===============================================
// 
// Creates a number field.
//
// Options
// -------
//      - min:  The minimum acceptable value.
//      - max:  The maximum acceptable value.
//      - step: The acceptable value granularity.
//      - Otherwise accepts the same options as text_field_tag.
//
// Examples
// --------
//   
//   numberFieldTag('count')
//   // => <input name="count" type="number">
//   
//   nubmerFieldTag('count', 10)
//   // => <input" name="count" type="number" value="10">
//   
//   numberFieldTag('count', 4, {min: 1, max: 9})
//   // => <input min="1" max="9" name="count" type="number" value="4">
//   
//   passwordFieldTag('count', {step: 25})
//   # => <input name="count" step="25" type="number">
Viking.View.Helpers.numberFieldTag = function (name, value, options) {
    
    // Handle both `name, value, options`, and `name, options` syntax
    if (typeof value === 'object') {
        options = value;
        value = undefined;
    }
    
    options = _.extend({type: 'number'}, options);
    if (value) { options.value = value; }

    return Viking.View.Helpers.textFieldTag(name, value, options);
};
// timeTag(date, [options], [value])
// =================================
//
// Returns an html time tag for the given date or time.
//
// Examples
// --------
//
//   timeTag(Date.today)
//   // => <time datetime="2010-11-04">November 04, 2010</time>
//
//   timeTag(Date.now)
//   // => <time datetime="2010-11-04T17:55:45+01:00">November 04, 2010 17:55</time>
//
//   timeTag(Date.yesterday, 'Yesterday')
//   // => <time datetime="2010-11-03">Yesterday</time>
//
//   timeTag(Date.today, {pubdate: true})
//   // => <time datetime="2010-11-04" pubdate="pubdate">November 04, 2010</time>
//
//   timeTag(Date.today, {datetime: Date.today.strftime('%G-W%V')})
//   // => <time datetime="2010-W44">November 04, 2010</time>
//
//   time_tag(Date.now, function() {
//     return '<span>Right now</span>';
//   });
//   // => <time datetime="2010-11-04T17:55:45+01:00"><span>Right now</span></time>
Viking.View.Helpers.timeTag = function (date, content, options) {
    var tmp;

    // handle both (date, opts, func || str) and (date, func || str, opts)
    if (typeof content === 'object') {
        tmp = options;
        options = content;
        content = tmp;
    }
    options || (options = {});
    
    if (!content) {
        content = options.format ? date.strftime(format) : date.toString()
    }
    if (options.format) delete options.format;
    if (!options.datetime) options.datetime = date.toISOString();
    

    return Viking.View.Helpers.contentTag('time', content, options);
};
// labelTag(content, options)
// ========================================================
//
// Creates a label element. Accepts a block.
//
// Options - Creates standard HTML attributes for the tag.
//
// Examples
// --------
//   labelTag('Name')
//   // => <label>Name</label>
//   
//   labelTag('name', 'Your name')
//   // => <label for="name">Your name</label>
//   
//   labelTag('name', nil, {for: 'id'})
//   // => <label for="name" class="small_label">Name</label>
Viking.View.Helpers.labelTag = function (content, options, escape) {
    var tmp;

    if (typeof options === 'function') {
        tmp = content;
        content = options;
        options = tmp;
    }

    return Viking.View.Helpers.contentTag('label', content, options, escape);
};
// optionsForSelectTag(container[, selected])
// =======================================
//
// Accepts a container (hash, array, collection, your type) and returns a
// string of option tags. Given a container where the elements respond to
// first and last (such as a two-element array), the "lasts" serve as option
// values and the "firsts" as option text. Hashes are turned into this
// form automatically, so the keys become "firsts" and values become lasts.
// If +selected+ is specified, the matching "last" or element will get the
// selected option-tag. +selected+ may also be an array of values to be
// selected when using a multiple select.
//
//   optionsForSelectTag([["Dollar", "$"], ["Kroner", "DKK"]])
//   // => <option value="$">Dollar</option>
//   // => <option value="DKK">Kroner</option>
//
//   optionsForSelectTag([ "VISA", "MasterCard" ], "MasterCard")
//   // => <option>VISA</option>
//   // => <option selected>MasterCard</option>
//
//   optionsForSelectTag({ "Basic" => "$20", "Plus" => "$40" }, "$40")
//   // => <option value="$20">Basic</option>
//   // => <option value="$40" selected>Plus</option>
//
//   optionsForSelectTag([ "VISA", "MasterCard", "Discover" ], ["VISA", "Discover"])
//   // => <option selected>VISA</option>
//   // => <option>MasterCard</option>
//   // => <option selected>Discover</option>
//
// You can optionally provide html attributes as the last element of the array.
//
//   optionsForSelectTag([ "Denmark", ["USA", {class: 'bold'}], "Sweden" ], ["USA", "Sweden"])
//   // => <option value="Denmark">Denmark</option>
//   // => <option value="USA" class="bold" selected>USA</option>
//   // => <option value="Sweden" selected>Sweden</option>
//
//   optionsForSelectTag([["Dollar", "$", {class: "bold"}], ["Kroner", "DKK", {class: "alert"}]])
//   // => <option value="$" class="bold">Dollar</option>
//   // => <option value="DKK" class="alert">Kroner</option>
//
// If you wish to specify disabled option tags, set +selected+ to be a hash,
// with <tt>:disabled</tt> being either a value or array of values to be
// disabled. In this case, you can use <tt>:selected</tt> to specify selected
// option tags.
//
//   optionsForSelectTag(["Free", "Basic", "Advanced", "Super Platinum"], {disabled: "Super Platinum"})
//   // => <option value="Free">Free</option>
//   // => <option value="Basic">Basic</option>
//   // => <option value="Advanced">Advanced</option>
//   // => <option value="Super Platinum" disabled>Super Platinum</option>
//
//   optionsForSelectTag(["Free", "Basic", "Advanced", "Super Platinum"], {disabled: ["Advanced", "Super Platinum"]})
//   // => <option value="Free">Free</option>
//   // => <option value="Basic">Basic</option>
//   // => <option value="Advanced" disabled>Advanced</option>
//   // => <option value="Super Platinum" disabled>Super Platinum</option>
//
//   optionsForSelectTag(["Free", "Basic", "Advanced", "Super Platinum"], {selected: "Free", disabled: "Super Platinum"})
//   // => <option value="Free" selected>Free</option>
//   // => <option value="Basic">Basic</option>
//   // => <option value="Advanced">Advanced</option>
//   // => <option value="Super Platinum" disabled>Super Platinum</option>
//
// NOTE: Only the option tags are returned, you have to wrap this call in a
// regular HTML select tag.
Viking.View.Helpers.optionsForSelectTag = function (container, selected) {
    var disabled;
    var arrayWrap = function (data) {
        if (_.isArray(data)) { return data; }
        return [data];
    };

    
    if (typeof selected !== 'object' && typeof selected !== 'function') {
        selected = arrayWrap(selected);
    } else if (!_.isArray(selected) && typeof selected !== 'function') {
        disabled = typeof selected.disabled === 'function' ? selected.disabled : arrayWrap(selected.disabled);
        selected = typeof selected.selected === 'function' ? selected.selected : arrayWrap(selected.selected);
    }
    
    if(_.isArray(container)) {
        return _.map(container, function(text) {
            var value, options = {};
            if (_.isArray(text)) {
                if (typeof _.last(text) === 'object') { options = text.pop(); }
                if (text.length === 2) {
                    options.value = value = text[1];
                    text = text[0];
                } else {
                    value = text = text[0];
                }
            } else {
                value = text;
            }
            
            if(typeof selected === 'function') {
                if (selected(value)) { options.selected = true; }
            } else if(_.contains(selected, value)) {
                options.selected = true;
            }
            if(typeof disabled === 'function') {
                if (disabled(value)) { options.disabled = true; }
            } else if(_.contains(disabled, value)) {
                options.disabled = true;
            }
            
            return Viking.View.Helpers.contentTag('option', text, options);
        }).join("\n");
    }
    
    return _.map(container, function(value, text) {
        var options = {value: value};

        if(typeof selected === 'function') {
            if (selected(value)) { options.selected = true; }
        } else if(_.contains(selected, value)) {
            options.selected = true;
        }
        if(typeof disabled === 'function') {
            if (disabled(value)) { options.disabled = true; }
        } else if(_.contains(disabled, value)) {
            options.disabled = true;
        }
        
        return Viking.View.Helpers.contentTag('option', text, options);
    }).join("\n");
};
// optionsFromCollectionForSelectTag(collection, valueMethod, textMethod, selected)
// =============================================================================
//
// Returns a string of option tags that have been compiled by iterating over
// the collection and assigning the result of a call to the valueMethod as
// the option value and the textMethod as the option text.
//
//   optionsFromCollectionForSelectTag(people, 'id', 'name')
//   // => <option value="person's id">person's name</option>
//
// This is more often than not used inside a selectTag like this example:
//
//   selectTag(person, optionsFromCollectionForSelectTag(people, 'id', 'name'))
//
// If selected is specified as a value or array of values, the element(s)
// returning a match on valueMethod will be selected option tag(s).
//
// If selected is specified as a Proc, those members of the collection that
// return true for the anonymous function are the selected values.
//
// selected can also be a hash, specifying both :selected and/or :disabled
// values as required.
//
// Be sure to specify the same class as the valueMethod when specifying
// selected or disabled options. Failure to do this will produce undesired
// results. Example:
//
//   optionsFromCollectionForSelectTag(people, 'id', 'name', '1')
//
// Will not select a person with the id of 1 because 1 (an Integer) is not
// the same as '1' (a string)
//
//   optionsFromCollectionForSelectTag(people, 'id', 'name', 1)
//
// should produce the desired results.
Viking.View.Helpers.optionsFromCollectionForSelectTag = function(collection, valueAttribute, textAttribute, selected) {
    var selectedForSelect;
    
    var options = collection.map(function(model) {
        return [Viking.View.methodOrAttribute(model, textAttribute), Viking.View.methodOrAttribute(model, valueAttribute)];
    });
    
    if (_.isArray(selected)) {
        selectedForSelect = selected;
    } else if (typeof selected === 'object'){
        selectedForSelect = {
            selected: selected.selected,
            disabled: selected.disabled
        };
    } else {
        selectedForSelect = selected;
    }

    return Viking.View.Helpers.optionsForSelectTag(options, selectedForSelect);
};
// passwordFieldTag(name = "password", value = nil, options = {})
// ================================================================
// 
// Creates a password field, a masked text field that will hide the users input
// behind a mask character.
//
// Options
// -------
//      - disabled:  If true, the user will not be able to use this input.
//      - size:      The number of visible characters that will fit in the input.
//      - maxlength: The maximum number of characters that the browser will allow the user to enter.
//      - Any other key creates standard HTML attributes for the tag
//
// Examples
// --------
//   
//   passwordFieldTag('pass')
//   // => <input name="pass" type="password">
//   
//   passwordFieldTag('secret', 'Your secret here')
//   // => <input" name="secret" type="password" value="Your secret here">
//   
//   passwordFieldTag('masked', nil, {class: 'masked_input_field'})
//   // => <input class="masked_input_field" name="masked" type="password">
//   
//   passwordFieldTag('token', '', {size: 15})
//   # => <input name="token" size="15" type="password" value="">
//   
//   passwordFieldTag('key', null, {maxlength: 16})
//   // => <input maxlength="16" name="key" type="password">
//   
//   passwordFieldTag('confirm_pass', null, {disabled: true})
//   // => <input disabled name="confirm_pass" type="password">
//   
//   passwordFieldTag('pin', '1234', {maxlength: 4, size: 6, class: "pin_input"})
//   // => <input class="pin_input" maxlength="4" name="pin" size="6" type="password" value="1234">
Viking.View.Helpers.passwordFieldTag = function (name, value, options) {
    if (name === undefined) { name = 'password'; }
    if (options === undefined) { options = {}; }
    _.defaults(options, {type: "password"});

    return Viking.View.Helpers.textFieldTag(name, value, options);
};
// radioButtonTag(name, value, checked, options)
// =============================================
//
// Creates a radio button; use groups of radio buttons named the same to allow
// users to select from a group of options.
//
// Options
// -------
//      - disabled: If true, the user will not be able to use this input.
//      - Any other key creates standard HTML attributes for the tag
//
// Examples
// --------
//   radioButtonTag('gender', 'male')
//   // => <input name="gender" type="radio" value="male">
//   
//   radioButtonTag('receive_updates', 'no', true)
//   // => <input checked="checked" name="receive_updates" type="radio" value="no">
//
//   radioButtonTag('time_slot', "3:00 p.m.", false, {disabled: true})
//   // => <input disabled name="time_slot" type="radio" value="3:00 p.m.">
//   
//   radioButtonTag('color', "green", true, {class: "color_input"})
//   // => <input checked class="color_input" name="color" type="radio" value="green">
Viking.View.Helpers.radioButtonTag = function (name, value, checked, options) {
    if (options === undefined) { options = {}; }
    if (checked === true) { options.checked = true; }
    _.defaults(options, {
        type: "radio",
        value: value,
        name: name,
        id: Viking.View.sanitizeToId(name)
    });

    return Viking.View.Helpers.tag("input", options);
};
// selectTag(name, option_tags, options)
// ======================================
//
// Creates a dropdown selection box, or if the :multiple option is set to true,
// a multiple choice selection box.
//
// Options
// -------
//    - multiple:      If set to true the selection will allow multiple choices.
//    - disabled:      If set to true, the user will not be able to use this input.
//    - includeBlank: If set to true, an empty option will be created.
//    - prompt:        Create a prompt option with blank value and the text asking user to select something
//    - Any other key creates standard HTML attributes for the tag.
//
// Examples
// --------
//   selectTag("people", options_for_select({ "Basic": "$20"}))
//   // <select name="people"><option value="$20">Basic</option></select>
//   
//   selectTag("people", "<option>David</option>")
//   // => <select name="people"><option>David</option></select>
//   
//   selectTag("count", "<option>1</option><option>2</option><option>3</option>")
//   // => <select name="count"><option>1</option><option>2</option><option>3</option></select>
//   
//   selectTag("colors", "<option>Red</option><option>Green</option><option>Blue</option>", {multiple: true})
//   // => <select multiple="multiple" name="colors[]"><option>Red</option>
//   //    <option>Green</option><option>Blue</option></select>
//   
//   selectTag("locations", "<option>Home</option><option selected='selected'>Work</option><option>Out</option>")
//   // => <select name="locations"><option>Home</option><option selected='selected'>Work</option>
//   //    <option>Out</option></select>
//   
//   selectTag("access", "<option>Read</option><option>Write</option>", {multiple: true, class: 'form_input'})
//   // => <select class="form_input" multiple="multiple" name="access[]"><option>Read</option>
//   //    <option>Write</option></select>
//   
//   selectTag("people", options_for_select({ "Basic": "$20"}), {includeBlank: true})
//   // => <select name="people"><option value=""></option><option value="$20">Basic</option></select>
//   
//   selectTag("people", options_for_select({"Basic": "$20"}), {prompt: "Select something"})
//   // => <select name="people"><option value="">Select something</option><option value="$20">Basic</option></select>
//   
//   selectTag("destination", "<option>NYC</option>", {disabled: true})
//   // => <select disabled name="destination"><option>NYC</option></select>
//   
//   selectTag("credit_card", options_for_select([ "VISA", "MasterCard" ], "MasterCard"))
//   // => <select name="credit_card"><option>VISA</option><option selected>MasterCard</option></select>
Viking.View.Helpers.selectTag = function (name, option_tags, options) {
    var tag_name = name;
    if (options === undefined) { options = {}; }
    if (options.multiple && tag_name.slice(-2) !== "[]") { tag_name = tag_name + "[]"; }
    _.defaults(options, {
        id: Viking.View.sanitizeToId(name),
        name: tag_name
    });

    if (options.includeBlank) {
        option_tags = Viking.View.Helpers.contentTag('option', '', {value: ''}) + option_tags;
        delete options.includeBlank;
    }

    if (options.prompt) {
        if (options.prompt === true) { options.prompt = 'Select'; }
        option_tags = Viking.View.Helpers.contentTag('option', options.prompt, {value: ''}) + option_tags;
        delete options.prompt;
    }

    return Viking.View.Helpers.contentTag('select', option_tags, options, false);
};
// submitTag(value="Save", options)
// =================================
//
// Creates a submit button with the text value as the caption.
//
// Options
// -------
//    - disabled:      If set to true, the user will not be able to use this input.
//    - Any other key creates standard HTML attributes for the tag.
//   
//   submitTag()
//   // => <input name="commit" type="submit" value="Save">
//   
//   submitTag "Edit this article"
//   // => <input name="commit" type="submit" value="Edit this article">
//   
//   submitTag("Save edits", {disabled: true})
//   // => <input disabled name="commit" type="submit" value="Save edits">
//   
//   submitTag(nil, {class: "form_submit"})
//   // => <input class="form_submit" name="commit" type="submit">
//   
//   submitTag("Edit", class: "edit_button")
//   // => <input class="edit_button" name="commit" type="submit" value="Edit">
Viking.View.Helpers.submitTag = function (value, options) {
    if (options === undefined) { options = {}; }
    if (!value) { value = 'Save'; }
    _.defaults(options, {
        type: 'submit',
        name: 'commit',
        id: null,
        value: value
    });

    return Viking.View.Helpers.tag('input', options);
};
// textAreaTag(name, [content], [options], [escape=true])
// =========================================
//
// Creates a text input area; use a textarea for longer text inputs such as
// blog posts or descriptions.
//
// Options
// -------
//    - size: A string specifying the dimensions (columns by rows) of the textarea (e.g., "25x10").
//    - rows: Specify the number of rows in the textarea
//    - cols: Specify the number of columns in the textarea
//    - disabled: If set to true, the user will not be able to use this input.
//    - Any other key creates standard HTML attributes for the tag.
//
// Examples
// --------
//   
//   textAreaTag('post')
//   // => <textarea name="post"></textarea>
//   
//   textAreaTag('bio', user.bio)
//   // => <textarea name="bio">This is my biography.</textarea>
//   
//   textAreaTag('body', null, {rows: 10, cols: 25})
//   // => <textarea cols="25" name="body" rows="10"></textarea>
//   
//   textAreaTag('body', null, {size: "25x10"})
//   // => <textarea name="body" cols="25" rows="10"></textarea>
//   
//   textAreaTag('description', "Description goes here.", {disabled: true})
//   // => <textarea disabled name="description">Description goes here.</textarea>
//   
//   textAreaTag('comment', null, {class: 'comment_input'})
//   // => <textarea class="comment_input" name="comment"></textarea>
Viking.View.Helpers.textAreaTag = function (name, content, options, escape) {
    if (options === undefined) { options = {}; }
    if (escape === undefined) { escape = true; }
    _.defaults(options, {
        id: Viking.View.sanitizeToId(name),
        name: name
    });

    if (options.size) {
        options.cols = options.size.split('x')[0];
        options.rows = options.size.split('x')[1];
        delete options.size;
    }

    if (escape) { content = _.escape(content); }

    return Viking.View.Helpers.contentTag('textarea', content, options, false);
};






// TODO: color_field_tag
// TODO: date_field_tag
// TODO: datetime_field_tag
// TODO: datetime_local_field_tag
// TODO: email_field_tag
// TODO: field_set_tag
// TODO: file_field_tag

// TODO: image_submit_tag
// TODO: month_field_tag

// TODO: phone_field_tag
// TODO: range_field_tag
// TODO: search_field_tag
// TODO: telephone_field_tag
// TODO: time_field_tag

// TODO: url_field_tag
// TODO: week_field_tag








function FormBuilder(model, options) {
    options || (options = {});
    
    this.model = model;
    this.options = options;
}

// TODO: options passed to the helpers can be made into a helper
FormBuilder.prototype = {

    checkBox: function(attribute, options, checkedValue, uncheckedValue) {
        options || (options = {});
        
        if (!options.name && this.options.namespace) {
            options.name = Viking.View.tagNameForModelAttribute(this.model, attribute, {namespace: this.options.namespace});
        }
        
        return Viking.View.Helpers.checkBox(this.model, attribute, options, checkedValue, uncheckedValue);
    },

    collectionSelect: function(attribute, collection, valueAttribute, textAttribute, options) {
        options || (options = {});
        
        if (!options.name && this.options.namespace) {
            options.name = Viking.View.tagNameForModelAttribute(this.model, attribute, {namespace: this.options.namespace});
        }
        
        return Viking.View.Helpers.collectionSelect(this.model, attribute, collection, valueAttribute, textAttribute, options);
    },

    hiddenField: function(attribute, options) {
        options || (options = {});
        
        if (!options.name && this.options.namespace) {
            options.name = Viking.View.tagNameForModelAttribute(this.model, attribute, {namespace: this.options.namespace});
        }
        
        return Viking.View.Helpers.hiddenField(this.model, attribute, options);
    },
    
    label: function(attribute, content, options, escape) {
        options || (options = {});
        
        //TODO shouldn't options.name be options.for?
        if (!options.name && this.options.namespace) {
            options['for'] = Viking.View.tagNameForModelAttribute(this.model, attribute, {namespace: this.options.namespace});
            options['for'] = Viking.View.sanitizeToId(options['for']);
        }
        
        return Viking.View.Helpers.label(this.model, attribute, content, options, escape);
    },
    
    number: function(attribute, options) {
        options || (options = {});
        
        if (!options.name && this.options.namespace) {
            options.name = Viking.View.tagNameForModelAttribute(this.model, attribute, {namespace: this.options.namespace});
        }
        
        return Viking.View.Helpers.numberField(this.model, attribute, options);
    },

    passwordField: function(attribute, options) {
        options || (options = {});
        
        if (!options.name && this.options.namespace) {
            options.name = Viking.View.tagNameForModelAttribute(this.model, attribute, {namespace: this.options.namespace});
        }
        
        return Viking.View.Helpers.passwordField(this.model, attribute, options);
    },
    
    radioButton: function(attribute, tagValue, options) {
        options || (options = {});
        
        if (!options.name && this.options.namespace) {
            options.name = Viking.View.tagNameForModelAttribute(this.model, attribute, {namespace: this.options.namespace});
        }
        
        return Viking.View.Helpers.radioButton(this.model, attribute, tagValue, options);
    },
    
    select: function(attribute, collection, options) {
        options || (options = {});
        
        if (!options.name && this.options.namespace) {
            options.name = Viking.View.tagNameForModelAttribute(this.model, attribute, {namespace: this.options.namespace});
        }
        
        return Viking.View.Helpers.select(this.model, attribute, collection, options);
    },

    textArea: function(attribute, options) {
        options || (options = {});
        
        if (!options.name && this.options.namespace) {
            options.name = Viking.View.tagNameForModelAttribute(this.model, attribute, {namespace: this.options.namespace});
        }
        
        return Viking.View.Helpers.textArea(this.model, attribute, options);
    },

    textField: function(attribute, options) {
        options || (options = {});
        
        if (!options.name && this.options.namespace) {
            options.name = Viking.View.tagNameForModelAttribute(this.model, attribute, {namespace: this.options.namespace});
        }
        
        return Viking.View.Helpers.textField(this.model, attribute, options);
    },
    
    checkBoxGroup: function(attribute, options, content) {
        if (typeof options === 'function') {
            content = options;
            options = {};
        }

        if (!options.namespace && this.options.namespace) {
            options.namespace = this.options.namespace;
        }

        return Viking.View.Helpers.checkBoxGroup(this.model, attribute, options, content);
    },
    
    fieldsFor: function(attribute, options, content) {
        if (typeof options === 'function') {
            content = options;
            options = {};
        }
        
        if (!options.namespace) {
            if (this.options.namespace) {
                options.namespace = this.options.namespace + '[' + this.model.baseModel.modelName + ']';
            } else {
                options.namespace = this.model.baseModel.modelName;
            }
        }
        
        var builder = new FormBuilder(this.model.get(attribute), options);
    
        return content(builder);
    }
    
};
function CheckBoxGroupBuilder(model, attribute, options) {
    options || (options = {});
    
    this.model = model;
    this.attribute = attribute;
    this.options = options;
}

// TODO: options passed to the helpers can be made into a helper
CheckBoxGroupBuilder.prototype = {

    checkBox: function(checkedValue, options) {
        var values = this.model.get(this.attribute);
        options || (options = {});
        
        if (!options.name && this.options.namespace) {
            options.name = Viking.View.tagNameForModelAttribute(this.model, this.attribute, {namespace: this.options.namespace});
        } else if (!options.name) {
            options.name = Viking.View.tagNameForModelAttribute(this.model, this.attribute);
        }
        
        if (!options.id) {
            options.id = Viking.View.sanitizeToId(options.name) + '_' + checkedValue;
        }
        
        return Viking.View.Helpers.checkBoxTag(options.name, checkedValue, _.contains(values, checkedValue), options);
    },
    
    label: function(value, content, options, escape) {
        options || (options = {});
        
        //TODO shouldn't options.name be options.for?
        if (!options.name && !options['for']) {
            options['for'] = Viking.View.tagNameForModelAttribute(this.model, this.attribute, {namespace: this.options.namespace});
            options['for'] = Viking.View.sanitizeToId(options['for']) + '_' + value;
        }
        
        return Viking.View.Helpers.label(this.model, this.attribute, content, options, escape);
    }
    
}


// checkBox(model, attribute, options={}, checkedValue="true", uncheckedValue="false")
// =====================================================================================
//
// Returns a checkbox tag tailored for accessing a specified attribute (identified
// by attribute) on an object. This object must be an instance of Viking.Model.
// Additional options on the input tag can be passed as a hash with options.
// The checkedValue defaults to the string `"true"` while the default
// uncheckedValue is set to the string `"false"`.
//
// Gotcha
// ------
//
// The HTML specification says unchecked check boxes are not successful, and
// thus web browsers do not send them. Unfortunately this introduces a gotcha:
// if an Invoice model has a paid flag, and in the form that edits a paid invoice
// the user unchecks its check box, no paid parameter is sent. So, any
// mass-assignment idiom like
//
//   @invoice.update(params[:invoice])
//
// wouldn't update the flag.
//
// To prevent this the helper generates an auxiliary hidden field before the very
// check box. The hidden field has the same name and its attributes mimic an
// unchecked check box.
//
// This way, the client either sends only the hidden field (representing the
// check box is unchecked), or both fields. Since the HTML specification says
// key/value pairs have to be sent in the same order they appear in the form,
// and parameters extraction gets the last occurrence of any repeated key in
// the query string, that works for ordinary forms.
//
// Unfortunately that workaround does not work when the check box goes within an
// array-like parameter, as in
// 
// <%= fields_for "project[invoice_attributes][]", invoice, index: nil do |form| %>
//   <%= form.check_box :paid %>
//   ...
// <% end %>
//
// because parameter name repetition is precisely what Rails seeks to distinguish
// the elements of the array. For each item with a checked check box you get an
// extra ghost item with only that attribute, assigned to "0".
//
// In that case it is preferable to either use check_box_tag or to use hashes
// instead of arrays.
//
// Examples
// --------
//   // Let's say that post.get('validated') is `true`:
//   checkBox(post, "validated")
//   // => <input name="post[validated]" type="hidden" value="false">
//   //    <input checked type="checkbox" name="post[validated]" value="true">
//   
//   // Let's say that puppy.get('gooddog') is `"no"`:
//   checkBox("puppy", "gooddog", {}, "yes", "no")
//   // => <input name="puppy[gooddog]" type="hidden" value="no">
//   //    <input type="checkbox" name="puppy[gooddog]" value="yes">
//   
//   checkBox("eula", "accepted", { class: 'eula_check' }, "yes", "no")
//   // => <input name="eula[accepted]" type="hidden" value="no">
//   //    <input type="checkbox" class="eula_check" name="eula[accepted]" value="yes">
Viking.View.Helpers.checkBox = function (model, attribute, options, checkedValue, uncheckedValue) {
    var output = '';
    var value = model.get(attribute);

    if (options === undefined) { options = {}; }
    if (checkedValue === undefined) { checkedValue = true; }
    if (uncheckedValue === undefined) { uncheckedValue = false; }
    Viking.View.addErrorClassToOptions(model, attribute, options);

    var name = options.name || Viking.View.tagNameForModelAttribute(model, attribute);    
    output += Viking.View.Helpers.hiddenFieldTag(name, uncheckedValue);
    output += Viking.View.Helpers.checkBoxTag(name, checkedValue, checkedValue === value, options);
    
    return output;
};
// checkBoxGroup(model, attribute, options = {}, content = func(f))
// ================================================================
// 
// Usefull for rendering an checkbox group. checkBox generates an auxiliary
// hidden field before the very check box that has the same name to mimic an
// unchecked box. Using checkBox within checkBoxGroup will not generate the
// auxiliary field.
//
// A useful example of this is when you have an array of items to choose from.
//
// Examples
// --------
//   checkBoxGroup(account, 'roles', function (f) {
//       return f.checkBox('admin') + "\n" + f.checkBox('agent', { class: 'agent_check' });
//   });
//   // => <input checked id="account_roles_admin" type="checkbox" name="account[roles][]" value="admin">
//   // => <input checked class="agent_check" id="account_roles_agent" type="checkbox" name="account[roles][]" value="agent">
Viking.View.Helpers.checkBoxGroup = function (model, attribute, options, content) {
    if (typeof options === 'function') {
        content = options;
        options = {};
    }
    
    var builder = new CheckBoxGroupBuilder(model, attribute, options);
    
    return content(builder);
};
// collectionSelect(model, attribute, collection, valueAttribute, textAttribute, options)
// ====================================================================================
//
// Returns <select> and <option> tags for the collection of existing return
// values of method for object's class. The value returned from calling method
// on the instance object will be selected. If calling method returns nil, no
// selection is made without including :prompt or :includeBlank in the options
// hash.
//
// The :value_method and :text_method parameters are methods to be called on
// each member of collection. The return values are used as the value attribute
// and contents of each <option> tag, respectively. They can also be any object
// that responds to call, such as a proc, that will be called for each member
// of the collection to retrieve the value/text.
//
// Example object structure for use with this method:
//
//   Post = Viking.Model.extend({
//       belongsTo: ['author']
//   });
//   
//   Author = Viking.Model.extend({
//       hasMany: ['posts'],
//       
//       nameWithInitial: function() {
//           return this.get('first_name')[0] + '. ' + this.get("last_name");
//       }
//   });
// 
// Sample usage (selecting the associated Author for an instance of Post):
//
//   collectionSelect(post, 'author_id', Author.all, 'id', 'nameWithInitial', {prompt: true})
// 
// If post.get('author_id') is already 1, this would return:
// 
//   <select name="post[author_id]">
//     <option value="">Please select</option>
//     <option value="1" selected>D. Heinemeier Hansson</option>
//     <option value="2">D. Thomas</option>
//     <option value="3">M. Clark</option>
//   </select>
Viking.View.Helpers.collectionSelect = function (model, attribute, collection, valueAttribute, textAttribute, options) {
    if (options === undefined) { options = {}; }

    var optionOptions = _.pick(options, 'selected');
    var selectOptions = _.omit(options, 'selected');
    if (model.get(attribute) && optionOptions.selected === undefined) {
        optionOptions.selected = Viking.View.methodOrAttribute(model.get(attribute), valueAttribute);
    }
    
    var name = options.name || Viking.View.tagNameForModelAttribute(model, attribute);
    var optionsTags = Viking.View.Helpers.optionsFromCollectionForSelectTag(collection, valueAttribute, textAttribute, selectOptions);
    return Viking.View.Helpers.selectTag(name, optionsTags, selectOptions);
};
// formFor(model, options = {}, content = func(f))
// ===============================================
// 
// Creates a FormBuilder for the model and passes it as the first argument to
// the `content` function.
//
// Examples
// --------
//   formFor(account, function (f) { return f.hiddenField('pass_confirm'); })
//   // => <input type="hidden" name="account[pass_confirm]" value="">
Viking.View.Helpers.formFor = function (model, options, content) {
    if (typeof options === 'function') {
        content = options;
        options = {};
    }
    
    var method = options.method;
    if (options.multipart === true) {
        options.enctype = "multipart/form-data";
        options.method = 'post';
        delete options.multipart;
    } else if (!options.method) {
        options.method = 'get';
    }

    var builder = new FormBuilder(model, options);
    if ( (options.method !== 'get' && options.method !== 'post') || (method && method !== options.method) ) {
        options.method = 'post';
        content = _.wrap(content, function(func, form) {
            var hiddenInput = Viking.View.Helpers.hiddenFieldTag('_method', method);
            return Viking.View.Helpers.contentTag('div', hiddenInput, {style: 'margin:0;padding:0;display:inline'}, false) + func(builder);
        });
    }
    
    return Viking.View.Helpers.contentTag('form', content(builder), options, false);
};
// hiddenField(model, attribute, options = {})
// =========================================
// 
// Returns a hidden input tag tailored for accessing a specified attribute
// (identified by method) on an object assigned to the template (identified
// by object). Additional options on the input tag can be passed as a hash
// with options. These options will be tagged onto the HTML as an HTML element
// attribute as in the example shown.
//
// Examples
// --------
//   hiddenField(:signup, :pass_confirm)
//   // => <input type="hidden" name="signup[pass_confirm]" value="">
//   
//   hiddenField(:post, :tag_list)
//   // => <input type="hidden" name="post[tag_list]" value="tag1 tag2 tag3">
//   
//   hiddenField(:user, :token)
//   // => <input type="hidden" name="user[token]" value="token">
Viking.View.Helpers.hiddenField = function (model, attribute, options) {
    var value = model.get(attribute);
    var name = Viking.View.tagNameForModelAttribute(model, attribute);
    
    return Viking.View.Helpers.hiddenFieldTag(name, (value || ''), options);
};
// label(model, attribute, content, options)
// =========================================
//
// Returns a label tag tailored for labelling an input field for a specified
// attribute (identified by method) on an object assigned to the template
// (identified by object). The text of label will default to the attribute
// name unless a translation is found in the current I18n locale (through
// helpers.label.<modelname>.<attribute>) or you specify it explicitly.
// Additional options on the label tag can be passed as a hash with options.
// These options will be tagged onto the HTML as an HTML element attribute as
// in the example shown, except for the :value option, which is designed to
// target labels for #radioButton tags (where the value is used in the ID
// of the input tag).
//
// Examples
// --------
//   label(post, "title")
//   // => <label for="post_title">Title</label>
//   
//   label(post, "title", "A short title")
//   // => <label for="post_title">A short title</label>
//   
//   label(post, "title", "A short title", {class: "title_label"})
//   // => <label for="post_title" class="title_label">A short title</label>
//   
//   label(post, "privacy", "Public Post", {value: "public"})
//   // => <label for="post_privacy_public">Public Post</label>
//   
//   label(post, "terms", function() {
//       return 'Accept <a href="/terms">Terms</a>.';
//   })
//   // => <label for="post_privacy_public">Public Post</label>
Viking.View.Helpers.label = function (model, attribute, content, options, escape) {
    var tmp;
    if (typeof content === 'object') {
        tmp = options;
        options = content;
        content = tmp;
    }
    
    if (options === undefined) { options = {}; }
    if (content === undefined) { content = attribute.humanize(); }
    if (typeof content === 'function') { content = content(); }        
    if (!options['for']) {
        var name = Viking.View.tagNameForModelAttribute(model, attribute);
        options['for'] = Viking.View.sanitizeToId(name);
    }
    
    Viking.View.addErrorClassToOptions(model, attribute, options);
    
    return Viking.View.Helpers.labelTag(content, options, escape);
};
// numberField(model, attribute, options)
// ======================================
//
// Returns an input tag of the "number" type tailored for accessing a specified
// attribute on the model. Additional options on the input tag can be passed as
// a hash with options. These options will be tagged onto the HTML as an HTML
// element attribute as in the example shown.
//
// Examples
// --------
//   numberField(user, 'age', {min: 0, max: 100})
//   // => <input id="user_age" name="user[age]" type="number" value="27">
//   
//   numberField(account, 'requests', {class: "form_input"})
//   // => <input class="form_input" id="account_requests" name="account[requests]" type="number" value="27">
Viking.View.Helpers.numberField = function (model, attribute, options) {
    options = _.extend({}, options);
    var name = options.name || Viking.View.tagNameForModelAttribute(model, attribute);

    Viking.View.addErrorClassToOptions(model, attribute, options);
    
    return Viking.View.Helpers.numberFieldTag(name, model.get(attribute), options);
};
// passwordField(model, attribute, options)
// ========================================
//
// Returns an input tag of the "password" type tailored for accessing a specified
// attribute on the model. Additional options on the input tag can be passed as
// a hash with options. These options will be tagged onto the HTML as an HTML
// element attribute as in the example shown. For security reasons this field
// is blank by default; pass value via options if this is not desired.
//
// Examples
// --------
//   passwordField(user, 'pass', {size: 20})
//   // => <input id="login_pass" name="login[pass]" type="password" size="20">
//   
//   passwordField(account, 'secret', {class: "form_input", value: account.get('secret')})
//   // => <input class="form_input" id="account_secret" name="account[secret]" type="password" value="unkown">
Viking.View.Helpers.passwordField = function (model, attribute, options) {
    options || (options = {});
    var name = options.name || Viking.View.tagNameForModelAttribute(model, attribute);

    if (options === undefined) { options = {}; }
    Viking.View.addErrorClassToOptions(model, attribute, options);
    
    return Viking.View.Helpers.passwordFieldTag(name, undefined, options);
};
// radioButton(model, attribute, tag_value, options)
// ==================================================
//
// Returns a radio button tag for accessing a specified attribute on a model.
// If the current value of attribute is tag_value the radio button will be checked.
//
// To force the radio button to be checked pass checked: true in the options hash.
// You may pass HTML options there as well.
//   
//   // Let's say that @post.category returns "rails":
//   radioButton("post", "category", "rails")
//   radioButton("post", "category", "java")
//   // => <input type="radio" id="post_category_rails" name="post[category]" value="rails" checked>
//   //    <input type="radio" id="post_category_java" name="post[category]" value="java">
//   
//   radioButton("user", "receive_newsletter", "yes")
//   radioButton("user", "receive_newsletter", "no")
//   // => <input type="radio" id="user_receive_newsletter_yes" name="user[receive_newsletter]" value="yes">
//   //    <input type="radio" id="user_receive_newsletter_no" name="user[receive_newsletter]" value="no" checked>
Viking.View.Helpers.radioButton = function (model, attribute, tag_value, options) {
    if (options === undefined) { options = {}; }
    var name = options.name || Viking.View.tagNameForModelAttribute(model, attribute);

    _.defaults(options, {
        id: Viking.View.sanitizeToId(name + "_" + tag_value)
    });
    Viking.View.addErrorClassToOptions(model, attribute, options);
    
    var value = tag_value;
    if (value === undefined || value === null) {
        value = "";
    }
    
    return Viking.View.Helpers.radioButtonTag(name, value, tag_value === model.get(attribute), options);
};
// Create a select tag and a series of contained option tags for the provided
// object and method. The option currently held by the object will be selected,
// provided that the object is available.
//
// There are two possible formats for the +choices+ parameter, corresponding
// to other helpers' output:
//
// * A flat collection (see +optionsForSelect+).
//
// * A nested collection (see +groupedOptionsForSelect+).
//
// For example:
//
//   select("post", "person_id", _.map(people, function(p) { return [p.name, p.id] }), { include_blank: true })
//
// would become:
//
//   <select name="post[person_id]">
//     <option value=""></option>
//     <option value="1" selected="selected">David</option>
//     <option value="2">Sam</option>
//     <option value="3">Tobias</option>
//   </select>
//
// assuming the associated person has ID 1.
//
// By default, `post.get('person_id')` is the selected option. Specify
// `selected: value` to use a different selection or `selected: nil` to leave
// all options unselected. Similarly, you can specify values to be disabled in
// the option tags by specifying the `:disabled` option. This can either be a
// single value or an array of values to be disabled.
//
// ==== Gotcha
//
// The HTML specification says when +multiple+ parameter passed to select and
// all options got deselected web browsers do not send any value to server.
// Unfortunately this introduces a gotcha: if an +User+ model has many +roles+
// and have +role_ids+ accessor, and in the form that edits roles of the user
// the user deselects all roles from +role_ids+ multiple select box, no
// +role_ids+ parameter is sent. So, any mass-assignment idiom like
//
//   @user.update(params[:user])
//
// wouldn't update roles.
//
// To prevent this the helper generates an auxiliary hidden field before every
// multiple select. The hidden field has the same name as multiple select and
// blank value.
//
// This way, the client either sends only the hidden field (representing
// the deselected multiple select box), or both fields. Since the HTML
// specification says key/value pairs have to be sent in the same order they
// appear in the form, and parameters extraction gets the last occurrence of
// any repeated key in the query string, that works for ordinary forms.
//
// In case if you don't want the helper to generate this hidden field you can
// specify `include_hidden: false` option.
Viking.View.Helpers.select = function (model, attribute, collection, options) {
    if (options === undefined) { options = {}; }

    var name = Viking.View.tagNameForModelAttribute(model, attribute);
    var optionOptions = _.pick(options, 'selected');
    var selectOptions = _.omit(options, 'selected');
    if (model.get(attribute) && optionOptions.selected === undefined) {
        optionOptions.selected = model.get(attribute);
    }
    if (selectOptions.multiple === undefined && model.associations[attribute] && model.associations[attribute].macro === "hasMany") {
        selectOptions.multiple = true;
    }
    return Viking.View.Helpers.selectTag(name, Viking.View.Helpers.optionsForSelectTag(collection, optionOptions), selectOptions);
};
// textArea(model, attribute, options)
// ====================================
//
// Returns a textarea opening and closing tag set tailored for accessing a
// specified attribute on a model. Additional options on the input tag can be
// passed as a hash with options.
//
// Examples
// ========
//   textArea(post, 'body', {cols: 20, rows: 40})
//   // => <textarea cols="20" rows="40" id="post_body" name="post[body]">
//   //      post body
//   //    </textarea>
//   
//   textArea(comment, 'text', {size: "20x30"})
//   // => <textarea cols="20" rows="30" id="comment_text" name="comment[text]">
//   //      comment text
//   //    </textarea>
//   
//   textArea(application, 'notes', {cols: 40, rows: 15, class: 'app_input'})
//   // => <textarea cols="40" rows="15" id="application_notes" name="application[notes]" class="app_input">
//   //      application notes
//   //    </textarea>
//   
//   textArea(entry, 'body', {size: "20x20", disabled: true})
//   // => <textarea cols="20" rows="20" id="entry_body" name="entry[body]" disabled>
//   //      entry body
//   //    </textarea>
Viking.View.Helpers.textArea = function (model, attribute, options) {
    var name = Viking.View.tagNameForModelAttribute(model, attribute);
    
    if (options === undefined) { options = {}; }
    Viking.View.addErrorClassToOptions(model, attribute, options);
    
    return Viking.View.Helpers.textAreaTag(name, model.get(attribute), options);
};
// textField(model, attribute, options)
// ====================================
//
// Returns an input tag of the "text" type tailored for accessing a specified
// attribute on a model. Additional options on the input tag can be passed as
// a hash with options. These options will be tagged onto the HTML as an HTML
// element attribute as in the example shown.
//
// Examples
// ========
//   text_field(post, "title", {size: 20})
//   // => <input id="post_title" name="post[title]" size="20" type="text" value="title">
//   
//   text_field(post, "title", {class: "create_input"})
//   // => <input class="create_input" id="post_title" name="post[title]" type="text" value="title">
Viking.View.Helpers.textField = function (model, attribute, options) {
    var name = Viking.View.tagNameForModelAttribute(model, attribute);
    
    if (options === undefined) { options = {}; }
    Viking.View.addErrorClassToOptions(model, attribute, options);
    
    return Viking.View.Helpers.textFieldTag(name, model.get(attribute), options);
};
// TODO: make this accept model string names



// TODO: date_field
// TODO: date_select
// TODO: day_field
// TODO: file_field



// TODO: month_field


// TODO: phone_field

// TODO: range_field
// TODO: search_field

// TODO: telephone_field


// TODO: time_field
// TODO: url_field
// TODO: week_field
// TODO: year_field
// urlFor(modelOrUrl, options)
// ===========================
//
// Returns the URL for the model. Note that by default +:onlyPath+ is +true+ so
// you'll get the relative "/controller/action" instead of the fully qualified
// URL like "http://example.com/controller/action".
//
// Passing the model will trigger the named route for that record. The lookup
// will happen on the name of the class. So passing a Workshop object will attempt
// to use the +workshopPath+ route. If you have a nested route, such as
// +adminWorkshopPath+ you'll have to call that explicitly (it's impossible
// for +urlFor+ to guess that route).
//
// If a string is passed instead of a model, the string is simply returned.
//
// ==== Options
//   - anchor: Specifies the anchor name to be appended to the path.
//   - onlyPath: If +true+, returns the relative URL (omitting the protocol,
//               host name, and port) (+false+ by default).
//   - trailingSlash: If true, adds a trailing slash, as in "/archive/2005/".
//                     Note that this is currently not recommended since it
//                     breaks caching.
//   - host: Overrides the default (current) host if provided.
//   - port: Optionally specify the port to connect to
//   - protocol: Overrides the default (current) protocol if provided.
//   - scriptName: Specifies application path relative to domain root. If
//                 provided, prepends application path
//   - user: Inline HTTP authentication (only plucked out if +:password+ is also present).
//   - password: Inline HTTP authentication (only plucked out if +:user+ is also present).
//
// ==== Examples
//   urlFor(Workshop)
//   // uses +workshopsUrl()+
//   # => http://www.example.com/workshops
//
//   urlFor(new Workshop())
//   // relies on Workshop answering isNew() (and in this case returning true)
//   # => http://www.example.com/workshops
//
//   urlFor(workshop)
//   // uses +workshopUrl(model)+
//   // which calls workshop.toParam() which by default returns the id
//   // => http://www.example.com/workshops/5
//
//   // toParam() can be re-defined in a model to provide different URL names:
//   // => http://www.example.com/workshops/1-workshop-name
//
//   urlFor(workshop, {anchor: 'location'})
//   // => http://www.example.com/workshops/5#location
//
//   urlFor(workshop, {onlyPath: true})
//   // => /workshops/5
//
//   urlFor(workshop, {trailingSlash: true})
//   // => http://www.example.com/workshops/5/
//
//   urlFor(workshop, {host: 'myhost'})
//   // => http://myhost.com/workshops/5
//
//   urlFor(workshop, {port: 9292})
//   // => http://www.example.com:9292/workshops/5
//
//   urlFor(workshop, {protocol: 'https'})
//   // => https://www.example.com/workshops/5
//
//   urlFor(workshop, {scriptName: '/location'})
//   // => http://example.com/location/workshops/5
//
//   urlFor(workshop, {user: 'username', password: 'password'})
//   // => http://username:password@example.com/workshops/5
//
//   urlFor("http://www.example.com")
//   // => http://www.example.com
//
// TODO: support polymorhic_paths... ie [blog, post] => /blogs/1/posts/3
//       polymorphic_url([blog, post]) # => "http://example.com/blogs/1/posts/1"
//       polymorphic_url([:admin, blog, post]) # => "http://example.com/admin/blogs/1/posts/1"
//       polymorphic_url([user, :blog, post]) # => "http://example.com/users/1/blog/posts/1"
//       polymorphic_url(Comment) # => "http://example.com/comments"
//
urlFor = function (modelOrUrl, options) {
    if (typeof modelOrUrl === 'string') {
        return modelOrUrl;
    }
    
    options = _.extend({
        onlyPath: false,
        trailingSlash: false,
        host: window.location.hostname,
        port: window.location.port,
        scriptName: '',
        protocol: window.location.protocol.replace(':','')
    }, options);
    
    var route;
    var klass = modelOrUrl.baseModel.modelName.camelize().constantize();
    if (modelOrUrl instanceof klass) {
        if (modelOrUrl.isNew()) {
            route = (klass.baseModel.modelName.pluralize() + 'Path').constantize();
            route = route();
        } else {
            route = (klass.baseModel.modelName + 'Path').constantize();
            route = route(modelOrUrl);
        }
    } else {
        route = (modelOrUrl.baseModel.modelName.pluralize() + 'Path').constantize();
        route = route();
    }
    
    if (!options.onlyPath) {
        route = options.protocol + '://' + options.host + (options.port ? ':' : '') + options.port + options.scriptName + route;
        
        if (options.user && options.password) {
            route = route.replace('://', '://' + options.user + ':' + options.password + '@');
        }
    }
    
    if (options.trailingSlash) {
        route += '/';
    }
    
    if (options.anchor) {
        route += '#' + options.anchor;
    }
    
    return route;
};
// linkTo(modelOrUrl, name, options)
// =================================
//
// Creates a link tag to the +modelOrUrl+. If +modelOrUrl+ is a model a href is
// generated from the routes. If a String is passed it is used as the href. See
// the documentation for +urlFor+ for how +modelOrUrl+ is translated into a url.
//
// ==== Signatures
//
//   linkTo(content, url)
//   
//   linkTo(content, url, options)
//
//   linkTo(url, contentFunc)
//
//   linkTo(url, options, contentFunc)
//
// ==== Options
//   - data: This option can be used to add custom data attributes.
// TODO: method not supported yet
//   - method: an HTTP verb. This modifier will dynamically create an HTML form
//             and immediately submit the form for processing using the HTTP verb
//             specified. Useful for having links perform a POST operation
//             in dangerous actions like deleting a record (which search bots can
//             follow while spidering your site). Supported verbs are +post+,
//             +:delete+, +:patch+, and +:put+.
//
// ==== Examples
//
//   linkTo("Profile", profilePath(profile))
//   // => <a href="/profiles/1">Profile</a>
//
// or the even pithier
//
//   linkTo("Profile", profile)
//   // => <a href="/profiles/1">Profile</a>
//
// Similarly,
//
//   linkTo("Profiles", profiles_path())
//   // => <a href="/profiles">Profiles</a>
//
// You can use a function as well if your link target is hard to fit into the
// name parameter. EJS example:
//
//   <%= linkTo(profile, function () { %>
//     <strong><%= profile.name %></strong> -- <span>Check it out!</span> 
//   <% }) %>
//   // => <a href="/profiles/1">
//          <strong>David</strong> -- <span>Check it out!</span>
//         </a>
//
// Classes and ids for CSS are easy to produce:
//
//   linkTo("Articles", articles_path(), {id: 'news', class: 'article'})
//   // => <a href="/articles" class="article" id="news">Articles</a>
//
// +linkTo+ can also produce links with anchors or query strings:
//
//   linkTo("Comment wall", profilePath(profile, {anchor: "wall"}))
//   // => <a href="/profiles/1#wall">Comment wall</a>
//
//   linkTo("Nonsense search", searches_path({foo: "bar", baz: "quux"}))
//   // => <a href="/searches?foo=bar&amp;baz=quux">Nonsense search</a>
//
// TODO: method not supported yet
// The only option specific to +linkTo+ (+:method+) is used as follows:
//
//   linkTo("Destroy", "http://www.example.com", {method: "delete"})
//   // => <a href='http://www.example.com' rel="nofollow" data-method="delete">Destroy</a>
//
// You can also use custom data attributes using the +:data+ option:
//
//   linkTo("Visit Other Site", "http://www.rubyonrails.org/", { data: { confirm: "Are you sure?" }})
//   // => <a href="http://www.rubyonrails.org/" data-confirm="Are you sure?">Visit Other Site</a>
Viking.View.Helpers.linkTo = function (content, modelOrUrl, options) {
    var tmp;
    
    if (typeof modelOrUrl === 'function') {
        tmp = content;
        content = modelOrUrl;
        modelOrUrl = tmp;
    } else if (typeof options === 'function') {
        tmp = options;
        options = modelOrUrl;
        modelOrUrl = content;
        content = tmp;
    }
    
    options = _.extend({
        href: urlFor(modelOrUrl)
    }, options);

    return Viking.View.Helpers.contentTag('a', content, options);
};
// mailTo(email, name, options)
// mailTo(email, contentFunc)
// mailTo(email, options, contentFunc)
// =====================================================================
//
// Creates a mailto link tag to the specified +email+, which is
// also used as the name of the link unless +name+ is specified. Additional
// HTML attributes for the link can be passed in +options+.
//
// +mailTo+ has several methods for customizing the email itself by
// passing special keys to +options+.
//
// Options
// -------
//      - subject:  Preset the subject line of the email.
//      - body:     Preset the body of the email.
//      - cc:       Carbon Copy additional recipients on the email.
//      - bcc:      Blind Carbon Copy additional recipients on the email.
//
// Examples
// --------
//   mailTo('me@domain.com')
//   // => <a href="mailto:me@domain.com">me@domain.com</a>
//
//   mailTo('me@domain.com', 'My email')
//   // => <a href="mailto:me@domain.com">My email</a>
//
//   mailTo('me@domain.com', 'My email', {
//     cc: 'ccaddress@domain.com',
//     subject: 'This is an example email'
//   })
//   // => <a href="mailto:me@domain.com?cc=ccaddress@domain.com&subject=This%20is%20an%20example%20email">My email</a>
//
// You can use a function as well if your link target is hard to fit into the
// name parameter.
// 
//   mailTo('me@domain.com', function () {
//     return "<strong>Email me:</strong> <span>me@domain.com</span>";
//   });
//   // => <a href="mailto:me@domain.com"><strong>Email me:</strong> <span>me@domain.com</span></a>
//
//   mailTo('me@domain.com', {key: 'value'}, function () {
//     return "Email me";
//   });
//   // => <a href="mailto:me@domain.com" key="value">Email me</a>
//
//   mailTo('me@domain.com', function(){ return "Email me"; }, {key: 'value'});
//   // => <a href="mailto:me@domain.com" key="value">Email me</a>
Viking.View.Helpers.mailTo = function (email, name, options) {
    var tmp;
    
    // handle (email, name, options), (email, contentFunc), and 
    // (email, options, contentFunc) formats
    if (typeof options === 'function') {
        tmp = options;
        options = name;
        name = tmp;
    } else if (typeof name === 'object') {
        options = name;
        name = undefined;
    }
    if (name === undefined) {
        name = _.escape(email);
    }
    options || (options = {});
    
    var extras = _.map(_.pick(options, 'cc', 'bcc', 'body', 'subject'), function(value, key) {
        return key + '=' + encodeURI(value);
    }).join('&');
    if (extras.length > 0) { extras = '?' + extras; }
    options = _.omit(options, 'cc', 'bcc', 'body', 'subject');
    
    options.href = "mailto:" + email + extras;

    return Viking.View.Helpers.contentTag('a', name, options, false);
};



// Returns an HTML image tag for the +source+. The +source+ can be a full
// path or a file.
//
// ==== Options
//
// You can add HTML attributes using the +options+. The +options+ supports
// two additional keys for convenience and conformance:
//
// * <tt>:alt</tt>  - If no alt text is given, the file name part of the
//   +source+ is used (capitalized and without the extension)
// * <tt>:size</tt> - Supplied as "{Width}x{Height}" or "{Number}", so "30x45" becomes
//   width="30" and height="45", and "50" becomes width="50" and height="50".
//   <tt>:size</tt> will be ignored if the value is not in the correct format.
//
// ==== Examples
//
//   imageTag("/assets/icon.png")
//   // => <img alt="Icon" src="/assets/icon.png">
//   imageTag("/assets/icon.png", {size: "16x10", alt: "A caption"})
//   // => <img src="/assets/icon.png" width="16" height="10" alt="A caption">
//   imageTag("/icons/icon.gif", size: "16")
//   // => <img src="/icons/icon.gif" width="16" height="16" alt="Icon">
//   imageTag("/icons/icon.gif", height: '32', width: '32')
//   // => <img alt="Icon" height="32" src="/icons/icon.gif" width="32">
//   imageTag("/icons/icon.gif", class: "menu_icon")
//   // => <img alt="Icon" class="menu_icon" src="/icons/icon.gif">

Viking.View.Helpers.imageTag = function(source, options) {
    var separator = /x/i,
        size,
        alt;

    if (!options) {
        options = {};
    }

    if (source) {
        options.src = source;
    }

    if (options.size) {
        size = options.size.search(separator) > 0 ? options.size.split(separator) : [options.size, options.size];
        options.width = size[0];
        options.height = size[1];
        delete options.size;
    }

    if (!options.alt) {
        alt = options.src.replace(/^.*[\\\/]/, '').split(/\./)[0];
        alt = alt.charAt(0).toUpperCase() + alt.slice(1);
        options.alt = alt;
    }

    return Viking.View.Helpers.tag('img', options);
};
Viking.View.Helpers.render = function (templatePath, locals) {
    var template = Viking.View.templates[templatePath];

    if (!locals) {
        locals = {};
    }

    if (template) {
        return template(_.extend(locals, Viking.View.Helpers));
    } else {
        throw new Error('Template does not exist: ' + templatePath);
    }
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
        this.cursor.set({
            total_count: parseInt(xhr.xhr.getResponseHeader('Total-Count'))
        });
        
        return attrs;
    },
    
    sync: function(method, model, options) {
        if(method === 'read') {
            options.data || (options.data = {});
            options.data.limit = model.cursor.limit();
            options.data.offset = model.cursor.offset();
            options.headers || (options.headers = {});
            options.headers['Total-Count'] = 'true';
        }
        return Viking.Collection.prototype.sync.call(this, method, model, options);
    }
    
});
Viking.Controller = Backbone.Model;
Viking.Predicate = Backbone.Model;
Viking.Cursor = Backbone.Model.extend({
    defaults: {
        page: 1,
        per_page: 25
    },
    
    reset: function(options) {
        this.set({
            page: 1
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
    
    limit: function() {
        return this.get('per_page');
    },
    
    offset: function () {
        return this.get('per_page') * (this.get('page') - 1);
    },
    
    totalPages: function () {
        return Math.ceil(this.get('total_count') / this.limit());
    },
    
    requiresRefresh: function() {
        var changedAttributes = this.changedAttributes();
        if(changedAttributes) {
            var triggers = ['page', 'per_page'];
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

    // Calls Backbone.history.start, with the default options {pushState: true}
    start: function (options) {
        options = _.extend({pushState: true}, options);
        
        return Backbone.history.start(options);
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
// TODO: move paginated_collection to a plugin





