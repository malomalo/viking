//     Viking.js 0.9.0 (sha:3c6d0e8)
//
//     (c) 2012-2019 Jonathan Bracy, 42Floors Inc.
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
  this.message = message || 'Insufficient arguments';
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
        return _.map(this, function(value) { return value === null ? encodeURIComponent(prefix) + '=' : value.toQuery(prefix); }).join('&');
    },
    writable: true,
    configureable: true,
    enumerable: false
});
// Alias of to_s.
Boolean.prototype.toParam = Boolean.prototype.toString;

Boolean.prototype.toQuery = function(key) {
	return encodeURIComponent(key.toParam()) + "=" + encodeURIComponent(this.toParam());
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
                for( i = 0; i < day.length; i++ ) {
                    day[i] = parseInt(day[i], 10) || 0;
                }
                day[1] -= 1;
                day = new Date(Date.UTC.apply(Date, day));
                if(!day.getDate()) { return NaN; }
                if(match[5]){
                    tz = (parseInt(match[5], 10) * 60);
                    if(match[6]) { tz += parseInt(match[6], 10); }
                    if(match[4] === '+') { tz *= -1; }
                    if(tz) { day.setUTCMinutes(day.getUTCMinutes() + tz); }
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
	return encodeURIComponent(key.toParam()) + "=" + encodeURIComponent(this.toParam());
};



Date.prototype.today = function() {
    return new Date();
};
    
Date.prototype.isToday = function() {
    return (this.getUTCFullYear() == (new Date()).getUTCFullYear() && this.getUTCMonth() == (new Date()).getUTCMonth() && this.getUTCDate() == (new Date()).getUTCDate());
};

Date.prototype.isThisMonth = function () {
    return (this.getUTCFullYear() == (new Date()).getUTCFullYear() && this.getUTCMonth() == (new Date()).getUTCMonth());
}

Date.prototype.isThisYear = function() {
    return (this.getUTCFullYear() == (new Date()).getUTCFullYear());
};


Date.prototype.past = function () {
    return (this < (new Date()));
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
	return encodeURIComponent(key.toParam()) + "=" + encodeURIComponent(this.toParam());
};


Number.prototype.second = function() {
    return this * 1000;
};
Number.prototype.seconds = Number.prototype.second;

Number.prototype.minute = function() {
    return this * 60000;
};
Number.prototype.minutes = Number.prototype.minute;

Number.prototype.hour = function() {
    return this * 3600000;
};
Number.prototype.hours = Number.prototype.hour;

Number.prototype.day = function() {
    return this * 86400000;
};
Number.prototype.days = Number.prototype.day;

Number.prototype.week = function() {
    return this * 7 * 86400000;
};
Number.prototype.weeks = Number.prototype.week;


Number.prototype.ago = function() {
    return new Date((new Date()).getTime() - this);
};

Number.prototype.fromNow = function() {
    return new Date((new Date()).getTime() + this);
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

            if (value === null || value === undefined) {
                return encodeURIComponent(namespaceWithKey);
            } else {
                return value.toQuery(namespaceWithKey);
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
String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

// Converts the first character to lowercase
String.prototype.anticapitalize = function () {
    return this.charAt(0).toLowerCase() + this.slice(1);
};

// Capitalizes all the words and replaces some characters in the string to
// create a nicer looking title. titleize is meant for creating pretty output.
String.prototype.titleize = function () {
    return this.underscore().humanize().replace(/\b('?[a-z])/g, function (m) { return m.toUpperCase(); });
};

// Capitalizes the first word and turns underscores into spaces and strips a
// trailing "_id", if any. Like titleize, this is meant for creating pretty output.
String.prototype.humanize = function () {
    var result = this.toLowerCase().replace(/_id$/, '').replace(/_/g, ' ');
    result = result.replace(/([a-z\d]*)/g, function (m) { return m.toLowerCase(); });
    return result.capitalize();
};

// Makes an underscored, lowercase form from the expression in the string.
//
// Changes '.' to '/' to convert namespaces to paths.
//
// Examples:
// 
//     "ActiveModel".underscore         # => "active_model"
//     "ActiveModel.Errors".underscore # => "active_model/errors"
//
// As a rule of thumb you can think of underscore as the inverse of camelize,
// though there are cases where that does not hold:
//
//     "SSLError".underscore().camelize() # => "SslError"
String.prototype.underscore = function () {
    var result = this.replace('.', '/');
    result = result.replace(/([A-Z\d]+)([A-Z][a-z])/g, "$1_$2");
    result = result.replace(/([a-z\d])([A-Z])/g, "$1_$2");
    return result.replace('-', '_').replace('-', '_').toLowerCase();
};

// By default, #camelize converts strings to UpperCamelCase. If the argument
// to camelize is set to `false` then #camelize produces lowerCamelCase.
//
// \#camelize will also convert "/" to "." which is useful for converting
// paths to namespaces.
//
// Examples:
//
//     "active_model".camelize               // => "ActiveModel"
//     "active_model".camelize(true)         // => "ActiveModel"
//     "active_model".camelize(false)        // => "activeModel"
//     "active_model/errors".camelize        // => "ActiveModel.Errors"
//     "active_model/errors".camelize(false) // => "activeModel.Errors"
//
// As a rule of thumb you can think of camelize as the inverse of underscore,
// though there are cases where that does not hold:
//
//     "SSLError".underscore().camelize()   // => "SslError"
String.prototype.camelize = function (uppercase_first_letter) {
    var result;

    if (uppercase_first_letter === undefined || uppercase_first_letter) {
        result = this.capitalize();
    } else {
        result = this.anticapitalize();
    }

    result = result.replace(/(_|(\/))([a-z\d]*)/g, function (_a, _b, first, rest) {
        return (first || '') + rest.capitalize();
    });

    return result.replace('/', '.');
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
String.prototype.booleanize = function (defaultTo) {
    if (this.toString() === 'true') { return true; }
    if (this.toString() === 'false') { return false; }

    return (defaultTo === undefined ? false : defaultTo);
};

// Replaces underscores with dashes.
//
// Example:
//
//     "puni_puni"  // => "puni-puni"
String.prototype.dasherize = function () {
    return this.replace('_', '-');
};

// Replaces special characters in a string so that it may be used as part of
// a "pretty" URL.
//
// Example:
//
//     "Donald E. Knuth".parameterize() // => 'donald-e-knuth'
String.prototype.parameterize = function (seperator) {
    return this.toLowerCase().replace(/[^a-z0-9\-_]+/g, seperator || '-');
};

// Add Underscore.inflection#pluralize function on the String object
String.prototype.pluralize = function (count, includeNumber) {
    return _.pluralize(this, count, includeNumber);
};

// Add Underscore.inflection#singularize function on the String object
String.prototype.singularize = function () {
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
String.prototype.constantize = function (context) {
    if (!context) { context = window; }

    var value = undefined;

    try {
        value = _.reduce(this.split('.'), function (context, name) {
            var v = context[name];
            if (!v) { throw new Viking.NameError("uninitialized variable " + name); }
            return v;
        }, context);
    } catch (e) {
        if (e instanceof Viking.NameError) {
            value = _.reduce(this.split('::'), function (context, name) {
                var v = context[name];
                if (!v) { throw new Viking.NameError("uninitialized variable " + name); }
                return v;
            }, context);
        } else {
            throw e;
        }
    }

    return value;
};

// Removes the module part from the expression in the string.
//
// Examples:
//     'Namespaced.Module'.demodulize() # => 'Module'
//     'Module'.demodulize() # => 'Module'
//     ''.demodulize() # => ''
String.prototype.demodulize = function (seperator) {
    if (!seperator) {
        seperator = '.';
    }

    var index = this.lastIndexOf(seperator);

    if (index === -1) {
        return String(this);
    } else {
        return this.slice(index + 1);
    }
}

// If `length` is greater than the length of the string, returns a new String
// of length `length` with the string right justified and padded with padString;
// otherwise, returns string
String.prototype.rjust = function (length, padString) {
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
String.prototype.ljust = function (length, padString) {
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

String.prototype.toQuery = function (key) {
    return encodeURIComponent(key.toParam()) + "=" + encodeURIComponent(this.toParam());
};

String.prototype.downcase = String.prototype.toLowerCase;







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
        if (options.emulateJSON) { params.data._method = type; }
        var beforeSend = options.beforeSend;
        options.beforeSend = function(xhr) {
          xhr.setRequestHeader('X-HTTP-Method-Override', type);
          if (beforeSend) { return beforeSend.apply(this, arguments); }
        };
      }
      
      // Don't process data on a non-GET request.
      if (params.type !== 'GET' && !options.emulateJSON) {
        params.processData = false;
      } else if (options.data && typeof options.data === 'object') {
          options.data = bin2String(msgpack.encode(options.data, {
              codec: MsgPackCodec
          }));
          options.headers = options.headers || {};
          options.headers['Query-Encoding'] = 'application/msgpack';
      }

      // Make the request, allowing the user to override any Ajax options.
      var xhr = options.xhr = Viking.ajax(model, _.extend(params, options));
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

    Viking.ajax = function(model, options) {
        if (model instanceof Viking.Collection) {
            model = model.model.prototype;
        }
        
        if(model.connection) {
            options.url = model.connection.host + options.url;
            if (model.connection.withCredentials) {
                options.xhrFields = { withCredentials: true };
            }

            if (options.headers) {
                _.defaults(options.headers, model.connection.headers);
            } else {
                options.headers = model.connection.headers;
            }
        }

        // We only speak json
        if (options.headers) {
            _.defaults(options.headers, {
                'Accept': 'application/json'
            });
        } else {
            options.headers = {'Accept': 'application/json'};
        }

        return jQuery.ajax(options);
    }

}());









// Viking.Model
// ------------
//
// Viking.Model is an extension of [Backbone.Model](http://backbonejs.org/#Model).
// It adds naming, relationships, data type coercions, selection, and modifies
// sync to work with [Ruby on Rails](http://rubyonrails.org/) out of the box.
Viking.Model = Backbone.Model.extend({

    abstract: true,

    // inheritanceAttribute is the attirbutes used for STI
    inheritanceAttribute: 'type',

    defaults: function () {
        var dflts = {};
        
        _.each(this.schema, function(options, key) {
            if(options['default']) {
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
                var type = attrs[this.inheritanceAttribute].camelize().constantize();
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

        if(typeof name === 'string') {
            child.modelName = new Viking.Model.Name(name);
        }

        child.associations = {};
        child.descendants = [];
        child.inheritanceAttribute = (protoProps.inheritanceAttribute === undefined) ? this.prototype.inheritanceAttribute : protoProps.inheritanceAttribute;
        
        if (child.inheritanceAttribute === false || (this.prototype.hasOwnProperty('abstract') && this.prototype.abstract)) {
            child.baseModel = child;
        } else {
            child.baseModel.descendants.push(child);
        }
        
        _.each(['belongsTo', 'hasOne', 'hasMany', 'hasAndBelongsToMany'], function(macro) {
            _.each((protoProps[macro] || []).concat(this[macro] || []), function(name) {
                var options;

                // Handle both `type, key, options` and `type, [key, options]` style arguments
                if (_.isArray(name)) {
                    options = name[1];
                    name = name[0];
                }

                if (!child.associations[name]) {
                    var reflectionClass = {
                        'belongsTo': Viking.Model.BelongsToReflection,
                        'hasOne': Viking.Model.HasOneReflection,
                        'hasMany': Viking.Model.HasManyReflection,
                        'hasAndBelongsToMany': Viking.Model.HasAndBelongsToManyReflection
                    }
                    reflectionClass = reflectionClass[macro];

                    child.associations[name] = new reflectionClass(name, options);
                }
            });
        }, this.prototype);
        
        if (this.prototype.schema && protoProps.schema) {
            _.each(this.prototype.schema, function(value, key) {
                if(!child.prototype.schema[key]) {
                    child.prototype.schema[key] = value;
                }
            });
        }

        
        return child;
    }

});
Viking.Model.Name = function (name) {
    var objectName = name.camelize(); // Namespaced.Name

    this.name = objectName;
    this.collectionName = objectName + 'Collection';
    this.singular = objectName.underscore().replace(/\//g, '_'); // namespaced_name
    this.plural = this.singular.pluralize(); // namespaced_names
    this.human = objectName.demodulize().underscore().humanize(); // Name
    this.title = objectName.demodulize().underscore().titleize();
    this.collection = this.singular.pluralize(); // namespaced/names
    this.paramKey = this.singular;
    this.routeKey = this.plural;
    this.element = objectName.demodulize().underscore();

    this.model = function () {
        if (this._model) {
            return this._model;
        }

        this._model = this.name.constantize();
        return this._model;
    }

}
Viking.Model.Reflection = function () { };
_.extend(Viking.Model.Reflection.prototype, {
    klass: function() {
        if (this.macro === 'hasMany') {
            return this.collection();
        }
        
        return this.model();
    },
    
    model: function() {
        return this.modelName.model();
    },
    
    collection: function() {
        return this.collectionName.constantize();
    }

});
Viking.Model.Reflection.extend = Backbone.Model.extend;
Viking.Model.BelongsToReflection = Viking.Model.Reflection.extend({
    
    constructor: function (name, options) {
        this.name = name;
        this.macro = 'belongsTo';
        this.options = _.extend({}, options);
    
        if (!this.options.polymorphic) {
            if (this.options.modelName) {
                this.modelName = new Viking.Model.Name(this.options.modelName);
            } else {
                this.modelName = new Viking.Model.Name(name);
            }
        }
    }
    
});
Viking.Model.HasAndBelongsToManyReflection = Viking.Model.Reflection.extend({

    constructor: function (name, options) {
        this.name = name;
        this.macro = 'hasAndBelongsToMany';
        this.options = _.extend({}, options);
    
        if (this.options.modelName) {
            this.modelName = new Viking.Model.Name(this.options.modelName);
        } else {
            this.modelName = new Viking.Model.Name(this.name.singularize());
        }

        if (this.options.collectionName) {
            this.collectionName = this.options.CollectionName;
        } else {
            this.collectionName = this.modelName.collectionName;
        }

    }
    
});
Viking.Model.HasManyReflection = Viking.Model.Reflection.extend({
    
    constructor: function (name, options) {
        this.name = name;
        this.macro = 'hasMany';
        this.options = _.extend({}, options);

        if (this.options.modelName) {
            this.modelName = new Viking.Model.Name(this.options.modelName);
        } else {
            this.modelName = new Viking.Model.Name(this.name.singularize());
        }

        if (this.options.collectionName) {
            this.collectionName = this.options.collectionName;
        } else {
            this.collectionName = this.modelName.collectionName;
        }
    }
    
});
Viking.Model.HasOneReflection = Viking.Model.Reflection.extend({
    
    constructor: function (name, options) {
        this.name = name;
        this.macro = 'hasOne';
        this.options = _.extend({}, options);

        if (!this.options.polymorphic) {
            if (this.options.modelName) {
                this.modelName = new Viking.Model.Name(this.options.modelName);
            } else {
                this.modelName = new Viking.Model.Name(name);
            }
        }
    }

});
// Create a model with +attributes+. Options are the 
// same as Viking.Model#save
Viking.Model.create = function(attributes, options) {
    var model = new this(attributes);
    model.save(null, options);
    return model;
};
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
// Find or create model by attributes. Accepts success callbacks in the
// options hash, which is passed (model) as arguments.
//
// findOrCreateBy returns the model, however it most likely won't have fetched
// the data	from the server if you immediately try to use attributes of the
// model.
Viking.Model.findOrCreateBy = function(attributes, options) {
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
}
Viking.Model.reflectOnAssociation = function(name) {
    return this.associations[name];
};
Viking.Model.reflectOnAssociations = function(macro) {
    var associations = _.values(this.associations);
    if (macro) {
        associations = _.select(associations, function(a) {
            return a.macro === macro;
        });
    }

    return associations;
};
// Generates the `urlRoot` based off of the model name.
Viking.Model.urlRoot = function() {
    if (this.prototype.hasOwnProperty('urlRoot')) {
        return _.result(this.prototype, 'urlRoot')
    } else if (this.baseModel.prototype.hasOwnProperty('urlRoot')) {
        return _.result(this.baseModel.prototype, 'urlRoot')
    } else {
        return "/" + this.baseModel.modelName.plural;
    }
};
// Returns a unfetched collection with the predicate set to the query
Viking.Model.where = function(options) {
    // TODO: Move to modelName as well?
    var Collection = (this.modelName.name + 'Collection').constantize();
    
    return new Collection(undefined, {predicate: options});
};
Viking.Model.prototype.coerceAttributes = function(attrs) {
    var that = this;
    _.each(this.associations, function(association) {
        var Type;
        var polymorphic = association.options.polymorphic;
        
        if (!attrs[association.name]) { return; }
        
        if (polymorphic && (attrs[association.name] instanceof Viking.Model)) {
            // TODO: remove setting the id?
            attrs[association.name + '_id'] = attrs[association.name].id;
            attrs[association.name + '_type'] = attrs[association.name].modelName.name;
        } else if (polymorphic && attrs[association.name + '_type']) {
            Type = attrs[association.name + '_type'].camelize().constantize();
            attrs[association.name] = new Type(attrs[association.name]);
        } else if (!(attrs[association.name] instanceof association.klass())) {
            Type = association.klass();
            attrs[association.name] = new Type(attrs[association.name]);
        }
    });

    _.each(this.schema, function (options, key) {
        if (attrs[key] || attrs[key] === false) {
            var tmp, klass;
            
            klass = Viking.Model.Type.registry[options['type']];
            
            if (klass) {
                if (options['array']) {
                    tmp = [];
                    _.each(attrs[key], function(value) {
                        tmp.push(klass.load(value, key));
                    });
                    attrs[key] = tmp;
                } else {
                    attrs[key] = klass.load(attrs[key], key);
                    if (attrs[key] instanceof Viking.Model) {
                        that.listenTo(attrs[key], 'change', function(){
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
    return this.baseModel.modelName.paramKey;
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
    options.success = function(resp) {
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
    options.error = function(resp) {
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
};
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
        var type = attrs[this.inheritanceAttribute].camelize().constantize();
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
        } else if (association && association.macro == 'belongsTo') {
            if (!value) {
                options.unset ? delete this.attributes[key + '_id'] : this.attributes[key + '_id'] = value;
            } else {
                this.attributes[key + '_id'] = value.id;
            }
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

    _.each(this.schema, function (options, key) {
        if (data[key] || data[key] === false) {
            var tmp, klass;
            
            klass = Viking.Model.Type.registry[options.type];

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
                throw new TypeError("Coercion of " + options.type + " unsupported");
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
Viking.Model.prototype.touch = function(columns, options) {
    var now = new Date();
    
    var attrs = {
        updated_at: now
    }

    options = _.extend({patch: true}, options);
    
    if (_.isArray(columns)) {
        _.each(columns, function (column) {
            attrs[column] = now;
        });
    } else if (columns) {
        attrs[columns] = now;
    }
    
    return this.save(attrs, options);
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
Viking.Model.Type = {
    'registry': {}
}

Viking.Model.Type.registry['boolean'] = Viking.Model.Type.Boolean = {
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
Viking.Model.Type.registry['date'] = Viking.Model.Type.Date = {
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
Viking.Model.Type.registry['json'] = Viking.Model.Type.JSON = {

    load: function(value, key) {
        if (typeof value === 'object' && !(value instanceof Viking.Model)) {
            var AnonModel = Viking.Model.extend({
                inheritanceAttribute: false
            });
            var model = new AnonModel(value);
            model.modelName = new Viking.Model.Name(key);
            model.baseModel = model;
            _.each(value, function(v, k){
                if(_.isObject(v) && !_.isArray(v) && !_.isDate(v)){
                    var sub_model = Viking.Model.Type.JSON.load(v, k)
                    model.listenTo(sub_model, 'change', function(){
                        model.trigger('change', arguments);
                    });
                    model.attributes[k] = sub_model;
                }
            })
            
            return model;
        } else if (!(value instanceof Viking.Model)) {
            throw new TypeError(typeof value + " can't be coerced into JSON");
        }
    },

    dump: function(value) {
        if (value instanceof Viking.Model) {
            var output = value.toJSON();
            _.each(output, function(v, k){
                if (v instanceof Viking.Model){
                    output[k] = Viking.Model.Type.JSON.dump(v)
                }
            })
            return output;
        }

        return value;
    }

};
Viking.Model.Type.registry['number'] = Viking.Model.Type.Number = {
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
Viking.Model.Type.registry['string'] = Viking.Model.Type.String = {
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
        this.includes = undefined;
        
        if(options && options.predicate) {
            this.setPredicate(options.predicate, {silent: true});
        }
        if(options && options.order) {
            this.order(options.order, {silent: true});
        }

        if(options && options.include) {
            this.include(options.include, {silent: true});
        }
    },
    
    url: function() {
        return "/" + this.model.modelName.plural;
    },
    paramRoot: function() {
        return this.model.modelName.plural;
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
                if(_.isArray(predicate)){
                    predicate = new Viking.Predicate({
                        value: predicate
                    });
                } else {
                    predicate = new Viking.Predicate(predicate);
                }
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
        this.trigger('change:predicate', this.predicate);
        this.fetch();
    },

    // Sets `'selected'` to `true` on the `model`. By default all other models
    // will be unselected. If `{multiple: true}` is passed as an option the other
    // models will not be unselected. Triggers the `selected` event on the
    // collection. If the model is already selected the `selected` event is
    // not triggered
    select: function(model, options) {
        options || (options = {});
        
        if(!options.multiple && !_.isArray(model)) {
            this.clearSelected(model);
        }
        if(_.isArray(model)){
            _.each(model, function(model){
                model = this.get(model);
                if(!model) return;
                if(!model.selected) {
                    model.selected = true;
                    model.trigger('selected', model, this.selected());
                }
            }, this)
        } else if(!model.selected) {
            model.selected = true;
            model.trigger('selected', model, this.selected());
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
            options.data.where = this.predicate.get('value') || this.predicate.attributes;
        }
        
        if(method === 'read' && this.ordering) {
            options.data || (options.data = {});
            options.data.order = this.ordering;
        }
        
        if(method == 'read' && this.includes){
            options.data || (options.data = {});
            options.data.include = this.includes;
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
            var normalizedOrder;
            
            if(typeof o === 'string') {
                normalizedOrder = {};
                normalizedOrder[o] = 'asc';
            } else {
                normalizedOrder = o;
            }
            
            return normalizedOrder;
        });
        
        if (order.length === 1 && !order[0]) {
            this.ordering = undefined;
            if (!options.silent) { this.orderChanged(order); }
            return;
        }
        
        if (this.ordering) {
            var orderingEqual = !_.contains( _.map(this.ordering, function(el, i) { return _.isEqual(el, order[i]); }), false );
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
    },
    

    
    
    include: function(includes, options) {
        if(_.isEmpty(includes)) {
            this.includes = undefined;
            if (!options.silent) { this.includeChanged(order); }
            return;
        }
        
        this.includes = includes;
        if (!options.silent) { this.includeChanged(order); }
    },
    
    includeChanged: function(includes) {
        this.fetch();
    }
    
});



// Viking.View
// -----------
//
// Viking.View is a framework fro handling view template lookup and rendering.
// It provides view helpers that assisst when building HTML forms and more.
Viking.View = Backbone.View.extend({

    template: undefined,

    renderTemplate: function(locals) {
        return Viking.View.Helpers.render(this.template, locals);
    },

    //Copied constructor from Backbone View
    constructor: function (options) {
        this.cid = _.uniqueId('view');
        options || (options = {});
        _.extend(this, _.pick(options, ['model', 'collection', 'el', 'id', 'attributes', 'className', 'tagName', 'events']));
        this._ensureElement();
        
        // Add an array for storing subView attached to this view so we can remove then
        this.subViews = [];
        
        this.initialize.apply(this, arguments);
        this.delegateEvents();
    },
    
    // A helper method that constructs a view and adds it to the subView array
    subView: function (SubView, options) {
        var view = new SubView(options);
        this.subViews.push(view);
        this.listenTo(view, 'remove', this.removeSubView);
        return view;
    },
    
    // Removes the subview from the array and stop listening to it, and calls
    // #remove on the subview.
    removeSubView: function (view) {
        this.subViews = _.without(this.subViews, view);
        this.stopListening(view);
        view.remove();
    },
    
    // Remove all subviews when remove this view. We don't call stopListening
    // here because this view is being removed anyways so those will get cleaned
    // up by Backbone.
    remove: function () {
        while (this.subViews.length > 0){
            this.subViews.pop().remove();
        }
        
        // Emit a remove event for when a view is removed
        // TODO: Maybe backport this to Backbone?
        this.trigger('remove', this);

        Backbone.View.prototype.remove.apply(this, arguments);
    },
    
    // Listens to attribute(s) of the model of the view, on change
    // renders the new value to el. Optionally, pass render function to render 
    // something different, model is passed as an arg
    // TODO: document me
    bindEl: function (attributes, selector, render) {
        var view = this;
        render || (render = function (model) { return model.get(attributes); } );
        if (!_.isArray(attributes)) { attributes = [attributes]; }
        
        //TODO: might want to Debounce because of some inputs being very rapid
        // but maybe that should be left up to the user changes (ie textareas like description)
        _.each(attributes, function (attribute) {
            view.listenTo(view.model, 'change:' + attribute, function (model) {
                view.$(selector).html( render(model) );
            });
        });
    }
    
    //TODO: Default render can just render template
}, {

    // `Viking.View.templates` is used for storing templates. 
    // `Viking.View.Helpers.render` looks up templates in this
    // variable
    templates: {},

    // Override the original extend function to support merging events
    extend: function(protoProps, staticProps) {
        if (protoProps && protoProps.events) {
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
            name = options.namespace + '[' + attribute + ']';
        } else {
            name = model.baseModel.modelName.paramKey + '[' + attribute + ']';
        }
        
        var isArray = model.schema && model.schema[attribute] && model.schema[attribute].array;
        if (value instanceof Viking.Collection || _.isArray(value) || isArray) {
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
Viking.View.Helpers.checkBoxTag = function (name, value, checked, options, escape) {
    if (value === undefined) { value = "1"; }
    if (options === undefined) { options = {}; }
    if (checked === true) { options.checked = true; }

    _.defaults(options, {
        type: "checkbox",
        value: value,
        id: Viking.View.sanitizeToId(name),
        name: name
    });

    return Viking.View.Helpers.tag("input", options, escape);
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
Viking.View.Helpers.textFieldTag = function (name, value, options, escape) {

    // Handle both `name, value` && `name, options` style arguments
    if (value !== null && typeof value === 'object' && !(value instanceof Backbone.Model)) {
        options = value;
        value = undefined;
    }

    return Viking.View.Helpers.tag('input', _.extend({
        "type": 'text',
        "id": Viking.View.sanitizeToId(name),
        "name": name,
        "value": value
    }, options), escape);
    
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
Viking.View.Helpers.hiddenFieldTag = function (name, value, options, escape) {
    if (options === undefined) { options = {}; }
    _.defaults(options, {type: "hidden", id: null});
    
    return Viking.View.Helpers.textFieldTag(name, value, options, escape);
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
    
    if (typeof options === 'function' || typeof options === 'string') {
        tmp = content;
        content = options;
        options = tmp;
    }
    options || (options = {});
    
    if (options.action && !options.method) {
        options.method = 'post';
    } else if (options.method && options.method !== 'get' && options.method !== 'post') {
        methodOverride = Viking.View.Helpers.hiddenFieldTag('_method', options.method);
        options.method = 'post';
    }
    
    if (options.multipart) {
        options.enctype = "multipart/form-data";
        delete options.multipart;
    }
    

    if(content !== undefined) {
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
// colorFieldTag(name, value = nil, options = {})
// ===============================================
// 
// Creates a color field.
//
// Options
// -------
//      - Accepts the same options as text_field_tag.
//
// Examples
// --------
//   
//   colorFieldTag('accent')
//   // => <input name="accent" type="color">
//   
//   colorFieldTag('accent', "#FFFFFF")
//   // => <input" name="accent" type="color" value="#FFFFFF">
Viking.View.Helpers.colorFieldTag = function (name, value, options) {
    
    // Handle both `name, value, options`, and `name, options` syntax
    if (typeof value === 'object') {
        options = value;
        value = undefined;
    }
    
    options = _.extend({type: 'color'}, options);
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
        content = options.format ? date.strftime(options.format) : date.toString();
    }
    if (options.format) { delete options.format; }
    if (!options.datetime) { options.datetime = date.toISOString(); }
    

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
    if (options.checked === false) { delete options.checked; }
    _.defaults(options, {
        type: "radio",
        value: value,
        name: name,
        id: Viking.View.sanitizeToId(name)
    });

    return Viking.View.Helpers.tag("input", options);
};
// selectTag(name, optionTags, options)
// ====================================
//
// Creates a dropdown selection box, or if the :multiple option is set to true,
// a multiple choice selection box.
//
// Options
// -------
//    - multiple:      If set to true the selection will allow multiple choices.
//    - disabled:      If set to true, the user will not be able to use this input.
//    - includeBlank:  If set to true, an empty option will be created, can pass a string to use as empty option content
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
Viking.View.Helpers.selectTag = function (name, optionTags, options) {
    var tagName = name;
    if (options === undefined) { options = {}; }
    if (options.multiple && tagName.slice(-2) !== "[]") { tagName = tagName + "[]"; }
    _.defaults(options, {
        id: Viking.View.sanitizeToId(name),
        name: tagName
    });

    if (options.includeBlank) {
        var content = typeof options.includeBlank == "string" ? options.includeBlank : "";
        optionTags = Viking.View.Helpers.contentTag('option', content, {value: ''}) + optionTags;
        delete options.includeBlank;
    }

    if (options.prompt) {
        if (options.prompt === true) { options.prompt = 'Select'; }
        optionTags = Viking.View.Helpers.contentTag('option', options.prompt, {value: ''}) + optionTags;
        delete options.prompt;
    }

    return Viking.View.Helpers.contentTag('select', optionTags, options, false);
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
    var modelName;

    options = _.extend({}, options);
    
    this.model = model;
    this.options = options;

    modelName = _.has(options, 'as') ? options.as : this.model.baseModel.modelName.paramKey;
    if (options.namespace) {
        if (options.as !== null) {
            this.options.namespace = options.namespace + '[' + modelName + ']';
        }
    } else {
        this.options.namespace = modelName;
    }
}

// TODO: options passed to the helpers can be made into a helper
FormBuilder.prototype = {

    checkBox: function(attribute, options, checkedValue, uncheckedValue, escape) {
        options || (options = {});

        if (!options.name && this.options.namespace) {
            options.name = Viking.View.tagNameForModelAttribute(this.model, attribute, {namespace: this.options.namespace});
        }
        
        return Viking.View.Helpers.checkBox(this.model, attribute, options, checkedValue, uncheckedValue, escape);
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
        if (!options['for'] && !options.name && this.options.namespace) {
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
    
    color: function(attribute, options) {
        options || (options = {});
        
        if (!options.name && this.options.namespace) {
            options.name = Viking.View.tagNameForModelAttribute(this.model, attribute, {namespace: this.options.namespace});
        }
        
        return Viking.View.Helpers.colorField(this.model, attribute, options);
    },
    
    money: function(attribute, options) {
        options || (options = {});
        
        if (!options.name && this.options.namespace) {
            options.name = Viking.View.tagNameForModelAttribute(this.model, attribute, {namespace: this.options.namespace});
        }
        
        return Viking.View.Helpers.moneyField(this.model, attribute, options);
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
    
    fieldsFor: function(attribute, records, options, content) {
        var builder;
        
        if (records instanceof Viking.Model) {
            records = [records];
        }

        if (!_.isArray(records) && !(records instanceof Viking.Collection)) {
            content = options;
            options = records;
            records = undefined;
        }

        if (typeof options === 'function') {
            content = options;
            options = {};
        }
        
        if (this.model.get(attribute) instanceof Viking.Collection) {
            var superOptions = this.options;
            var parentModel = this.model;
            records || (records = this.model.get(attribute));
            if (records instanceof Viking.Collection) {
                records = records.models;
            }

            return _.map(records, function(model) {
                var localOptions = _.extend({'as': null}, options);
                if (!options.namespace) {
                    if (superOptions.namespace) {
                        localOptions.namespace = superOptions.namespace + '[' + attribute + '][' + model.cid + ']';
                    } else {
                        localOptions.namespace = parentModel.baseModel.modelName.paramKey + '[' + attribute + '][' + model.cid + ']';
                    }
                }
                
                builder = new FormBuilder(model, localOptions);
                
                if (model.id) {
                    return builder.hiddenField('id') + content(builder);
                } else {
                    return content(builder);
                }
            }).join('');
        } else {
            if (!options.namespace && this.options.namespace) {
                options.namespace = this.options.namespace;
            }
            options.as = attribute;

            builder = new FormBuilder(this.model.get(attribute), options);
            return content(builder);
        }

    }
    
};
function CheckBoxGroupBuilder(model, attribute, options) {
    var modelName;
    options = _.extend({}, options);
    
    this.model = model;
    this.attribute = attribute;
    this.options = options;

    modelName = _.has(options, 'as') ? options.as : this.model.baseModel.modelName.paramKey;
    if (options.namespace) {
        if (options.as !== null && options.namespace.indexOf(modelName) == -1) {
            this.options.namespace = options.namespace + '[' + modelName + ']';
        }
    } else {
        this.options.namespace = modelName;
    }
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
    
};


// distanceOfTimeInWords(fromTime)
// distanceOfTimeInWords(fromTime, options)
// distanceOfTimeInWords(fromTime, toTime)
// distanceOfTimeInWords(fromTime, toTime, options)
// ================================================
//
// Reports the approximate distance in time between two Date objects. If only
// fromTime is given, toTime defaults to now
//
// Pass +includeSeconds: true+ if you want more detailed approximations
// when distance < 1 min, 29 secs.
//
// Distances are reported based on the following table:
//
//   0 secs <-> 1 min, 29 secs                                                  # => a minute
//   1 min, 30 secs <-> 59 mins, 29 secs                                        # => [2..59] minutes
//   59 mins, 30 secs <-> 1 hr, 29 mins, 59 secs                                # => an hour
//   1 hr, 30 mins, 0 secs <-> 23 hrs, 29 mins, 59 secs                         # => [2..23] hours
//   23 hrs, 30 mins, 0 secs <-> 1 day, 11 hrs, 59 mins, 59 secs                # => a day
//   1 day, 12 hrs, 0 mins, 0 secs <-> 29 days, 11 hrs, 59 mins, 59 secs        # => [2..29] days
//   29 days, 12 hrs, 0 mins, 0 secs <-> 44 days, 23 hrs, 59 mins, 59 secs       # => a month
//   45 days, 0 hrs, 0 mins, 0 secs <-> 1 yr minus 1 sec                        # => [2..12] months
//   1 yr <-> 1 yr, 3 months                                                    # => a year
//   1 yr, 3 months <-> 1 yr, 9 months                                          # => over a year
//   1 yr, 9 months <-> 2 yr minus 1 sec                                        # => almost 2 years
//   2 yrs <-> max time or date                                                 # => (same rules as 1 yr)
//
// With <tt>includeSeconds: true</tt> and the difference < 1 minute 29 seconds:
//   0-1   secs      # => a second
//   2-9   secs      # => [1..9] seconds
//   10-54 secs      # => [10,20...50] seconds
//   55-89 secs      # => a minute
//
//   fromTime = new Date()
//   distanceOfTimeInWords(fromTime, fromTime + 50.minutes)                                # => about 1 hour
//   distanceOfTimeInWords(fromTime, 50.minutes.from_now)                                   # => about 1 hour
//   distanceOfTimeInWords(fromTime, fromTime + 15.seconds)                                # => less than a minute
//   distanceOfTimeInWords(fromTime, fromTime + 15.seconds, include_seconds: true)         # => less than 20 seconds
//   distanceOfTimeInWords(fromTime, 3.years.from_now)                                      # => about 3 years
//   distanceOfTimeInWords(fromTime, fromTime + 60.hours)                                  # => 3 days
//   distanceOfTimeInWords(fromTime, fromTime + 45.seconds, include_seconds: true)         # => less than a minute
//   distanceOfTimeInWords(fromTime, fromTime - 45.seconds, include_seconds: true)         # => less than a minute
//   distanceOfTimeInWords(fromTime, 76.seconds.from_now)                                   # => 1 minute
//   distanceOfTimeInWords(fromTime, fromTime + 1.year + 3.days)                           # => about 1 year
//   distanceOfTimeInWords(fromTime, fromTime + 3.years + 6.months)                        # => over 3 years
//   distanceOfTimeInWords(fromTime, fromTime + 4.years + 9.days + 30.minutes + 5.seconds) # => about 4 years
//
//   toTime = Time.now + 6.years + 19.days
//   distanceOfTimeInWords(fromTime, toTime, include_seconds: true)                        # => about 6 years
//   distanceOfTimeInWords(toTime, fromTime, include_seconds: true)                        # => about 6 years
//   distanceOfTimeInWords(Time.now, Time.now)                                               # => less than a minute
Viking.View.Helpers.distanceOfTimeInWords = function (fromTime, toTime, options) {
    var tmp;
    
    if (!(toTime instanceof Date)) {
        options = toTime;
        toTime = new Date();
    }
    
    options = _.extend({}, options);
    
    if ( fromTime > toTime ) {
        tmp = fromTime;
        fromTime = toTime;
        toTime = tmp;
    }
    
    var distance_in_seconds = Math.round((toTime.getTime() - fromTime.getTime()) / 1000);
    var distance_in_minutes = Math.round(distance_in_seconds / 60);

    if (distance_in_seconds <= 60) {
        if ( options.includeSeconds ) {
            if (distance_in_seconds < 2) {
                return "a second";
            } else if (distance_in_seconds < 10) {
                return distance_in_seconds + " seconds";
            } else if (distance_in_seconds < 55) {
                return (Math.round(distance_in_seconds/10)*10) + " seconds";
            } else {
                return "a minute";
            }
        } else {
            return "a minute";
        }
    } else if (distance_in_seconds < 90) {
        return "a minute";
    } else if (distance_in_seconds < (59*60) + 30) {
        return distance_in_minutes + " minutes";
    } else if (distance_in_seconds < (1*3600) + (30*60)) {
        return "an hour";
    } else if (distance_in_seconds < (23*3600) + (30*60)) { // Less than 23.5 Hours
        return Math.round(distance_in_seconds / 3600) + " hours"
    } else if (distance_in_seconds < (36*3600)) { // Less than 36 Hours
        return "a day";
    } else if (distance_in_seconds < (29*86400) + (12*3600)) { // Less than 29.5 Days
        return Math.round(distance_in_seconds / 86400) + " days"
    } else if (distance_in_seconds < (45*86400)) { // Less than 45 Days
        return "a month";
    } else if (distance_in_seconds < (365*86400)) { // Less than 365 Days
        return Math.round(distance_in_seconds / (30*86400)) + " months"
    } else {
        // 1 year = 525949 min
        // 1 leap year = 527040 min
        // for out calculations 400 year = 97 leap years + 303 years
        // 1 year ~= (525949 * 303 + 527040 * 97) / 400 = 526213.5675 min
        var years = Math.round((distance_in_minutes / 526213.5675)*100)/100;
        var partial_years = Math.round(years % 1 * 100) / 100;
        if (years < 1 || partial_years < 0.33) {
            years = Math.round(years);
            if (years == 1) { 
                return "a year";
            } else {
                return years + " years";
            }
        } else if (partial_years < 0.66) {
            years = Math.floor(years);
            if (years == 1) { 
                return "over a year";
            } else {
                return "over " + years + " years";
            }
        } else {
            years = Math.floor(years);
            return "almost " + (years+1) + " years";
        }
    }
};

Viking.View.Helpers.timeAgoInWords = Viking.View.Helpers.distanceOfTimeInWords;
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
Viking.View.Helpers.checkBox = function (model, attribute, options, checkedValue, uncheckedValue, escape) {
    var output = '';
    var value = model.get(attribute);

    if (options === undefined) { options = {}; }
    if (checkedValue === undefined) { checkedValue = true; }
    if (uncheckedValue === undefined) { uncheckedValue = false; }
    Viking.View.addErrorClassToOptions(model, attribute, options);

    var name = options.name || Viking.View.tagNameForModelAttribute(model, attribute, options);    
    output += Viking.View.Helpers.hiddenFieldTag(name, uncheckedValue, undefined, escape);
    output += Viking.View.Helpers.checkBoxTag(name, checkedValue, checkedValue === value, options, escape);
    
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
    
    var name = options.name || Viking.View.tagNameForModelAttribute(model, attribute, options);
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
    var name = Viking.View.tagNameForModelAttribute(model, attribute, options);
    
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
        var name = Viking.View.tagNameForModelAttribute(model, attribute, options);
        options['for'] = Viking.View.sanitizeToId(name);
    }
    if (options['value']) {
        options['for'] += "_" + options['value'];
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
    var name = options.name || Viking.View.tagNameForModelAttribute(model, attribute, options);

    Viking.View.addErrorClassToOptions(model, attribute, options);
    
    return Viking.View.Helpers.numberFieldTag(name, model.get(attribute), options);
};
// colorField(model, attribute, options)
// ======================================
//
// Returns an input tag of the "color" type tailored for accessing a specified
// attribute on the model. Additional options on the input tag can be passed as
// a hash with options. These options will be tagged onto the HTML as an HTML
// element attribute as in the example shown.
//
// Examples
// --------
//   colorField(brand, 'accent')
//   // => <input id="brand_accent" name="brand[accent]" type="color">
Viking.View.Helpers.colorField = function (model, attribute, options) {
    options = _.extend({}, options);
    var name = options.name || Viking.View.tagNameForModelAttribute(model, attribute, options);

    Viking.View.addErrorClassToOptions(model, attribute, options);
    
    return Viking.View.Helpers.colorFieldTag(name, model.get(attribute), options);
};
// moneyField(model, attribute, options)
//
// same as numberField only it converts value from cents to dollars (val / 100)
Viking.View.Helpers.moneyField = function (model, attribute, options) {
    options = _.extend({class: "viking-money-field"}, options);
    var name = options.name || Viking.View.tagNameForModelAttribute(model, attribute, options);
    var value = model.get(attribute) / 100;

    Viking.View.addErrorClassToOptions(model, attribute, options);
    
    return Viking.View.Helpers.numberFieldTag(name, value, options);
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
    var name = options.name || Viking.View.tagNameForModelAttribute(model, attribute, options);

    if (options === undefined) { options = {}; }
    Viking.View.addErrorClassToOptions(model, attribute, options);
    
    return Viking.View.Helpers.passwordFieldTag(name, undefined, options);
};
// radioButton(model, attribute, tagValue, options)
// ==================================================
//
// Returns a radio button tag for accessing a specified attribute on a model.
// If the current value of attribute is tagValue the radio button will be checked.
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
Viking.View.Helpers.radioButton = function (model, attribute, tagValue, options) {
    if (options === undefined) { options = {}; }
    var name = options.name || Viking.View.tagNameForModelAttribute(model, attribute, options);

    _.defaults(options, {
        id: Viking.View.sanitizeToId(name + "_" + tagValue)
    });
    Viking.View.addErrorClassToOptions(model, attribute, options);
    
    var value = tagValue;
    if (value === undefined || value === null) {
        value = "";
    }
    
    return Viking.View.Helpers.radioButtonTag(name, value, tagValue === model.get(attribute), options);
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

    var name = options['name'] || Viking.View.tagNameForModelAttribute(model, attribute, options);
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
    var name = options['name'] || Viking.View.tagNameForModelAttribute(model, attribute, options);
    
    if (options === undefined) { options = {}; }
    Viking.View.addErrorClassToOptions(model, attribute, options);
    
    var value = model.get(attribute)
    if (model.schema && model.schema[attribute] && model.schema[attribute].type == 'json') {
        value = JSON.stringify(model.get(attribute), undefined, 4);
    }
    
    return Viking.View.Helpers.textAreaTag(name, value, options);
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
    if (options === undefined) { options = {}; }
    Viking.View.addErrorClassToOptions(model, attribute, options);

    var name = options['name'] || Viking.View.tagNameForModelAttribute(model, attribute, options);
    var value = model.get(attribute)
    value = value && typeof value === 'object' ? value.toString() : value
    return Viking.View.Helpers.textFieldTag(name, value, options);
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
        protocol: window.location.protocol.replace(':', '')
    }, options);
    
    var route;
    var klass = modelOrUrl.baseModel.modelName.model();
    if (modelOrUrl instanceof klass) {
        if (modelOrUrl.isNew()) {
            route = (klass.baseModel.modelName.plural + 'Path').constantize();
            route = route();
        } else {
            route = (klass.baseModel.modelName.singular + 'Path').constantize();
            route = route(modelOrUrl);
        }
    } else {
        route = (modelOrUrl.baseModel.modelName.plural + 'Path').constantize();
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
    }

    throw new Error('Template does not exist: ' + templatePath);
};
Viking.PaginatedCollection = Viking.Collection.extend({
    constructor: function(models, options) {
        Viking.Collection.apply(this, arguments);
        if (options && options.cursor) {
            if(options.cursor instanceof Viking.Cursor) {
                this.cursor = options.cursor;
            } else {
                this.cursor = new Viking.Cursor(options.cursor);
            }
        } else {
            this.cursor = new Viking.Cursor();
        }
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
        this.fetch(options);
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
Viking.Controller = Backbone.Model.extend({
    
    // Below is the same code from the Backbone.Model function
    // except where there are comments
    constructor: function (attributes, options) {
        var attrs = attributes || {};
        options || (options = {});
        this.cid = _.uniqueId('c');
        this.attributes = {};
        if (options.collection) this.collection = options.collection;
        if (options.parse) attrs = this.parse(attrs, options) || {};
        attrs = _.defaults({}, attrs, _.result(this, 'defaults'));
        this.set(attrs, options);
        this.changed = {};
        this.initialize.apply(this, arguments);
        
        // Add a helper reference to get the model name from an model instance.
        this.controllerName = this.constructor.controllerName;
    }
    
}, {
    
    // Overide the default extend method to support passing in the controlelr name
    //
    // The name is helpful for determining the current controller and using it
    // as a key
    //
    // `name` is optional, and must be a string
    extend: function(controllerName, protoProps, staticProps) {
        if(typeof controllerName !== 'string') {
            staticProps = protoProps;
            protoProps = controllerName;
        }
        protoProps || (protoProps = {});
        
        var child = Backbone.Model.extend.call(this, protoProps, staticProps);

        if(typeof controllerName === 'string') { child.controllerName = controllerName; }
        
        _.each(protoProps, function(value, key) {
            if (typeof value === 'function') { child.prototype[key].controller = child; }
        });
        
        return child;
    }

});
Viking.Predicate = Backbone.Model;
Viking.Cursor = Backbone.Model.extend({
    defaults: {
        "page": 1,
        "per_page": 25
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
// https://github.com/kawanet/msgpack-lite 
// v.0.1.26
!function(t){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=t();else if("function"==typeof define&&define.amd)define([],t);else{var r;r="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this,r.msgpack=t()}}(function(){return function t(r,e,n){function i(f,u){if(!e[f]){if(!r[f]){var a="function"==typeof require&&require;if(!u&&a)return a(f,!0);if(o)return o(f,!0);var s=new Error("Cannot find module '"+f+"'");throw s.code="MODULE_NOT_FOUND",s}var c=e[f]={exports:{}};r[f][0].call(c.exports,function(t){var e=r[f][1][t];return i(e?e:t)},c,c.exports,t,r,e,n)}return e[f].exports}for(var o="function"==typeof require&&require,f=0;f<n.length;f++)i(n[f]);return i}({1:[function(t,r,e){e.encode=t("./encode").encode,e.decode=t("./decode").decode,e.Encoder=t("./encoder").Encoder,e.Decoder=t("./decoder").Decoder,e.createCodec=t("./ext").createCodec,e.codec=t("./codec").codec},{"./codec":10,"./decode":12,"./decoder":13,"./encode":15,"./encoder":16,"./ext":20}],2:[function(t,r,e){(function(Buffer){function t(t){return t&&t.isBuffer&&t}r.exports=t("undefined"!=typeof Buffer&&Buffer)||t(this.Buffer)||t("undefined"!=typeof window&&window.Buffer)||this.Buffer}).call(this,t("buffer").Buffer)},{buffer:29}],3:[function(t,r,e){function n(t,r){for(var e=this,n=r||(r|=0),i=t.length,o=0,f=0;f<i;)o=t.charCodeAt(f++),o<128?e[n++]=o:o<2048?(e[n++]=192|o>>>6,e[n++]=128|63&o):o<55296||o>57343?(e[n++]=224|o>>>12,e[n++]=128|o>>>6&63,e[n++]=128|63&o):(o=(o-55296<<10|t.charCodeAt(f++)-56320)+65536,e[n++]=240|o>>>18,e[n++]=128|o>>>12&63,e[n++]=128|o>>>6&63,e[n++]=128|63&o);return n-r}function i(t,r,e){var n=this,i=0|r;e||(e=n.length);for(var o="",f=0;i<e;)f=n[i++],f<128?o+=String.fromCharCode(f):(192===(224&f)?f=(31&f)<<6|63&n[i++]:224===(240&f)?f=(15&f)<<12|(63&n[i++])<<6|63&n[i++]:240===(248&f)&&(f=(7&f)<<18|(63&n[i++])<<12|(63&n[i++])<<6|63&n[i++]),f>=65536?(f-=65536,o+=String.fromCharCode((f>>>10)+55296,(1023&f)+56320)):o+=String.fromCharCode(f));return o}function o(t,r,e,n){var i;e||(e=0),n||0===n||(n=this.length),r||(r=0);var o=n-e;if(t===this&&e<r&&r<n)for(i=o-1;i>=0;i--)t[i+r]=this[i+e];else for(i=0;i<o;i++)t[i+r]=this[i+e];return o}e.copy=o,e.toString=i,e.write=n},{}],4:[function(t,r,e){function n(t){return new Array(t)}function i(t){if(!o.isBuffer(t)&&o.isView(t))t=o.Uint8Array.from(t);else if(o.isArrayBuffer(t))t=new Uint8Array(t);else{if("string"==typeof t)return o.from.call(e,t);if("number"==typeof t)throw new TypeError('"value" argument must not be a number')}return Array.prototype.slice.call(t)}var o=t("./bufferish"),e=r.exports=n(0);e.alloc=n,e.concat=o.concat,e.from=i},{"./bufferish":8}],5:[function(t,r,e){function n(t){return new Buffer(t)}function i(t){if(!o.isBuffer(t)&&o.isView(t))t=o.Uint8Array.from(t);else if(o.isArrayBuffer(t))t=new Uint8Array(t);else{if("string"==typeof t)return o.from.call(e,t);if("number"==typeof t)throw new TypeError('"value" argument must not be a number')}return Buffer.from&&1!==Buffer.from.length?Buffer.from(t):new Buffer(t)}var o=t("./bufferish"),Buffer=o.global,e=r.exports=o.hasBuffer?n(0):[];e.alloc=o.hasBuffer&&Buffer.alloc||n,e.concat=o.concat,e.from=i},{"./bufferish":8}],6:[function(t,r,e){function n(t,r,e,n){var o=a.isBuffer(this),f=a.isBuffer(t);if(o&&f)return this.copy(t,r,e,n);if(c||o||f||!a.isView(this)||!a.isView(t))return u.copy.call(this,t,r,e,n);var s=e||null!=n?i.call(this,e,n):this;return t.set(s,r),s.length}function i(t,r){var e=this.slice||!c&&this.subarray;if(e)return e.call(this,t,r);var i=a.alloc.call(this,r-t);return n.call(this,i,0,t,r),i}function o(t,r,e){var n=!s&&a.isBuffer(this)?this.toString:u.toString;return n.apply(this,arguments)}function f(t){function r(){var r=this[t]||u[t];return r.apply(this,arguments)}return r}var u=t("./buffer-lite");e.copy=n,e.slice=i,e.toString=o,e.write=f("write");var a=t("./bufferish"),Buffer=a.global,s=a.hasBuffer&&"TYPED_ARRAY_SUPPORT"in Buffer,c=s&&!Buffer.TYPED_ARRAY_SUPPORT},{"./buffer-lite":3,"./bufferish":8}],7:[function(t,r,e){function n(t){return new Uint8Array(t)}function i(t){if(o.isView(t)){var r=t.byteOffset,n=t.byteLength;t=t.buffer,t.byteLength!==n&&(t.slice?t=t.slice(r,r+n):(t=new Uint8Array(t),t.byteLength!==n&&(t=Array.prototype.slice.call(t,r,r+n))))}else{if("string"==typeof t)return o.from.call(e,t);if("number"==typeof t)throw new TypeError('"value" argument must not be a number')}return new Uint8Array(t)}var o=t("./bufferish"),e=r.exports=o.hasArrayBuffer?n(0):[];e.alloc=n,e.concat=o.concat,e.from=i},{"./bufferish":8}],8:[function(t,r,e){function n(t){return"string"==typeof t?u.call(this,t):a(this).from(t)}function i(t){return a(this).alloc(t)}function o(t,r){function n(t){r+=t.length}function o(t){a+=w.copy.call(t,u,a)}r||(r=0,Array.prototype.forEach.call(t,n));var f=this!==e&&this||t[0],u=i.call(f,r),a=0;return Array.prototype.forEach.call(t,o),u}function f(t){return t instanceof ArrayBuffer||E(t)}function u(t){var r=3*t.length,e=i.call(this,r),n=w.write.call(e,t);return r!==n&&(e=w.slice.call(e,0,n)),e}function a(t){return d(t)?g:y(t)?b:p(t)?v:h?g:l?b:v}function s(){return!1}function c(t,r){return t="[object "+t+"]",function(e){return null!=e&&{}.toString.call(r?e[r]:e)===t}}var Buffer=e.global=t("./buffer-global"),h=e.hasBuffer=Buffer&&!!Buffer.isBuffer,l=e.hasArrayBuffer="undefined"!=typeof ArrayBuffer,p=e.isArray=t("isarray");e.isArrayBuffer=l?f:s;var d=e.isBuffer=h?Buffer.isBuffer:s,y=e.isView=l?ArrayBuffer.isView||c("ArrayBuffer","buffer"):s;e.alloc=i,e.concat=o,e.from=n;var v=e.Array=t("./bufferish-array"),g=e.Buffer=t("./bufferish-buffer"),b=e.Uint8Array=t("./bufferish-uint8array"),w=e.prototype=t("./bufferish-proto"),E=c("ArrayBuffer")},{"./buffer-global":2,"./bufferish-array":4,"./bufferish-buffer":5,"./bufferish-proto":6,"./bufferish-uint8array":7,isarray:34}],9:[function(t,r,e){function n(t){return this instanceof n?(this.options=t,void this.init()):new n(t)}function i(t){for(var r in t)n.prototype[r]=o(n.prototype[r],t[r])}function o(t,r){function e(){return t.apply(this,arguments),r.apply(this,arguments)}return t&&r?e:t||r}function f(t){function r(t,r){return r(t)}return t=t.slice(),function(e){return t.reduce(r,e)}}function u(t){return s(t)?f(t):t}function a(t){return new n(t)}var s=t("isarray");e.createCodec=a,e.install=i,e.filter=u;var c=t("./bufferish");n.prototype.init=function(){var t=this.options;return t&&t.uint8array&&(this.bufferish=c.Uint8Array),this},e.preset=a({preset:!0})},{"./bufferish":8,isarray:34}],10:[function(t,r,e){t("./read-core"),t("./write-core"),e.codec={preset:t("./codec-base").preset}},{"./codec-base":9,"./read-core":22,"./write-core":25}],11:[function(t,r,e){function n(t){if(!(this instanceof n))return new n(t);if(t&&(this.options=t,t.codec)){var r=this.codec=t.codec;r.bufferish&&(this.bufferish=r.bufferish)}}e.DecodeBuffer=n;var i=t("./read-core").preset,o=t("./flex-buffer").FlexDecoder;o.mixin(n.prototype),n.prototype.codec=i,n.prototype.fetch=function(){return this.codec.decode(this)}},{"./flex-buffer":21,"./read-core":22}],12:[function(t,r,e){function n(t,r){var e=new i(r);return e.write(t),e.read()}e.decode=n;var i=t("./decode-buffer").DecodeBuffer},{"./decode-buffer":11}],13:[function(t,r,e){function n(t){return this instanceof n?void o.call(this,t):new n(t)}e.Decoder=n;var i=t("event-lite"),o=t("./decode-buffer").DecodeBuffer;n.prototype=new o,i.mixin(n.prototype),n.prototype.decode=function(t){arguments.length&&this.write(t),this.flush()},n.prototype.push=function(t){this.emit("data",t)},n.prototype.end=function(t){this.decode(t),this.emit("end")}},{"./decode-buffer":11,"event-lite":31}],14:[function(t,r,e){function n(t){if(!(this instanceof n))return new n(t);if(t&&(this.options=t,t.codec)){var r=this.codec=t.codec;r.bufferish&&(this.bufferish=r.bufferish)}}e.EncodeBuffer=n;var i=t("./write-core").preset,o=t("./flex-buffer").FlexEncoder;o.mixin(n.prototype),n.prototype.codec=i,n.prototype.write=function(t){this.codec.encode(this,t)}},{"./flex-buffer":21,"./write-core":25}],15:[function(t,r,e){function n(t,r){var e=new i(r);return e.write(t),e.read()}e.encode=n;var i=t("./encode-buffer").EncodeBuffer},{"./encode-buffer":14}],16:[function(t,r,e){function n(t){return this instanceof n?void o.call(this,t):new n(t)}e.Encoder=n;var i=t("event-lite"),o=t("./encode-buffer").EncodeBuffer;n.prototype=new o,i.mixin(n.prototype),n.prototype.encode=function(t){this.write(t),this.emit("data",this.read())},n.prototype.end=function(t){arguments.length&&this.encode(t),this.flush(),this.emit("end")}},{"./encode-buffer":14,"event-lite":31}],17:[function(t,r,e){function n(t,r){return this instanceof n?(this.buffer=i.from(t),void(this.type=r)):new n(t,r)}e.ExtBuffer=n;var i=t("./bufferish")},{"./bufferish":8}],18:[function(t,r,e){function n(t){t.addExtPacker(14,Error,[u,i]),t.addExtPacker(1,EvalError,[u,i]),t.addExtPacker(2,RangeError,[u,i]),t.addExtPacker(3,ReferenceError,[u,i]),t.addExtPacker(4,SyntaxError,[u,i]),t.addExtPacker(5,TypeError,[u,i]),t.addExtPacker(6,URIError,[u,i]),t.addExtPacker(10,RegExp,[f,i]),t.addExtPacker(11,Boolean,[o,i]),t.addExtPacker(12,String,[o,i]),t.addExtPacker(13,Date,[Number,i]),t.addExtPacker(15,Number,[o,i]),"undefined"!=typeof Uint8Array&&(t.addExtPacker(17,Int8Array,c),t.addExtPacker(18,Uint8Array,c),t.addExtPacker(19,Int16Array,c),t.addExtPacker(20,Uint16Array,c),t.addExtPacker(21,Int32Array,c),t.addExtPacker(22,Uint32Array,c),t.addExtPacker(23,Float32Array,c),"undefined"!=typeof Float64Array&&t.addExtPacker(24,Float64Array,c),"undefined"!=typeof Uint8ClampedArray&&t.addExtPacker(25,Uint8ClampedArray,c),t.addExtPacker(26,ArrayBuffer,c),t.addExtPacker(29,DataView,c)),s.hasBuffer&&t.addExtPacker(27,Buffer,s.from)}function i(r){return a||(a=t("./encode").encode),a(r)}function o(t){return t.valueOf()}function f(t){t=RegExp.prototype.toString.call(t).split("/"),t.shift();var r=[t.pop()];return r.unshift(t.join("/")),r}function u(t){var r={};for(var e in h)r[e]=t[e];return r}e.setExtPackers=n;var a,s=t("./bufferish"),Buffer=s.global,c=s.Uint8Array.from,h={name:1,message:1,stack:1,columnNumber:1,fileName:1,lineNumber:1}},{"./bufferish":8,"./encode":15}],19:[function(t,r,e){function n(t){t.addExtUnpacker(14,[i,f(Error)]),t.addExtUnpacker(1,[i,f(EvalError)]),t.addExtUnpacker(2,[i,f(RangeError)]),t.addExtUnpacker(3,[i,f(ReferenceError)]),t.addExtUnpacker(4,[i,f(SyntaxError)]),t.addExtUnpacker(5,[i,f(TypeError)]),t.addExtUnpacker(6,[i,f(URIError)]),t.addExtUnpacker(10,[i,o]),t.addExtUnpacker(11,[i,u(Boolean)]),t.addExtUnpacker(12,[i,u(String)]),t.addExtUnpacker(13,[i,u(Date)]),t.addExtUnpacker(15,[i,u(Number)]),"undefined"!=typeof Uint8Array&&(t.addExtUnpacker(17,u(Int8Array)),t.addExtUnpacker(18,u(Uint8Array)),t.addExtUnpacker(19,[a,u(Int16Array)]),t.addExtUnpacker(20,[a,u(Uint16Array)]),t.addExtUnpacker(21,[a,u(Int32Array)]),t.addExtUnpacker(22,[a,u(Uint32Array)]),t.addExtUnpacker(23,[a,u(Float32Array)]),"undefined"!=typeof Float64Array&&t.addExtUnpacker(24,[a,u(Float64Array)]),"undefined"!=typeof Uint8ClampedArray&&t.addExtUnpacker(25,u(Uint8ClampedArray)),t.addExtUnpacker(26,a),t.addExtUnpacker(29,[a,u(DataView)])),c.hasBuffer&&t.addExtUnpacker(27,u(Buffer))}function i(r){return s||(s=t("./decode").decode),s(r)}function o(t){return RegExp.apply(null,t)}function f(t){return function(r){var e=new t;for(var n in h)e[n]=r[n];return e}}function u(t){return function(r){return new t(r)}}function a(t){return new Uint8Array(t).buffer}e.setExtUnpackers=n;var s,c=t("./bufferish"),Buffer=c.global,h={name:1,message:1,stack:1,columnNumber:1,fileName:1,lineNumber:1}},{"./bufferish":8,"./decode":12}],20:[function(t,r,e){t("./read-core"),t("./write-core"),e.createCodec=t("./codec-base").createCodec},{"./codec-base":9,"./read-core":22,"./write-core":25}],21:[function(t,r,e){function n(){if(!(this instanceof n))return new n}function i(){if(!(this instanceof i))return new i}function o(){function t(t){var r=this.offset?p.prototype.slice.call(this.buffer,this.offset):this.buffer;this.buffer=r?t?this.bufferish.concat([r,t]):r:t,this.offset=0}function r(){for(;this.offset<this.buffer.length;){var t,r=this.offset;try{t=this.fetch()}catch(t){if(t&&t.message!=v)throw t;this.offset=r;break}this.push(t)}}function e(t){var r=this.offset,e=r+t;if(e>this.buffer.length)throw new Error(v);return this.offset=e,r}return{bufferish:p,write:t,fetch:a,flush:r,push:c,pull:h,read:s,reserve:e,offset:0}}function f(){function t(){var t=this.start;if(t<this.offset){var r=this.start=this.offset;return p.prototype.slice.call(this.buffer,t,r)}}function r(){for(;this.start<this.offset;){var t=this.fetch();t&&this.push(t)}}function e(){var t=this.buffers||(this.buffers=[]),r=t.length>1?this.bufferish.concat(t):t[0];return t.length=0,r}function n(t){var r=0|t;if(this.buffer){var e=this.buffer.length,n=0|this.offset,i=n+r;if(i<e)return this.offset=i,n;this.flush(),t=Math.max(t,Math.min(2*e,this.maxBufferSize))}return t=Math.max(t,this.minBufferSize),this.buffer=this.bufferish.alloc(t),this.start=0,this.offset=r,0}function i(t){var r=t.length;if(r>this.minBufferSize)this.flush(),this.push(t);else{var e=this.reserve(r);p.prototype.copy.call(t,this.buffer,e)}}return{bufferish:p,write:u,fetch:t,flush:r,push:c,pull:e,read:s,reserve:n,send:i,maxBufferSize:y,minBufferSize:d,offset:0,start:0}}function u(){throw new Error("method not implemented: write()")}function a(){throw new Error("method not implemented: fetch()")}function s(){var t=this.buffers&&this.buffers.length;return t?(this.flush(),this.pull()):this.fetch()}function c(t){var r=this.buffers||(this.buffers=[]);r.push(t)}function h(){var t=this.buffers||(this.buffers=[]);return t.shift()}function l(t){function r(r){for(var e in t)r[e]=t[e];return r}return r}e.FlexDecoder=n,e.FlexEncoder=i;var p=t("./bufferish"),d=2048,y=65536,v="BUFFER_SHORTAGE";n.mixin=l(o()),n.mixin(n.prototype),i.mixin=l(f()),i.mixin(i.prototype)},{"./bufferish":8}],22:[function(t,r,e){function n(t){function r(t){var r=s(t),n=e[r];if(!n)throw new Error("Invalid type: "+(r?"0x"+r.toString(16):r));return n(t)}var e=c.getReadToken(t);return r}function i(){var t=this.options;return this.decode=n(t),t&&t.preset&&a.setExtUnpackers(this),this}function o(t,r){var e=this.extUnpackers||(this.extUnpackers=[]);e[t]=h.filter(r)}function f(t){function r(r){return new u(r,t)}var e=this.extUnpackers||(this.extUnpackers=[]);return e[t]||r}var u=t("./ext-buffer").ExtBuffer,a=t("./ext-unpacker"),s=t("./read-format").readUint8,c=t("./read-token"),h=t("./codec-base");h.install({addExtUnpacker:o,getExtUnpacker:f,init:i}),e.preset=i.call(h.preset)},{"./codec-base":9,"./ext-buffer":17,"./ext-unpacker":19,"./read-format":23,"./read-token":24}],23:[function(t,r,e){function n(t){var r=k.hasArrayBuffer&&t&&t.binarraybuffer,e=t&&t.int64,n=T&&t&&t.usemap,B={map:n?o:i,array:f,str:u,bin:r?s:a,ext:c,uint8:h,uint16:p,uint32:y,uint64:g(8,e?E:b),int8:l,int16:d,int32:v,int64:g(8,e?A:w),float32:g(4,m),float64:g(8,x)};return B}function i(t,r){var e,n={},i=new Array(r),o=new Array(r),f=t.codec.decode;for(e=0;e<r;e++)i[e]=f(t),o[e]=f(t);for(e=0;e<r;e++)n[i[e]]=o[e];return n}function o(t,r){var e,n=new Map,i=new Array(r),o=new Array(r),f=t.codec.decode;for(e=0;e<r;e++)i[e]=f(t),o[e]=f(t);for(e=0;e<r;e++)n.set(i[e],o[e]);return n}function f(t,r){for(var e=new Array(r),n=t.codec.decode,i=0;i<r;i++)e[i]=n(t);return e}function u(t,r){var e=t.reserve(r),n=e+r;return _.toString.call(t.buffer,"utf-8",e,n)}function a(t,r){var e=t.reserve(r),n=e+r,i=_.slice.call(t.buffer,e,n);return k.from(i)}function s(t,r){var e=t.reserve(r),n=e+r,i=_.slice.call(t.buffer,e,n);return k.Uint8Array.from(i).buffer}function c(t,r){var e=t.reserve(r+1),n=t.buffer[e++],i=e+r,o=t.codec.getExtUnpacker(n);if(!o)throw new Error("Invalid ext type: "+(n?"0x"+n.toString(16):n));var f=_.slice.call(t.buffer,e,i);return o(f)}function h(t){var r=t.reserve(1);return t.buffer[r]}function l(t){var r=t.reserve(1),e=t.buffer[r];return 128&e?e-256:e}function p(t){var r=t.reserve(2),e=t.buffer;return e[r++]<<8|e[r]}function d(t){var r=t.reserve(2),e=t.buffer,n=e[r++]<<8|e[r];return 32768&n?n-65536:n}function y(t){var r=t.reserve(4),e=t.buffer;return 16777216*e[r++]+(e[r++]<<16)+(e[r++]<<8)+e[r]}function v(t){var r=t.reserve(4),e=t.buffer;return e[r++]<<24|e[r++]<<16|e[r++]<<8|e[r]}function g(t,r){return function(e){var n=e.reserve(t);return r.call(e.buffer,n,S)}}function b(t){return new P(this,t).toNumber()}function w(t){return new R(this,t).toNumber()}function E(t){return new P(this,t)}function A(t){return new R(this,t)}function m(t){return B.read(this,t,!1,23,4)}function x(t){return B.read(this,t,!1,52,8)}var B=t("ieee754"),U=t("int64-buffer"),P=U.Uint64BE,R=U.Int64BE;e.getReadFormat=n,e.readUint8=h;var k=t("./bufferish"),_=t("./bufferish-proto"),T="undefined"!=typeof Map,S=!0},{"./bufferish":8,"./bufferish-proto":6,ieee754:32,"int64-buffer":33}],24:[function(t,r,e){function n(t){var r=s.getReadFormat(t);return t&&t.useraw?o(r):i(r)}function i(t){var r,e=new Array(256);for(r=0;r<=127;r++)e[r]=f(r);for(r=128;r<=143;r++)e[r]=a(r-128,t.map);for(r=144;r<=159;r++)e[r]=a(r-144,t.array);for(r=160;r<=191;r++)e[r]=a(r-160,t.str);for(e[192]=f(null),e[193]=null,e[194]=f(!1),e[195]=f(!0),e[196]=u(t.uint8,t.bin),e[197]=u(t.uint16,t.bin),e[198]=u(t.uint32,t.bin),e[199]=u(t.uint8,t.ext),e[200]=u(t.uint16,t.ext),e[201]=u(t.uint32,t.ext),e[202]=t.float32,e[203]=t.float64,e[204]=t.uint8,e[205]=t.uint16,e[206]=t.uint32,e[207]=t.uint64,e[208]=t.int8,e[209]=t.int16,e[210]=t.int32,e[211]=t.int64,e[212]=a(1,t.ext),e[213]=a(2,t.ext),e[214]=a(4,t.ext),e[215]=a(8,t.ext),e[216]=a(16,t.ext),e[217]=u(t.uint8,t.str),e[218]=u(t.uint16,t.str),e[219]=u(t.uint32,t.str),e[220]=u(t.uint16,t.array),e[221]=u(t.uint32,t.array),e[222]=u(t.uint16,t.map),e[223]=u(t.uint32,t.map),r=224;r<=255;r++)e[r]=f(r-256);return e}function o(t){var r,e=i(t).slice();for(e[217]=e[196],e[218]=e[197],e[219]=e[198],r=160;r<=191;r++)e[r]=a(r-160,t.bin);return e}function f(t){return function(){return t}}function u(t,r){return function(e){var n=t(e);return r(e,n)}}function a(t,r){return function(e){return r(e,t)}}var s=t("./read-format");e.getReadToken=n},{"./read-format":23}],25:[function(t,r,e){function n(t){function r(t,r){var n=e[typeof r];if(!n)throw new Error('Unsupported type "'+typeof r+'": '+r);n(t,r)}var e=s.getWriteType(t);return r}function i(){var t=this.options;return this.encode=n(t),t&&t.preset&&a.setExtPackers(this),this}function o(t,r,e){function n(r){return e&&(r=e(r)),new u(r,t)}e=c.filter(e);var i=r.name;if(i&&"Object"!==i){var o=this.extPackers||(this.extPackers={});o[i]=n}else{var f=this.extEncoderList||(this.extEncoderList=[]);f.unshift([r,n])}}function f(t){var r=this.extPackers||(this.extPackers={}),e=t.constructor,n=e&&e.name&&r[e.name];if(n)return n;for(var i=this.extEncoderList||(this.extEncoderList=[]),o=i.length,f=0;f<o;f++){var u=i[f];if(e===u[0])return u[1]}}var u=t("./ext-buffer").ExtBuffer,a=t("./ext-packer"),s=t("./write-type"),c=t("./codec-base");c.install({addExtPacker:o,getExtPacker:f,init:i}),e.preset=i.call(c.preset)},{"./codec-base":9,"./ext-buffer":17,"./ext-packer":18,"./write-type":27}],26:[function(t,r,e){function n(t){return t&&t.uint8array?i():m||E.hasBuffer&&t&&t.safe?f():o()}function i(){var t=o();return t[202]=c(202,4,p),t[203]=c(203,8,d),t}function o(){var t=w.slice();return t[196]=u(196),t[197]=a(197),t[198]=s(198),t[199]=u(199),t[200]=a(200),t[201]=s(201),t[202]=c(202,4,x.writeFloatBE||p,!0),t[203]=c(203,8,x.writeDoubleBE||d,!0),t[204]=u(204),t[205]=a(205),t[206]=s(206),t[207]=c(207,8,h),t[208]=u(208),t[209]=a(209),t[210]=s(210),t[211]=c(211,8,l),t[217]=u(217),t[218]=a(218),t[219]=s(219),t[220]=a(220),t[221]=s(221),t[222]=a(222),t[223]=s(223),t}function f(){var t=w.slice();return t[196]=c(196,1,Buffer.prototype.writeUInt8),t[197]=c(197,2,Buffer.prototype.writeUInt16BE),t[198]=c(198,4,Buffer.prototype.writeUInt32BE),t[199]=c(199,1,Buffer.prototype.writeUInt8),t[200]=c(200,2,Buffer.prototype.writeUInt16BE),t[201]=c(201,4,Buffer.prototype.writeUInt32BE),t[202]=c(202,4,Buffer.prototype.writeFloatBE),t[203]=c(203,8,Buffer.prototype.writeDoubleBE),t[204]=c(204,1,Buffer.prototype.writeUInt8),t[205]=c(205,2,Buffer.prototype.writeUInt16BE),t[206]=c(206,4,Buffer.prototype.writeUInt32BE),t[207]=c(207,8,h),t[208]=c(208,1,Buffer.prototype.writeInt8),t[209]=c(209,2,Buffer.prototype.writeInt16BE),t[210]=c(210,4,Buffer.prototype.writeInt32BE),t[211]=c(211,8,l),t[217]=c(217,1,Buffer.prototype.writeUInt8),t[218]=c(218,2,Buffer.prototype.writeUInt16BE),t[219]=c(219,4,Buffer.prototype.writeUInt32BE),t[220]=c(220,2,Buffer.prototype.writeUInt16BE),t[221]=c(221,4,Buffer.prototype.writeUInt32BE),t[222]=c(222,2,Buffer.prototype.writeUInt16BE),t[223]=c(223,4,Buffer.prototype.writeUInt32BE),t}function u(t){return function(r,e){var n=r.reserve(2),i=r.buffer;i[n++]=t,i[n]=e}}function a(t){return function(r,e){var n=r.reserve(3),i=r.buffer;i[n++]=t,i[n++]=e>>>8,i[n]=e}}function s(t){return function(r,e){var n=r.reserve(5),i=r.buffer;i[n++]=t,i[n++]=e>>>24,i[n++]=e>>>16,i[n++]=e>>>8,i[n]=e}}function c(t,r,e,n){return function(i,o){var f=i.reserve(r+1);i.buffer[f++]=t,e.call(i.buffer,o,f,n)}}function h(t,r){new g(this,r,t)}function l(t,r){new b(this,r,t)}function p(t,r){y.write(this,t,r,!1,23,4)}function d(t,r){y.write(this,t,r,!1,52,8)}var y=t("ieee754"),v=t("int64-buffer"),g=v.Uint64BE,b=v.Int64BE,w=t("./write-uint8").uint8,E=t("./bufferish"),Buffer=E.global,A=E.hasBuffer&&"TYPED_ARRAY_SUPPORT"in Buffer,m=A&&!Buffer.TYPED_ARRAY_SUPPORT,x=E.hasBuffer&&Buffer.prototype||{};e.getWriteToken=n},{"./bufferish":8,"./write-uint8":28,ieee754:32,"int64-buffer":33}],27:[function(t,r,e){function n(t){function r(t,r){var e=r?195:194;_[e](t,r)}function e(t,r){var e,n=0|r;return r!==n?(e=203,void _[e](t,r)):(e=-32<=n&&n<=127?255&n:0<=n?n<=255?204:n<=65535?205:206:-128<=n?208:-32768<=n?209:210,void _[e](t,n))}function n(t,r){var e=207;_[e](t,r.toArray())}function o(t,r){var e=211;_[e](t,r.toArray())}function v(t){return t<32?1:t<=255?2:t<=65535?3:5}function g(t){return t<32?1:t<=65535?3:5}function b(t){function r(r,e){var n=e.length,i=5+3*n;r.offset=r.reserve(i);var o=r.buffer,f=t(n),u=r.offset+f;n=s.write.call(o,e,u);var a=t(n);if(f!==a){var c=u+a-f,h=u+n;s.copy.call(o,o,c,u,h)}var l=1===a?160+n:a<=3?215+a:219;_[l](r,n),r.offset+=n}return r}function w(t,r){if(null===r)return A(t,r);if(I(r))return Y(t,r);if(i(r))return m(t,r);if(f.isUint64BE(r))return n(t,r);if(u.isInt64BE(r))return o(t,r);var e=t.codec.getExtPacker(r);return e&&(r=e(r)),r instanceof l?U(t,r):void D(t,r)}function E(t,r){return I(r)?k(t,r):void w(t,r)}function A(t,r){var e=192;_[e](t,r)}function m(t,r){var e=r.length,n=e<16?144+e:e<=65535?220:221;_[n](t,e);for(var i=t.codec.encode,o=0;o<e;o++)i(t,r[o])}function x(t,r){var e=r.length,n=e<255?196:e<=65535?197:198;_[n](t,e),t.send(r)}function B(t,r){x(t,new Uint8Array(r))}function U(t,r){var e=r.buffer,n=e.length,i=y[n]||(n<255?199:n<=65535?200:201);_[i](t,n),h[r.type](t),t.send(e)}function P(t,r){var e=Object.keys(r),n=e.length,i=n<16?128+n:n<=65535?222:223;_[i](t,n);var o=t.codec.encode;e.forEach(function(e){o(t,e),o(t,r[e])})}function R(t,r){if(!(r instanceof Map))return P(t,r);var e=r.size,n=e<16?128+e:e<=65535?222:223;_[n](t,e);var i=t.codec.encode;r.forEach(function(r,e,n){i(t,e),i(t,r)})}function k(t,r){var e=r.length,n=e<32?160+e:e<=65535?218:219;_[n](t,e),t.send(r)}var _=c.getWriteToken(t),T=t&&t.useraw,S=p&&t&&t.binarraybuffer,I=S?a.isArrayBuffer:a.isBuffer,Y=S?B:x,C=d&&t&&t.usemap,D=C?R:P,O={boolean:r,function:A,number:e,object:T?E:w,string:b(T?g:v),symbol:A,undefined:A};return O}var i=t("isarray"),o=t("int64-buffer"),f=o.Uint64BE,u=o.Int64BE,a=t("./bufferish"),s=t("./bufferish-proto"),c=t("./write-token"),h=t("./write-uint8").uint8,l=t("./ext-buffer").ExtBuffer,p="undefined"!=typeof Uint8Array,d="undefined"!=typeof Map,y=[];y[1]=212,y[2]=213,y[4]=214,y[8]=215,y[16]=216,e.getWriteType=n},{"./bufferish":8,"./bufferish-proto":6,"./ext-buffer":17,"./write-token":26,"./write-uint8":28,"int64-buffer":33,isarray:34}],28:[function(t,r,e){function n(t){return function(r){var e=r.reserve(1);r.buffer[e]=t}}for(var i=e.uint8=new Array(256),o=0;o<=255;o++)i[o]=n(o)},{}],29:[function(t,r,e){(function(r){"use strict";function n(){try{var t=new Uint8Array(1);return t.__proto__={__proto__:Uint8Array.prototype,foo:function(){return 42}},42===t.foo()&&"function"==typeof t.subarray&&0===t.subarray(1,1).byteLength}catch(t){return!1}}function i(){return Buffer.TYPED_ARRAY_SUPPORT?2147483647:1073741823}function o(t,r){if(i()<r)throw new RangeError("Invalid typed array length");return Buffer.TYPED_ARRAY_SUPPORT?(t=new Uint8Array(r),t.__proto__=Buffer.prototype):(null===t&&(t=new Buffer(r)),t.length=r),t}function Buffer(t,r,e){if(!(Buffer.TYPED_ARRAY_SUPPORT||this instanceof Buffer))return new Buffer(t,r,e);if("number"==typeof t){if("string"==typeof r)throw new Error("If encoding is specified then the first argument must be a string");return s(this,t)}return f(this,t,r,e)}function f(t,r,e,n){if("number"==typeof r)throw new TypeError('"value" argument must not be a number');return"undefined"!=typeof ArrayBuffer&&r instanceof ArrayBuffer?l(t,r,e,n):"string"==typeof r?c(t,r,e):p(t,r)}function u(t){if("number"!=typeof t)throw new TypeError('"size" argument must be a number');if(t<0)throw new RangeError('"size" argument must not be negative')}function a(t,r,e,n){return u(r),r<=0?o(t,r):void 0!==e?"string"==typeof n?o(t,r).fill(e,n):o(t,r).fill(e):o(t,r)}function s(t,r){if(u(r),t=o(t,r<0?0:0|d(r)),!Buffer.TYPED_ARRAY_SUPPORT)for(var e=0;e<r;++e)t[e]=0;return t}function c(t,r,e){if("string"==typeof e&&""!==e||(e="utf8"),!Buffer.isEncoding(e))throw new TypeError('"encoding" must be a valid string encoding');var n=0|v(r,e);t=o(t,n);var i=t.write(r,e);return i!==n&&(t=t.slice(0,i)),t}function h(t,r){var e=r.length<0?0:0|d(r.length);t=o(t,e);for(var n=0;n<e;n+=1)t[n]=255&r[n];return t}function l(t,r,e,n){if(r.byteLength,e<0||r.byteLength<e)throw new RangeError("'offset' is out of bounds");if(r.byteLength<e+(n||0))throw new RangeError("'length' is out of bounds");return r=void 0===e&&void 0===n?new Uint8Array(r):void 0===n?new Uint8Array(r,e):new Uint8Array(r,e,n),Buffer.TYPED_ARRAY_SUPPORT?(t=r,t.__proto__=Buffer.prototype):t=h(t,r),t}function p(t,r){if(Buffer.isBuffer(r)){var e=0|d(r.length);return t=o(t,e),0===t.length?t:(r.copy(t,0,0,e),t)}if(r){if("undefined"!=typeof ArrayBuffer&&r.buffer instanceof ArrayBuffer||"length"in r)return"number"!=typeof r.length||H(r.length)?o(t,0):h(t,r);if("Buffer"===r.type&&Q(r.data))return h(t,r.data)}throw new TypeError("First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.")}function d(t){if(t>=i())throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x"+i().toString(16)+" bytes");return 0|t}function y(t){return+t!=t&&(t=0),Buffer.alloc(+t)}function v(t,r){if(Buffer.isBuffer(t))return t.length;if("undefined"!=typeof ArrayBuffer&&"function"==typeof ArrayBuffer.isView&&(ArrayBuffer.isView(t)||t instanceof ArrayBuffer))return t.byteLength;"string"!=typeof t&&(t=""+t);var e=t.length;if(0===e)return 0;for(var n=!1;;)switch(r){case"ascii":case"latin1":case"binary":return e;case"utf8":case"utf-8":case void 0:return q(t).length;case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return 2*e;case"hex":return e>>>1;case"base64":return X(t).length;default:if(n)return q(t).length;r=(""+r).toLowerCase(),n=!0}}function g(t,r,e){var n=!1;if((void 0===r||r<0)&&(r=0),r>this.length)return"";if((void 0===e||e>this.length)&&(e=this.length),e<=0)return"";if(e>>>=0,r>>>=0,e<=r)return"";for(t||(t="utf8");;)switch(t){case"hex":return I(this,r,e);case"utf8":case"utf-8":return k(this,r,e);case"ascii":return T(this,r,e);case"latin1":case"binary":return S(this,r,e);case"base64":return R(this,r,e);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return Y(this,r,e);default:if(n)throw new TypeError("Unknown encoding: "+t);t=(t+"").toLowerCase(),n=!0}}function b(t,r,e){var n=t[r];t[r]=t[e],t[e]=n}function w(t,r,e,n,i){if(0===t.length)return-1;if("string"==typeof e?(n=e,e=0):e>2147483647?e=2147483647:e<-2147483648&&(e=-2147483648),e=+e,isNaN(e)&&(e=i?0:t.length-1),e<0&&(e=t.length+e),e>=t.length){if(i)return-1;e=t.length-1}else if(e<0){if(!i)return-1;e=0}if("string"==typeof r&&(r=Buffer.from(r,n)),Buffer.isBuffer(r))return 0===r.length?-1:E(t,r,e,n,i);if("number"==typeof r)return r=255&r,Buffer.TYPED_ARRAY_SUPPORT&&"function"==typeof Uint8Array.prototype.indexOf?i?Uint8Array.prototype.indexOf.call(t,r,e):Uint8Array.prototype.lastIndexOf.call(t,r,e):E(t,[r],e,n,i);throw new TypeError("val must be string, number or Buffer")}function E(t,r,e,n,i){function o(t,r){return 1===f?t[r]:t.readUInt16BE(r*f)}var f=1,u=t.length,a=r.length;if(void 0!==n&&(n=String(n).toLowerCase(),"ucs2"===n||"ucs-2"===n||"utf16le"===n||"utf-16le"===n)){if(t.length<2||r.length<2)return-1;f=2,u/=2,a/=2,e/=2}var s;if(i){var c=-1;for(s=e;s<u;s++)if(o(t,s)===o(r,c===-1?0:s-c)){if(c===-1&&(c=s),s-c+1===a)return c*f}else c!==-1&&(s-=s-c),c=-1}else for(e+a>u&&(e=u-a),s=e;s>=0;s--){for(var h=!0,l=0;l<a;l++)if(o(t,s+l)!==o(r,l)){h=!1;break}if(h)return s}return-1}function A(t,r,e,n){e=Number(e)||0;var i=t.length-e;n?(n=Number(n),n>i&&(n=i)):n=i;var o=r.length;if(o%2!==0)throw new TypeError("Invalid hex string");n>o/2&&(n=o/2);for(var f=0;f<n;++f){var u=parseInt(r.substr(2*f,2),16);if(isNaN(u))return f;t[e+f]=u}return f}function m(t,r,e,n){return G(q(r,t.length-e),t,e,n)}function x(t,r,e,n){return G(W(r),t,e,n)}function B(t,r,e,n){return x(t,r,e,n)}function U(t,r,e,n){return G(X(r),t,e,n)}function P(t,r,e,n){return G(J(r,t.length-e),t,e,n)}function R(t,r,e){return 0===r&&e===t.length?Z.fromByteArray(t):Z.fromByteArray(t.slice(r,e))}function k(t,r,e){e=Math.min(t.length,e);for(var n=[],i=r;i<e;){var o=t[i],f=null,u=o>239?4:o>223?3:o>191?2:1;if(i+u<=e){var a,s,c,h;switch(u){case 1:o<128&&(f=o);break;case 2:a=t[i+1],128===(192&a)&&(h=(31&o)<<6|63&a,h>127&&(f=h));break;case 3:a=t[i+1],s=t[i+2],128===(192&a)&&128===(192&s)&&(h=(15&o)<<12|(63&a)<<6|63&s,h>2047&&(h<55296||h>57343)&&(f=h));break;case 4:a=t[i+1],s=t[i+2],c=t[i+3],128===(192&a)&&128===(192&s)&&128===(192&c)&&(h=(15&o)<<18|(63&a)<<12|(63&s)<<6|63&c,h>65535&&h<1114112&&(f=h))}}null===f?(f=65533,u=1):f>65535&&(f-=65536,n.push(f>>>10&1023|55296),f=56320|1023&f),n.push(f),i+=u}return _(n)}function _(t){var r=t.length;if(r<=$)return String.fromCharCode.apply(String,t);for(var e="",n=0;n<r;)e+=String.fromCharCode.apply(String,t.slice(n,n+=$));return e}function T(t,r,e){var n="";e=Math.min(t.length,e);for(var i=r;i<e;++i)n+=String.fromCharCode(127&t[i]);return n}function S(t,r,e){var n="";e=Math.min(t.length,e);for(var i=r;i<e;++i)n+=String.fromCharCode(t[i]);return n}function I(t,r,e){var n=t.length;(!r||r<0)&&(r=0),(!e||e<0||e>n)&&(e=n);for(var i="",o=r;o<e;++o)i+=V(t[o]);return i}function Y(t,r,e){for(var n=t.slice(r,e),i="",o=0;o<n.length;o+=2)i+=String.fromCharCode(n[o]+256*n[o+1]);return i}function C(t,r,e){if(t%1!==0||t<0)throw new RangeError("offset is not uint");if(t+r>e)throw new RangeError("Trying to access beyond buffer length")}function D(t,r,e,n,i,o){if(!Buffer.isBuffer(t))throw new TypeError('"buffer" argument must be a Buffer instance');if(r>i||r<o)throw new RangeError('"value" argument is out of bounds');if(e+n>t.length)throw new RangeError("Index out of range")}function O(t,r,e,n){r<0&&(r=65535+r+1);for(var i=0,o=Math.min(t.length-e,2);i<o;++i)t[e+i]=(r&255<<8*(n?i:1-i))>>>8*(n?i:1-i)}function L(t,r,e,n){r<0&&(r=4294967295+r+1);for(var i=0,o=Math.min(t.length-e,4);i<o;++i)t[e+i]=r>>>8*(n?i:3-i)&255}function M(t,r,e,n,i,o){if(e+n>t.length)throw new RangeError("Index out of range");if(e<0)throw new RangeError("Index out of range")}function N(t,r,e,n,i){return i||M(t,r,e,4,3.4028234663852886e38,-3.4028234663852886e38),K.write(t,r,e,n,23,4),e+4}function F(t,r,e,n,i){return i||M(t,r,e,8,1.7976931348623157e308,-1.7976931348623157e308),K.write(t,r,e,n,52,8),e+8}function j(t){
if(t=z(t).replace(tt,""),t.length<2)return"";for(;t.length%4!==0;)t+="=";return t}function z(t){return t.trim?t.trim():t.replace(/^\s+|\s+$/g,"")}function V(t){return t<16?"0"+t.toString(16):t.toString(16)}function q(t,r){r=r||1/0;for(var e,n=t.length,i=null,o=[],f=0;f<n;++f){if(e=t.charCodeAt(f),e>55295&&e<57344){if(!i){if(e>56319){(r-=3)>-1&&o.push(239,191,189);continue}if(f+1===n){(r-=3)>-1&&o.push(239,191,189);continue}i=e;continue}if(e<56320){(r-=3)>-1&&o.push(239,191,189),i=e;continue}e=(i-55296<<10|e-56320)+65536}else i&&(r-=3)>-1&&o.push(239,191,189);if(i=null,e<128){if((r-=1)<0)break;o.push(e)}else if(e<2048){if((r-=2)<0)break;o.push(e>>6|192,63&e|128)}else if(e<65536){if((r-=3)<0)break;o.push(e>>12|224,e>>6&63|128,63&e|128)}else{if(!(e<1114112))throw new Error("Invalid code point");if((r-=4)<0)break;o.push(e>>18|240,e>>12&63|128,e>>6&63|128,63&e|128)}}return o}function W(t){for(var r=[],e=0;e<t.length;++e)r.push(255&t.charCodeAt(e));return r}function J(t,r){for(var e,n,i,o=[],f=0;f<t.length&&!((r-=2)<0);++f)e=t.charCodeAt(f),n=e>>8,i=e%256,o.push(i),o.push(n);return o}function X(t){return Z.toByteArray(j(t))}function G(t,r,e,n){for(var i=0;i<n&&!(i+e>=r.length||i>=t.length);++i)r[i+e]=t[i];return i}function H(t){return t!==t}var Z=t("base64-js"),K=t("ieee754"),Q=t("isarray");e.Buffer=Buffer,e.SlowBuffer=y,e.INSPECT_MAX_BYTES=50,Buffer.TYPED_ARRAY_SUPPORT=void 0!==r.TYPED_ARRAY_SUPPORT?r.TYPED_ARRAY_SUPPORT:n(),e.kMaxLength=i(),Buffer.poolSize=8192,Buffer._augment=function(t){return t.__proto__=Buffer.prototype,t},Buffer.from=function(t,r,e){return f(null,t,r,e)},Buffer.TYPED_ARRAY_SUPPORT&&(Buffer.prototype.__proto__=Uint8Array.prototype,Buffer.__proto__=Uint8Array,"undefined"!=typeof Symbol&&Symbol.species&&Buffer[Symbol.species]===Buffer&&Object.defineProperty(Buffer,Symbol.species,{value:null,configurable:!0})),Buffer.alloc=function(t,r,e){return a(null,t,r,e)},Buffer.allocUnsafe=function(t){return s(null,t)},Buffer.allocUnsafeSlow=function(t){return s(null,t)},Buffer.isBuffer=function(t){return!(null==t||!t._isBuffer)},Buffer.compare=function(t,r){if(!Buffer.isBuffer(t)||!Buffer.isBuffer(r))throw new TypeError("Arguments must be Buffers");if(t===r)return 0;for(var e=t.length,n=r.length,i=0,o=Math.min(e,n);i<o;++i)if(t[i]!==r[i]){e=t[i],n=r[i];break}return e<n?-1:n<e?1:0},Buffer.isEncoding=function(t){switch(String(t).toLowerCase()){case"hex":case"utf8":case"utf-8":case"ascii":case"latin1":case"binary":case"base64":case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return!0;default:return!1}},Buffer.concat=function(t,r){if(!Q(t))throw new TypeError('"list" argument must be an Array of Buffers');if(0===t.length)return Buffer.alloc(0);var e;if(void 0===r)for(r=0,e=0;e<t.length;++e)r+=t[e].length;var n=Buffer.allocUnsafe(r),i=0;for(e=0;e<t.length;++e){var o=t[e];if(!Buffer.isBuffer(o))throw new TypeError('"list" argument must be an Array of Buffers');o.copy(n,i),i+=o.length}return n},Buffer.byteLength=v,Buffer.prototype._isBuffer=!0,Buffer.prototype.swap16=function(){var t=this.length;if(t%2!==0)throw new RangeError("Buffer size must be a multiple of 16-bits");for(var r=0;r<t;r+=2)b(this,r,r+1);return this},Buffer.prototype.swap32=function(){var t=this.length;if(t%4!==0)throw new RangeError("Buffer size must be a multiple of 32-bits");for(var r=0;r<t;r+=4)b(this,r,r+3),b(this,r+1,r+2);return this},Buffer.prototype.swap64=function(){var t=this.length;if(t%8!==0)throw new RangeError("Buffer size must be a multiple of 64-bits");for(var r=0;r<t;r+=8)b(this,r,r+7),b(this,r+1,r+6),b(this,r+2,r+5),b(this,r+3,r+4);return this},Buffer.prototype.toString=function(){var t=0|this.length;return 0===t?"":0===arguments.length?k(this,0,t):g.apply(this,arguments)},Buffer.prototype.equals=function(t){if(!Buffer.isBuffer(t))throw new TypeError("Argument must be a Buffer");return this===t||0===Buffer.compare(this,t)},Buffer.prototype.inspect=function(){var t="",r=e.INSPECT_MAX_BYTES;return this.length>0&&(t=this.toString("hex",0,r).match(/.{2}/g).join(" "),this.length>r&&(t+=" ... ")),"<Buffer "+t+">"},Buffer.prototype.compare=function(t,r,e,n,i){if(!Buffer.isBuffer(t))throw new TypeError("Argument must be a Buffer");if(void 0===r&&(r=0),void 0===e&&(e=t?t.length:0),void 0===n&&(n=0),void 0===i&&(i=this.length),r<0||e>t.length||n<0||i>this.length)throw new RangeError("out of range index");if(n>=i&&r>=e)return 0;if(n>=i)return-1;if(r>=e)return 1;if(r>>>=0,e>>>=0,n>>>=0,i>>>=0,this===t)return 0;for(var o=i-n,f=e-r,u=Math.min(o,f),a=this.slice(n,i),s=t.slice(r,e),c=0;c<u;++c)if(a[c]!==s[c]){o=a[c],f=s[c];break}return o<f?-1:f<o?1:0},Buffer.prototype.includes=function(t,r,e){return this.indexOf(t,r,e)!==-1},Buffer.prototype.indexOf=function(t,r,e){return w(this,t,r,e,!0)},Buffer.prototype.lastIndexOf=function(t,r,e){return w(this,t,r,e,!1)},Buffer.prototype.write=function(t,r,e,n){if(void 0===r)n="utf8",e=this.length,r=0;else if(void 0===e&&"string"==typeof r)n=r,e=this.length,r=0;else{if(!isFinite(r))throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");r=0|r,isFinite(e)?(e=0|e,void 0===n&&(n="utf8")):(n=e,e=void 0)}var i=this.length-r;if((void 0===e||e>i)&&(e=i),t.length>0&&(e<0||r<0)||r>this.length)throw new RangeError("Attempt to write outside buffer bounds");n||(n="utf8");for(var o=!1;;)switch(n){case"hex":return A(this,t,r,e);case"utf8":case"utf-8":return m(this,t,r,e);case"ascii":return x(this,t,r,e);case"latin1":case"binary":return B(this,t,r,e);case"base64":return U(this,t,r,e);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return P(this,t,r,e);default:if(o)throw new TypeError("Unknown encoding: "+n);n=(""+n).toLowerCase(),o=!0}},Buffer.prototype.toJSON=function(){return{type:"Buffer",data:Array.prototype.slice.call(this._arr||this,0)}};var $=4096;Buffer.prototype.slice=function(t,r){var e=this.length;t=~~t,r=void 0===r?e:~~r,t<0?(t+=e,t<0&&(t=0)):t>e&&(t=e),r<0?(r+=e,r<0&&(r=0)):r>e&&(r=e),r<t&&(r=t);var n;if(Buffer.TYPED_ARRAY_SUPPORT)n=this.subarray(t,r),n.__proto__=Buffer.prototype;else{var i=r-t;n=new Buffer(i,void 0);for(var o=0;o<i;++o)n[o]=this[o+t]}return n},Buffer.prototype.readUIntLE=function(t,r,e){t=0|t,r=0|r,e||C(t,r,this.length);for(var n=this[t],i=1,o=0;++o<r&&(i*=256);)n+=this[t+o]*i;return n},Buffer.prototype.readUIntBE=function(t,r,e){t=0|t,r=0|r,e||C(t,r,this.length);for(var n=this[t+--r],i=1;r>0&&(i*=256);)n+=this[t+--r]*i;return n},Buffer.prototype.readUInt8=function(t,r){return r||C(t,1,this.length),this[t]},Buffer.prototype.readUInt16LE=function(t,r){return r||C(t,2,this.length),this[t]|this[t+1]<<8},Buffer.prototype.readUInt16BE=function(t,r){return r||C(t,2,this.length),this[t]<<8|this[t+1]},Buffer.prototype.readUInt32LE=function(t,r){return r||C(t,4,this.length),(this[t]|this[t+1]<<8|this[t+2]<<16)+16777216*this[t+3]},Buffer.prototype.readUInt32BE=function(t,r){return r||C(t,4,this.length),16777216*this[t]+(this[t+1]<<16|this[t+2]<<8|this[t+3])},Buffer.prototype.readIntLE=function(t,r,e){t=0|t,r=0|r,e||C(t,r,this.length);for(var n=this[t],i=1,o=0;++o<r&&(i*=256);)n+=this[t+o]*i;return i*=128,n>=i&&(n-=Math.pow(2,8*r)),n},Buffer.prototype.readIntBE=function(t,r,e){t=0|t,r=0|r,e||C(t,r,this.length);for(var n=r,i=1,o=this[t+--n];n>0&&(i*=256);)o+=this[t+--n]*i;return i*=128,o>=i&&(o-=Math.pow(2,8*r)),o},Buffer.prototype.readInt8=function(t,r){return r||C(t,1,this.length),128&this[t]?(255-this[t]+1)*-1:this[t]},Buffer.prototype.readInt16LE=function(t,r){r||C(t,2,this.length);var e=this[t]|this[t+1]<<8;return 32768&e?4294901760|e:e},Buffer.prototype.readInt16BE=function(t,r){r||C(t,2,this.length);var e=this[t+1]|this[t]<<8;return 32768&e?4294901760|e:e},Buffer.prototype.readInt32LE=function(t,r){return r||C(t,4,this.length),this[t]|this[t+1]<<8|this[t+2]<<16|this[t+3]<<24},Buffer.prototype.readInt32BE=function(t,r){return r||C(t,4,this.length),this[t]<<24|this[t+1]<<16|this[t+2]<<8|this[t+3]},Buffer.prototype.readFloatLE=function(t,r){return r||C(t,4,this.length),K.read(this,t,!0,23,4)},Buffer.prototype.readFloatBE=function(t,r){return r||C(t,4,this.length),K.read(this,t,!1,23,4)},Buffer.prototype.readDoubleLE=function(t,r){return r||C(t,8,this.length),K.read(this,t,!0,52,8)},Buffer.prototype.readDoubleBE=function(t,r){return r||C(t,8,this.length),K.read(this,t,!1,52,8)},Buffer.prototype.writeUIntLE=function(t,r,e,n){if(t=+t,r=0|r,e=0|e,!n){var i=Math.pow(2,8*e)-1;D(this,t,r,e,i,0)}var o=1,f=0;for(this[r]=255&t;++f<e&&(o*=256);)this[r+f]=t/o&255;return r+e},Buffer.prototype.writeUIntBE=function(t,r,e,n){if(t=+t,r=0|r,e=0|e,!n){var i=Math.pow(2,8*e)-1;D(this,t,r,e,i,0)}var o=e-1,f=1;for(this[r+o]=255&t;--o>=0&&(f*=256);)this[r+o]=t/f&255;return r+e},Buffer.prototype.writeUInt8=function(t,r,e){return t=+t,r=0|r,e||D(this,t,r,1,255,0),Buffer.TYPED_ARRAY_SUPPORT||(t=Math.floor(t)),this[r]=255&t,r+1},Buffer.prototype.writeUInt16LE=function(t,r,e){return t=+t,r=0|r,e||D(this,t,r,2,65535,0),Buffer.TYPED_ARRAY_SUPPORT?(this[r]=255&t,this[r+1]=t>>>8):O(this,t,r,!0),r+2},Buffer.prototype.writeUInt16BE=function(t,r,e){return t=+t,r=0|r,e||D(this,t,r,2,65535,0),Buffer.TYPED_ARRAY_SUPPORT?(this[r]=t>>>8,this[r+1]=255&t):O(this,t,r,!1),r+2},Buffer.prototype.writeUInt32LE=function(t,r,e){return t=+t,r=0|r,e||D(this,t,r,4,4294967295,0),Buffer.TYPED_ARRAY_SUPPORT?(this[r+3]=t>>>24,this[r+2]=t>>>16,this[r+1]=t>>>8,this[r]=255&t):L(this,t,r,!0),r+4},Buffer.prototype.writeUInt32BE=function(t,r,e){return t=+t,r=0|r,e||D(this,t,r,4,4294967295,0),Buffer.TYPED_ARRAY_SUPPORT?(this[r]=t>>>24,this[r+1]=t>>>16,this[r+2]=t>>>8,this[r+3]=255&t):L(this,t,r,!1),r+4},Buffer.prototype.writeIntLE=function(t,r,e,n){if(t=+t,r=0|r,!n){var i=Math.pow(2,8*e-1);D(this,t,r,e,i-1,-i)}var o=0,f=1,u=0;for(this[r]=255&t;++o<e&&(f*=256);)t<0&&0===u&&0!==this[r+o-1]&&(u=1),this[r+o]=(t/f>>0)-u&255;return r+e},Buffer.prototype.writeIntBE=function(t,r,e,n){if(t=+t,r=0|r,!n){var i=Math.pow(2,8*e-1);D(this,t,r,e,i-1,-i)}var o=e-1,f=1,u=0;for(this[r+o]=255&t;--o>=0&&(f*=256);)t<0&&0===u&&0!==this[r+o+1]&&(u=1),this[r+o]=(t/f>>0)-u&255;return r+e},Buffer.prototype.writeInt8=function(t,r,e){return t=+t,r=0|r,e||D(this,t,r,1,127,-128),Buffer.TYPED_ARRAY_SUPPORT||(t=Math.floor(t)),t<0&&(t=255+t+1),this[r]=255&t,r+1},Buffer.prototype.writeInt16LE=function(t,r,e){return t=+t,r=0|r,e||D(this,t,r,2,32767,-32768),Buffer.TYPED_ARRAY_SUPPORT?(this[r]=255&t,this[r+1]=t>>>8):O(this,t,r,!0),r+2},Buffer.prototype.writeInt16BE=function(t,r,e){return t=+t,r=0|r,e||D(this,t,r,2,32767,-32768),Buffer.TYPED_ARRAY_SUPPORT?(this[r]=t>>>8,this[r+1]=255&t):O(this,t,r,!1),r+2},Buffer.prototype.writeInt32LE=function(t,r,e){return t=+t,r=0|r,e||D(this,t,r,4,2147483647,-2147483648),Buffer.TYPED_ARRAY_SUPPORT?(this[r]=255&t,this[r+1]=t>>>8,this[r+2]=t>>>16,this[r+3]=t>>>24):L(this,t,r,!0),r+4},Buffer.prototype.writeInt32BE=function(t,r,e){return t=+t,r=0|r,e||D(this,t,r,4,2147483647,-2147483648),t<0&&(t=4294967295+t+1),Buffer.TYPED_ARRAY_SUPPORT?(this[r]=t>>>24,this[r+1]=t>>>16,this[r+2]=t>>>8,this[r+3]=255&t):L(this,t,r,!1),r+4},Buffer.prototype.writeFloatLE=function(t,r,e){return N(this,t,r,!0,e)},Buffer.prototype.writeFloatBE=function(t,r,e){return N(this,t,r,!1,e)},Buffer.prototype.writeDoubleLE=function(t,r,e){return F(this,t,r,!0,e)},Buffer.prototype.writeDoubleBE=function(t,r,e){return F(this,t,r,!1,e)},Buffer.prototype.copy=function(t,r,e,n){if(e||(e=0),n||0===n||(n=this.length),r>=t.length&&(r=t.length),r||(r=0),n>0&&n<e&&(n=e),n===e)return 0;if(0===t.length||0===this.length)return 0;if(r<0)throw new RangeError("targetStart out of bounds");if(e<0||e>=this.length)throw new RangeError("sourceStart out of bounds");if(n<0)throw new RangeError("sourceEnd out of bounds");n>this.length&&(n=this.length),t.length-r<n-e&&(n=t.length-r+e);var i,o=n-e;if(this===t&&e<r&&r<n)for(i=o-1;i>=0;--i)t[i+r]=this[i+e];else if(o<1e3||!Buffer.TYPED_ARRAY_SUPPORT)for(i=0;i<o;++i)t[i+r]=this[i+e];else Uint8Array.prototype.set.call(t,this.subarray(e,e+o),r);return o},Buffer.prototype.fill=function(t,r,e,n){if("string"==typeof t){if("string"==typeof r?(n=r,r=0,e=this.length):"string"==typeof e&&(n=e,e=this.length),1===t.length){var i=t.charCodeAt(0);i<256&&(t=i)}if(void 0!==n&&"string"!=typeof n)throw new TypeError("encoding must be a string");if("string"==typeof n&&!Buffer.isEncoding(n))throw new TypeError("Unknown encoding: "+n)}else"number"==typeof t&&(t=255&t);if(r<0||this.length<r||this.length<e)throw new RangeError("Out of range index");if(e<=r)return this;r>>>=0,e=void 0===e?this.length:e>>>0,t||(t=0);var o;if("number"==typeof t)for(o=r;o<e;++o)this[o]=t;else{var f=Buffer.isBuffer(t)?t:q(new Buffer(t,n).toString()),u=f.length;for(o=0;o<e-r;++o)this[o+r]=f[o%u]}return this};var tt=/[^+\/0-9A-Za-z-_]/g}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{"base64-js":30,ieee754:32,isarray:34}],30:[function(t,r,e){"use strict";function n(t){var r=t.length;if(r%4>0)throw new Error("Invalid string. Length must be a multiple of 4");return"="===t[r-2]?2:"="===t[r-1]?1:0}function i(t){return 3*t.length/4-n(t)}function o(t){var r,e,i,o,f,u,a=t.length;f=n(t),u=new h(3*a/4-f),i=f>0?a-4:a;var s=0;for(r=0,e=0;r<i;r+=4,e+=3)o=c[t.charCodeAt(r)]<<18|c[t.charCodeAt(r+1)]<<12|c[t.charCodeAt(r+2)]<<6|c[t.charCodeAt(r+3)],u[s++]=o>>16&255,u[s++]=o>>8&255,u[s++]=255&o;return 2===f?(o=c[t.charCodeAt(r)]<<2|c[t.charCodeAt(r+1)]>>4,u[s++]=255&o):1===f&&(o=c[t.charCodeAt(r)]<<10|c[t.charCodeAt(r+1)]<<4|c[t.charCodeAt(r+2)]>>2,u[s++]=o>>8&255,u[s++]=255&o),u}function f(t){return s[t>>18&63]+s[t>>12&63]+s[t>>6&63]+s[63&t]}function u(t,r,e){for(var n,i=[],o=r;o<e;o+=3)n=(t[o]<<16)+(t[o+1]<<8)+t[o+2],i.push(f(n));return i.join("")}function a(t){for(var r,e=t.length,n=e%3,i="",o=[],f=16383,a=0,c=e-n;a<c;a+=f)o.push(u(t,a,a+f>c?c:a+f));return 1===n?(r=t[e-1],i+=s[r>>2],i+=s[r<<4&63],i+="=="):2===n&&(r=(t[e-2]<<8)+t[e-1],i+=s[r>>10],i+=s[r>>4&63],i+=s[r<<2&63],i+="="),o.push(i),o.join("")}e.byteLength=i,e.toByteArray=o,e.fromByteArray=a;for(var s=[],c=[],h="undefined"!=typeof Uint8Array?Uint8Array:Array,l="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",p=0,d=l.length;p<d;++p)s[p]=l[p],c[l.charCodeAt(p)]=p;c["-".charCodeAt(0)]=62,c["_".charCodeAt(0)]=63},{}],31:[function(t,r,e){function n(){if(!(this instanceof n))return new n}!function(t){function e(t){for(var r in s)t[r]=s[r];return t}function n(t,r){return u(this,t).push(r),this}function i(t,r){function e(){o.call(n,t,e),r.apply(this,arguments)}var n=this;return e.originalListener=r,u(n,t).push(e),n}function o(t,r){function e(t){return t!==r&&t.originalListener!==r}var n,i=this;if(arguments.length){if(r){if(n=u(i,t,!0)){if(n=n.filter(e),!n.length)return o.call(i,t);i[a][t]=n}}else if(n=i[a],n&&(delete n[t],!Object.keys(n).length))return o.call(i)}else delete i[a];return i}function f(t,r){function e(t){t.call(o)}function n(t){t.call(o,r)}function i(t){t.apply(o,s)}var o=this,f=u(o,t,!0);if(!f)return!1;var a=arguments.length;if(1===a)f.forEach(e);else if(2===a)f.forEach(n);else{var s=Array.prototype.slice.call(arguments,1);f.forEach(i)}return!!f.length}function u(t,r,e){if(!e||t[a]){var n=t[a]||(t[a]={});return n[r]||(n[r]=[])}}"undefined"!=typeof r&&(r.exports=t);var a="listeners",s={on:n,once:i,off:o,emit:f};e(t.prototype),t.mixin=e}(n)},{}],32:[function(t,r,e){e.read=function(t,r,e,n,i){var o,f,u=8*i-n-1,a=(1<<u)-1,s=a>>1,c=-7,h=e?i-1:0,l=e?-1:1,p=t[r+h];for(h+=l,o=p&(1<<-c)-1,p>>=-c,c+=u;c>0;o=256*o+t[r+h],h+=l,c-=8);for(f=o&(1<<-c)-1,o>>=-c,c+=n;c>0;f=256*f+t[r+h],h+=l,c-=8);if(0===o)o=1-s;else{if(o===a)return f?NaN:(p?-1:1)*(1/0);f+=Math.pow(2,n),o-=s}return(p?-1:1)*f*Math.pow(2,o-n)},e.write=function(t,r,e,n,i,o){var f,u,a,s=8*o-i-1,c=(1<<s)-1,h=c>>1,l=23===i?Math.pow(2,-24)-Math.pow(2,-77):0,p=n?0:o-1,d=n?1:-1,y=r<0||0===r&&1/r<0?1:0;for(r=Math.abs(r),isNaN(r)||r===1/0?(u=isNaN(r)?1:0,f=c):(f=Math.floor(Math.log(r)/Math.LN2),r*(a=Math.pow(2,-f))<1&&(f--,a*=2),r+=f+h>=1?l/a:l*Math.pow(2,1-h),r*a>=2&&(f++,a/=2),f+h>=c?(u=0,f=c):f+h>=1?(u=(r*a-1)*Math.pow(2,i),f+=h):(u=r*Math.pow(2,h-1)*Math.pow(2,i),f=0));i>=8;t[e+p]=255&u,p+=d,u/=256,i-=8);for(f=f<<i|u,s+=i;s>0;t[e+p]=255&f,p+=d,f/=256,s-=8);t[e+p-d]|=128*y}},{}],33:[function(t,r,e){(function(Buffer){var t,r,n,i;!function(e){function o(t,r,n){function i(t,r,e,n){return this instanceof i?v(this,t,r,e,n):new i(t,r,e,n)}function o(t){return!(!t||!t[F])}function v(t,r,e,n,i){if(E&&A&&(r instanceof A&&(r=new E(r)),n instanceof A&&(n=new E(n))),!(r||e||n||g))return void(t.buffer=h(m,0));if(!s(r,e)){var o=g||Array;i=e,n=r,e=0,r=new o(8)}t.buffer=r,t.offset=e|=0,b!==typeof n&&("string"==typeof n?x(r,e,n,i||10):s(n,i)?c(r,e,n,i):"number"==typeof i?(k(r,e+T,n),k(r,e+S,i)):n>0?O(r,e,n):n<0?L(r,e,n):c(r,e,m,0))}function x(t,r,e,n){var i=0,o=e.length,f=0,u=0;"-"===e[0]&&i++;for(var a=i;i<o;){var s=parseInt(e[i++],n);if(!(s>=0))break;u=u*n+s,f=f*n+Math.floor(u/B),u%=B}a&&(f=~f,u?u=B-u:f++),k(t,r+T,f),k(t,r+S,u)}function P(){var t=this.buffer,r=this.offset,e=_(t,r+T),i=_(t,r+S);return n||(e|=0),e?e*B+i:i}function R(t){var r=this.buffer,e=this.offset,i=_(r,e+T),o=_(r,e+S),f="",u=!n&&2147483648&i;for(u&&(i=~i,o=B-o),t=t||10;;){var a=i%t*B+o;if(i=Math.floor(i/t),o=Math.floor(a/t),f=(a%t).toString(t)+f,!i&&!o)break}return u&&(f="-"+f),f}function k(t,r,e){t[r+D]=255&e,e>>=8,t[r+C]=255&e,e>>=8,t[r+Y]=255&e,e>>=8,t[r+I]=255&e}function _(t,r){return t[r+I]*U+(t[r+Y]<<16)+(t[r+C]<<8)+t[r+D]}var T=r?0:4,S=r?4:0,I=r?0:3,Y=r?1:2,C=r?2:1,D=r?3:0,O=r?l:d,L=r?p:y,M=i.prototype,N="is"+t,F="_"+N;return M.buffer=void 0,M.offset=0,M[F]=!0,M.toNumber=P,M.toString=R,M.toJSON=P,M.toArray=f,w&&(M.toBuffer=u),E&&(M.toArrayBuffer=a),i[N]=o,e[t]=i,i}function f(t){var r=this.buffer,e=this.offset;return g=null,t!==!1&&0===e&&8===r.length&&x(r)?r:h(r,e)}function u(t){var r=this.buffer,e=this.offset;if(g=w,t!==!1&&0===e&&8===r.length&&Buffer.isBuffer(r))return r;var n=new w(8);return c(n,0,r,e),n}function a(t){var r=this.buffer,e=this.offset,n=r.buffer;if(g=E,t!==!1&&0===e&&n instanceof A&&8===n.byteLength)return n;var i=new E(8);return c(i,0,r,e),i.buffer}function s(t,r){var e=t&&t.length;return r|=0,e&&r+8<=e&&"string"!=typeof t[r]}function c(t,r,e,n){r|=0,n|=0;for(var i=0;i<8;i++)t[r++]=255&e[n++]}function h(t,r){return Array.prototype.slice.call(t,r,r+8)}function l(t,r,e){for(var n=r+8;n>r;)t[--n]=255&e,e/=256}function p(t,r,e){var n=r+8;for(e++;n>r;)t[--n]=255&-e^255,e/=256}function d(t,r,e){for(var n=r+8;r<n;)t[r++]=255&e,e/=256}function y(t,r,e){var n=r+8;for(e++;r<n;)t[r++]=255&-e^255,e/=256}function v(t){return!!t&&"[object Array]"==Object.prototype.toString.call(t)}var g,b="undefined",w=b!==typeof Buffer&&Buffer,E=b!==typeof Uint8Array&&Uint8Array,A=b!==typeof ArrayBuffer&&ArrayBuffer,m=[0,0,0,0,0,0,0,0],x=Array.isArray||v,B=4294967296,U=16777216;t=o("Uint64BE",!0,!0),r=o("Int64BE",!0,!1),n=o("Uint64LE",!1,!0),i=o("Int64LE",!1,!1)}("object"==typeof e&&"string"!=typeof e.nodeName?e:this||{})}).call(this,t("buffer").Buffer)},{buffer:29}],34:[function(t,r,e){var n={}.toString;r.exports=Array.isArray||function(t){return"[object Array]"==n.call(t)}},{}]},{},[1])(1)});







//
// TODO: move paginated_collection to a plugin







function bin2String(array) {
  var result = [];
  for (var i = 0; i < array.length; i++) {
    if (array[i] >= 48 && array[i] <= 57) {
        result.push(String.fromCharCode(array[i]));
    } else if (array[i] >= 65 && array[i] <= 90) {
        result.push(String.fromCharCode(array[i]));
    } else if (array[i] >= 97 && array[i] <= 122) {
        result.push(String.fromCharCode(array[i]));
    } else if (array[i] == 32 || array[i] == 45 || array[i] == 46 || array[i] == 95 || array[i] == 126) {
        result.push(String.fromCharCode(array[i]));
    } else {
        result.push('%' + ('00' + (array[i]).toString(16)).slice(-2).toUpperCase());
    }
  }

  return result.join("");
}

var MsgPackCodec = msgpack.createCodec({
    useraw: true
});
MsgPackCodec.addExtPacker(0x01, Date, function(date) {
    return date.toISOString();
});
MsgPackCodec.addExtUnpacker(0x01, function(date) {
    return Date.parse(date);
});
