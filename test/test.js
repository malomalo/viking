this.Viking = this.Viking || {};
(function () {
	'use strict';

	// Calls `to_param` on all its elements and joins the result with slashes.
	// This is used by url_for in Viking Pack.
	Object.defineProperty(Array.prototype, 'toParam', {
	    value: function value() {
	        return this.map(function (e) {
	            return e.toParam();
	        }).join('/');
	    },
	    writable: true,
	    configureable: true,
	    enumerable: false
	});

	// Converts an array into a string suitable for use as a URL query string,
	// using the given key as the param name.
	Object.defineProperty(Array.prototype, 'toQuery', {
	    value: function value(key) {
	        var prefix = key + "[]";
	        return this.map(function (value) {
	            if (value === null) {
	                return escape(prefix) + '=';
	            }
	            return value.toQuery(prefix);
	        }).join('&');
	    },
	    writable: true,
	    configureable: true,
	    enumerable: false
	});

	// Alias of to_s.
	Boolean.prototype.toParam = Boolean.prototype.toString;

	Boolean.prototype.toQuery = function (key) {
	    return escape(key.toParam()) + "=" + escape(this.toParam());
	};

	// strftime relies on https://github.com/samsonjs/strftime. It supports
	// standard specifiers from C as well as some other extensions from Ruby.
	Date.prototype.strftime = function (format) {
	    return strftime(format, this);
	};

	Date.fromISO = function (s) {
	    return new Date(s);
	};

	// Alias of to_s.
	Date.prototype.toParam = Date.prototype.toJSON;

	Date.prototype.toQuery = function (key) {
	    return escape(key.toParam()) + "=" + escape(this.toParam());
	};

	Date.prototype.today = function () {
	    return new Date();
	};

	Date.prototype.isToday = function () {
	    return this.getUTCFullYear() === new Date().getUTCFullYear() && this.getUTCMonth() === new Date().getUTCMonth() && this.getUTCDate() === new Date().getUTCDate();
	};

	Date.prototype.isThisMonth = function () {
	    return this.getUTCFullYear() === new Date().getUTCFullYear() && this.getUTCMonth() === new Date().getUTCMonth();
	};

	Date.prototype.isThisYear = function () {
	    return this.getUTCFullYear() === new Date().getUTCFullYear();
	};

	Date.prototype.past = function () {
	    return this < new Date();
	};

	// ordinalize returns the ordinal string corresponding to integer:
	//
	//     (1).ordinalize()    // => '1st'
	//     (2).ordinalize()    // => '2nd'
	//     (53).ordinalize()   // => '53rd'
	//     (2009).ordinalize() // => '2009th'
	//     (-134).ordinalize() // => '-134th'
	Number.prototype.ordinalize = function () {
	    var abs = Math.abs(this);

	    if (abs % 100 >= 11 && abs % 100 <= 13) {
	        return this + 'th';
	    }

	    abs = abs % 10;
	    if (abs === 1) {
	        return this + 'st';
	    }
	    if (abs === 2) {
	        return this + 'nd';
	    }
	    if (abs === 3) {
	        return this + 'rd';
	    }

	    return this + 'th';
	};

	// Alias of to_s.
	Number.prototype.toParam = Number.prototype.toString;

	Number.prototype.toQuery = function (key) {
	    return escape(key.toParam()) + "=" + escape(this.toParam());
	};

	Number.prototype.second = function () {
	    return this * 1000;
	};

	Number.prototype.seconds = Number.prototype.second;

	Number.prototype.minute = function () {
	    return this * 60000;
	};

	Number.prototype.minutes = Number.prototype.minute;

	Number.prototype.hour = function () {
	    return this * 3600000;
	};

	Number.prototype.hours = Number.prototype.hour;

	Number.prototype.day = function () {
	    return this * 86400000;
	};

	Number.prototype.days = Number.prototype.day;

	Number.prototype.week = function () {
	    return this * 7 * 86400000;
	};

	Number.prototype.weeks = Number.prototype.week;

	Number.prototype.ago = function () {
	    return new Date(new Date().getTime() - this);
	};

	Number.prototype.fromNow = function () {
	    return new Date(new Date().getTime() + this);
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
	    writable: true,
	    configureable: true,
	    enumerable: false,
	    value: function value(namespace) {
	        var _this = this;

	        return Object.keys(this).map(function (key) {
	            var value = _this[key];
	            var namespaceWithKey = namespace ? namespace + "[" + key + "]" : key;

	            if (value === null || value === undefined) {
	                return escape(namespaceWithKey);
	            } else {
	                return value.toQuery(namespaceWithKey);
	            }
	        }).join('&');
	    }
	});

	// Converts an object into a string suitable for use as a URL query string,
	// using the given key as the param name.
	//
	// Note: This method is defined as a default implementation for all Objects for
	// Object#toQuery to work.
	Object.defineProperty(Object.prototype, 'toQuery', {
	    writable: true,
	    configureable: true,
	    enumerable: false,
	    value: Object.prototype.toParam
	});

	var NameError = function NameError(message, file, lineNumber) {
	    var err = new Error();

	    if (err.stack) {
	        // Remove one stack level.
	        if (typeof Components != 'undefined') {
	            // Mozilla
	            this.stack = err.stack.substring(err.stack.indexOf('\n') + 1);
	        } else if (typeof chrome != 'undefined' || typeof process != 'undefined') {
	            // Chrome / Node.js
	            this.stack = err.stack.replace(/\n[^\n]*/, '');
	        } else {
	            this.stack = err.stack;
	        }
	    }

	    this.name = 'Viking.NameError';
	    this.message = message === undefined ? err.message : message;
	    this.file = file === undefined ? err.file : file;
	    this.lineNumber = lineNumber === undefined ? err.lineNumber : lineNumber;
	};

	NameError.prototype = Object.create(Error.prototype);
	NameError.prototype.constructor = NameError;

	var URLError = function URLError(message, file, lineNumber) {
	    var err = new Error();

	    if (typeof message === 'undefined') {
	        message = 'A "url" property or function must be specified';
	    }

	    if (err.stack) {
	        // Remove one stack level.
	        if (typeof Components != 'undefined') {
	            // Mozilla
	            this.stack = err.stack.substring(err.stack.indexOf('\n') + 1);
	        } else if (typeof chrome != 'undefined' || typeof process != 'undefined') {
	            // Chrome / Node.js
	            this.stack = err.stack.replace(/\n[^\n]*/, '');
	        } else {
	            this.stack = err.stack;
	        }
	    }

	    this.name = 'Viking.URLError';
	    this.message = message === undefined ? err.message : message;
	    this.file = file === undefined ? err.file : file;
	    this.lineNumber = lineNumber === undefined ? err.lineNumber : lineNumber;
	};

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
	    return this.underscore().humanize().replace(/\b('?[a-z])/g, function (m) {
	        return m.toUpperCase();
	    });
	};

	// Capitalizes the first word and turns underscores into spaces and strips a
	// trailing "_id", if any. Like titleize, this is meant for creating pretty output.
	String.prototype.humanize = function () {
	    var result = this.toLowerCase().replace(/_id$/, '').replace(/_/g, ' ');
	    result = result.replace(/([a-z\d]*)/g, function (m) {
	        return m.toLowerCase();
	    });
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
	    return result.replace('-', '_').toLowerCase();
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
	    var result = void 0;

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
	    if (this.toString() === 'true') {
	        return true;
	    }
	    if (this.toString() === 'false') {
	        return false;
	    }

	    return defaultTo === undefined ? false : defaultTo;
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
	// `context` defaults to the Viking global namespace.
	//
	// Examples:
	//     'Module'.constantize     # => Module
	//     'Test.Unit'.constantize  # => Test.Unit
	//     'Unit'.constantize(Test) # => Test.Unit
	//
	// Viking.NameError is raised when the variable is unknown.
	String.prototype.constantize = function (context) {

	    if (!context) {
	        context = window;
	    }

	    return this.split('.').reduce(function (context, name) {
	        var v = context[name];
	        if (!v) {
	            throw new NameError("uninitialized variable " + name);
	        }
	        return v;
	    }, context);
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
	};

	// If `length` is greater than the length of the string, returns a new String
	// of length `length` with the string right justified and padded with padString;
	// otherwise, returns string
	String.prototype.rjust = function (length, padString) {
	    if (!padString) {
	        padString = ' ';
	    }

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
	    if (!padString) {
	        padString = ' ';
	    }

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
	    return escape(key.toParam()) + "=" + escape(this.toParam());
	};

	String.prototype.downcase = String.prototype.toLowerCase;

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
	  return typeof obj;
	} : function (obj) {
	  return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
	};

	// import Collection from './collection';

	var noXhrPatch = typeof window !== 'undefined' && !!window.ActiveXObject && !(window.XMLHttpRequest && new XMLHttpRequest().dispatchEvent);

	// Map from CRUD to HTTP for our default `Backbone.sync` implementation.
	var methodMap = {
	  'create': 'POST',
	  'update': 'PUT',
	  'patch': 'PATCH',
	  'delete': 'DELETE',
	  'read': 'GET'
	};

	var ajax = function ajax(model, options) {
	  // if (model instanceof Collection) {
	  //     model = model.model.prototype;
	  // }

	  if (model.connection) {
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
	    options.headers = { 'Accept': 'application/json' };
	  }

	  return jQuery.ajax(options);
	};

	// Viking.sync
	// -------------
	// Override Backbone.sync to process data for the ajax request with
	// +toParam()+ as opposed to letting jQuery automatically call $.param().
	var vikingSync = function sync(method, model, options) {
	  var type = methodMap[method];

	  // Default options, unless specified.
	  _.defaults(options || (options = {}), {
	    emulateHTTP: Backbone.emulateHTTP,
	    emulateJSON: Backbone.emulateJSON
	  });

	  // Default JSON-request options.
	  var params = { type: type, dataType: 'json' };

	  // Ensure that we have a URL.
	  if (!options.url) {
	    params.url = _.result(model, 'url');
	    if (!params.url) {
	      throw new URLError();
	    }
	  }

	  // Ensure that we have the appropriate request data.
	  if (options.data == null && model && (method === 'create' || method === 'update' || method === 'patch')) {
	    params.contentType = 'application/json';
	    params.data = JSON.stringify(options.attrs || model.toJSON(options));
	  }

	  // For older servers, emulate JSON by encoding the request into an HTML-form.
	  if (options.emulateJSON) {
	    params.contentType = 'application/x-www-form-urlencoded';
	    params.data = params.data ? { model: params.data } : {};
	  }

	  // For older servers, emulate HTTP by mimicking the HTTP method with `_method`
	  // And an `X-HTTP-Method-Override` header.
	  if (options.emulateHTTP && (type === 'PUT' || type === 'DELETE' || type === 'PATCH')) {
	    (function () {
	      params.type = 'POST';
	      if (options.emulateJSON) {
	        params.data._method = type;
	      }
	      var beforeSend = options.beforeSend;
	      options.beforeSend = function (xhr) {
	        xhr.setRequestHeader('X-HTTP-Method-Override', type);
	        if (beforeSend) {
	          return beforeSend.apply(this, arguments);
	        }
	      };
	    })();
	  }

	  // Don't process data on a non-GET request.
	  if (params.type !== 'GET' && !options.emulateJSON) {
	    params.processData = false;
	  } else if (options.data && _typeof(options.data) === 'object') {
	    options.data = options.data.toParam();
	  }

	  // Make the request, allowing the user to override any Ajax options.
	  var xhr = options.xhr = ajax(model, _.extend(params, options));
	  model.trigger('request', model, xhr, options);
	  return xhr;
	};

	// The Viking gloval namespace for tracking created models, collections, etc...
	var global$1 = {};

	// TODO: the objectName should be passed into the function
	var Name = function Name(name) {
	    var objectName = name.camelize(); // Namespaced.Name

	    this.name = objectName;
	    this.collectionName = objectName + 'Collection';
	    this.singular = objectName.underscore().replace(/\//g, '_'); // namespaced_name
	    this.plural = this.singular.pluralize(); // namespaced_names
	    this.human = objectName.demodulize().humanize(); // Name
	    this.collection = this.singular.pluralize(); // namespaced/names
	    this.paramKey = this.singular;
	    this.routeKey = this.plural;
	    this.element = objectName.demodulize().underscore();

	    this.model = function () {
	        if (this._model) {
	            return this._model;
	        }

	        this._model = this.name.constantize(global$1);
	        return this._model;
	    };
	};

	var DateType = {

	    load: function load(value) {
	        if (typeof value === 'string' || typeof value === 'number') {
	            return Date.fromISO(value);
	        }

	        if (!(value instanceof Date)) {
	            throw new TypeError((typeof value === 'undefined' ? 'undefined' : _typeof(value)) + " can't be coerced into Date");
	        }

	        return value;
	    },

	    dump: function dump(value) {
	        return value.toISOString();
	    }

	};

	var JSONType = {

	    load: function load(value, key, className) {

	        if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object') {

	            if (key) {
	                var name = key.camelize();

	                if (global$1[name]) {
	                    var model = new global$1[name](value);
	                    return model;
	                }

	                return value;
	            }

	            return value;
	        }

	        throw new TypeError((typeof value === 'undefined' ? 'undefined' : _typeof(value)) + " can't be coerced into JSON");
	    },

	    dump: function dump(value) {
	        if (value instanceof Model) {
	            return value.toJSON();
	        }
	        return value;
	    }

	};

	var NumberType = {

	    load: function load(value) {
	        if (typeof value === 'string') {
	            value = value.replace(/\,/g, '');

	            if (value.trim() === '') {
	                return null;
	            }
	        }
	        return Number(value);
	    },

	    dump: function dump(value) {
	        return value;
	    }

	};

	var StringType = {

	    load: function load(value) {
	        if (typeof value !== 'string' && value !== undefined && value !== null) {
	            return String(value);
	        }
	        return value;
	    },

	    dump: function dump(value) {
	        if (typeof value !== 'string' && value !== undefined && value !== null) {
	            return String(value);
	        }
	        return value;
	    }

	};

	var BooleanType = {

	    load: function load(value) {
	        if (typeof value === 'string') {
	            value = value === 'true';
	        }
	        return !!value;
	    },

	    dump: function dump(value) {
	        return value;
	    }

	};

	var Type = {
	    'registry': {}
	};

	Type.registry['date'] = Type.Date = DateType;
	Type.registry['json'] = Type.JSON = JSONType;
	Type.registry['number'] = Type.Number = NumberType;
	Type.registry['string'] = Type.String = StringType;
	Type.registry['boolean'] = Type.Boolean = BooleanType;

	var Reflection = function Reflection() {};

	_.extend(Reflection.prototype, {

	    klass: function klass() {
	        if (this.macro === 'hasMany') {
	            return this.collection();
	        }

	        return this.model();
	    },

	    model: function model() {
	        return this.modelName.model();
	    },

	    collection: function collection() {
	        return this.collectionName.constantize(global$1);
	    }

	});

	Reflection.extend = Backbone.Model.extend;

	var BelongsTo = Reflection.extend({

	    constructor: function constructor(name, options) {
	        this.name = name;
	        this.macro = 'belongsTo';
	        this.options = _.extend({}, options);

	        if (!this.options.polymorphic) {
	            if (this.options.modelName) {
	                this.modelName = new Name(this.options.modelName);
	            } else {
	                this.modelName = new Name(name);
	            }
	        }
	    }

	});

	Reflection.BelongsTo = BelongsTo;

	var HasMany = Reflection.extend({

	    constructor: function constructor(name, options) {
	        this.name = name;
	        this.macro = 'hasMany';
	        this.options = _.extend({}, options);

	        if (this.options.modelName) {
	            this.modelName = new Name(this.options.modelName);
	        } else {
	            this.modelName = new Name(this.name.singularize());
	        }

	        if (this.options.collectionName) {
	            this.collectionName = this.options.collectionName;
	        } else {
	            this.collectionName = this.modelName.collectionName;
	        }
	    }

	});

	Reflection.HasMany = HasMany;

	var HasOne = Reflection.extend({

	    constructor: function constructor(name, options) {
	        this.name = name;
	        this.macro = 'hasOne';
	        this.options = _.extend({}, options);

	        if (!this.options.polymorphic) {
	            if (this.options.modelName) {
	                this.modelName = new Name(this.options.modelName);
	            } else {
	                this.modelName = new Name(name);
	            }
	        }
	    }

	});

	Reflection.HasOne = HasOne;

	var HasAndBelongsToMany = Reflection.extend({

	    constructor: function constructor(name, options) {
	        this.name = name;
	        this.macro = 'hasAndBelongsToMany';
	        this.options = _.extend({}, options);

	        if (this.options.modelName) {
	            this.modelName = new Name(this.options.modelName);
	        } else {
	            this.modelName = new Name(this.name.singularize());
	        }

	        if (this.options.collectionName) {
	            this.collectionName = this.options.CollectionName;
	        } else {
	            this.collectionName = this.modelName.collectionName;
	        }
	    }

	});

	Reflection.HasAndBelongsToMany = HasAndBelongsToMany;

	var coerceAttributes = function coerceAttributes(attrs) {

	    _.each(this.associations, function (association) {
	        var objectType = void 0;
	        var polymorphic = association.options.polymorphic;

	        if (!attrs[association.name]) {
	            return;
	        }

	        if (polymorphic && attrs[association.name] instanceof Model) {
	            // TODO: remove setting the id?
	            attrs[association.name + '_id'] = attrs[association.name].id;
	            attrs[association.name + '_type'] = attrs[association.name].modelName.name;
	        } else if (polymorphic && attrs[association.name + '_type']) {
	            objectType = attrs[association.name + '_type'].camelize().constantize(global$1);
	            attrs[association.name] = new objectType(attrs[association.name]);
	        } else if (!(attrs[association.name] instanceof association.klass())) {
	            objectType = association.klass();
	            attrs[association.name] = new objectType(attrs[association.name]);
	        }
	    });

	    _.each(this.schema, function (options, key) {
	        if (attrs[key] || attrs[key] === false) {
	            (function () {
	                var tmp = void 0,
	                    klass = void 0;

	                klass = Type.registry[options.type];

	                if (klass) {
	                    if (options['array']) {
	                        tmp = [];
	                        _.each(attrs[key], function (value) {
	                            tmp.push(klass.load(value, key));
	                        });
	                        attrs[key] = tmp;
	                    } else {
	                        attrs[key] = klass.load(attrs[key], key);
	                    }
	                } else {
	                    throw new TypeError("Coercion of " + options['type'] + " unsupported");
	                }
	            })();
	        }
	    });

	    return attrs;
	};

	// Below is the same code from the Backbone.Model function
	// except where there are comments
	var constructor = function constructor(attributes, options) {
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
	            var type = attrs[this.inheritanceAttribute].camelize().constantize(global$1);
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
	    this.reflectOnAssociations('hasMany').forEach(function (association) {
	        this.attributes[association.name] = new (association.collection())();
	    }, this);

	    if (options.collection) {
	        this.collection = options.collection;
	    }
	    if (options.parse) {
	        attrs = this.parse(attrs, options) || {};
	    }

	    this.set(attrs, options);
	    this.changed = {};
	    this.initialize.call(this, attributes, options);
	};

	var defaults$1 = function defaults() {
	    var _this = this;

	    var dflts = {};

	    if (typeof this.schema === 'undefined') {
	        return dflts;
	    }

	    Object.keys(this.schema).forEach(function (key) {
	        if (_this.schema[key]['default']) {
	            dflts[key] = _this.schema[key]['default'];
	        }
	    });

	    return dflts;
	};

	// TODO: testme
	var errorsOn = function errorsOn(attribute) {
	    if (this.validationError) {
	        return this.validationError[attribute];
	    }

	    return false;
	};

	// Returns string to use for params names. This is the key attributes from
	// the model will be namespaced under when saving to the server
	var paramRoot = function paramRoot() {
	    return this.baseModel.modelName.paramKey;
	};

	// Overwrite Backbone.Model#save so that we can catch errors when a save
	// fails.
	var save = function save(key, val, options) {
	  var attrs = void 0,
	      method = void 0,
	      xhr = void 0,
	      attributes = this.attributes;

	  // Handle both `"key", value` and `{key: value}` -style arguments.
	  if (key == null || (typeof key === 'undefined' ? 'undefined' : _typeof(key)) === 'object') {
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
	    if (!this.set(attrs, options)) {
	      return false;
	    }
	  } else {
	    if (!this._validate(attrs, options)) {
	      return false;
	    }
	  }

	  // Set temporary attributes if `{wait: true}`.
	  if (attrs && options.wait) {
	    this.attributes = _.extend({}, attributes, attrs);
	  }

	  // After a successful server-side save, the client is (optionally)
	  // updated with the server-side state.
	  if (options.parse === void 0) {
	    options.parse = true;
	  }
	  var model = this;
	  var success = options.success;
	  options.success = function (resp) {
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
	  options.error = function (resp) {
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

	  method = this.isNew() ? 'create' : options.patch ? 'patch' : 'update';
	  if (method === 'patch') {
	    options.attrs = attrs;
	  }
	  xhr = this.sync(method, this, options);

	  // Restore attributes.
	  if (attrs && options.wait) {
	    this.attributes = attributes;
	  }

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
	var select = function select(value, options) {

	    // Handle both `value[, options]` and `options` -style arguments.
	    if (value === undefined || (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object') {
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

	var set$1 = function set(key, val, options) {
	    if (key === null) {
	        return this;
	    }

	    // Handle both `"key", value` and `{key: value}` -style arguments.
	    var attrs = void 0;
	    if ((typeof key === 'undefined' ? 'undefined' : _typeof(key)) === 'object') {
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
	        var type = attrs[this.inheritanceAttribute].camelize().constantize(global$1);
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
	        _.each(this.reflectOnAssociations('hasMany'), function (association) {
	            if (!this.attributes[association.name]) {
	                this.attributes[association.name] = new (association.collection())();
	            }
	        }, this);
	    }

	    this.coerceAttributes(attrs);
	    _.each(attrs, function (value, key) {
	        var association = this.reflectOnAssociation(key);
	        if (association && association.macro === 'hasMany') {
	            if (!value) {
	                this.attributes[key].set([]);
	            } else {
	                this.attributes[key].set(value.models);
	                _.each(value.models, function (model) {
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

	var setErrors = function setErrors(errors, options) {
	    if (_.size(errors) === 0) {
	        return;
	    }

	    var model = this;
	    this.validationError = errors;

	    model.trigger('invalid', this, errors, options);
	};

	// Override [Backbone.Model#sync](http://backbonejs.org/#Model-sync).
	// [Ruby on Rails](http://rubyonrails.org/) expects the attributes to be
	// namespaced
	var sync = function sync(method, model, options) {
	    options || (options = {});

	    if (options.data == null && (method === 'create' || method === 'update' || method === 'patch')) {
	        options.contentType = 'application/json';
	        options.data = {};
	        options.data[_.result(model, 'paramRoot')] = options.attrs || model.toJSON(options);
	        options.data = JSON.stringify(options.data);
	    }

	    return vikingSync.call(this, method, model, options);
	};

	// similar to Rails as_json method
	var toJSON = function toJSON(options) {
	    var data = _.clone(this.attributes);

	    if (options === undefined) {
	        options = {};
	    }

	    if (options.include) {
	        if (typeof options.include === 'string') {
	            var key = options.include;
	            options.include = {};
	            options.include[key] = {};
	        } else if (_.isArray(options.include)) {
	            var array = options.include;
	            options.include = {};
	            _.each(array, function (key) {
	                options.include[key] = {};
	            });
	        }
	    } else {
	        options.include = {};
	    }

	    _.each(this.associations, function (association) {
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
	            (function () {
	                var tmp = void 0,
	                    klass = void 0;

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
	            })();
	        }
	    });

	    return data;
	};

	// Returns a string representing the object's key suitable for use in URLs,
	// or nil if `#isNew` is true.
	var toParam = function toParam() {
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
	var touch = function touch(columns, options) {
	    var now = new Date();

	    var attrs = {
	        updated_at: now
	    };

	    options = _.extend({ patch: true }, options);

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
	var unselect = function unselect(options) {
	    this.select(false, options);
	};

	// TODO: test return
	var updateAttribute = function updateAttribute(key, value, options) {
	    var data = {};
	    data[key] = value;

	    return this.updateAttributes(data, options);
	};

	// TODO: test return
	var updateAttributes = function updateAttributes(data, options) {
	    options || (options = {});
	    options.patch = true;

	    return this.save(data, options);
	};

	// Default URL for the model's representation on the server
	var url = function url() {
	    var base = _.result(this, 'urlRoot') || _.result(this.collection, 'url');

	    if (!base) {
	        throw new URLError();
	    }

	    if (this.isNew()) return base;

	    return base.replace(/([^\/])$/, '$1/') + this.toParam();
	};

	// Alias for `::urlRoot`
	var urlRoot = function urlRoot() {
	    return this.constructor.urlRoot();
	};

	var abstract = true;

	// inheritanceAttribute is the attirbute used for STI
	var inheritanceAttribute = 'type';

var instanceProperties = Object.freeze({
		abstract: abstract,
		inheritanceAttribute: inheritanceAttribute,
		coerceAttributes: coerceAttributes,
		constructor: constructor,
		defaults: defaults$1,
		errorsOn: errorsOn,
		paramRoot: paramRoot,
		save: save,
		select: select,
		set: set$1,
		setErrors: setErrors,
		sync: sync,
		toJSON: toJSON,
		toParam: toParam,
		touch: touch,
		unselect: unselect,
		updateAttribute: updateAttribute,
		updateAttributes: updateAttributes,
		url: url,
		urlRoot: urlRoot
	});

	// Create a model with +attributes+. Options are the
	// same as Viking.Model#save
	var create = function create(attributes, options) {
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
	var find = function find(id, options) {
	    var model = new this({ id: id });
	    model.fetch(options);
	    return model;
	};

	// Find or create model by attributes. Accepts success callbacks in the
	// options hash, which is passed (model) as arguments.
	//
	// findOrCreateBy returns the model, however it most likely won't have fetched
	// the data	from the server if you immediately try to use attributes of the
	// model.
	var findOrCreateBy = function findOrCreateBy(attributes, options) {
	    var klass = this;
	    klass.where(attributes).fetch({
	        success: function success(modelCollection) {
	            var model = modelCollection.models[0];
	            if (model) {
	                if (options && options.success) options.success(model);
	            } else {
	                klass.create(attributes, options);
	            }
	        }
	    });
	};

	var reflectOnAssociation = function reflectOnAssociation(name) {
	    return this.associations[name];
	};

	var reflectOnAssociations = function reflectOnAssociations(macro) {
	    var associations = _.values(this.associations);
	    if (macro) {
	        associations = _.select(associations, function (a) {
	            return a.macro === macro;
	        });
	    }

	    return associations;
	};

	// Generates the `urlRoot` based off of the model name.
	var urlRoot$1 = function urlRoot() {
	    if (this.prototype.hasOwnProperty('urlRoot')) {
	        return _.result(this.prototype, 'urlRoot');
	    } else if (this.baseModel.prototype.hasOwnProperty('urlRoot')) {
	        return _.result(this.baseModel.prototype, 'urlRoot');
	    } else {
	        return "/" + this.baseModel.modelName.plural;
	    }
	};

	// Returns a unfetched collection with the predicate set to the query
	var where = function where(options) {
	    // TODO: Move to modelName as well?
	    var Collection = (this.modelName.name + 'Collection').constantize(global$1);

	    return new Collection(undefined, { predicate: options });
	};

	// Overide the default extend method to support passing in the modelName
	// and support STI
	//
	// The modelName is used for generating urls and relationships.
	//
	// If a Model is extended further is acts simlar to ActiveRecords STI.
	//
	// `name` is optional, and must be a string
	var extend = function extend(name, protoProps, staticProps) {
	    var _this = this;

	    // if (typeof name !== 'string' || arguments.length < 1 || arguments.length > 3) {
	    //     throw new ArgumentError('extend takes 1 - 3 arguments (name: String, protoProps: Object, staticProps: Object?)');
	    // }
	    if (typeof name !== 'string') {
	        staticProps = protoProps;
	        protoProps = name;
	    }
	    protoProps || (protoProps = {});

	    var child = Backbone.Model.extend.call(this, protoProps, staticProps);

	    if (typeof name === 'string') {
	        child.modelName = new Name(name);
	    }

	    child.associations = {};
	    child.descendants = [];
	    child.inheritanceAttribute = protoProps.inheritanceAttribute === undefined ? this.prototype.inheritanceAttribute : protoProps.inheritanceAttribute;

	    if (child.inheritanceAttribute === false || this.prototype.hasOwnProperty('abstract') && this.prototype.abstract) {
	        child.baseModel = child;
	    } else {
	        child.baseModel.descendants.push(child);
	    }

	    ['belongsTo', 'hasOne', 'hasMany', 'hasAndBelongsToMany'].forEach(function (macro) {
	        (protoProps[macro] || []).concat(this[macro] || []).forEach(function (name) {
	            var options = void 0;

	            // Handle both `type, key, options` and `type, [key, options]` style arguments
	            if (Array.isArray(name)) {
	                options = name[1];
	                name = name[0];
	            }

	            if (!child.associations[name]) {
	                var reflectionClass = {
	                    'belongsTo': Reflection.BelongsTo,
	                    'hasOne': Reflection.HasOne,
	                    'hasMany': Reflection.HasMany,
	                    'hasAndBelongsToMany': Reflection.HasAndBelongsToMany
	                };
	                reflectionClass = reflectionClass[macro];

	                child.associations[name] = new reflectionClass(name, options);
	            }
	        });
	    }, this.prototype);

	    if (this.prototype.schema && protoProps.schema) {
	        Object.keys(this.prototype.schema).forEach(function (key) {
	            if (!child.prototype.schema[key]) {
	                child.prototype.schema[key] = _this.prototype.schema[key];
	            }
	        });
	    }

	    // Track the model in the Viking global namespace.
	    // Used in the constinize method
	    if (child.modelName) {
	        global$1[child.modelName.name] = child;
	    }

	    return child;
	};

	var associations = [];

var classProperties = Object.freeze({
		associations: associations,
		create: create,
		find: find,
		findOrCreateBy: findOrCreateBy,
		reflectOnAssociation: reflectOnAssociation,
		reflectOnAssociations: reflectOnAssociations,
		urlRoot: urlRoot$1,
		where: where,
		extend: extend
	});

	//= require_tree ./model/instance_properties

	// Viking.Model
	// ------------
	//
	// Viking.Model is an extension of [Backbone.Model](http://backbonejs.org/#Model).
	// It adds naming, relationships, data type coercions, selection, and modifies
	// sync to work with [Ruby on Rails](http://rubyonrails.org/) out of the box.
	var Model = Backbone.Model.extend(instanceProperties, classProperties);

	Model.Name = Name;
	Model.Type = Type;
	Model.Reflection = Reflection;

	var Predicate = Backbone.Model;

	// Viking.Collection
	// -----------------
	//
	// Viking.Collection is an extension of [Backbone.Collection](http://backbonejs.org/#Collection).
	// It adds predicates, selection, and modifies fetch to cancel any current
	// request if a new fetch is triggered.
	var Collection = Backbone.Collection.extend({

	    // Set the default model to a generic Viking.Model
	    model: Model,

	    constructor: function constructor(models, options) {
	        Backbone.Collection.call(this, models, options);

	        if (options && options.predicate) {
	            this.setPredicate(options.predicate, { silent: true });
	        }

	        if (options && options.order) {
	            this.order(options.order, { silent: true });
	        }
	    },

	    url: function url() {
	        return "/" + this.model.modelName.plural;
	    },

	    paramRoot: function paramRoot() {
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
	    setPredicate: function setPredicate(predicate, options) {
	        if (this.predicate === predicate) {
	            return false;
	        }

	        if (this.predicate) {
	            this.stopListening(this.predicate);
	        }

	        if (predicate) {
	            if (!(predicate instanceof Predicate)) {
	                predicate = new Predicate(predicate);
	            }
	            this.predicate = predicate;
	            this.listenTo(predicate, 'change', this.predicateChanged);
	            if (!(options && options.silent)) {
	                this.predicateChanged();
	            }
	        } else if (this.predicate) {
	            delete this.predicate;
	            if (!(options && options.silent)) {
	                this.predicateChanged();
	            }
	        }
	    },

	    // Called when the predicate is changed. Having this being called
	    // when the predicate changes instead of just `fetch` allows sub
	    // collections to overwrite what happens when it changes. An example
	    // of this would be the `Viking.PaginatedCollection`
	    predicateChanged: function predicateChanged(predicate, options) {
	        this.trigger('change:predicate', this.predicate);
	        this.fetch();
	    },

	    // Sets `'selected'` to `true` on the `model`. By default all other models
	    // will be unselected. If `{multiple: true}` is passed as an option the other
	    // models will not be unselected. Triggers the `selected` event on the
	    // collection. If the model is already selected the `selected` event is
	    // not triggered
	    select: function select(model, options) {
	        options || (options = {});

	        if (!options.multiple) {
	            this.clearSelected(model);
	        }
	        if (!model.selected) {
	            model.selected = true;
	            model.trigger('selected', this.selected());
	        }
	    },

	    // returns all the models where `selected` == true
	    selected: function selected() {
	        return this.filter(function (m) {
	            return m.selected;
	        });
	    },

	    // Sets `'selected'` to `false` on all models
	    clearSelected: function clearSelected(exceptModel) {
	        if (exceptModel instanceof Backbone.Model) {
	            exceptModel = exceptModel.cid;
	        }
	        this.each(function (m) {
	            if (m.cid !== exceptModel) {
	                m.unselect();
	            }
	        });
	    },

	    // Override the default Backbone.Collection#fetch to cancel any current
	    // fetch request if fetch is called again. For example when the predicate
	    // changes 3 times, if the first 2 request don't return before the 3rd is
	    // sent they will be canceled and only the last one will finish and update
	    // the collection. You won't get the collection being updated 3 times.
	    fetch: function fetch(options) {
	        options || (options = {});

	        var complete = options.complete;
	        options.complete = _.bind(function () {
	            delete this.xhr;
	            if (complete) {
	                complete();
	            }
	        }, this);

	        if (this.xhr) {
	            this.xhr.abort();
	        }
	        this.xhr = Backbone.Collection.prototype.fetch.call(this, options);
	    },

	    // TODO: testme?
	    sync: function sync(method, model, options) {
	        if (method === 'read' && this.predicate) {
	            options.data || (options.data = {});
	            options.data.where = this.predicate.attributes;
	        }

	        if (method === 'read' && this.ordering) {
	            options.data || (options.data = {});
	            options.data.order = this.ordering;
	        }

	        return vikingSync.apply(this, arguments);
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
	    order: function order(_order, options) {
	        options || (options = {});
	        _order = _.isArray(_order) ? _order : [_order];

	        _order = _.map(_order, function (o) {
	            var normalizedOrder = void 0;

	            if (typeof o === 'string') {
	                normalizedOrder = {};
	                normalizedOrder[o] = 'asc';
	            } else {
	                normalizedOrder = o;
	            }

	            return normalizedOrder;
	        });

	        if (_order.length === 1 && !_order[0]) {
	            this.ordering = undefined;
	            if (!options.silent) {
	                this.orderChanged(_order);
	            }
	            return;
	        }

	        if (this.ordering) {
	            var orderingEqual = _.find(_.map(this.ordering, function (el, i) {
	                return _.isEqual(el, _order[i]);
	            }), function (el) {
	                return el;
	            });
	            if (!orderingEqual) {
	                this.ordering = _order;
	                if (!options.silent) {
	                    this.orderChanged(_order);
	                }
	            }
	            return;
	        }

	        this.ordering = _order;
	        if (!options.silent) {
	            this.orderChanged(_order);
	        }
	    },

	    // Called when the order is changed. Having this being called
	    // when the predicate changes instead of just `fetch` allows sub
	    // collections to overwrite what happens when it changes, similar to
	    // #predicateChanged
	    orderChanged: function orderChanged(order) {
	        this.fetch();
	    }

	}, {

	    extend: function extend(name, protoProps, staticProps) {

	        if (typeof name !== 'string') {
	            staticProps = protoProps;
	            protoProps = name;
	        }
	        protoProps || (protoProps = {});

	        var child = Backbone.Collection.extend.call(this, protoProps, staticProps);

	        // Track the collection in the Viking global namespace.
	        // Used in the constinize method
	        if (typeof name !== 'string') {
	            if (child.prototype.model && child.prototype.model.modelName) {
	                name = child.prototype.model.modelName.collectionName;
	                global$1[name] = child;
	            }
	        } else {
	            global$1[name] = child;
	        }

	        return child;
	    }

	});

	var booleanAttributes = ['disabled', 'readonly', 'multiple', 'checked', 'autobuffer', 'autoplay', 'controls', 'loop', 'selected', 'hidden', 'scoped', 'async', 'defer', 'reversed', 'ismap', 'seemless', 'muted', 'required', 'autofocus', 'novalidate', 'formnovalidate', 'open', 'pubdate', 'itemscope'];

	var tagOption = function tagOption(key, value, escape) {
	    if (Array.isArray(value)) {
	        value = value.join(" ");
	    }

	    if (escape) {
	        value = _.escape(value);
	    }

	    return key + '="' + value + '"';
	};

	var dataTagOption = function dataTagOption(key, value, escape) {
	    key = "data-" + key;

	    if (_.isObject(value)) {
	        value = JSON.stringify(value);
	    }

	    return tagOption(key, value, escape);
	};

	var tagOptions = function tagOptions(options, escape) {
	    if (options === undefined) {
	        return "";
	    }

	    if (escape === undefined) {
	        escape = true;
	    }

	    var attrs = [];
	    _.each(options, function (value, key) {
	        if (key === "data" && _.isObject(value)) {
	            // TODO testme
	            _.each(value, function (value, key) {
	                attrs.push(dataTagOption(key, value, escape));
	            });
	        } else if (value === true && _.contains(booleanAttributes, key)) {
	            attrs.push(key);
	        } else if (value !== null && value !== undefined) {
	            attrs.push(tagOption(key, value, escape));
	        }
	    });

	    if (attrs.length === 0) {
	        return '';
	    }

	    return " " + attrs.sort().join(' ');
	};

	// see http://www.w3.org/TR/html4/types.html#type-name
	var sanitizeToId = function sanitizeToId(name) {
	    return name.replace(/[^\-a-zA-Z0-9:.]/g, "_").replace(/_+/g, '_').replace(/_+$/, '').replace(/_+/g, '_');
	};

	// TODO: move to model_helpers?
	var tagNameForModelAttribute = function tagNameForModelAttribute(model, attribute, options) {
	    options || (options = {});

	    var value = model.get(attribute);
	    var name = void 0;

	    if (options.namespace) {
	        name = options.namespace + '[' + attribute + ']';
	    } else {
	        name = model.baseModel.modelName.paramKey + '[' + attribute + ']';
	    }

	    if (value instanceof Collection || Array.isArray(value)) {
	        name = name + '[]';
	    }

	    return name;
	};

	// TODO: move to model_helpers?
	var addErrorClassToOptions = function addErrorClassToOptions(model, attribute, options) {
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
	var methodOrAttribute = function methodOrAttribute(model, funcOrAttribute) {
	    if (typeof funcOrAttribute !== 'function') {
	        if (model[funcOrAttribute]) {
	            return _.result(model, funcOrAttribute);
	        }

	        return model.get(funcOrAttribute);
	    }

	    return funcOrAttribute(model);
	};

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
	var urlFor = function urlFor(modelOrUrl, options) {
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

	    var route = void 0;
	    var klass = modelOrUrl.baseModel.modelName.model();
	    if (modelOrUrl instanceof klass) {
	        if (modelOrUrl.isNew()) {
	            route = (klass.baseModel.modelName.plural + 'Path').constantize(global$1);
	            route = route();
	        } else {
	            route = (klass.baseModel.modelName.singular + 'Path').constantize(global$1);
	            route = route(modelOrUrl);
	        }
	    } else {
	        route = (modelOrUrl.baseModel.modelName.plural + 'Path').constantize(global$1);
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
	var tag = function tag(name, options, escape) {
	    return "<" + name + tagOptions(options, escape) + ">";
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

	var imageTag = function imageTag(source, options) {
	    var separator = /x/i,
	        size = void 0,
	        alt = void 0;

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

	    return tag('img', options);
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
	var checkBoxTag = function checkBoxTag(name, value, checked, options, escape) {
	    if (value === undefined) {
	        value = "1";
	    }
	    if (options === undefined) {
	        options = {};
	    }
	    if (checked === true) {
	        options.checked = true;
	    }

	    _.defaults(options, {
	        type: "checkbox",
	        value: value,
	        id: sanitizeToId(name),
	        name: name
	    });

	    return tag("input", options, escape);
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
	var label = function label(model, attribute, content, options, escape) {
	    var tmp = void 0;
	    if ((typeof content === 'undefined' ? 'undefined' : _typeof(content)) === 'object') {
	        tmp = options;
	        options = content;
	        content = tmp;
	    }

	    if (options === undefined) {
	        options = {};
	    }
	    if (content === undefined) {
	        content = attribute.humanize();
	    }
	    if (typeof content === 'function') {
	        content = content();
	    }
	    if (!options['for']) {
	        var name = Viking.View.tagNameForModelAttribute(model, attribute);
	        options['for'] = Viking.View.sanitizeToId(name);
	    }

	    Viking.View.addErrorClassToOptions(model, attribute, options);

	    return Viking.View.Helpers.labelTag(content, options, escape);
	};

	function CheckBoxGroupBuilder(model, attribute, options) {
	    var modelName = void 0;
	    options = _.extend({}, options);

	    this.model = model;
	    this.attribute = attribute;
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
	CheckBoxGroupBuilder.prototype = {

	    checkBox: function checkBox(checkedValue, options) {
	        var values = this.model.get(this.attribute);
	        options || (options = {});

	        if (!options.name && this.options.namespace) {
	            options.name = tagNameForModelAttribute(this.model, this.attribute, { namespace: this.options.namespace });
	        } else if (!options.name) {
	            options.name = tagNameForModelAttribute(this.model, this.attribute);
	        }

	        if (!options.id) {
	            options.id = sanitizeToId(options.name) + '_' + checkedValue;
	        }

	        return checkBoxTag(options.name, checkedValue, _.contains(values, checkedValue), options);
	    },

	    label: function label$$(value, content, options, escape) {
	        options || (options = {});

	        //TODO shouldn't options.name be options.for?
	        if (!options.name && !options['for']) {
	            options['for'] = tagNameForModelAttribute(this.model, this.attribute, { namespace: this.options.namespace });
	            options['for'] = sanitizeToId(options['for']) + '_' + value;
	        }

	        return label(this.model, this.attribute, content, options, escape);
	    }

	};

	function FormBuilder(model, options) {
	    var modelName = void 0;

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

	    checkBox: function checkBox(attribute, options, checkedValue, uncheckedValue, escape) {
	        options || (options = {});

	        if (!options.name && this.options.namespace) {
	            options.name = Viking.View.tagNameForModelAttribute(this.model, attribute, { namespace: this.options.namespace });
	        }

	        return Viking.View.Helpers.checkBox(this.model, attribute, options, checkedValue, uncheckedValue, escape);
	    },

	    collectionSelect: function collectionSelect(attribute, collection, valueAttribute, textAttribute, options) {
	        options || (options = {});

	        if (!options.name && this.options.namespace) {
	            options.name = Viking.View.tagNameForModelAttribute(this.model, attribute, { namespace: this.options.namespace });
	        }

	        return Viking.View.Helpers.collectionSelect(this.model, attribute, collection, valueAttribute, textAttribute, options);
	    },

	    hiddenField: function hiddenField(attribute, options) {
	        options || (options = {});

	        if (!options.name && this.options.namespace) {
	            options.name = Viking.View.tagNameForModelAttribute(this.model, attribute, { namespace: this.options.namespace });
	        }

	        return Viking.View.Helpers.hiddenField(this.model, attribute, options);
	    },

	    label: function label(attribute, content, options, escape) {
	        options || (options = {});

	        //TODO shouldn't options.name be options.for?
	        if (!options['for'] && !options.name && this.options.namespace) {
	            options['for'] = Viking.View.tagNameForModelAttribute(this.model, attribute, { namespace: this.options.namespace });
	            options['for'] = Viking.View.sanitizeToId(options['for']);
	        }

	        return Viking.View.Helpers.label(this.model, attribute, content, options, escape);
	    },

	    number: function number(attribute, options) {
	        options || (options = {});

	        if (!options.name && this.options.namespace) {
	            options.name = Viking.View.tagNameForModelAttribute(this.model, attribute, { namespace: this.options.namespace });
	        }

	        return Viking.View.Helpers.numberField(this.model, attribute, options);
	    },

	    passwordField: function passwordField(attribute, options) {
	        options || (options = {});

	        if (!options.name && this.options.namespace) {
	            options.name = Viking.View.tagNameForModelAttribute(this.model, attribute, { namespace: this.options.namespace });
	        }

	        return Viking.View.Helpers.passwordField(this.model, attribute, options);
	    },

	    radioButton: function radioButton(attribute, tagValue, options) {
	        options || (options = {});

	        if (!options.name && this.options.namespace) {
	            options.name = Viking.View.tagNameForModelAttribute(this.model, attribute, { namespace: this.options.namespace });
	        }

	        return Viking.View.Helpers.radioButton(this.model, attribute, tagValue, options);
	    },

	    select: function select(attribute, collection, options) {
	        options || (options = {});

	        if (!options.name && this.options.namespace) {
	            options.name = Viking.View.tagNameForModelAttribute(this.model, attribute, { namespace: this.options.namespace });
	        }

	        return Viking.View.Helpers.select(this.model, attribute, collection, options);
	    },

	    textArea: function textArea(attribute, options) {
	        options || (options = {});

	        if (!options.name && this.options.namespace) {
	            options.name = Viking.View.tagNameForModelAttribute(this.model, attribute, { namespace: this.options.namespace });
	        }

	        return Viking.View.Helpers.textArea(this.model, attribute, options);
	    },

	    textField: function textField(attribute, options) {
	        options || (options = {});

	        if (!options.name && this.options.namespace) {
	            options.name = Viking.View.tagNameForModelAttribute(this.model, attribute, { namespace: this.options.namespace });
	        }

	        return Viking.View.Helpers.textField(this.model, attribute, options);
	    },

	    checkBoxGroup: function checkBoxGroup(attribute, options, content) {
	        if (typeof options === 'function') {
	            content = options;
	            options = {};
	        }

	        if (!options.namespace && this.options.namespace) {
	            options.namespace = this.options.namespace;
	        }

	        return Viking.View.Helpers.checkBoxGroup(this.model, attribute, options, content);
	    },

	    fieldsFor: function fieldsFor(attribute, records, options, content) {
	        var _this = this;

	        var builder = void 0;

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
	            var _ret = function () {
	                var superOptions = _this.options;
	                var parentModel = _this.model;
	                records || (records = _this.model.get(attribute));
	                if (records instanceof Viking.Collection) {
	                    records = records.models;
	                }

	                return {
	                    v: _.map(records, function (model) {
	                        var localOptions = _.extend({ 'as': null }, options);
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
	                    }).join('')
	                };
	            }();

	            if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
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
	var textFieldTag = function textFieldTag(name, value, options, escape) {

	    // Handle both `name, value` && `name, options` style arguments
	    if (value !== null && (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object' && !(value instanceof Backbone.Model)) {
	        options = value;
	        value = undefined;
	    }

	    return tag('input', _.extend({
	        "type": 'text',
	        "id": sanitizeToId(name),
	        "name": name,
	        "value": value
	    }, options), escape);
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
	var textField = function textField(model, attribute, options) {
	    if (options === undefined) {
	        options = {};
	    }
	    addErrorClassToOptions(model, attribute, options);

	    var name = options['name'] || tagNameForModelAttribute(model, attribute);
	    var value = model.get(attribute);
	    value = value && (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object' ? value.toString() : value;
	    return textFieldTag(name, value, options);
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
	var contentTag = function contentTag(name, content, options, escape) {
	    var tmp = void 0;

	    // Handle `name, content`, `name, content, options`,
	    // `name, content, options, escape`, `name, content, escape`, `name, block`,
	    // `name, options, block`, `name, options, escape, block`, && `name, escape, block`
	    // style arguments
	    if (typeof content === "boolean") {
	        escape = content;
	        content = options;
	        options = undefined;
	    } else if ((typeof content === 'undefined' ? 'undefined' : _typeof(content)) === 'object') {
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

	    return "<" + name + tagOptions(options, escape) + ">" + content + "</" + name + ">";
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
	var buttonTag = function buttonTag(content, options) {
	    var tmp = void 0;

	    // Handle `content, options` && `options` style arguments
	    if ((typeof content === 'undefined' ? 'undefined' : _typeof(content)) === 'object') {
	        tmp = options;
	        options = content;
	        content = tmp;
	    } else if (options === undefined) {
	        options = {};
	    }

	    _.defaults(options, { name: 'button', type: 'submit' });
	    return contentTag('button', content, options);
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
	var hiddenFieldTag = function hiddenFieldTag(name, value, options, escape) {
	    if (options === undefined) {
	        options = {};
	    }
	    _.defaults(options, { type: "hidden", id: null });

	    return textFieldTag(name, value, options, escape);
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
	var formTag = function formTag(options, content) {
	    var tmp = void 0,
	        methodOverride = '';

	    if (typeof options === 'function' || typeof options === 'string') {
	        tmp = content;
	        content = options;
	        options = tmp;
	    }
	    options || (options = {});

	    if (options.action && !options.method) {
	        options.method = 'post';
	    } else if (options.method && options.method !== 'get' && options.method !== 'post') {
	        methodOverride = hiddenFieldTag('_method', options.method);
	        options.method = 'post';
	    }

	    if (options.multipart) {
	        options.enctype = "multipart/form-data";
	        delete options.multipart;
	    }

	    if (content !== undefined) {
	        content = methodOverride + (typeof content === 'function' ? content() : content);

	        return contentTag('form', content, options, false);
	    }

	    return tag('form', options, false) + methodOverride;
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
	var labelTag = function labelTag(content, options, escape) {
	    var tmp = void 0;

	    if (typeof options === 'function') {
	        tmp = content;
	        content = options;
	        options = tmp;
	    }

	    return contentTag('label', content, options, escape);
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
	var numberFieldTag = function numberFieldTag(name, value, options) {

	    // Handle both `name, value, options`, and `name, options` syntax
	    if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object') {
	        options = value;
	        value = undefined;
	    }

	    options = _.extend({ type: 'number' }, options);
	    if (value) {
	        options.value = value;
	    }

	    return textFieldTag(name, value, options);
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
	var optionsForSelectTag = function optionsForSelectTag(container, selected) {
	    var disabled = void 0;
	    var arrayWrap = function arrayWrap(data) {
	        if (_.isArray(data)) {
	            return data;
	        }
	        return [data];
	    };

	    if ((typeof selected === 'undefined' ? 'undefined' : _typeof(selected)) !== 'object' && typeof selected !== 'function') {
	        selected = arrayWrap(selected);
	    } else if (!_.isArray(selected) && typeof selected !== 'function') {
	        disabled = typeof selected.disabled === 'function' ? selected.disabled : arrayWrap(selected.disabled);
	        selected = typeof selected.selected === 'function' ? selected.selected : arrayWrap(selected.selected);
	    }

	    if (_.isArray(container)) {
	        return _.map(container, function (text) {
	            var value = void 0,
	                options = {};
	            if (_.isArray(text)) {
	                if (_typeof(_.last(text)) === 'object') {
	                    options = text.pop();
	                }
	                if (text.length === 2) {
	                    options.value = value = text[1];
	                    text = text[0];
	                } else {
	                    value = text = text[0];
	                }
	            } else {
	                value = text;
	            }

	            if (typeof selected === 'function') {
	                if (selected(value)) {
	                    options.selected = true;
	                }
	            } else if (_.contains(selected, value)) {
	                options.selected = true;
	            }
	            if (typeof disabled === 'function') {
	                if (disabled(value)) {
	                    options.disabled = true;
	                }
	            } else if (_.contains(disabled, value)) {
	                options.disabled = true;
	            }

	            return contentTag('option', text, options);
	        }).join("\n");
	    }

	    return _.map(container, function (value, text) {
	        var options = { value: value };

	        if (typeof selected === 'function') {
	            if (selected(value)) {
	                options.selected = true;
	            }
	        } else if (_.contains(selected, value)) {
	            options.selected = true;
	        }
	        if (typeof disabled === 'function') {
	            if (disabled(value)) {
	                options.disabled = true;
	            }
	        } else if (_.contains(disabled, value)) {
	            options.disabled = true;
	        }

	        return contentTag('option', text, options);
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
	var optionsFromCollectionForSelectTag = function optionsFromCollectionForSelectTag(collection, valueAttribute, textAttribute, selected) {
	    var selectedForSelect = void 0;

	    var options = collection.map(function (model) {
	        return [methodOrAttribute(model, textAttribute), methodOrAttribute(model, valueAttribute)];
	    });

	    if (_.isArray(selected)) {
	        selectedForSelect = selected;
	    } else if ((typeof selected === 'undefined' ? 'undefined' : _typeof(selected)) === 'object') {
	        selectedForSelect = {
	            selected: selected.selected,
	            disabled: selected.disabled
	        };
	    } else {
	        selectedForSelect = selected;
	    }

	    return optionsForSelectTag(options, selectedForSelect);
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
	var passwordFieldTag = function passwordFieldTag(name, value, options) {
	    if (name === undefined) {
	        name = 'password';
	    }
	    if (options === undefined) {
	        options = {};
	    }
	    _.defaults(options, { type: "password" });

	    return textFieldTag(name, value, options);
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
	var radioButtonTag = function radioButtonTag(name, value, checked, options) {
	    if (options === undefined) {
	        options = {};
	    }
	    if (checked === true) {
	        options.checked = true;
	    }
	    _.defaults(options, {
	        type: "radio",
	        value: value,
	        name: name,
	        id: sanitizeToId(name)
	    });

	    return tag("input", options);
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
	var selectTag = function selectTag(name, optionTags, options) {
	    var tagName = name;
	    if (options === undefined) {
	        options = {};
	    }
	    if (options.multiple && tagName.slice(-2) !== "[]") {
	        tagName = tagName + "[]";
	    }
	    _.defaults(options, {
	        id: sanitizeToId(name),
	        name: tagName
	    });

	    if (options.includeBlank) {
	        var content = typeof options.includeBlank == "string" ? options.includeBlank : "";
	        optionTags = contentTag('option', content, { value: '' }) + optionTags;
	        delete options.includeBlank;
	    }

	    if (options.prompt) {
	        if (options.prompt === true) {
	            options.prompt = 'Select';
	        }
	        optionTags = contentTag('option', options.prompt, { value: '' }) + optionTags;
	        delete options.prompt;
	    }

	    return contentTag('select', optionTags, options, false);
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
	var submitTag = function submitTag(value, options) {
	    if (options === undefined) {
	        options = {};
	    }
	    if (!value) {
	        value = 'Save';
	    }
	    _.defaults(options, {
	        type: 'submit',
	        name: 'commit',
	        id: null,
	        value: value
	    });

	    return tag('input', options);
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
	var textAreaTag = function textAreaTag(name, content, options, escape) {
	    if (options === undefined) {
	        options = {};
	    }
	    if (escape === undefined) {
	        escape = true;
	    }
	    _.defaults(options, {
	        id: sanitizeToId(name),
	        name: name
	    });

	    if (options.size) {
	        options.cols = options.size.split('x')[0];
	        options.rows = options.size.split('x')[1];
	        delete options.size;
	    }

	    if (escape) {
	        content = _.escape(content);
	    }

	    return contentTag('textarea', content, options, false);
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
	var timeTag = function timeTag(date, content, options) {
	    var tmp = void 0;

	    // handle both (date, opts, func || str) and (date, func || str, opts)
	    if ((typeof content === 'undefined' ? 'undefined' : _typeof(content)) === 'object') {
	        tmp = options;
	        options = content;
	        content = tmp;
	    }
	    options || (options = {});

	    if (!content) {
	        content = options.format ? date.strftime(options.format) : date.toString();
	    }
	    if (options.format) {
	        delete options.format;
	    }
	    if (!options.datetime) {
	        options.datetime = date.toISOString();
	    }

	    return contentTag('time', content, options);
	};

	// The Viking gloval namespace for tracking created models, collections, etc...
	var templates = {};

	var render = function render(templatePath, locals) {
	    var template = templates[templatePath];

	    if (!locals) {
	        locals = {};
	    }

	    if (template) {
	        return template(_.extend(locals, Helpers));
	    }

	    throw new Error('Template does not exist: ' + templatePath);
	};

	var Helpers = {
	    // Asset Helpers
	    imageTag: imageTag,

	    // Builders
	    CheckBoxGroupBuilder: CheckBoxGroupBuilder,
	    FormBuilder: FormBuilder,

	    // Form Helpers
	    textField: textField,

	    // Utils
	    tagOption: tagOption,
	    dataTagOption: dataTagOption,
	    tagOptions: tagOptions,
	    sanitizeToId: sanitizeToId,
	    tagNameForModelAttribute: tagNameForModelAttribute,
	    addErrorClassToOptions: addErrorClassToOptions,
	    methodOrAttribute: methodOrAttribute,

	    // Form Tag Helpers
	    buttonTag: buttonTag,
	    checkBoxTag: checkBoxTag,
	    contentTag: contentTag,
	    formTag: formTag,
	    hiddenFieldTag: hiddenFieldTag,
	    labelTag: labelTag,
	    numberFieldTag: numberFieldTag,
	    optionsForSelectTag: optionsForSelectTag,
	    optionsFromCollectionForSelectTag: optionsFromCollectionForSelectTag,
	    passwordFieldTag: passwordFieldTag,
	    radioButtonTag: radioButtonTag,
	    selectTag: selectTag,
	    submitTag: submitTag,
	    tag: tag,
	    textAreaTag: textAreaTag,
	    textFieldTag: textFieldTag,
	    timeTag: timeTag,

	    // Render
	    render: render
	};

	// TODO: Remove utils from Viking.View, not sure why they are added to it.
	// Viking.View
	// -----------
	//
	// Viking.View is a framework fro handling view template lookup and rendering.
	// It provides view helpers that assisst when building HTML forms and more.
	var View = Backbone.View.extend({

	    template: undefined,

	    renderTemplate: function renderTemplate(locals) {
	        return Helpers.render(this.template, locals);
	    },

	    //Copied constructor from Backbone View
	    constructor: function constructor(options) {
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
	    subView: function subView(SubView, options) {
	        var view = new SubView(options);
	        this.subViews.push(view);
	        this.listenTo(view, 'remove', this.removeSubView);
	        return view;
	    },

	    // Removes the subview from the array and stop listening to it, and calls
	    // #remove on the subview.
	    removeSubView: function removeSubView(view) {
	        this.subViews = _.without(this.subViews, view);
	        this.stopListening(view);
	        view.remove();
	    },

	    // Remove all subviews when remove this view. We don't call stopListening
	    // here because this view is being removed anyways so those will get cleaned
	    // up by Backbone.
	    remove: function remove() {
	        while (this.subViews.length > 0) {
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
	    bindEl: function bindEl(attributes, selector, render) {
	        var view = this;
	        render || (render = function render(model) {
	            return model.get(attributes);
	        });
	        if (!_.isArray(attributes)) {
	            attributes = [attributes];
	        }

	        //TODO: might want to Debounce because of some inputs being very rapid
	        // but maybe that should be left up to the user changes (ie textareas like description)
	        _.each(attributes, function (attribute) {
	            view.listenTo(view.model, 'change:' + attribute, function (model) {
	                view.$(selector).html(render(model));
	            });
	        });
	    }

	    //TODO: Default render can just render template
	}, {

	    // `Viking.View.templates` is used for storing templates.
	    // `Viking.View.Helpers.render` looks up templates in this
	    // variable
	    templates: templates,

	    // registerTemplate: function (path, template) {
	    //     templates[path] = template;
	    // },

	    // Override the original extend function to support merging events
	    extend: function extend(protoProps, staticProps) {
	        if (protoProps && protoProps.events) {
	            _.defaults(protoProps.events, this.prototype.events);
	        }

	        return Backbone.View.extend.call(this, protoProps, staticProps);
	    },

	    urlFor: urlFor,
	    tagOption: tagOption,
	    dataTagOption: dataTagOption,
	    tagOptions: tagOptions,
	    sanitizeToId: sanitizeToId,
	    tagNameForModelAttribute: tagNameForModelAttribute,
	    addErrorClassToOptions: addErrorClassToOptions,
	    methodOrAttribute: methodOrAttribute

	});

	View.Helpers = Helpers;

	var Cursor = Backbone.Model.extend({
	    defaults: {
	        "page": 1,
	        "per_page": 25
	    },

	    reset: function reset(options) {
	        this.set({
	            page: 1
	        }, { silent: true });

	        if (!(options && options.silent) && this.requiresRefresh()) {
	            this.trigger('reset', this, options);
	        }
	    },

	    incrementPage: function incrementPage(options) {
	        this.set('page', this.get('page') + 1, options);
	    },

	    decrementPage: function decrementPage(options) {
	        this.set('page', this.get('page') - 1, options);
	    },

	    goToPage: function goToPage(pageNumber, options) {
	        this.set('page', pageNumber, options);
	    },

	    limit: function limit() {
	        return this.get('per_page');
	    },

	    offset: function offset() {
	        return this.get('per_page') * (this.get('page') - 1);
	    },

	    totalPages: function totalPages() {
	        return Math.ceil(this.get('total_count') / this.limit());
	    },

	    requiresRefresh: function requiresRefresh() {
	        var changedAttributes = this.changedAttributes();
	        if (changedAttributes) {
	            var triggers = ['page', 'per_page'];
	            return _.intersection(_.keys(changedAttributes), triggers).length > 0;
	        }

	        return false;
	    }

	});

	var Controller$1 = Backbone.Model.extend({

	    // Below is the same code from the Backbone.Model function
	    // except where there are comments
	    constructor: function constructor(attributes, options) {
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
	    extend: function extend(controllerName, protoProps, staticProps) {
	        if (typeof controllerName !== 'string') {
	            staticProps = protoProps;
	            protoProps = controllerName;
	        }
	        protoProps || (protoProps = {});

	        var child = Backbone.Model.extend.call(this, protoProps, staticProps);

	        if (typeof controllerName === 'string') {
	            child.controllerName = controllerName;
	        }

	        _.each(protoProps, function (value, key) {
	            if (typeof value === 'function') {
	                child.prototype[key].controller = child;
	            }
	        });

	        return child;
	    }

	});

	// export let currentController;

	var Router = Backbone.Router.extend({

	    currentController: undefined,

	    route: function route(_route, name, callback) {
	        var router = void 0,
	            controller = void 0,
	            action = void 0;

	        if (!_.isRegExp(_route)) {
	            if (/^r\/.*\/$/.test(_route)) {
	                _route = new RegExp(_route.slice(2, -1));
	            } else {
	                _route = this._routeToRegExp(_route);
	            }
	        }

	        if (_.isFunction(name)) {
	            callback = name;
	            name = '';
	        } else if (_.isString(name) && name.match(/^(\w+)#(\w+)$/)) {
	            controller = /^(\w+)#(\w+)$/.exec(name);
	            action = controller[2];
	            controller = controller[1];
	            callback = { controller: controller, action: action };
	        } else if (_.isObject(name)) {
	            // TODO: maybe this should be Controller::action since it's not
	            // an instance method
	            controller = /^(\w+)#(\w+)$/.exec(name.to);
	            action = controller[2];
	            controller = controller[1];
	            name = name.name;

	            callback = { controller: controller, action: action };
	        }

	        if (!callback) {
	            callback = this[name];
	        }

	        router = this;
	        Backbone.history.route(_route, function (fragment) {
	            var controllerClass = void 0;
	            var args = router._extractParameters(_route, fragment);
	            var previousController = router.currentController;
	            router.currentController = undefined;

	            if (!callback) {
	                return;
	            }

	            if (_.isFunction(callback)) {
	                callback.apply(router, args);
	            } else if (window[callback.controller]) {
	                controllerClass = window[callback.controller];

	                if (controllerClass.__super__ === Controller$1.prototype) {
	                    if (!(previousController instanceof controllerClass)) {
	                        router.currentController = new controllerClass();
	                    } else {
	                        router.currentController = previousController;
	                    }
	                } else {
	                    router.currentController = controllerClass;
	                }

	                if (router.currentController && router.currentController[callback.action]) {
	                    router.currentController[callback.action].apply(router.currentController, args);
	                }
	            }

	            router.trigger.apply(router, ['route:' + name].concat(args));
	            router.trigger('route', name, args);
	            Backbone.history.trigger('route', router, name, args);
	        });
	        return this;
	    },

	    // Calls Backbone.history.start, with the default options {pushState: true}
	    start: function start(options) {
	        options = _.extend({ pushState: true }, options);

	        return Backbone.history.start(options);
	    },

	    stop: function stop() {
	        Backbone.history.stop();
	    },

	    navigate: function navigate(fragment, args) {
	        var root_url = window.location.protocol + '//' + window.location.host;
	        if (fragment.indexOf(root_url) === 0) {
	            fragment = fragment.replace(root_url, '');
	        }

	        Backbone.Router.prototype.navigate.call(this, fragment, args);
	    }

	});

	var PaginatedCollection = Collection.extend({

	    constructor: function constructor(models, options) {
	        Collection.apply(this, arguments);
	        this.cursor = options && options.cursor || new Cursor();
	        this.listenTo(this.cursor, 'change', function () {
	            if (this.cursor.requiresRefresh()) {
	                this.cursorChanged.apply(this, arguments);
	            }
	        });
	    },

	    predicateChanged: function predicateChanged(predicate, options) {
	        this.cursor.reset({ silent: true });
	        this.cursorChanged();
	    },

	    cursorChanged: function cursorChanged(cursor, options) {
	        this.fetch();
	    },

	    parse: function parse(attrs, xhr) {
	        this.cursor.set({
	            total_count: parseInt(xhr.xhr.getResponseHeader('Total-Count'))
	        });

	        return attrs;
	    },

	    sync: function sync(method, model, options) {
	        if (method === 'read') {
	            options.data || (options.data = {});
	            options.data.limit = model.cursor.limit();
	            options.data.offset = model.cursor.offset();
	            options.headers || (options.headers = {});
	            options.headers['Total-Count'] = 'true';
	        }
	        return Collection.prototype.sync.call(this, method, model, options);
	    }

	});

	var Viking$1 = {
	    sync: vikingSync,
	    Model: Model,
	    Cursor: Cursor,
	    Collection: Collection,
	    Predicate: Predicate,
	    PaginatedCollection: PaginatedCollection,
	    Controller: Controller$1,
	    Router: Router,
	    View: View
	};

	module("Viking.Model#fetch", {
	    setup: function setup() {
	        this.requests = [];
	        this.xhr = sinon.useFakeXMLHttpRequest();
	        this.xhr.onCreate = _.bind(function (xhr) {
	            this.requests.push(xhr);
	        }, this);
	    },
	    teardown: function teardown() {
	        this.xhr.restore();
	    }
	});

	test("calls Backbone.Collection#fetch", function () {
	    expect(1);

	    var vc = new Viking$1.Collection();
	    var oldFetch = Backbone.Collection.prototype.fetch;
	    Backbone.Collection.prototype.fetch = function () {
	        ok(true);
	    };

	    vc.fetch();

	    Backbone.Collection.prototype.fetch = oldFetch;
	});

	test("set this.xhr", function () {
	    var vc = new Viking$1.Collection();
	    equal(undefined, vc.xhr);
	    vc.fetch({ url: '/' });
	    notEqual(undefined, vc.xhr);
	});

	test("deletes this.xhr after xhr is complete", function () {
	    var vc = new Viking$1.Collection();
	    equal(undefined, vc.xhr);
	    vc.fetch({ url: '/' });
	    notEqual(undefined, vc.xhr);
	    this.requests[0].respond(200, '[]', 'OK');
	    equal(undefined, vc.xhr);
	});

	test("aborts previous xhr if in process and #fetch is called again", function () {
	    var vc = new Viking$1.Collection();
	    equal(undefined, vc.xhr);
	    vc.fetch({ url: '/' });
	    equal('pending', vc.xhr.state());
	    var oldxhr = vc.xhr;
	    vc.fetch({ url: '/' });
	    equal('abort', oldxhr.statusText);
	    equal('pending', vc.xhr.state());
	    this.requests[1].respond(200, '[]', 'OK');
	    equal(undefined, vc.xhr);
	});

	(function () {
	    module("Viking.Collection::new");

	    test("([], {order: ORDER}) sets ordering by calling #order(ORDER)", function () {
	        expect(1);

	        var Collection = Viking$1.Collection.extend({
	            order: function order(_order) {
	                equal(_order, 'data');
	            }
	        });

	        var c = new Collection([], { order: 'data' });
	    });

	    test("([], {order: ORDER}) calls #order with the options {silent: true}", function () {
	        expect(1);

	        var Collection = Viking$1.Collection.extend({
	            order: function order(_order2, options) {
	                deepEqual(options, { silent: true });
	            }
	        });

	        new Collection([], { order: 'data' });
	    });
	})();

	(function () {
	    module("Viking.Collection#order", {
	        setup: function setup() {
	            this.oldFetch = Viking$1.Collection.prototype.fetch;
	            Viking$1.Collection.prototype.fetch = function () {};
	        },
	        teardown: function teardown() {
	            Viking$1.Collection.prototype.fetch = this.oldFetch;
	        }
	    });

	    test("order(string) sets ordering on collection", function () {
	        var vc = new Viking$1.Collection();

	        vc.order('size');

	        deepEqual(vc.ordering, [{ size: 'asc' }]);
	    });

	    test("order([string]) sets ordering on collection", function () {
	        var vc = new Viking$1.Collection();

	        vc.order(['size']);

	        deepEqual(vc.ordering, [{ size: 'asc' }]);
	    });

	    test("order([string, string]) sets ordering on collection", function () {
	        var vc = new Viking$1.Collection();

	        vc.order(['size', 'id']);

	        deepEqual(vc.ordering, [{ size: 'asc' }, { id: 'asc' }]);
	    });

	    test("order({key: direction}) sets ordering on collection", function () {
	        var vc = new Viking$1.Collection();

	        vc.order({ updated_at: 'asc' });
	        deepEqual(vc.ordering, [{ updated_at: 'asc' }]);

	        vc.order({ updated_at: 'desc' });
	        deepEqual(vc.ordering, [{ updated_at: 'desc' }]);
	    });

	    test("order([{key: direction}]) sets ordering on collection", function () {
	        var vc = new Viking$1.Collection();

	        vc.order([{ updated_at: 'asc' }]);
	        deepEqual(vc.ordering, [{ updated_at: 'asc' }]);

	        vc.order([{ updated_at: 'desc' }]);
	        deepEqual(vc.ordering, [{ updated_at: 'desc' }]);
	    });

	    test("order([{key: direction}, {key: direction}]) sets ordering on collection", function () {
	        var vc = new Viking$1.Collection();

	        vc.order([{ updated_at: 'asc' }, { size: 'desc' }]);

	        deepEqual(vc.ordering, [{ updated_at: 'asc' }, { size: 'desc' }]);
	    });

	    test("order(null) unsets ordering on collection", function () {
	        var vc = new Viking$1.Collection();

	        vc.order(null);

	        deepEqual(vc.ordering, undefined);
	    });

	    test("order(...) calls orderChanged", function () {
	        expect(1);

	        var vc = new Viking$1.Collection();
	        var oldOrder = Viking$1.Collection.prototype.orderChanged;
	        Viking$1.Collection.prototype.orderChanged = function () {
	            ok(true);
	        };

	        vc.order('size');

	        Viking$1.Collection.prototype.orderChanged = oldOrder;
	    });

	    test("order(...) and not changing the order doesn't call orderChanged", function () {
	        expect(0);

	        var vc = new Viking$1.Collection(null, { order: 'size' });
	        var oldOrder = Viking$1.Collection.prototype.orderChanged;
	        Viking$1.Collection.prototype.orderChanged = function () {
	            ok(true);
	        };

	        vc.order('size');

	        Viking$1.Collection.prototype.orderChanged = oldOrder;
	    });

	    test("order(ORDER, {silent: true}) doesn't call orderChanged", function () {
	        expect(0);

	        var vc = new Viking$1.Collection();
	        var oldOrder = Viking$1.Collection.prototype.orderChanged;
	        Viking$1.Collection.prototype.orderChanged = function () {
	            ok(true);
	        };

	        vc.order('size', { silent: true });

	        Viking$1.Collection.prototype.orderChanged = oldOrder;
	    });
	})();

	(function () {
	    module("Viking.Model predicate");

	    test("new Viking.Model(options) calls setPredicate(options.predicate) if in options", function () {
	        expect(1);

	        var Collection = Viking$1.Collection.extend({
	            setPredicate: function setPredicate(predicate) {
	                equal(predicate, 'data');
	            }
	        });

	        var c = new Collection([], { predicate: 'data' });
	    });

	    test("#setPredicate sets predicate", function () {
	        var vc = new Viking$1.Collection();
	        var predicate = new Viking$1.Predicate();
	        vc.setPredicate(predicate, { silent: true });

	        equal(vc.predicate, predicate);
	    });

	    test("#setPredicate accepts a instanceof Viking.Predicate", function () {
	        var predicate = new Viking$1.Predicate();
	        var vc = new Viking$1.Collection();

	        vc.setPredicate(predicate, { silent: true });
	        equal(predicate, vc.predicate);
	    });

	    test("#setPredicate accepts attributes to construct a Viking.Predicate", function () {
	        var vc = new Viking$1.Collection();

	        vc.setPredicate({}, { silent: true });
	        ok(vc.predicate instanceof Viking$1.Predicate);
	    });

	    test("#setPredicate removes old predicate callbacks", function () {
	        expect(0);

	        var collection = Viking$1.Collection.extend({
	            predicateChanged: function predicateChanged() {
	                ok(true);
	            }
	        });
	        var predicate = new Viking$1.Predicate();
	        var vc = new collection([], { predicate: predicate });
	        vc.setPredicate(new Viking$1.Predicate(), { silent: true });

	        predicate.trigger('change');
	    });

	    test("#setPredicate to a falsey value removes the predicate", function () {
	        var collection = Viking$1.Collection.extend({
	            predicateChanged: function predicateChanged() {}
	        });
	        var vc = new collection([], { predicate: {} });
	        vc.setPredicate(null);
	        equal(undefined, vc.predicate);
	    });

	    test("changing the predicate triggers a fetch", function () {
	        expect(1);

	        var collection = Viking$1.Collection.extend({
	            fetch: function fetch(options) {
	                ok(true);
	            }
	        });
	        var predicate = new Viking$1.Predicate();
	        var vc = new collection([], { predicate: predicate });
	        predicate.trigger('change');
	    });

	    test("#setPredicate triggers #predicateChanged when setting to a new Predicate", function () {
	        expect(1);

	        var collection = Viking$1.Collection.extend({
	            predicateChanged: function predicateChanged(options) {
	                ok(true);
	            }
	        });
	        var vc = new collection();

	        vc.setPredicate(new Viking$1.Predicate());
	    });

	    test("#setPredicate doesn't trigger #predicateChanged when setting to a the same predicate object", function () {
	        expect(0);

	        var predicate = new Viking$1.Predicate();
	        var collection = Viking$1.Collection.extend({
	            predicateChanged: function predicateChanged(options) {
	                ok(true);
	            }
	        });
	        var vc = new collection([], { predicate: predicate });

	        vc.setPredicate(predicate);
	    });

	    test("#setPredicate triggers predicateChanged() when removing the predicate", function () {
	        expect(1);

	        var collection = Viking$1.Collection.extend({
	            predicateChanged: function predicateChanged(options) {
	                ok(true);
	            }
	        });
	        var vc = new collection([], { predicate: {} });

	        vc.setPredicate(null);
	    });

	    test("#setPredicate doesn't trigger #predicateChanged when removing and not predicate set", function () {
	        expect(0);

	        var collection = Viking$1.Collection.extend({
	            predicateChanged: function predicateChanged(options) {
	                ok(true);
	            }
	        });
	        var vc = new collection([]);

	        vc.setPredicate(null);
	    });

	    test("#setPredicate to predicate with options.silent = true doesn't trigger #predicateChanged", function () {
	        expect(0);

	        var collection = Viking$1.Collection.extend({
	            predicateChanged: function predicateChanged(options) {
	                ok(true);
	            }
	        });
	        var vc = new collection();

	        vc.setPredicate({}, { silent: true });
	    });

	    test("#setPredicate to undefined with options.silent = true doesn't trigger #predicateChanged", function () {
	        expect(0);

	        var collection = Viking$1.Collection.extend({
	            predicateChanged: function predicateChanged(options) {
	                ok(true);
	            }
	        });
	        var vc = new collection([], { predicate: {} });

	        vc.setPredicate(null, { silent: true });
	    });
	})();

	(function () {
	    module("Viking.Collection#sync", {
	        setup: function setup() {
	            this.requests = [];
	            this.xhr = sinon.useFakeXMLHttpRequest();
	            this.xhr.onCreate = _.bind(function (xhr) {
	                this.requests.push(xhr);
	            }, this);
	        },
	        teardown: function teardown() {
	            this.xhr.restore();
	        }
	    });

	    test("adds in order params when set", function () {
	        var vc = new Viking$1.Collection(null, { order: 'size' });

	        vc.fetch({ url: '/' });
	        equal("/?" + encodeURI("order[][size]=asc"), this.requests[0].url);
	    });

	    test("doesn't add order params when not set", function () {
	        var vc = new Viking$1.Collection();

	        vc.fetch({ url: '/' });
	        equal("/", this.requests[0].url);
	    });

	    test("adds in predicate params when set", function () {
	        expect(1);

	        var m = Viking$1.Model.extend('model');
	        var f = new Viking$1.Predicate({ types: [1, 2] });
	        var c = Viking$1.Collection.extend({ model: m });
	        var c = new c([], { predicate: f });

	        var old = Viking$1.sync;
	        Viking$1.sync = function (method, model, options) {
	            deepEqual(options.data, { where: { types: [1, 2] } });
	        };
	        c.fetch();
	        Viking$1.sync = old;
	    });

	    test("doesn't add predicate params when not set", function () {
	        expect(1);

	        var m = Viking$1.Model.extend('model');
	        var c = Viking$1.Collection.extend({ model: m });
	        var c = new c();

	        var old = Viking$1.sync;
	        Viking$1.sync = function (method, model, options) {
	            equal(options.data, undefined);
	        };
	        c.fetch();
	        Viking$1.sync = old;
	    });

	    test("#sync uses Viking.sync", function () {
	        expect(1);

	        var c = new Viking$1.Collection();

	        var old = Viking$1.sync;
	        Viking$1.sync = function (method, model, options) {
	            ok(true);
	        };
	        c.sync();
	        Viking$1.sync = old;
	    });
	})();

	(function () {
	    module("Viking.Collection");

	    // Url -----------------------------------------------------------------------
	    test("url based on model.modelName", function () {
	        var m = Viking$1.Model.extend('model');
	        var mc = Viking$1.Collection.extend({
	            model: m
	        });

	        var c = new mc();

	        equal('/models', c.url());
	    });

	    test("url based on model.modelName", function () {
	        var m = Viking$1.Model.extend('model');
	        var mc = Viking$1.Collection.extend({
	            model: m
	        });

	        var c = new mc();

	        equal('/models', c.url());
	    });

	    // paramRoot -----------------------------------------------------------------
	    test("paramRoot based on model.modelName", function () {
	        var m = Viking$1.Model.extend('model');
	        var mc = Viking$1.Collection.extend({
	            model: m
	        });

	        var c = new mc();

	        equal('models', c.paramRoot());
	    });

	    // select() ------------------------------------------------------------------
	    test("select(model) sets 'selected' to true on the model", function () {
	        var c = new Viking$1.Collection([{}, {}]);
	        var model = c.models[0];
	        c.select(model);

	        ok(model.selected);
	    });

	    test("select(model) sets 'selected' to false other models", function () {
	        var c = new Viking$1.Collection([{}, {}, {}]);
	        var models = c.models;
	        models[0].selected = true;
	        models[1].selected = true;
	        models[2].selected = true;

	        ok(models[0].selected);
	        ok(models[1].selected);
	        ok(models[2].selected);

	        c.select(models[1]);

	        ok(!models[0].selected);
	        ok(models[1].selected);
	        ok(!models[2].selected);
	    });

	    test("select(model, {multiple: true}) doesn't unselect other models", function () {
	        var c = new Viking$1.Collection([{}, {}, {}]);
	        var models = c.models;

	        c.select(models[0]);
	        c.select(models[1], { multiple: true });
	        c.select(models[2], { multiple: true });

	        ok(models[0].selected);
	        ok(models[1].selected);
	        ok(models[2].selected);
	    });

	    test("select(model) triggers a 'selected' event on collection", function () {
	        expect(1);

	        var c = new Viking$1.Collection([{}]);
	        var model = c.models[0];
	        c.on('selected', function () {
	            ok(model.selected);
	        });
	        c.select(model);
	        c.off('selected');
	    });

	    test("select(model) triggers a 'selected' event on collection only if change", function () {
	        expect(0);

	        var c = new Viking$1.Collection([{}]);
	        c.models[0].selected = true;
	        c.on('selected', function () {
	            ok(true);
	        });
	        c.select(c.models[0]);
	        c.off('selected');
	    });

	    test("model.unselect() triggers a 'unselected' event on collection", function () {
	        expect(1);

	        var c = new Viking$1.Collection([{}]);
	        var model = c.models[0];
	        model.selected = true;
	        c.on('unselected', function () {
	            ok(!model.selected);
	        });
	        model.unselect();
	        c.off('unselected');
	    });

	    test("model.unselect() triggers a 'unselected' event on collection only if change", function () {
	        expect(0);

	        var c = new Viking$1.Collection([{}]);
	        c.on('unselected', function () {
	            ok(true);
	        });
	        c.models[0].select(c.models[0]);
	        c.off('unselected');
	    });

	    test("selected() only returns selected models", function () {
	        var c = new Viking$1.Collection([{}, {}, {}]);
	        var models = c.models;

	        c.select(models[0]);
	        var selected = c.selected();
	        equal(1, selected.length);
	        equal(c.models[0].cid, selected[0].cid);

	        c.select(models[1], { multiple: true });
	        c.select(models[2], { multiple: true });

	        selected = c.selected();
	        equal(3, selected.length);
	        equal(c.models[0].cid, selected[0].cid);
	        equal(c.models[1].cid, selected[1].cid);
	        equal(c.models[2].cid, selected[2].cid);
	    });

	    // clearSelected() ------------------------------------------------------------
	    test("clearSelected() set 'selected' to false on all models", function () {
	        var c = new Viking$1.Collection([{}, {}, {}]);
	        c.models[0].selected = true;
	        c.models[1].selected = true;
	        c.models[2].selected = true;

	        equal(3, c.selected().length);
	        c.clearSelected();
	        equal(0, c.selected().length);
	    });

	    test("clearSelected(except) set 'selected' to false on all models", function () {
	        var c = new Viking$1.Collection([{}, {}, {}]);
	        c.models[0].selected = true;
	        c.models[1].selected = true;
	        c.models[2].selected = true;

	        var model = c.models[1];
	        equal(3, c.selected().length);
	        c.clearSelected(model);
	        equal(1, c.selected().length);
	    });

	    test("clearSelected() triggers 'unselected' event on all models", function () {
	        expect(2);

	        var c = new Viking$1.Collection([{}, {}, {}]);
	        c.models[0].selected = false;
	        c.models[1].selected = true;
	        c.models[2].selected = true;
	        c.models[0].on('unselected', function () {
	            ok(true);
	        });
	        c.models[1].on('unselected', function () {
	            ok(true);
	        });
	        c.models[2].on('unselected', function () {
	            ok(true);
	        });

	        c.clearSelected();

	        c.models[0].off('unselected');
	        c.models[1].off('unselected');
	        c.models[2].off('unselected');
	    });

	    test("decrementPage options get passed to callbacks", function () {
	        expect(2);

	        var c = new Viking$1.Cursor();
	        c.on('change', function (model, options) {
	            deepEqual({ remove: false }, options);
	        });
	        c.on('change:page', function (model, value, options) {
	            deepEqual({ remove: false }, options);
	        });
	        c.decrementPage({ remove: false });
	        c.off('change');
	        c.off('change:page');
	    });

	    // set -----------------------------------------------------------------------
	    test("predicate.set() options get passed to predicateChanged", function () {
	        expect(3);

	        var f = new Viking$1.Predicate();
	        var m = Viking$1.Model.extend('model');
	        var c = Viking$1.Collection.extend({
	            model: m,
	            predicateChanged: function predicateChanged(model, options) {
	                deepEqual({ remove: false }, options);
	            }
	        });
	        var c = new c([], { predicate: f });

	        f.on('change', function (model, options) {
	            deepEqual({ remove: false }, options);
	        });
	        f.on('change:query', function (model, value, options) {
	            deepEqual({ remove: false }, options);
	        });
	        f.set('query', 'Дорогой', { remove: false });
	        f.off('change');
	        f.off('change:query');
	    });
	})();

	(function () {
	    module("Viking.Controller");

	    test("::extend acts like normal Backbone.Model", function () {
	        var Controller = Viking$1.Controller.extend({ key: 'value' }, { key: 'value' });

	        equal(Controller.key, 'value');
	        equal(new Controller().key, 'value');
	    });

	    test("::extend with name", function () {
	        var Controller = Viking$1.Controller.extend('controller');

	        equal(Controller.controllerName, 'controller');
	        equal(new Controller().controllerName, 'controller');
	    });

	    test("action functions get a reference to the controller", function () {
	        var Controller = Viking$1.Controller.extend('controller', {
	            'index': function index() {
	                return true;
	            }
	        });

	        var controller = new Controller();

	        strictEqual(controller.index.controller, Controller);
	    });
	})();

	(function () {
	    module("Viking.Cursor");

	    // Defaults ------------------------------------------------------------------
	    test("defaults are set", function () {
	        var c = new Viking$1.Cursor();

	        deepEqual(c.attributes, { page: 1, per_page: 25 });
	    });

	    // Reset ---------------------------------------------------------------------
	    test("reset resets to default values", function () {
	        var c = new Viking$1.Cursor({ page: 21, per_page: 40 });

	        c.reset();
	        deepEqual(c.attributes, { page: 1, per_page: 40 });
	    });

	    test("reset doesn't change per_page", function () {
	        var c = new Viking$1.Cursor({ per_page: 60 });

	        c.reset();
	        equal(60, c.get('per_page'));
	    });

	    test("reset triggers a reset event", function () {
	        expect(1);

	        var c = new Viking$1.Cursor({ page: 2 });
	        c.on('reset', function () {
	            ok(true);
	        });
	        c.reset();
	        c.off('reset');
	    });

	    test("reset doesnt trigger a change event", function () {
	        expect(0);

	        var c = new Viking$1.Cursor({ page: 2 });
	        c.on('change', function () {
	            ok(true);
	        });
	        c.reset({ silent: true });
	        c.off('change');
	    });

	    test("reset doesnt triggers a reset event when options.silent", function () {
	        expect(0);

	        var c = new Viking$1.Cursor();
	        c.on('reset', function () {
	            ok(true);
	        });
	        c.reset({ silent: true });
	        c.off('reset');
	    });

	    test("reset doesn't trigger a reset event if !requiresRefresh()", function () {
	        expect(0);

	        var c = new Viking$1.Cursor();
	        c.on('reset', function () {
	            ok(true);
	        });
	        c.reset();
	        c.off('reset');
	    });

	    test("reset options get passed to callbacks", function () {
	        expect(1);

	        var c = new Viking$1.Cursor({ page: 2 });
	        c.on('reset', function (model, options) {
	            deepEqual({ remove: false }, options);
	        });
	        c.reset({ remove: false });
	        c.off('reset');
	    });

	    // incrementPage -------------------------------------------------------------
	    test("incrementPage increments page by 1", function () {
	        var c = new Viking$1.Cursor();
	        equal(c.get('page'), 1);
	        c.incrementPage();
	        equal(c.get('page'), 2);
	    });

	    test("incrementPage options get passed to callbacks", function () {
	        expect(2);

	        var c = new Viking$1.Cursor();
	        c.on('change', function (model, options) {
	            deepEqual({ remove: false }, options);
	        });
	        c.on('change:page', function (model, value, options) {
	            deepEqual({ remove: false }, options);
	        });
	        c.incrementPage({ remove: false });
	        c.off('change');
	        c.off('change:page');
	    });

	    // decrementPage -------------------------------------------------------------
	    test("decrementPage decrements page by 1", function () {
	        var c = new Viking$1.Cursor({ page: 2 });
	        equal(c.get('page'), 2);
	        c.decrementPage();
	        equal(c.get('page'), 1);
	    });

	    test("decrementPage options get passed to callbacks", function () {
	        expect(2);

	        var c = new Viking$1.Cursor();
	        c.on('change', function (model, options) {
	            deepEqual({ remove: false }, options);
	        });
	        c.on('change:page', function (model, value, options) {
	            deepEqual({ remove: false }, options);
	        });
	        c.decrementPage({ remove: false });
	        c.off('change');
	        c.off('change:page');
	    });

	    // goToPage ------------------------------------------------------------------
	    test("goToPage changes page to given pageNumber", function () {
	        var c = new Viking$1.Cursor({ page: 1 });
	        equal(c.get('page'), 1);
	        c.goToPage(12);
	        equal(c.get('page'), 12);
	    });

	    // requiresRefresh -----------------------------------------------------------
	    test("requiresRefresh returns true if page changes", function () {
	        var c = new Viking$1.Cursor({ page: 1 });
	        c.set('page', 2);
	        ok(c.requiresRefresh());
	    });

	    test("requiresRefresh returns true if per_page changes", function () {
	        var c = new Viking$1.Cursor({ page: 1 });
	        c.set('per_page', 2);
	        ok(c.requiresRefresh());
	    });

	    test("requiresRefresh returns false if neither page, offset, or per_page have changed", function () {
	        var c = new Viking$1.Cursor();
	        c.set('total_pages', 2);
	        ok(!c.requiresRefresh());
	    });
	})();

	(function () {
	    module("Viking#defaults");

	    test("defaults with schema", function () {
	        var Klass = Viking$1.Model.extend('klass', {
	            schema: {
	                foo: { 'default': 'bar' },
	                bat: { 'default': 'bazz' }
	            }
	        });

	        deepEqual(_.result(Klass.prototype, 'defaults'), { foo: 'bar', bat: 'bazz' });
	    });
	})();

	(function () {
	    module("Viking.Model.Type.Boolean");

	    test("::load coerces the string 'true' to true", function () {
	        strictEqual(Viking$1.Model.Type.Boolean.load("true"), true);
	    });

	    test("::load coerces the string 'false' to false", function () {
	        strictEqual(Viking$1.Model.Type.Boolean.load("false"), false);
	    });

	    test("::load coerces true to true", function () {
	        strictEqual(Viking$1.Model.Type.Boolean.load(true), true);
	    });

	    test("::load coerces false to false", function () {
	        strictEqual(Viking$1.Model.Type.Boolean.load(false), false);
	    });

	    test("::dump true", function () {
	        strictEqual(Viking$1.Model.Type.Boolean.dump(true), true);
	    });

	    test("::dump false", function () {
	        strictEqual(Viking$1.Model.Type.Boolean.dump(false), false);
	    });
	})();

	(function () {
	    module("Viking.Model.Type.Date");

	    test("::load thows error when can't coerce value", function () {
	        expect(2);

	        throws(function () {
	            Viking$1.Model.Type.Date.load(true);
	        }, TypeError);

	        try {
	            Viking$1.Model.Type.Date.load(true);
	        } catch (e) {
	            equal(e.message, "boolean can't be coerced into Date");
	        }
	    });

	    test("::load coerces iso8601 string to date", function () {
	        deepEqual(Viking$1.Model.Type.Date.load("2013-04-10T21:24:28+00:00"), new Date(1365629068000));

	        equal(Viking$1.Model.Type.Date.load("2013-04-10T21:24:28+00:00").valueOf(), new Date(1365629068000).valueOf());
	    });

	    test("::load coerces int(milliseconds since epoch) to date", function () {
	        deepEqual(Viking$1.Model.Type.Date.load(1365629126097), new Date(1365629126097));

	        equal(Viking$1.Model.Type.Date.load(1365629126097).valueOf(), new Date(1365629126097).valueOf());
	    });

	    test("::load coerces date to date", function () {
	        equal(Viking$1.Model.Type.Date.load(new Date(1365629126097)).valueOf(), new Date(1365629126097).valueOf());
	    });

	    test("::dump coerces Date to ISOString", function () {
	        deepEqual(Viking$1.Model.Type.Date.dump(new Date(1365629068000)), "2013-04-10T21:24:28.000Z");
	    });
	})();

	(function () {
	    module("Viking.Model.Type.JSON");

	    test("::load coerces {} to {}", function () {
	        ok(Viking$1.Model.Type.JSON.load({}) instanceof Object);
	        deepEqual(Viking$1.Model.Type.JSON.load({}), {});
	        deepEqual(Viking$1.Model.Type.JSON.load({ key: 'value' }), { key: 'value' });
	    });

	    test("::load coerces {} to Viking.Model with modelName set to key", function () {
	        var Ship = Viking$1.Model.extend('ship');
	        equal(Viking$1.Model.Type.JSON.load({}, 'ship').modelName.name, 'Ship');
	        // equal(Viking.Model.Type.JSON.load([{}], 'ship')[0].modelName.name, 'Ship');
	    });

	    test("::load thows error when can't coerce value", function () {
	        expect(2);

	        throws(function () {
	            Viking$1.Model.Type.JSON.load(true);
	        }, TypeError);

	        try {
	            Viking$1.Model.Type.JSON.load(true);
	        } catch (e) {
	            equal(e.message, "boolean can't be coerced into JSON");
	        }
	    });

	    test("::load doesn't use the type key for STI", function () {
	        var Ship = Viking$1.Model.extend('ship', {
	            inheritanceAttribute: false
	        });
	        deepEqual(Viking$1.Model.Type.JSON.load({ type: 'my_value' }, 'ship').attributes, { type: 'my_value' });
	    });

	    test("::dump calls toJSON() on model", function () {
	        var model = new Viking$1.Model({
	            foo: 'bar'
	        });

	        deepEqual(Viking$1.Model.Type.JSON.dump(model), {
	            foo: 'bar'
	        });
	    });

	    test("::dump calls toJSON() with object", function () {
	        var model = { foo: 'bar' };
	        deepEqual(Viking$1.Model.Type.JSON.dump(model), { foo: 'bar' });
	    });
	})();

	(function () {
	    module("Viking.Model.Type.Number");

	    test("::load coerces number to number", function () {
	        equal(Viking$1.Model.Type.Number.load(10), 10);
	        equal(Viking$1.Model.Type.Number.load(10.5), 10.5);
	    });

	    test("::load coerces string to number", function () {
	        equal(Viking$1.Model.Type.Number.load('10'), 10);
	        equal(Viking$1.Model.Type.Number.load('10.5'), 10.5);
	    });

	    test("::load coerces empty string to null", function () {
	        equal(Viking$1.Model.Type.Number.load(' '), null);
	        equal(Viking$1.Model.Type.Number.load(''), null);
	    });

	    test("::dump coerces number to number", function () {
	        equal(Viking$1.Model.Type.Number.dump(10), 10);
	        equal(Viking$1.Model.Type.Number.dump(10.5), 10.5);
	    });

	    test("::dump coerces null to null", function () {
	        equal(Viking$1.Model.Type.Number.dump(null), null);
	        equal(Viking$1.Model.Type.Number.dump(null), null);
	    });
	})();

	(function () {
	    module("Viking.Model.Type.String");

	    test("::load coerces boolean to string", function () {
	        equal(Viking$1.Model.Type.String.load(true), 'true');
	        equal(Viking$1.Model.Type.String.load(false), 'false');
	    });

	    test("::load coerces number to string", function () {
	        equal(Viking$1.Model.Type.String.load(10), '10');
	        equal(Viking$1.Model.Type.String.load(10.5), '10.5');
	    });

	    test("::load coerces null to string", function () {
	        equal(Viking$1.Model.Type.String.load(null), null);
	    });

	    test("::load coerces undefined to string", function () {
	        equal(Viking$1.Model.Type.String.load(undefined), undefined);
	    });

	    test("::dump coerces boolean to string", function () {
	        equal(Viking$1.Model.Type.String.dump(true), 'true');
	        equal(Viking$1.Model.Type.String.dump(false), 'false');
	    });

	    test("::dump coerces number to string", function () {
	        equal(Viking$1.Model.Type.String.dump(10), '10');
	        equal(Viking$1.Model.Type.String.dump(10.5), '10.5');
	    });

	    test("::dump coerces null to string", function () {
	        equal(Viking$1.Model.Type.String.dump(null), null);
	    });

	    test("::dump coerces undefined to string", function () {
	        equal(Viking$1.Model.Type.String.dump(undefined), undefined);
	    });
	})();

	(function () {
	    module("Viking.Model::baseModel");

	    test("::baseModel get's set to self when extending Viking.Model", function () {
	        var Ship = Viking$1.Model.extend('ship');

	        strictEqual(Ship, Ship.baseModel);
	    });

	    test("::baseModel get's set to self when extending an abstract Viking.Model", function () {
	        var RussianShip = Viking$1.Model.extend('russianShip', {
	            abstract: true
	        });
	        var Ship = RussianShip.extend('ship');

	        strictEqual(Ship, Ship.baseModel);
	    });

	    test("::baseModel get's set to parent Model when extending a Viking.Model", function () {
	        var Ship = Viking$1.Model.extend('ship');
	        var Carrier = Ship.extend('carrier');

	        strictEqual(Ship, Carrier.baseModel);
	    });
	})();

	(function () {
	    module("Viking.Model::create", {
	        setup: function setup() {
	            this.requests = [];
	            this.xhr = sinon.useFakeXMLHttpRequest();
	            this.xhr.onCreate = _.bind(function (xhr) {
	                this.requests.push(xhr);
	            }, this);
	        },
	        teardown: function teardown() {
	            this.xhr.restore();
	        }
	    });

	    test("::create returns an new model", function () {
	        var Model = Viking$1.Model.extend('model');

	        var m = Model.create({ name: "name" });
	        ok(m instanceof Model);
	    });

	    test("::create calls save with options", function () {
	        var Model = Viking$1.Model.extend('model');

	        Model.prototype.save = function (attributes, options) {
	            deepEqual(options, { option: 1 });
	        };

	        var m = Model.create({ name: "name" }, { option: 1 });
	    });
	})();

	(function () {
	    module("Viking.model::extend");

	    // setting attributes on a model coerces relations
	    test("::extend acts like normal Backbone.Model", function () {
	        var Model = Viking$1.Model.extend('model', { key: 'value' }, { key: 'value' });

	        equal(Model.key, 'value');
	        equal(new Model().key, 'value');
	    });

	    test("::extend with modelName", function () {
	        var Model = Viking$1.Model.extend('model');

	        propEqual(_.omit(Model.modelName, 'model'), {
	            name: 'Model',
	            element: 'model',
	            human: 'Model',
	            paramKey: 'model',
	            plural: 'models',
	            routeKey: 'models',
	            singular: 'model',
	            collection: 'models',
	            collectionName: 'ModelCollection'
	        });
	        propEqual(_.omit(new Model().modelName, 'model'), {
	            name: 'Model',
	            element: 'model',
	            human: 'Model',
	            paramKey: 'model',
	            plural: 'models',
	            routeKey: 'models',
	            singular: 'model',
	            collection: 'models',
	            collectionName: 'ModelCollection'
	        });
	    });

	    test("::extend initalizes the assocations", function () {
	        var Model = Viking$1.Model.extend('model');

	        deepEqual(Model.associations, {});
	    });

	    test("::extend adds hasMany relationships to associations", function () {
	        var Ship = Viking$1.Model.extend('ship', { hasMany: ['ships'] });

	        equal(Ship.associations['ships'].name, 'ships');
	        equal(Ship.associations['ships'].macro, 'hasMany');
	        deepEqual(Ship.associations['ships'].options, {});
	        equal(Ship.associations['ships'].collectionName, 'ShipCollection');
	    });

	    test("::extend adds hasMany relationships with options to associations", function () {
	        var Ship = Viking$1.Model.extend('ship', { hasMany: [['ships', { collectionName: 'MyCollection' }]] });

	        equal(Ship.associations['ships'].name, 'ships');
	        equal(Ship.associations['ships'].macro, 'hasMany');
	        deepEqual(Ship.associations['ships'].options, { collectionName: 'MyCollection' });
	        equal(Ship.associations['ships'].collectionName, 'MyCollection');
	    });

	    test("::extend adds belongsTo relationships to associations", function () {
	        var Ship = Viking$1.Model.extend('ship', { belongsTo: ['ship'] });

	        equal(Ship.associations['ship'].name, 'ship');
	        equal(Ship.associations['ship'].macro, 'belongsTo');
	        deepEqual(Ship.associations['ship'].options, {});
	        propEqual(_.omit(Ship.associations['ship'].modelName, 'model'), {
	            name: 'Ship',
	            element: 'ship',
	            human: 'Ship',
	            paramKey: 'ship',
	            plural: 'ships',
	            routeKey: 'ships',
	            singular: 'ship',
	            collection: 'ships',
	            collectionName: 'ShipCollection'
	        });
	    });

	    test("::extend adds belongsTo relationships with options to associations", function () {
	        var Ship = Viking$1.Model.extend('ship', { belongsTo: [['ship', { modelName: 'Carrier' }]] });

	        equal(Ship.associations['ship'].name, 'ship');
	        equal(Ship.associations['ship'].macro, 'belongsTo');
	        deepEqual(Ship.associations['ship'].options, { modelName: 'Carrier' });
	        propEqual(Ship.associations['ship'].modelName, new Viking$1.Model.Name('carrier'));
	    });

	    // STI
	    // ========================================================================

	    test("::extend a Viking.Model unions the hasMany relationships", function () {
	        var Key = Viking$1.Model.extend('key');
	        var Comment = Viking$1.Model.extend('comment');
	        var Account = Viking$1.Model.extend('account', { hasMany: ['comments'] });
	        var Agent = Account.extend('agent', { hasMany: ['keys'] });

	        deepEqual(['comments'], _.map(Account.associations, function (a) {
	            return a.name;
	        }));
	        deepEqual(['comments', 'keys'], _.map(Agent.associations, function (a) {
	            return a.name;
	        }).sort());
	    });

	    test("::extend a Viking.Model unions the belongsTo relationships", function () {
	        var State = Viking$1.Model.extend('state');
	        var Region = Viking$1.Model.extend('region');
	        var Account = Viking$1.Model.extend('account', { belongsTo: ['state'] });
	        var Agent = Account.extend('agent', { belongsTo: ['region'] });

	        deepEqual(['state'], _.map(Account.associations, function (a) {
	            return a.name;
	        }));
	        deepEqual(['region', 'state'], _.map(Agent.associations, function (a) {
	            return a.name;
	        }).sort());
	    });

	    test("::extend a Viking.Model unions the schema", function () {
	        var Account = Viking$1.Model.extend('account', { schema: {
	                created_at: { type: 'date' }
	            } });

	        var Agent = Account.extend('agent', { schema: {
	                name: { type: 'string' }
	            } });

	        deepEqual(Account.prototype.schema, {
	            created_at: { type: 'date' }
	        });
	        deepEqual(Agent.prototype.schema, {
	            created_at: { type: 'date' },
	            name: { type: 'string' }
	        });
	    });

	    test("::extend a Viking.Model adds itself to the descendants", function () {
	        var Account = Viking$1.Model.extend('account');
	        var Agent = Account.extend('agent');

	        deepEqual(Account.descendants, [Agent]);
	        deepEqual(Agent.descendants, []);
	    });
	})();

	(function () {
	    module("Viking.Model::findOrCreateBy", {
	        setup: function setup() {
	            this.requests = [];
	            this.xhr = sinon.useFakeXMLHttpRequest();
	            this.xhr.onCreate = _.bind(function (xhr) {
	                this.requests.push(xhr);
	            }, this);
	        },
	        teardown: function teardown() {
	            this.xhr.restore();
	        }
	    });

	    test("::findOrCreateBy(attributes) find a model that exits", function () {
	        expect(1);

	        var Ship = Viking$1.Model.extend('ship');
	        var relient = new Ship({ name: 'Relient' });

	        var ShipCollection = Viking$1.Collection.extend({
	            model: Ship,
	            fetch: function fetch(options) {
	                options.success(new ShipCollection([relient]));
	            }
	        });

	        Ship.findOrCreateBy({ name: 'Relient' }, {
	            success: function success(model) {
	                strictEqual(model, relient);
	            }
	        });
	    });

	    test("::findOrCreateBy(attributes) without a success callback finds a model that exits", function () {
	        expect(0);

	        var Ship = Viking$1.Model.extend('ship');
	        var ShipCollection = Viking$1.Collection.extend({
	            model: Ship,
	            fetch: function fetch(options) {
	                options.success(new ShipCollection([{ name: 'Relient' }]));
	            }
	        });

	        Ship.findOrCreateBy({ name: 'Relient' });
	    });

	    test("::findOrCreateBy(attributes) calls create when the model doesn't exist", function () {
	        expect(2);

	        var Ship = Viking$1.Model.extend('ship');
	        var ShipCollection = Viking$1.Collection.extend({
	            model: Ship,
	            fetch: function fetch(options) {
	                options.success(new ShipCollection([]));
	            }
	        });

	        Ship.create = function (attributes, options) {
	            deepEqual(attributes, { name: 'Relient' });
	            deepEqual(options, { option: 1 });
	        };

	        Ship.findOrCreateBy({ name: 'Relient' }, { option: 1 });
	    });
	})();

	(function () {
	    module("Viking.Model::find", {
	        setup: function setup() {
	            this.requests = [];
	            this.xhr = sinon.useFakeXMLHttpRequest();
	            this.xhr.onCreate = _.bind(function (xhr) {
	                this.requests.push(xhr);
	            }, this);
	        },
	        teardown: function teardown() {
	            this.xhr.restore();
	        }
	    });

	    test("::find returns an new model", function () {
	        var Model = Viking$1.Model.extend('model');

	        var m = Model.find(12);
	        ok(m instanceof Model);
	    });

	    test("::find sends get request to correct url", function () {
	        var Model = Viking$1.Model.extend('model');

	        Model.find(12);
	        equal(this.requests[0].method, 'GET');
	        equal(this.requests[0].url, '/models/12');
	    });

	    test("::find triggers success callback", function () {
	        expect(1);

	        var Model = Viking$1.Model.extend('model');
	        Model.find(12, {
	            success: function success(m) {
	                equal(m.get('name'), "Viking");
	            }
	        });
	        this.requests[0].respond(200, '[]', '{"id": 12, "name": "Viking"}');
	    });

	    test("::find triggers error callback", function () {
	        expect(1);

	        var Model = Viking$1.Model.extend('model');
	        Model.find(12, {
	            error: function error(m) {
	                ok(true);
	            }
	        });
	        this.requests[0].respond(500, '[]', 'Server Error!');
	    });
	})();

	(function () {
	    module("Viking.Model::inheritanceAttribute");

	    test("::inheritanceAttribute get set when extending a Model", function () {
	        var Ship = Viking$1.Model.extend('ship');
	        ok(Ship.inheritanceAttribute);
	    });

	    test("::inheritanceAttribute default to `type`", function () {
	        var Ship = Viking$1.Model.extend();

	        equal('type', Ship.inheritanceAttribute);
	    });

	    test("::inheritanceAttribute override", function () {
	        var Ship = Viking$1.Model.extend('ship', {
	            inheritanceAttribute: 'class_name'
	        });

	        equal('class_name', Ship.inheritanceAttribute);
	    });

	    test("::inheritanceAttribute set to false disabled STI", function () {
	        var Ship = Viking$1.Model.extend('ship', {
	            inheritanceAttribute: false
	        });
	        var Battleship = Ship.extend('battleship');

	        var bship = new Battleship();
	        strictEqual(false, Ship.inheritanceAttribute);
	        strictEqual(Battleship, bship.baseModel);
	    });
	})();

	(function () {
	    module("Viking.Model::new");

	    test("::new sets modelName on the instance", function () {
	        var Ship = Viking$1.Model.extend('ship');

	        propEqual(_.omit(new Ship().modelName, 'model'), {
	            name: 'Ship',
	            element: 'ship',
	            human: 'Ship',
	            paramKey: 'ship',
	            plural: 'ships',
	            routeKey: 'ships',
	            singular: 'ship',
	            collection: 'ships',
	            collectionName: 'ShipCollection'
	        });

	        var Namespaced = {};
	        var Model = Viking$1.Model.extend('namespaced/model');
	        propEqual(_.omit(new Model().modelName, 'model'), {
	            'name': 'Namespaced.Model',
	            singular: 'namespaced_model',
	            plural: 'namespaced_models',
	            routeKey: 'namespaced_models',
	            paramKey: 'namespaced_model',
	            human: 'Model',
	            element: 'model',
	            collection: 'namespaced_models',
	            collectionName: 'Namespaced.ModelCollection'
	        });
	    });

	    test("::new sets associations on the instance as a refernce to the associations on the Class", function () {
	        var Ship = Viking$1.Model.extend('ship', { hasMany: [['ships', { collectionName: 'MyCollection' }]] });
	        var MyCollection = Viking$1.Collection.extend('MyCollection');

	        var myship = new Ship();
	        strictEqual(myship.associations, Ship.associations);
	    });

	    test("::new(attrs) does coercions", function () {
	        var Model = Viking$1.Model.extend('model', { schema: {
	                date: { type: 'date' }
	            } });

	        var a = new Model({ 'date': "2013-04-10T21:24:28+00:00" });
	        equal(a.get('date').valueOf(), new Date(1365629068000).valueOf());
	    });

	    test("::new(attrs) coerces hasMany relations", function () {
	        var Ship = Viking$1.Model.extend('ship', { hasMany: ['ships'] });
	        var ShipCollection = Viking$1.Collection.extend({ model: Ship });

	        var a = new Ship({ ships: [{}, {}] });
	        ok(a.get('ships') instanceof ShipCollection);
	        equal(a.get('ships').length, 2);
	        ok(a.get('ships').first() instanceof Ship);
	    });

	    test("::new(attrs) coerces belongsTo relations", function () {
	        var Ship = Viking$1.Model.extend('ship', { belongsTo: ['ship'] });

	        var a = new Ship({ 'ship': {} });
	        ok(a.get('ship') instanceof Ship);
	    });

	    test("::new(attrs) sets hasMany relations to an empty collection if not in attrs", function () {
	        var Ship = Viking$1.Model.extend('ship', { hasMany: ['ships'] });
	        var ShipCollection = Viking$1.Collection.extend({ model: Ship });

	        var a = new Ship();
	        ok(a.get('ships') instanceof ShipCollection);
	        equal(a.get('ships').length, 0);
	    });

	    // STI
	    test("::new(attrs) on subtype sets the type to the submodel type", function () {
	        var Account = Viking$1.Model.extend('account');
	        var Agent = Account.extend('agent');

	        var agent = new Agent();
	        equal('Agent', agent.get('type'));
	    });

	    test("::new(attrs) on model sets the type if there are submodels", function () {
	        var Account = Viking$1.Model.extend('account');
	        var Agent = Account.extend('agent');

	        var account = new Account();
	        equal('Account', account.get('type'));
	    });

	    test("::new(attrs) with type set to a sub-type returns subtype", function () {
	        var Account = Viking$1.Model.extend('account');
	        var Agent = Account.extend('agent');

	        var agent = new Account({ type: 'agent' });
	        ok(agent instanceof Agent);
	        ok(agent instanceof Account);
	    });

	    test("::new() with default type", function () {
	        var Account = Viking$1.Model.extend('account', {
	            defaults: {
	                type: 'agent'
	            }
	        });
	        var Agent = Account.extend('agent');

	        var agent = new Account();
	        ok(agent instanceof Agent);
	    });
	})();

	(function () {
	    module("Viking.Model::reflectOnAssociation");

	    test("::reflectOnAssociation() returns the assocation", function () {
	        var Ship = Viking$1.Model.extend('ship', { hasMany: ['ships'], belongsTo: [['carrier', { modelName: 'Ship' }]] });
	        var ShipCollection = Viking$1.Collection.extend({ model: Ship });

	        equal('ships', Ship.reflectOnAssociation('ships').name);
	        equal('carrier', Ship.reflectOnAssociation('carrier').name);
	        equal(undefined, Ship.reflectOnAssociation('bird'));
	    });
	})();

	(function () {
	    module("Viking.Model::reflectOnAssociations");

	    test("::reflectOnAssociations() returns all the assocations", function () {
	        var Ship = Viking$1.Model.extend('ship', { hasMany: ['ships'], belongsTo: [['carrier', { modelName: 'Ship' }]] });
	        var ShipCollection = Viking$1.Collection.extend({ model: Ship });

	        deepEqual(['carrier', 'ships'], _.map(Ship.reflectOnAssociations(), function (a) {
	            return a.name;
	        }));
	    });

	    test("::reflectOnAssociations(macro) returns all macro assocations", function () {
	        var Ship = Viking$1.Model.extend('ship', { hasMany: ['ships'], belongsTo: [['carrier', { modelName: 'Ship' }]] });
	        var ShipCollection = Viking$1.Collection.extend({ model: Ship });

	        deepEqual(['ships'], _.map(Ship.reflectOnAssociations('hasMany'), function (a) {
	            return a.name;
	        }));
	    });
	})();

	(function () {
	    module("Viking.Model::urlRoot");

	    test("::urlRoot returns an URL based on modelName", function () {
	        var Model = Viking$1.Model.extend('model');
	        equal(Model.urlRoot(), '/models');

	        var Model = Viking$1.Model.extend('namespaced/model');
	        equal(Model.urlRoot(), '/namespaced_models');
	    });

	    test("::urlRoot returns an URL based on #urlRoot set on the model", function () {
	        var Model = Viking$1.Model.extend('model', {
	            urlRoot: '/buoys'
	        });
	        equal(Model.urlRoot(), '/buoys');
	    });

	    // STI test
	    test("::urlRoot returns an URL based on modelName of the baseModel", function () {
	        var Ship = Viking$1.Model.extend('ship');
	        var Carrier = Ship.extend();

	        equal(Carrier.urlRoot(), '/ships');
	    });

	    test("::urlRoot returns an URL based on #urlRoot set on the baseModel", function () {
	        var Ship = Viking$1.Model.extend('ship', {
	            urlRoot: '/myships'
	        });
	        var Carrier = Ship.extend();

	        equal(Carrier.urlRoot(), '/myships');
	    });

	    test("::urlRoot returns an URL based on #urlRoot set on the sti model", function () {
	        var Ship = Viking$1.Model.extend('ship');
	        var Carrier = Ship.extend({
	            urlRoot: '/carriers'
	        });

	        equal(Carrier.urlRoot(), '/carriers');
	    });
	})();

	(function () {
	    module("Viking.Model#baseModel");

	    test("#baseModel get's set to self when extending Viking.Model", function () {
	        var Ship = Viking$1.Model.extend('ship');
	        var ship = new Ship();

	        strictEqual(Ship, ship.baseModel);
	    });

	    test("#baseModel get's set to self when extending an abstract Viking.Model", function () {
	        var RussianShip = Viking$1.Model.extend('russianShip', {
	            abstract: true
	        });
	        var Ship = RussianShip.extend('ship');

	        var ship = new Ship();

	        strictEqual(Ship, ship.baseModel);
	    });

	    test("#baseModel get's set to parent Model when extending a Viking.Model", function () {
	        var Ship = Viking$1.Model.extend('ship');
	        var Carrier = Ship.extend('carrier');
	        var carrier = new Carrier();

	        strictEqual(Ship, carrier.baseModel);
	    });
	})();

	(function () {
	    module("Viking.Model#coerceAttributes - belongsTo");

	    test("#coerceAttributes initializes belongsTo relation with hash", function () {
	        var Ship = Viking$1.Model.extend('ship', { belongsTo: ['ship'] });
	        var a = new Ship();

	        var result = a.coerceAttributes({ ship: { key: 'value' } });
	        ok(result.ship instanceof Ship);
	        deepEqual(result.ship.attributes, { key: 'value' });
	    });

	    test("#coerceAttributes initializes belongsTo relation with instance of model", function () {
	        var Ship = Viking$1.Model.extend('ship', { belongsTo: ['ship'] });
	        var a = new Ship();
	        var b = new Ship({ key: 'value' });

	        var result = a.coerceAttributes({ ship: b });
	        ok(result.ship === b);
	    });
	})();

	(function () {
	    module("Viking.Model#coerceAttributes - coercions");

	    // coerceAttributes modifies the object passed in ----------------------------
	    test("#coerceAttributes modifies the object passed in", function () {
	        var Model = Viking$1.Model.extend('model', { schema: {
	                date: { type: 'date' }
	            } });
	        var a = new Model();
	        var attrs = { date: "2013-04-10T21:24:28+00:00" };
	        a.coerceAttributes(attrs);

	        deepEqual(attrs, { date: new Date(1365629068000) });
	        equal(attrs.date.valueOf(), new Date(1365629068000).valueOf());
	    });

	    // coercions and unsupported data type ---------------------------------------
	    test("#coerceAttributes thows error when can't coerce value", function () {
	        expect(2);

	        var Model = Viking$1.Model.extend('model', { schema: {
	                date: { type: 'Unkown' }
	            } });
	        var a = new Model();

	        throws(function () {
	            a.coerceAttributes({ date: true });
	        }, TypeError);

	        try {
	            a.coerceAttributes({ date: true });
	        } catch (e) {
	            equal(e.message, "Coercion of Unkown unsupported");
	        }
	    });

	    // coercing dates ---------------------------------------------------------
	    test("#coerceAttributes coerces iso8601 string to date", function () {
	        var Model = Viking$1.Model.extend('model', { schema: {
	                date: { type: 'date' }
	            } });
	        var a = new Model();

	        deepEqual(a.coerceAttributes({ date: "2013-04-10T21:24:28+00:00" }), { date: new Date(1365629068000) });
	        equal(a.coerceAttributes({ date: "2013-04-10T21:24:28+00:00" }).date.valueOf(), new Date(1365629068000).valueOf());
	    });

	    test("#coerceAttributes coerces int(milliseconds since epoch) to date", function () {
	        var Model = Viking$1.Model.extend('model', { schema: {
	                date: { type: 'date' }
	            } });
	        var a = new Model();

	        deepEqual(a.coerceAttributes({ date: 1365629126097 }), { date: new Date(1365629126097) });
	        equal(a.coerceAttributes({ date: 1365629126097 }).date.valueOf(), new Date(1365629126097).valueOf());
	    });

	    // coercing strings -------------------------------------------------------
	    test("#coerceAttributes coerces boolean to string", function () {
	        var Model = Viking$1.Model.extend('model', { schema: {
	                key: { type: 'string' }
	            } });
	        var a = new Model();

	        equal(a.coerceAttributes({ key: true }).key, 'true');
	        equal(a.coerceAttributes({ key: false }).key, 'false');
	    });

	    test("#coerceAttributes coerces number to string", function () {
	        var Model = Viking$1.Model.extend('model', { schema: {
	                key: { type: 'string' }
	            } });
	        var a = new Model();

	        equal(a.coerceAttributes({ key: 10 }).key, '10');
	        equal(a.coerceAttributes({ key: 10.5 }).key, '10.5');
	    });

	    test("#coerceAttributes coerces null to string", function () {
	        var Model = Viking$1.Model.extend('model', { schema: {
	                key: { type: 'string' }
	            } });
	        var a = new Model();

	        equal(a.coerceAttributes({ key: null }).key, null);
	    });

	    // coercing numbers -------------------------------------------------------
	    test("#coerceAttributes coerces string to number", function () {
	        var Model = Viking$1.Model.extend('model', { schema: {
	                key: { type: 'number' }
	            } });
	        var a = new Model();

	        equal(a.coerceAttributes({ key: '10.5' }).key, 10.50);
	        equal(a.coerceAttributes({ key: '10' }).key, 10);
	    });

	    // coercing JSON ----------------------------------------------------------
	    test("#coerceAttributes coerces {} to Object", function () {
	        var Model = Viking$1.Model.extend('model', { schema: {
	                key: { type: 'json' }
	            } });
	        var a = new Model();

	        ok(a.coerceAttributes({ key: {} }).key instanceof Object);
	        deepEqual(a.coerceAttributes({ key: {} }).key.attributes, {});
	        deepEqual(a.coerceAttributes({ key: { key: 'value' } }).key.attributes, { key: 'value' });
	    });

	    test("#coerceAttributes coerces {} to Viking.Model", function () {
	        var Model = Viking$1.Model.extend('model', { schema: {
	                key: { type: 'json' }
	            } });
	        var a = new Model();

	        ok(a.coerceAttributes({ key: {} }).key instanceof Viking$1.Model);
	        deepEqual(a.coerceAttributes({ key: {} }).key.attributes, {});
	        deepEqual(a.coerceAttributes({ key: { key: 'value' } }).key.attributes, { key: 'value' });
	    });

	    test("#coerceAttributes coerces {} to Viking.Model and sets the modelName", function () {
	        var Model = Viking$1.Model.extend('model', {
	            belongsTo: [['key', { modelName: 'Model' }]]
	            // schema: { key: {type: 'json'} }
	        });
	        var a = new Model();

	        deepEqual(a.coerceAttributes({ key: {} }).key.modelName.name, 'Model');
	    });

	    test("#coerceAttributes thows error when can't coerce value", function () {
	        expect(2);

	        var Model = Viking$1.Model.extend('model', { schema: {
	                date: { type: 'date' }
	            } });
	        var a = new Model();

	        throws(function () {
	            a.coerceAttributes({ date: true });
	        }, TypeError);

	        try {
	            a.coerceAttributes({ date: true });
	        } catch (e) {
	            equal(e.message, "boolean can't be coerced into Date");
	        }
	    });

	    // Array support
	    test("#coerceAttributes support array coercion", function () {
	        var Model = Viking$1.Model.extend('model', { schema: {
	                key: { type: 'number', array: true }
	            } });
	        var a = new Model();

	        deepEqual(a.coerceAttributes({ key: [10, '10.5'] }).key, [10, 10.5]);
	        deepEqual(a.coerceAttributes({ key: ['10.5'] }).key, [10.50]);
	    });
	})();

	(function () {
	    module("Viking.Model#coerceAttributes - hasMany");

	    test("#coerceAttributes initializes hasMany relation with array of hashes", function () {
	        var Ship = Viking$1.Model.extend('ship', { hasMany: ['ships'] });
	        var ShipCollection = Viking$1.Collection.extend({ model: Ship });

	        var a = new Ship();

	        var result = a.coerceAttributes({ ships: [{ key: 'foo' }, { key: 'bar' }] });
	        ok(result.ships instanceof ShipCollection);
	        ok(result.ships.models[0] instanceof Ship);
	        ok(result.ships.models[1] instanceof Ship);
	        deepEqual(result.ships.models[0].attributes.key, 'foo');
	        deepEqual(result.ships.models[1].attributes.key, 'bar');
	    });

	    test("#coerceAttributes() initializes hasMany relation with array of models", function () {
	        var Ship = Viking$1.Model.extend('ship', { hasMany: ['ships'] });
	        var ShipCollection = Viking$1.Collection.extend({ model: Ship });

	        var a = new Ship();
	        var models = [new Ship({ key: 'foo' }), new Ship({ key: 'bar' })];

	        var result = a.coerceAttributes({ ships: models });
	        ok(result.ships instanceof ShipCollection);
	        ok(result.ships.models[0] === models[0]);
	        ok(result.ships.models[1] === models[1]);
	    });
	})();

	(function () {
	    module("Viking.Model#inheritanceAttribute");

	    test("#inheritanceAttribute get set when extending a Model", function () {
	        var Ship = Viking$1.Model.extend('ship');
	        var ship = new Ship();
	        ok(ship.inheritanceAttribute);
	    });

	    test("::inheritanceAttribute default to `type`", function () {
	        var Ship = Viking$1.Model.extend('ship');
	        var ship = new Ship();
	        equal('type', ship.inheritanceAttribute);
	    });

	    test("::inheritanceAttribute override", function () {
	        var Ship = Viking$1.Model.extend('ship', {
	            inheritanceAttribute: 'class_name'
	        });
	        var ship = new Ship();

	        equal('class_name', ship.inheritanceAttribute);
	    });
	})();

	(function () {
	    module("Viking.Model#paramRoot");

	    test("instance.paramRoot returns underscored modelName", function () {
	        var Model = Viking$1.Model.extend('model');
	        var model = new Model();

	        equal(model.paramRoot(), 'model');

	        Model = Viking$1.Model.extend('namespaced/model');
	        model = new Model();
	        equal(model.paramRoot(), 'namespaced_model');
	    });

	    test("instance.paramRoot returns underscored baseModel.modelName when used as STI", function () {
	        var Boat = Viking$1.Model.extend('boat');
	        var Carrier = Boat.extend('boat');
	        var model = new Carrier();

	        equal(model.paramRoot(), 'boat');
	    });
	})();

	(function () {
	    module("Viking.Model#reflectOnAssociation");

	    test("#reflectOnAssociation() is a reference to ::reflectOnAssociation()", function () {
	        var Ship = Viking$1.Model.extend();

	        strictEqual(Ship.reflectOnAssociation, new Ship().reflectOnAssociation);
	    });
	})();

	(function () {
	    module("Viking.Model#reflectOnAssociations");

	    test("#reflectOnAssociations() is a reference to ::reflectOnAssociations()", function () {
	        var Ship = Viking$1.Model.extend();

	        strictEqual(Ship.reflectOnAssociations, new Ship().reflectOnAssociations);
	    });
	})();

	(function () {
	    module("Viking.Model#save", {
	        setup: function setup() {
	            this.requests = [];
	            this.xhr = sinon.useFakeXMLHttpRequest();
	            this.xhr.onCreate = _.bind(function (xhr) {
	                this.requests.push(xhr);
	            }, this);
	        },
	        teardown: function teardown() {
	            this.xhr.restore();
	        }
	    });

	    test("#save calls setErrors when a 400 is returned", function () {
	        expect(1);

	        var Model = Viking$1.Model.extend('model');

	        var m = new Model();
	        m.setErrors = function (errors, options) {
	            deepEqual(errors, {
	                "address": { "city": ["cant be blank"] },
	                "agents": [{ "email": ["cant be blank", "is invalid"] }],
	                "size": ["cant be blank", "is not a number"]
	            });
	        };

	        m.save();
	        this.requests[0].respond(400, '[]', JSON.stringify({
	            "errors": {
	                "address": { "city": ["cant be blank"] },
	                "agents": [{ "email": ["cant be blank", "is invalid"] }],
	                "size": ["cant be blank", "is not a number"]
	            }
	        }));
	    });

	    test("#save calls the invalid callback when a 400 is returned", function () {
	        expect(1);

	        var Model = Viking$1.Model.extend('model');

	        var m = new Model({ foo: 'bar' });
	        m.save(null, {
	            invalid: function invalid(model, errors, options) {
	                deepEqual(errors, {
	                    "address": { "city": ["cant be blank"] },
	                    "agents": [{ "email": ["cant be blank", "is invalid"] }],
	                    "size": ["cant be blank", "is not a number"]
	                });
	            }
	        });

	        this.requests[0].respond(400, '[]', JSON.stringify({
	            "errors": {
	                "address": { "city": ["cant be blank"] },
	                "agents": [{ "email": ["cant be blank", "is invalid"] }],
	                "size": ["cant be blank", "is not a number"]
	            }
	        }));
	    });
	})();

	(function () {
	    module("Viking.Model#select");

	    test("#select() sets 'selected' to true on model when not in a collection", function () {
	        var model = new Viking$1.Model({});
	        model.select();

	        ok(model.selected);
	    });

	    test("#select() sets 'selected' to true on the model when in a collection", function () {
	        var c = new Viking$1.Collection([{}, {}]);
	        var model = c.models[0];
	        model.select();

	        ok(model.selected);
	    });

	    test("#select() sets 'selected' to false other models", function () {
	        var c = new Viking$1.Collection([{}, {}, {}]);
	        var models = c.models;
	        models[0].selected = true;
	        models[1].selected = true;
	        models[2].selected = true;

	        ok(models[0].selected);
	        ok(models[1].selected);
	        ok(models[2].selected);

	        models[1].select();

	        ok(!models[0].selected);
	        ok(models[1].selected);
	        ok(!models[2].selected);
	    });

	    test("#select(true) selects the model", function () {
	        var c = new Viking$1.Collection([{}, {}, {}]);
	        var models = c.models;

	        ok(!models[0].selected);
	        models[0].select(true);
	        ok(models[0].selected);
	    });

	    test("#select(false) unselects the model", function () {
	        var c = new Viking$1.Collection([{}, {}, {}]);
	        var models = c.models;

	        models[0].select();

	        ok(models[0].selected);
	        models[0].select(false);
	        ok(!models[0].selected);
	    });

	    test("#select({multiple: true}) doesn't unselect other models", function () {
	        var c = new Viking$1.Collection([{}, {}, {}]);
	        var models = c.models;

	        models[0].select();
	        models[1].select({ multiple: true });
	        models[2].select({ multiple: true });

	        ok(models[0].selected);
	        ok(models[1].selected);
	        ok(models[2].selected);
	    });

	    test("#select() triggers a 'selected' event", function () {
	        expect(1);

	        var c = new Viking$1.Collection([{}]);
	        var model = c.models[0];

	        model.on('selected', function () {
	            ok(model.selected);
	        });
	        model.select();
	        model.off('selected');
	    });

	    test("#select() triggers a 'selected' event on the collection", function () {
	        expect(1);

	        var c = new Viking$1.Collection([{}]);
	        c.on('selected', function () {
	            ok(true);
	        });
	        c.models[0].select();
	        c.off('selected');
	    });

	    test("#select() triggers a 'selected' event only if change", function () {
	        expect(0);

	        var c = new Viking$1.Collection([{}]);
	        var m = c.models[0];
	        m.selected = true;
	        m.on('selected', function () {
	            ok(true);
	        });
	        m.select();
	        m.off('selected');
	    });

	    test("#select() triggers a 'selected' event on collection only if change", function () {
	        expect(0);

	        var c = new Viking$1.Collection([{}]);
	        c.models[0].selected = true;
	        c.on('selected', function () {
	            ok(true);
	        });
	        c.models[0].select();
	        c.off('selected');
	    });
	})();

	(function () {
	    module("Viking.model#set - belongsTo");

	    // setting attributes on a model coerces relations
	    test("#set(key, val) coerces belongsTo relations", function () {
	        var Ship = Viking$1.Model.extend('ship', { belongsTo: ['ship'] });

	        var a = new Ship();
	        a.set('ship', {});
	        ok(a.get('ship') instanceof Ship);
	    });

	    test("#set({key, val}) coerces belongsTo relations", function () {
	        var Ship = Viking$1.Model.extend('ship', { belongsTo: ['ship'] });

	        var a = new Ship();
	        a.set({ ship: {} });
	        ok(a.get('ship') instanceof Ship);
	    });

	    test("#set(key, val) sets relation id", function () {
	        var Ship = Viking$1.Model.extend('ship', { belongsTo: ['ship'] });
	        var a = new Ship();

	        a.set('ship', { id: 12 });
	        equal(12, a.get('ship_id'));

	        a.set('ship', {});
	        equal(null, a.get('ship_id'));
	    });

	    test("#set({key, val}) sets relation id", function () {
	        var Ship = Viking$1.Model.extend('ship', { belongsTo: ['ship'] });
	        var a = new Ship();

	        a.set({ ship: { id: 12 } });
	        equal(12, a.get('ship_id'));

	        a.set({ ship: {} });
	        equal(null, a.get('ship_id'));
	    });

	    test("#unset(key) unsets relation id", function () {
	        var Ship = Viking$1.Model.extend('ship', { belongsTo: ['ship'] });
	        var a = new Ship();

	        a.set('ship', { id: 12 });
	        equal(12, a.get('ship_id'));

	        a.unset('ship');
	        equal(null, a.get('ship_id'));
	    });

	    test("::set(key, val) sets polymorphic belongsTo relation & sets appropriate keys", function () {
	        var Account = Viking$1.Model.extend('account');
	        var Ship = Viking$1.Model.extend('ship');
	        var Photo = Viking$1.Model.extend('photo', { belongsTo: [['subject', { polymorphic: true }]] });

	        var a = new Photo();
	        var ship = new Ship({ id: 10 });
	        a.set({ subject: ship });
	        ok(a.get('subject') instanceof Ship);
	        equal(a.get('subject_id'), 10);
	        equal(a.get('subject_type'), 'Ship');

	        var account = new Account({ id: 1 });
	        a.set({ subject: account });
	        ok(a.get('subject') instanceof Account);
	        equal(a.get('subject_id'), 1);
	        equal(a.get('subject_type'), 'Account');
	    });

	    test("::set({key: {}, key_type: KLASS}) coerces polymorphic belongsTo relations useing type declared in model", function () {
	        var Ship = Viking$1.Model.extend('ship');
	        var Photo = Viking$1.Model.extend('photo', { belongsTo: [['subject', { polymorphic: true }]] });

	        var a = new Photo();
	        a.set({ subject: { id: 10 }, subject_type: 'ship' });
	        ok(a.get('subject') instanceof Ship);
	        equal(a.get('subject').get('id'), 10);
	        equal(a.get('subject_type'), 'ship');
	    });
	})();

	(function () {
	    module("Viking.Model#set - coercions");

	    test("#set(key, val) does coercions", function () {
	        var Model = Viking$1.Model.extend('model', { schema: {
	                date: { type: 'date' }
	            } });

	        var a = new Model();
	        a.set('date', "2013-04-10T21:24:28+00:00");
	        equal(a.get('date').valueOf(), new Date(1365629068000).valueOf());
	    });

	    test("#set({key, val}) does coercions", function () {
	        var Model = Viking$1.Model.extend('model', { schema: {
	                date: { type: 'date' }
	            } });

	        var a = new Model();
	        a.set({ date: "2013-04-10T21:24:28+00:00" });
	        equal(a.get('date').valueOf(), new Date(1365629068000).valueOf());
	    });
	})();

	(function () {
	    module("Viking.model#set - hasMany");

	    // setting attributes on a model coerces relations
	    test("#set(key, val) coerces hasMany relations", function () {
	        var Ship = Viking$1.Model.extend('ship', { hasMany: ['ships'] });
	        var ShipCollection = Viking$1.Collection.extend({ model: Ship });

	        var a = new Ship();
	        a.set('ships', [{}, {}]);
	        ok(a.get('ships') instanceof ShipCollection);
	        equal(a.get('ships').length, 2);
	        ok(a.get('ships').first() instanceof Ship);
	    });

	    test("#set({key, val}) coerces hasMany relations", function () {
	        var Ship = Viking$1.Model.extend('ship', { hasMany: ['ships'] });
	        var ShipCollection = Viking$1.Collection.extend({ model: Ship });

	        var a = new Ship();
	        a.set({ ships: [{}, {}] });
	        ok(a.get('ships') instanceof ShipCollection);
	        equal(a.get('ships').length, 2);
	        ok(a.get('ships').first() instanceof Ship);
	    });

	    test("#set(belongsToRelation, data) updates the current collection and doesn't create a new one", function () {
	        expect(6);

	        var Ship = Viking$1.Model.extend('ship', { hasMany: ['ships'] });
	        var ShipCollection = Viking$1.Collection.extend({ model: Ship });

	        var a = new Ship();
	        a.set({ ships: [{ id: 1 }, {}, { id: 3 }] });
	        a.get('ships').on("add", function () {
	            ok(true);
	        });
	        a.get('ships').get(1).on("change", function () {
	            ok(true);
	        });
	        a.get('ships').on("remove", function () {
	            ok(true);
	        });

	        var oldCollection = a.get('ships');
	        a.set({ ships: [{ id: 1, key: 'value' }, { id: 2 }] });

	        strictEqual(oldCollection, a.get('ships'));
	        deepEqual([1, 2], a.get('ships').map(function (s) {
	            return s.id;
	        }));
	        a.get('ships').off();
	        a.get('ships').get(1).off();
	    });

	    test("#set(hasManyRelation, data) updates the current collection and doesn't create a new one", function () {
	        var Ship = Viking$1.Model.extend('ship', {});
	        var ShipCollection = Viking$1.Collection.extend({ model: Ship });
	        var Fleet = Viking$1.Model.extend('fleet', { hasMany: ['ships'] });

	        var f = new Fleet();
	        var s = new Ship();

	        f.set({ ships: [s] });
	        strictEqual(s.collection, f.get('ships'));
	    });

	    test("#set({type: klass}) initilizes hasMany associations", function () {
	        var Ship = Viking$1.Model.extend('ship');
	        var ShipCollection = Viking$1.Collection.extend({ model: Ship });
	        var Account = Viking$1.Model.extend('account');
	        var Agent = Account.extend('agent', { hasMany: ['ships'] });

	        var account = new Account();
	        ok(!(account instanceof Agent));
	        account.set({ type: 'agent' });
	        ok(account instanceof Agent);
	        ok(account.get('ships') instanceof ShipCollection);
	    });
	})();

	(function () {
	    module("Viking.Model#set");

	    test("#set({type: klass}) changes the object prototype of klass", function () {
	        var Account = Viking$1.Model.extend('account');
	        var Agent = Account.extend('agent');

	        var account = new Account();
	        ok(!(account instanceof Agent));
	        account.set({ type: 'agent' });

	        ok(account instanceof Agent);
	    });

	    test("#set({type: klass}) changes the modelName on instance to modelName of klass", function () {
	        var Account = Viking$1.Model.extend('account');
	        var Agent = Account.extend('agent');

	        var account = new Account();
	        ok(!(account instanceof Agent));
	        account.set({ type: 'agent' });

	        strictEqual(Agent.modelName, account.modelName);
	        propEqual(_.omit(account.modelName, 'model'), {
	            name: 'Agent',
	            element: 'agent',
	            human: 'Agent',
	            paramKey: 'agent',
	            plural: 'agents',
	            routeKey: 'agents',
	            singular: 'agent',
	            collection: 'agents',
	            collectionName: 'AgentCollection'
	        });
	    });

	    test("::set({type: string}) doesn't change the object prototype when inheritanceAttribute set to false", function () {
	        var Ship = Viking$1.Model.extend('ship', {
	            inheritanceAttribute: false
	        });
	        var Battleship = Ship.extend('battleship', {});

	        var bship = new Battleship();
	        bship.set({ type: 'ship' });

	        strictEqual(Battleship, bship.baseModel);
	    });

	    test("#set({type: klass}) doesn't change the modelName on instance to modelName of klass when inheritanceAttribute set to false", function () {
	        var Ship = Viking$1.Model.extend('ship', {
	            inheritanceAttribute: false
	        });
	        var Battleship = Ship.extend('battleship', {});

	        var bship = new Battleship();
	        bship.set({ type: 'ship' });

	        strictEqual(Battleship.modelName, bship.modelName);
	    });
	})();

	(function () {
	    module("Viking.Model#setErrors");

	    test("#setErrors is a noop if the size of the errors is 0", function () {
	        expect(0);

	        var m = new Viking$1.Model();
	        m.on('invalid', function (model, errors, options) {
	            ok(false);
	        });
	        m.setErrors({});
	        m.off('invalid');
	    });

	    test("#setErrors emits invalid event errors are set", function () {
	        expect(1);

	        var m = new Viking$1.Model();
	        m.on('invalid', function (model, errors, options) {
	            deepEqual(errors, {
	                "address": { "city": ["cant be blank"] },
	                "agents": [{ "email": ["cant be blank", "is invalid"] }],
	                "size": ["cant be blank", "is not a number"]
	            });
	        });

	        m.setErrors({
	            "address": { "city": ["cant be blank"] },
	            "agents": [{ "email": ["cant be blank", "is invalid"] }],
	            "size": ["cant be blank", "is not a number"]
	        });
	        m.off('invalid');
	    });
	})();

	(function () {
	    module("Viking.Model#sync", {
	        setup: function setup() {
	            this.requests = [];
	            this.xhr = sinon.useFakeXMLHttpRequest();
	            this.xhr.onCreate = _.bind(function (xhr) {
	                this.requests.push(xhr);
	            }, this);
	        },
	        teardown: function teardown() {
	            this.xhr.restore();
	        }
	    });

	    test("#sync namespaces the data to the paramRoot of the model when !options.data", function () {
	        var Model = Viking$1.Model.extend('model');

	        var m = new Model({ foo: 'bar' });
	        m.sync('create', m);
	        equal(this.requests[0].method, 'POST');
	        deepEqual(JSON.parse(this.requests[0].requestBody), {
	            model: { foo: 'bar' }
	        });
	    });

	    test("#sync doesn't set the data if options.data", function () {
	        var Model = Viking$1.Model.extend('model');

	        var m = new Model({ foo: 'bar' });
	        m.sync('patch', m, { data: { 'this': 'that' } });
	        equal(this.requests[0].method, 'PATCH');
	        deepEqual(this.requests[0].requestBody, {
	            'this': 'that'
	        });
	    });

	    test("#sync namespaces options.attrs to the paramRoot of the model if options.attrs", function () {
	        var Model = Viking$1.Model.extend('model');

	        var m = new Model({ foo: 'bar' });
	        m.sync('patch', m, { attrs: { 'this': 'that' } });
	        equal(this.requests[0].method, 'PATCH');
	        deepEqual(JSON.parse(this.requests[0].requestBody), {
	            model: { 'this': 'that' }
	        });
	    });

	    // test("#sync uses Viking.sync", function () {
	    //     expect(1);
	    //
	    //     var m = new Viking.Model();
	    //
	    //     var old = Viking.sync;
	    //     Viking.sync = function(method, model, options) {
	    //         ok(true);
	    //     }
	    //
	    //     m.sync();
	    //     Viking.sync = old;
	    // });
	})();

	(function () {
	    module("Viking.Model#toJSON", {
	        setup: function setup() {
	            this.Ship = Viking$1.Model.extend('ship', {
	                hasMany: ['ships'],
	                belongsTo: ['ship'],
	                schema: {
	                    date: { type: 'date' }
	                }
	            });
	            this.ShipCollection = Viking$1.Collection.extend({
	                model: this.Ship
	            });

	            this.ship = new this.Ship({
	                foo: 'bar',

	                ship: { bat: 'baz', ship: { bing: 'bong', ships: [] } },
	                ships: [{ ping: 'pong', ship: { bing: 'bong' } }, { ships: [] }],

	                date: "2013-04-10T21:24:28.000Z"
	            });
	        }
	    });

	    test("#toJSON", function () {
	        deepEqual(this.ship.toJSON(), {
	            foo: 'bar',
	            date: "2013-04-10T21:24:28.000Z"
	        });
	    });

	    test("#toJSON supports arrays", function () {
	        var Ship = Viking$1.Model.extend('ship', {
	            coercions: { date: ['Date', { array: true }] }
	        });

	        var ship = new Ship({
	            date: ["2013-04-10T21:24:28.000Z"]
	        });

	        deepEqual(ship.toJSON(), {
	            date: ["2013-04-10T21:24:28.000Z"]
	        });
	    });

	    test('#toJSON include belongsTo', function () {
	        deepEqual(this.ship.toJSON({ include: 'ship' }), {
	            foo: 'bar',
	            date: "2013-04-10T21:24:28.000Z",
	            ship_attributes: { bat: 'baz' }
	        });
	    });

	    test("#toJSON doesn't include belongsTo that is undefined", function () {
	        // undefined means probably not loaded
	        this.ship.unset('ship');

	        deepEqual(this.ship.toJSON({ include: 'ship' }), {
	            foo: 'bar',
	            date: "2013-04-10T21:24:28.000Z"
	        });
	    });

	    test("#toJSON includes belongsTo that is null", function () {
	        // null probably means loaded, but set to null to remove
	        this.ship.set('ship', null);

	        deepEqual(this.ship.toJSON({ include: 'ship' }), {
	            foo: 'bar',
	            date: "2013-04-10T21:24:28.000Z",
	            ship_attributes: null
	        });
	    });

	    test('#toJSON include belongsTo includes belongsTo', function () {
	        deepEqual(this.ship.toJSON({ include: {
	                ship: { include: 'ship' }
	            } }), {
	            foo: 'bar',
	            date: "2013-04-10T21:24:28.000Z",
	            ship_attributes: {
	                bat: 'baz',
	                ship_attributes: { bing: 'bong' }
	            }
	        });
	    });

	    test('#toJSON include belongsTo includes hasMany', function () {
	        deepEqual(this.ship.toJSON({ include: {
	                ship: { include: 'ships' }
	            } }), {
	            foo: 'bar',
	            date: "2013-04-10T21:24:28.000Z",
	            ship_attributes: {
	                bat: 'baz',
	                ships_attributes: []
	            }
	        });
	    });

	    test('#toJSON include hasMany', function () {
	        deepEqual(this.ship.toJSON({ include: 'ships' }), {
	            foo: 'bar',
	            date: "2013-04-10T21:24:28.000Z",
	            ships_attributes: [{ ping: 'pong' }, {}]
	        });
	    });

	    test('#toJSON include hasMany includes belongsTo', function () {
	        deepEqual(this.ship.toJSON({ include: {
	                ships: { include: 'ship' }
	            } }), {
	            foo: 'bar',
	            date: "2013-04-10T21:24:28.000Z",
	            ships_attributes: [{ ping: 'pong', ship_attributes: { bing: 'bong' } }, {}]
	        });
	    });

	    test('#toJSON include hasMany includes hasMany', function () {
	        deepEqual(this.ship.toJSON({ include: {
	                ships: { include: 'ships' }
	            } }), {
	            foo: 'bar',
	            date: "2013-04-10T21:24:28.000Z",
	            ships_attributes: [{ ping: 'pong', ships_attributes: [] }, { ships_attributes: [] }]
	        });
	    });
	})();

	(function () {
	    module("Viking.Model#toJSON - belongsTo");

	    test("#toJSON for belongsTo relation", function () {
	        var Ship = Viking$1.Model.extend('ship', { belongsTo: ['ship'] });
	        var a = new Ship({ 'ship': { foo: 'bar' }, bat: 'baz' });

	        deepEqual(a.toJSON({ include: 'ship' }), {
	            bat: 'baz',
	            ship_attributes: { foo: 'bar' }
	        });
	    });

	    test('#toJSON sets relation attributes to null if relation is null', function () {
	        var Ship = Viking$1.Model.extend('ship', { belongsTo: ['ship'] });
	        var a = new Ship({ 'ship': null, bat: 'baz' });

	        deepEqual(a.toJSON({ include: 'ship' }), {
	            bat: 'baz',
	            ship_attributes: null
	        });
	    });

	    test("#toJSON doesn't sets relation attributes to null if relation is falsely and not null", function () {
	        var Ship = Viking$1.Model.extend('ship', { belongsTo: ['ship'] });
	        var a = new Ship({ 'ship': null, bat: 'baz' });

	        deepEqual(a.toJSON({ include: 'ship' }), {
	            bat: 'baz',
	            ship_attributes: null
	        });
	    });
	})();

	(function () {
	    module("Viking.Model#toJSON - hasMany");

	    // toJSON --------------------------------------------------------------------
	    test("#toJSON for hasMany relation", function () {
	        var Ship = Viking$1.Model.extend('ship', {
	            hasMany: ['ships']
	        });
	        var ShipCollection = Viking$1.Collection.extend({
	            model: Ship
	        });

	        var a = new Ship({ 'ships': [{ foo: 'bar' }], bat: 'baz' });

	        deepEqual(a.toJSON({ include: { 'ships': { include: 'ships' } } }), {
	            bat: 'baz',
	            ships_attributes: [{
	                foo: 'bar',
	                ships_attributes: []
	            }]
	        });
	    });
	})();

	(function () {
	    module("Viking.Model#toParam");

	    test("#toParam() returns null on a model without an id", function () {
	        var model = new Viking$1.Model();

	        equal(null, model.toParam());
	    });

	    test("#toParam() returns id on a model with an id set", function () {
	        var model = new Viking$1.Model({ id: 42 });

	        equal(42, model.toParam());
	    });
	})();

	(function () {
	    module("Viking.Model#touch", {
	        setup: function setup() {
	            this.clock = sinon.useFakeTimers();

	            this.requests = [];
	            this.xhr = sinon.useFakeXMLHttpRequest();
	            this.xhr.onCreate = _.bind(function (xhr) {
	                this.requests.push(xhr);
	            }, this);
	        },
	        teardown: function teardown() {
	            this.clock.restore();
	            this.xhr.restore();
	        }
	    });

	    test("sends a PUT request to /models/:id/touch", function () {
	        var Model = Viking$1.Model.extend('model');

	        var m = new Model({ id: 2, foo: 'bar' });
	        m.touch();
	        equal(this.requests[0].method, 'PATCH');
	        equal(this.requests[0].url, '/models/2');
	        deepEqual(JSON.parse(this.requests[0].requestBody), {
	            model: { updated_at: new Date().toISOString(3) }
	        });
	    });

	    test("sends an empty body", function () {
	        var Model = Viking$1.Model.extend('model');

	        var m = new Model({ id: 2, foo: 'bar' });
	        m.touch();
	        deepEqual(JSON.parse(this.requests[0].requestBody), {
	            model: { updated_at: new Date().toISOString(3) }
	        });
	    });

	    test("sends the name of the column to be touched if specified", function () {
	        var Model = Viking$1.Model.extend('model');

	        var m = new Model({ id: 2, foo: 'bar' });
	        m.touch('read_at');
	        deepEqual(JSON.parse(this.requests[0].requestBody), {
	            model: {
	                read_at: new Date().toISOString(3),
	                updated_at: new Date().toISOString(3)
	            }
	        });
	    });

	    test("updates the attributes from the response", function () {
	        var Model = Viking$1.Model.extend('model', { schema: {
	                updated_at: { type: 'date' },
	                read_at: { type: 'date' }
	            } });

	        var m = new Model({ id: 2, updated_at: null, read_at: null });

	        equal(m.get('updated_at'), null);
	        m.touch();
	        this.requests[0].respond(200, '[]', JSON.stringify({ updated_at: "2013-04-10T21:24:28+00:00" }));
	        equal(m.get('updated_at').valueOf(), 1365629068000);

	        equal(m.get('read_at'), null);
	        m.touch('read_at');
	        this.requests[1].respond(200, '[]', JSON.stringify({ read_at: "2013-04-10T21:24:28+00:00" }));
	        equal(m.get('read_at').valueOf(), 1365629068000);
	    });
	})();

	(function () {
	    module("Viking.Model#unselect");

	    test("#unselect() triggers a 'unselected' event", function () {
	        expect(1);

	        var c = new Viking$1.Collection([{}]);
	        var model = c.models[0];
	        model.selected = true;
	        model.on('unselected', function () {
	            ok(!model.selected);
	        });
	        model.unselect();
	        model.off('unselected');
	    });

	    test("#unselect() triggers a 'unselected' event on collection", function () {
	        expect(1);

	        var c = new Viking$1.Collection([{}]);
	        c.models[0].selected = true;
	        c.on('unselected', function () {
	            ok(true);
	        });
	        c.models[0].unselect();
	        c.off('unselected');
	    });

	    test("#unselect() triggers a 'selected' event only if change", function () {
	        expect(0);

	        var c = new Viking$1.Collection([{}]);
	        var m = c.models[0];
	        m.on('unselected', function () {
	            ok(true);
	        });
	        m.unselect();
	        m.off('unselected');
	    });

	    test("#unselect() triggers a 'unselected' event on collection only if change", function () {
	        expect(0);

	        var c = new Viking$1.Collection([{}]);
	        c.models[0].selected = false;
	        c.on('unselected', function () {
	            ok(true);
	        });
	        c.models[0].unselect();
	        c.off('unselected');
	    });
	})();

	(function () {
	    module("Viking.model#unset - hasMany");

	    // setting attributes on a model coerces relations
	    test("#set(key) unsets a hasMany relationship", function () {
	        var Ship = Viking$1.Model.extend('ship', { hasMany: ['ships'] });
	        var ShipCollection = Viking$1.Collection.extend({ model: Ship });

	        var a = new Ship();
	        a.set('ships', [{}, {}]);

	        a.unset('ships');
	        ok(a.get('ships') instanceof ShipCollection);
	        equal(0, a.get('ships').length);
	    });
	})();

	(function () {
	    module("Viking.Model#updateAttribute");

	    test("#updateAttribute(key, data) calls #updateAttributes", function () {
	        expect(2);

	        var model = new Viking$1.Model();
	        model.updateAttributes = function (data, options) {
	            deepEqual(data, { key: 'value' });
	            equal(undefined, options);
	        };

	        model.updateAttribute('key', 'value');
	    });

	    test("#updateAttribute(key, data, options) calls #updateAttributes", function () {
	        expect(2);

	        var model = new Viking$1.Model();
	        model.updateAttributes = function (data, options) {
	            deepEqual(data, { key: 'value' });
	            deepEqual(options, { option: 'key' });
	        };

	        model.updateAttribute('key', 'value', { option: 'key' });
	    });
	})();

	(function () {
	    module("Viking.Model#updateAttributes");

	    test("#updateAttributes(data) calls #save", function () {
	        expect(2);

	        var model = new Viking$1.Model();
	        model.save = function (data, options) {
	            deepEqual(data, { key: 'value' });
	            deepEqual(options, { patch: true });
	        };

	        model.updateAttributes({ key: 'value' });
	    });

	    test("#updateAttributes(data, options) calls #save", function () {
	        expect(2);

	        var model = new Viking$1.Model();
	        model.save = function (data, options) {
	            deepEqual(data, { key: 'value' });
	            deepEqual(options, { patch: true, option: 1 });
	        };

	        model.updateAttributes({ key: 'value' }, { option: 1 });
	    });
	})();

	(function () {
	    module("Viking.Model#url");

	    test("#url /pluralModelName/id by default", function () {
	        var Model = Viking$1.Model.extend('model');
	        var model = new Model({ id: 42 });
	        equal(model.url(), '/models/42');

	        Model = Viking$1.Model.extend('namespaced/model');
	        model = new Model({ id: 42 });
	        equal(model.url(), '/namespaced_models/42');
	    });

	    test("#url /pluralModelName/slug by overriding #toParam()", function () {
	        var Model = Viking$1.Model.extend('model');
	        var model = new Model({ id: 42 });
	        model.toParam = function () {
	            return 'slug';
	        };

	        equal(model.url(), '/models/slug');
	    });

	    // STI test
	    test("#url returns an URL based on modelName of the baseModel", function () {
	        var Ship = Viking$1.Model.extend('ship');
	        var Carrier = Ship.extend();
	        var carrier = new Carrier({ id: 42 });

	        equal(carrier.url(), '/ships/42');
	    });
	})();

	(function () {
	    module("Viking.Model#urlRoot");

	    test("#urlRoot is an alias to ::urlRoot", function () {
	        var Model = Viking$1.Model.extend('model', {}, {
	            urlRoot: function urlRoot() {
	                return 42;
	            }
	        });

	        equal(new Model().urlRoot(), 42);
	    });
	})();

	(function () {
	    module("Viking.Model");

	    test("instance.modelName is set on instantiation", function () {
	        var model = new (Viking$1.Model.extend('model'))();

	        propEqual(_.omit(model.modelName, 'model'), {
	            name: 'Model',
	            element: 'model',
	            human: 'Model',
	            paramKey: 'model',
	            plural: 'models',
	            routeKey: 'models',
	            singular: 'model',
	            collection: 'models',
	            collectionName: 'ModelCollection'
	        });
	    });

	    test("::where() returns ModelCollection without a predicate", function () {
	        var Ship = Viking$1.Model.extend('ship');
	        var ShipCollection = Viking$1.Collection.extend({ model: Ship });

	        var scope = Ship.where();
	        ok(scope instanceof ShipCollection);
	        strictEqual(undefined, scope.predicate);
	    });

	    test("::where(predicate) returns ModelCollection with a predicate set", function () {
	        var Ship = Viking$1.Model.extend('ship');
	        var ShipCollection = Viking$1.Collection.extend({ model: Ship });

	        var scope = Ship.where({ name: 'Zoey' });
	        ok(scope instanceof ShipCollection);
	        deepEqual({ name: 'Zoey' }, scope.predicate.attributes);
	    });
	})();

	(function () {
	    module("Viking.PaginatedCollection");

	    // Cursor -----------------------------------------------------------------------
	    test("new sets new cursor", function () {
	        var pc = new Viking$1.PaginatedCollection();

	        ok(pc.cursor);
	    });

	    test("new sets cursor passed in options", function () {
	        var cursor = new Viking$1.Cursor();
	        var pc = new Viking$1.PaginatedCollection([], { cursor: cursor });

	        ok(cursor === pc.cursor);
	    });

	    test("cursorChanged called when cursor changes", function () {
	        expect(1);

	        var collection = Viking$1.PaginatedCollection.extend({
	            cursorChanged: function cursorChanged() {
	                ok(true);
	            }
	        });
	        var pc = new collection();

	        pc.cursor.incrementPage();
	    });

	    test("cursorChanged doesn't get called when not needed", function () {
	        expect(0);

	        var collection = Viking$1.PaginatedCollection.extend({
	            cursorChanged: function cursorChanged() {
	                ok(true);
	            }
	        });
	        var pc = new collection();

	        pc.cursor.set('total_pages', 4);
	    });

	    // Predicate -----------------------------------------------------------------
	    test("predicateChanged method is called when predicate is changed", function () {
	        expect(1);

	        var collection = Viking$1.PaginatedCollection.extend({
	            predicateChanged: function predicateChanged(options) {
	                ok(true);
	            }
	        });
	        var predicate = new Viking$1.Predicate();
	        var pc = new collection([], { predicate: predicate });

	        predicate.trigger('change');
	    });

	    test("predicateChanged resets the cursor and calls fetch()", function () {
	        expect(1);

	        var collection = Viking$1.PaginatedCollection.extend({
	            cursorChanged: function cursorChanged() {
	                ok(true);
	            }
	        });
	        var predicate = new Viking$1.Predicate();
	        var cursor = new Viking$1.Cursor({ page: 10 });
	        var pc = new collection([], { predicate: predicate, cursor: cursor });
	        predicate.trigger('change');
	    });

	    test("predicateChanged() calls cursorChanged()", function () {
	        expect(1);

	        var c = Viking$1.PaginatedCollection.extend({
	            cursorChanged: function cursorChanged() {
	                ok(true);
	            }
	        });
	        var c = new c();

	        c.predicateChanged();
	    });

	    // Parse ---------------------------------------------------------------------
	    test("parse extracts cursor information", function () {
	        var m = Viking$1.Model.extend('model');
	        var c = Viking$1.PaginatedCollection.extend({ model: m });
	        var c = new c();

	        c.cursor.set({ page: 3, per_page: 40, offset: 0 }, { silent: true });
	        c.parse([{ "id": 2069, "type": "lease" }], {
	            xhr: { getResponseHeader: function getResponseHeader(key) {
	                    if (key == 'Total-Count') {
	                        return 3049;
	                    }
	                } }
	        });
	        equal(77, c.cursor.totalPages());
	        equal(3049, c.cursor.get('total_count'));
	    });

	    // sync() --------------------------------------------------------------------
	    test("sync() adds in cursor params", function () {
	        expect(2);

	        var m = Viking$1.Model.extend('model');
	        var c = Viking$1.PaginatedCollection.extend({ model: m });
	        var c = new c([]);

	        var old = Viking$1.sync;
	        Viking$1.sync = function (method, model, options) {
	            equal(40, options.data.limit);
	            equal(40, options.data.offset);
	        };
	        c.cursor.set({ page: 2, per_page: 40 });
	        Viking$1.sync = old;
	    });
	})();

	(function () {
	    module("Viking.Router", {
	        setup: function setup() {
	            Viking$1.Router.prototype.cleanup = function () {
	                this.stop();
	                Backbone.history.handlers = [];
	            };
	        },
	        teardown: function teardown() {
	            delete Viking$1.Router.prototype.cleanup;
	        }
	    });

	    test("routes to a function in the router", function () {
	        expect(2);

	        var router = Viking$1.Router.extend({
	            routes: {
	                '': 'func'
	            },
	            func: function func() {
	                ok(true);
	            }
	        });
	        router = new router();

	        ok(Backbone.history.handlers[0].route.test(''));
	        Backbone.history.handlers[0].callback('');
	        router.cleanup();
	    });

	    test("routes to a function", function () {
	        expect(2);

	        var func = function func() {
	            ok(true);
	        };
	        var router = Viking$1.Router.extend({
	            routes: {
	                '': func
	            }
	        });
	        router = new router();

	        ok(Backbone.history.handlers[0].route.test(''));
	        Backbone.history.handlers[0].callback('');
	        router.cleanup();
	    });

	    test("routes to a controller and action (normal obj)", function () {
	        expect(2);

	        window.Controller = { action: function action() {
	                ok(true);
	            } };
	        var router = Viking$1.Router.extend({
	            routes: {
	                '': { to: 'Controller#action', name: 'root' }
	            }
	        });
	        router = new router();

	        ok(Backbone.history.handlers[0].route.test(''));
	        Backbone.history.handlers[0].callback('');
	        router.cleanup();
	        delete window.Controller;
	    });

	    test("routes to a controller and undefined action", function () {
	        expect(1);

	        window.Controller = {};
	        var router = Viking$1.Router.extend({
	            routes: {
	                '': { to: 'Controller#action', name: 'root' }
	            }
	        });
	        router = new router();

	        ok(Backbone.history.handlers[0].route.test(''));
	        Backbone.history.handlers[0].callback('');
	        router.cleanup();
	        delete window.Controller;
	    });

	    test("routes to a undefined controller and undefined action", function () {
	        expect(1);

	        var router = Viking$1.Router.extend({
	            routes: {
	                '': { to: 'Controller#action', name: 'root' }
	            }
	        });
	        router = new router();

	        ok(Backbone.history.handlers[0].route.test(''));
	        Backbone.history.handlers[0].callback('');
	        router.cleanup();
	    });

	    test("routes to a uninitialized controller and action (Viking.Controller)", function () {
	        expect(2);

	        window.Controller = Viking$1.Controller.extend({ action: function action() {
	                ok(true);
	            } });
	        var router = Viking$1.Router.extend({
	            routes: {
	                '': { to: 'Controller#action', name: 'root' }
	            }
	        });
	        router = new router();

	        ok(Backbone.history.handlers[0].route.test(''));
	        Backbone.history.handlers[0].callback('');
	        router.cleanup();
	        delete window.Controller;
	    });

	    test("routes to a initialized controller and action (Viking.Controller)", function () {
	        expect(2);

	        window.Controller = Viking$1.Controller.extend({ action: function action() {
	                ok(true);
	            } });
	        var router = Viking$1.Router.extend({
	            routes: {
	                '': { to: 'Controller#action', name: 'root' }
	            }
	        });
	        router = new router();
	        router.currentController = new Controller();

	        ok(Backbone.history.handlers[0].route.test(''));
	        Backbone.history.handlers[0].callback('');
	        router.cleanup();
	        delete window.Controller;
	    });

	    test("routing to a Viking.Controller more than once in a row only initializes the controller once", function () {
	        expect(2);

	        window.Controller = Viking$1.Controller.extend({ initialize: function initialize() {
	                ok(true);
	            } });
	        var router = Viking$1.Router.extend({
	            routes: {
	                '': { to: 'Controller#action', name: 'root' }
	            }
	        });
	        router = new router();

	        ok(Backbone.history.handlers[0].route.test(''));
	        Backbone.history.handlers[0].callback('');
	        Backbone.history.handlers[0].callback('');
	        Backbone.history.handlers[0].callback('');
	        router.cleanup();
	        delete window.Controller;
	    });

	    test("routing to a Viking.Controller then to another route changes the controller", function () {
	        expect(6);

	        window.Controller = Viking$1.Controller.extend();
	        window.BController = Viking$1.Controller.extend();
	        window.Another = {};
	        var router = Viking$1.Router.extend({
	            routes: {
	                '': { to: 'Controller#action', name: 'root' },
	                'b': { to: 'BController#action', name: 'b' },
	                'other': { to: 'Other#action', name: 'other' },
	                'another': { to: 'Another#action', name: 'another' },
	                'func': 'func',
	                'closure': function closure() {}
	            },

	            func: function func() {}
	        });
	        router = new router();

	        Backbone.history.handlers[0].callback('');
	        ok(router.currentController instanceof Controller);

	        Backbone.history.handlers[0].callback('');
	        Backbone.history.handlers[1].callback('b');
	        ok(router.currentController instanceof BController);

	        Backbone.history.handlers[0].callback('');
	        Backbone.history.handlers[2].callback('other');
	        equal(undefined, router.currentController);

	        Backbone.history.handlers[0].callback('');
	        Backbone.history.handlers[3].callback('another');
	        equal(Another, router.currentController);

	        Backbone.history.handlers[0].callback('');
	        Backbone.history.handlers[4].callback('func');
	        equal(undefined, router.currentController);

	        Backbone.history.handlers[0].callback('');
	        Backbone.history.handlers[5].callback('closure');
	        equal(undefined, router.currentController);

	        router.cleanup();
	        delete window.Controller;
	        delete window.BController;
	        delete window.Another;
	    });

	    test("routes to a Viking.Controller and undefined action", function () {
	        expect(1);

	        window.Controller = Viking$1.Controller.extend();
	        var router = Viking$1.Router.extend({
	            routes: {
	                '': { to: 'Controller#action', name: 'root' }
	            }
	        });
	        router = new router();

	        ok(Backbone.history.handlers[0].route.test(''));
	        Backbone.history.handlers[0].callback('');
	        router.cleanup();
	        delete window.Controller;
	    });

	    test("routes with a regex", function () {
	        expect(5);

	        var router = Viking$1.Router.extend({
	            routes: {
	                'r/^([a-z][a-z])\/([^\/]+)\/([^\/]+)$/': 'func'
	            },
	            func: function func(state, something, another) {
	                equal(state, 'ca');
	                equal(something, 'something');
	                equal(another, 'another');
	            }
	        });
	        router = new router();
	        ok(Backbone.history.handlers[0].route.test('ca/something/another'));
	        ok(!Backbone.history.handlers[0].route.test('dca/something/another'));
	        Backbone.history.handlers[0].callback.call(router, 'ca/something/another');
	        router.cleanup();
	    });

	    test('routes with a string', function () {
	        expect(3);

	        var router = Viking$1.Router.extend({
	            routes: {
	                '': 'Controller#action'
	            }
	        });
	        router = new router();

	        window.Controller = { action: function action() {
	                ok(true);
	            } };
	        ok(Backbone.history.handlers[0].route.test(''));
	        ok(!Backbone.history.handlers[0].route.test('dca/something/another'));
	        Backbone.history.handlers[0].callback.call(router, '');
	        router.cleanup();
	        delete window.Controller;
	    });

	    test("router.start() starts Backbone.history", function () {
	        expect(1);

	        var router = new Viking$1.Router();
	        var oldstart = Backbone.history.start;
	        Backbone.history.start = function () {
	            ok(true);
	        };
	        router.start();
	        Backbone.history.start = oldstart;
	    });

	    test("router.start() passes {pushState: true} as options to Backbone.history", function () {
	        expect(1);

	        var router = new Viking$1.Router();
	        var oldstart = Backbone.history.start;
	        Backbone.history.start = function (options) {
	            deepEqual({ pushState: true }, options);
	        };
	        router.start();
	        Backbone.history.start = oldstart;
	    });

	    test("router.start(options) passes options to Backbone.history", function () {
	        expect(1);

	        var router = new Viking$1.Router();
	        var oldstart = Backbone.history.start;
	        Backbone.history.start = function (options) {
	            deepEqual({ pushState: true, silent: true }, options);
	        };
	        router.start({ silent: true });
	        Backbone.history.start = oldstart;
	    });

	    test("router.stop() stops Backbone.history", function () {
	        expect(1);

	        var router = new Viking$1.Router();
	        var oldstop = Backbone.history.stop;
	        Backbone.history.stop = function () {
	            ok(true);
	        };
	        router.start();
	        router.stop();
	        Backbone.history.stop = oldstop;
	        router.cleanup();
	    });

	    test('router.start() calls callbacks with the name of the route', function () {
	        expect(2);

	        window.Controller = { action: function action() {
	                ok(true);
	            } };
	        var r = {};
	        r[window.location.pathname.replace('/', '')] = { to: 'Controller#action', name: 'root' };
	        var Router = Viking$1.Router.extend({ routes: r });

	        var router = new Router();
	        router.on('route:root', function () {
	            ok(true);
	        });
	        router.start();

	        router.cleanup();
	        router.off('route:root');
	        delete window.Controller;
	    });

	    test('router.navigate() calls Backbone.Router.prototype.navigate', function () {
	        expect(2);

	        var oldnavigate = Backbone.Router.prototype.navigate;

	        var router = new Viking$1.Router();
	        Backbone.Router.prototype.navigate = function (f, a) {
	            equal(f, '/path');
	            equal(a, 'arguments');
	        };
	        router.navigate('/path', 'arguments');

	        Backbone.Router.prototype.navigate = oldnavigate;
	    });

	    test('router.navigate() strips the root_url from urls from the current domain', function () {
	        expect(2);

	        var oldnavigate = Backbone.Router.prototype.navigate;

	        var router = new Viking$1.Router();
	        Backbone.Router.prototype.navigate = function (f, a) {
	            equal(f, '/path');
	            equal(a, 'arguments');
	        };
	        router.navigate(window.location.protocol + '//' + window.location.host + '/path', 'arguments');

	        Backbone.Router.prototype.navigate = oldnavigate;
	    });
	})();

	(function () {
	    module("Array");

	    test('#toParam()', function () {
	        equal('2013/myString/true', [2013, 'myString', true].toParam());
	    });

	    test("#toParam() doesn't show up in iterators", function () {
	        var objs = [];
	        var array = [];

	        _.each(array, function (value, key) {
	            objs.push(key);
	        });

	        ok(!_.include(objs, 'toParam'));
	    });

	    test('#toQuery(key)', function () {
	        equal('key%5B%5D=2013&key%5B%5D=myString&key%5B%5D=true&key%5B%5D=', [2013, 'myString', true, null].toQuery('key'));
	    });

	    test("#toQuery() doesn't show up in iterators", function () {
	        var objs = [];
	        var array = [];

	        _.each(array, function (value, key) {
	            objs.push(key);
	        });

	        ok(!_.include(objs, 'toQuery'));
	    });
	})();

	(function () {
		module("Boolean");

		test('#toParam()', function () {
			equal('true', true.toParam());
			equal('false', false.toParam());
		});

		test('#toQuery(key)', function () {
			equal('key=true', true.toQuery('key'));
			equal('key=false', false.toQuery('key'));
		});
	})();

	(function () {
	    module("Date");

	    test("strftime", function () {
	        var d = new Date(1363904818448);

	        // TODO: turns out timezone in javascript are nonexist, well existent
	        // but untouchable and any date you create is in the loacle timezone,
	        // so this test fails when adding %Z on a server set to a timezone
	        // other than PDT, also %I
	        // equal(d.strftime('%A %I %-m %Y %Z'), 'Thursday 03 3 2013 PDT');
	        equal(d.strftime('%A %-m %Y'), 'Thursday 3 2013');
	    });

	    test('#toParam()', function () {
	        equal('2013-03-21T22:26:58.448Z', new Date(1363904818448).toParam());
	    });

	    test('#toQuery(key)', function () {
	        equal('key=2013-03-21T22%3A26%3A58.448Z', new Date(1363904818448).toQuery('key'));
	    });
	})();

	(function () {
	    module("Number");

	    test("1.ordinalize()", function () {
	        equal('1st', 1..ordinalize());
	    });

	    test("2.ordinalize()", function () {
	        equal('2nd', 2..ordinalize());
	    });

	    test("3.ordinalize()", function () {
	        equal('3rd', 3..ordinalize());
	    });

	    test("4.ordinalize()", function () {
	        equal('4th', 4..ordinalize());
	    });

	    test("100.ordinalize()", function () {
	        equal('100th', 100..ordinalize());
	    });

	    test("1013.ordinalize()", function () {
	        equal('1013th', 1013..ordinalize());
	    });

	    test('#toParam()', function () {
	        equal('1013', 1013..toParam());
	    });

	    test('#toQuery(key)', function () {
	        equal('key=42', 42..toQuery('key'));
	    });
	})();

	(function () {
	    module("Object");

	    test('#toParam()', function () {
	        equal('1=2013&2=myString&3=true&4&5=false', { 1: 2013, 2: 'myString', 3: true, 4: null, 5: false }.toParam());
	    });

	    test('#toParam(namespace)', function () {
	        equal('namespace%5B1%5D=2013&namespace%5B2%5D=myString&namespace%5B3%5D=true&namespace%5B4%5D&namespace%5B5%5D=false', { 1: 2013, 2: 'myString', 3: true, 4: null, 5: false }.toParam('namespace'));
	    });

	    test("#toParam() doesn't show up in iterators", function () {
	        var objs = [];
	        var obj = {};

	        _.each(obj, function (value, key) {
	            objs.push(key);
	        });

	        ok(!_.include(objs, 'toParam'));
	    });

	    test('#toQuery is an alias for #toParam', function () {
	        strictEqual(Object.prototype.toParam, Object.prototype.toQuery);
	    });

	    test("#toQuery() doesn't show up in iterators", function () {
	        var objs = [];
	        var obj = {};

	        _.each(obj, function (value, key) {
	            objs.push(key);
	        });

	        ok(!_.include(objs, 'toQuery'));
	    });
	})();

	(function () {
	    module("String");

	    test("capitalize()", function () {
	        equal("test".capitalize(), 'Test');
	        equal("Test".capitalize(), 'Test');
	    });

	    test("anticapitalize()", function () {
	        equal("Test".anticapitalize(), 'test');
	        equal("test".anticapitalize(), 'test');
	    });

	    test("titleize()", function () {
	        equal("man from the boondocks".titleize(), "Man From The Boondocks");
	        equal("x-men: the last stand".titleize(), "X Men: The Last Stand");
	        equal("TheManWithoutAPast".titleize(), "The Man Without A Past");
	        equal("raiders_of_the_lost_ark".titleize(), "Raiders Of The Lost Ark");
	    });

	    test("humanize()", function () {
	        equal("employee_salary".humanize(), "Employee salary");
	        equal("author_id".humanize(), "Author");
	        equal("the_man_without_a_past".humanize(), "The man without a past");
	    });

	    test("underscore()", function () {
	        equal("ActiveModel".underscore(), "active_model");
	        equal("ActiveModel.Errors".underscore(), "active_model/errors");
	        equal("SSLError".underscore(), "ssl_error");
	    });

	    test("camelize()", function () {
	        equal("active_model".camelize(), "ActiveModel");
	        equal("active_model".camelize(true), "ActiveModel");
	        equal("active_model".camelize(false), "activeModel");
	        equal("active_model/errors".camelize(), "ActiveModel.Errors");
	        equal("active_model/errors".camelize(true), "ActiveModel.Errors");
	        equal("active_model/errors".camelize(false), "activeModel.Errors");
	    });

	    test("booleanize()", function () {
	        equal("true".booleanize(), true);
	        equal("false".booleanize(), false);
	        equal("other".booleanize(), false);
	        equal("other".booleanize(true), true);
	    });

	    test("dasherize()", function () {
	        equal("puni_puni".dasherize(), "puni-puni");
	    });

	    test("parameterize()", function () {
	        equal("Donald E. Knuth".parameterize(), 'donald-e-knuth');
	        equal("Donald E. Knuth".parameterize('_'), 'donald_e_knuth');
	    });

	    test("pluralize()", function () {
	        equal("word".pluralize(), "words");
	        equal("word".pluralize(1), "word");
	        equal("word".pluralize(3, true), "3 words");
	    });

	    test("singularize()", function () {
	        equal("words".singularize(), "word");
	    });

	    test('demodulize()', function () {
	        equal('Namespaced.Module'.demodulize(), 'Module');
	        equal('Module'.demodulize(), 'Module');
	        equal(''.demodulize(), '');
	    });

	    test("constantize()", function () {
	        equal("Viking".constantize(), Viking$1);
	        equal("Viking.Model".constantize(), Viking$1.Model);
	        equal("Model".constantize(Viking$1), Viking$1.Model);
	        throws(function () {
	            "Unknown".constantize();
	        }, Viking$1.NameError, "uninitialized variable Unknown");
	        throws(function () {
	            "Unknown.Again".constantize();
	        }, Viking$1.NameError, "uninitialized variable Unknown.Again");
	    });

	    test("rjust()", function () {
	        equal('hello'.rjust(4), 'hello');
	        equal('hello'.rjust(10), '     hello');
	        equal('hello'.rjust(10, '-'), '-----hello');
	        equal('hello'.rjust(10, '1234'), '12341hello');

	        // Test doesn't modify original
	        var string = 'hello';
	        string.rjust(10);
	        equal(string, 'hello');
	    });

	    test("ljust()", function () {
	        equal('hello'.ljust(4), 'hello');
	        equal('hello'.ljust(10), 'hello     ');
	        equal('hello'.ljust(10, '-'), 'hello-----');
	        equal('hello'.ljust(10, '1234'), 'hello12341');

	        // Test doesn't modify original
	        var string = 'hello';
	        string.ljust(10);
	        equal(string, 'hello');
	    });

	    test('#toParam()', function () {
	        equal("myString", "myString".toParam());
	    });

	    test('#toQuery(key)', function () {
	        equal('key=gnirts', 'gnirts'.toQuery('key'));
	    });
	})();

	(function () {
	    module("Viking.sync", {
	        setup: function setup() {
	            this.requests = [];
	            this.xhr = sinon.useFakeXMLHttpRequest();
	            this.xhr.onCreate = _.bind(function (xhr) {
	                this.requests.push(xhr);
	            }, this);
	        },
	        teardown: function teardown() {
	            this.xhr.restore();
	        }
	    });

	    test("sync uses .toParam() as opposed to letting jQuery use $.param()", function () {
	        var model = new Viking$1.Model();

	        Viking$1.sync('read', model, { url: '/', data: { order: [{ key: 'asc' }] } });
	        equal(this.requests[0].url, encodeURI("/?order[][key]=asc"));
	    });

	    test("ajax uses connection config info from model", function () {
	        var Model = Viking$1.Model.extend('name', {
	            connection: {
	                host: 'http://google.com',
	                withCredentials: true,
	                headers: {
	                    'API-Version': '0.1.0'
	                }
	            }
	        });

	        var model = new Model();
	        model.save();

	        equal(this.requests[0].url, encodeURI("http://google.com/names"));
	        equal(this.requests[0].withCredentials, true);
	        equal(this.requests[0].requestHeaders['API-Version'], "0.1.0");
	    });

	    test("ajax uses connection config info inherited from ancestors", function () {
	        var Name = Viking$1.Model.extend('name', {
	            connection: {
	                host: 'http://google.com',
	                withCredentials: true,
	                headers: {
	                    'API-Version': '0.1.0'
	                }
	            }
	        });

	        var FirstName = Name.extend('first_name');

	        var model = new FirstName();
	        model.save();

	        equal(this.requests[0].url, encodeURI("http://google.com/names"));
	        equal(this.requests[0].withCredentials, true);
	        equal(this.requests[0].requestHeaders['API-Version'], "0.1.0");
	    });

	    test("ajax uses connection config info from Viking.Model", function () {
	        var Model = Viking$1.Model.extend('name');

	        Viking$1.Model.prototype.connection = {
	            host: 'http://google.com',
	            withCredentials: true,
	            headers: {
	                'API-Version': '0.1.0'
	            }
	        };

	        var model = new Model();
	        model.save();

	        equal(this.requests[0].url, encodeURI("http://google.com/names"));
	        equal(this.requests[0].withCredentials, true);
	        equal(this.requests[0].requestHeaders['API-Version'], "0.1.0");

	        delete Viking$1.Model.prototype.connection;
	    });

	    test("ajax uses connection config info inherited from abstract model", function () {
	        var MyModel = Viking$1.Model.extend('myModel', {
	            abstract: true,

	            connection: {
	                host: 'http://google.com',
	                withCredentials: true,
	                headers: {
	                    'API-Version': '0.1.0'
	                }
	            }
	        });

	        var Model = MyModel.extend('name');

	        var model = new Model();
	        model.save();

	        equal(this.requests[0].url, encodeURI("http://google.com/names"));
	        equal(this.requests[0].withCredentials, true);
	        equal(this.requests[0].requestHeaders['API-Version'], "0.1.0");
	    });
	})();

	(function () {
	    module("Viking.View.Helpers#imageTag");

	    test("imageTag(src)", function () {
	        equal(Viking$1.View.Helpers.imageTag('/assets/icon.png'), '<img alt="Icon" src="/assets/icon.png">');
	    });

	    test("imageTag(src, options)", function () {
	        equal(Viking$1.View.Helpers.imageTag('/assets/icon.png', { size: '16x10', alt: 'A caption' }), '<img alt="A caption" height="10" src="/assets/icon.png" width="16">');
	    });

	    test("imageTag(src, options)", function () {
	        equal(Viking$1.View.Helpers.imageTag('/assets/icon.gif', { size: '16' }), '<img alt="Icon" height="16" src="/assets/icon.gif" width="16">');
	    });

	    test("imageTag(src, options)", function () {
	        equal(Viking$1.View.Helpers.imageTag('/icons/icon.gif', { height: '32', width: '32' }), '<img alt="Icon" height="32" src="/icons/icon.gif" width="32">');
	    });

	    test("imageTag(src, options)", function () {
	        equal(Viking$1.View.Helpers.imageTag('/icons/icon.gif', { 'class': 'menu_icon' }), '<img alt="Icon" class="menu_icon" src="/icons/icon.gif">');
	    });
	})();

	(function () {
	    module("Viking.View.Helpers#distanceOfTimeInWords");

	    // Test each type of function call
	    test("distanceOfTimeInWords(now - 5 seconds)", function () {
	        var from = new Date();
	        from.setTime(from.getTime() - 5000);

	        equal(Viking$1.View.Helpers.distanceOfTimeInWords(from), 'a minute');
	    });

	    test("distanceOfTimeInWords(now + 1 day)", function () {
	        var from = new Date();
	        from.setTime(from.getTime() + 1..day());

	        equal(Viking$1.View.Helpers.distanceOfTimeInWords(from), 'a day');
	    });

	    test("distanceOfTimeInWords(fromTime, {includeSeconds: true})", function () {
	        var from = new Date();
	        var to = new Date();
	        to.setTime(from.getTime() + 5000);

	        equal(Viking$1.View.Helpers.distanceOfTimeInWords(from, to, { includeSeconds: true }), '5 seconds');
	    });

	    test("distanceOfTimeInWords(fromTime, fromTime + 5.seconds)", function () {
	        var from = new Date();
	        var to = new Date();
	        to.setTime(from.getTime() + 5000);

	        equal(Viking$1.View.Helpers.distanceOfTimeInWords(from, to), 'a minute');
	    });

	    test("distanceOfTimeInWords(fromTime, fromTime + 5.seconds, {includeSeconds: true})", function () {
	        var from = new Date();
	        var to = new Date();
	        to.setTime(from.getTime() + 5000);

	        equal(Viking$1.View.Helpers.distanceOfTimeInWords(from, to, { includeSeconds: true }), '5 seconds');
	    });

	    // Now test the input / output combos
	    test("distanceOfTimeInWords output", function () {
	        var fromTime = new Date();
	        var toTime = new Date();

	        //   0 secs <-> 1 min, 29 secs                                                  # => a minute
	        toTime.setTime(fromTime.getTime() + 0);
	        equal(Viking$1.View.Helpers.distanceOfTimeInWords(fromTime, toTime), 'a minute');

	        toTime.setTime(fromTime.getTime() + 1..minutes() + 29..seconds());
	        equal(Viking$1.View.Helpers.distanceOfTimeInWords(fromTime, toTime), 'a minute');

	        //   1 min, 30 secs <-> 59 mins, 29 secs                                        # => [2..59] minutes
	        toTime.setTime(fromTime.getTime() + 1..minutes() + 30..seconds());
	        equal(Viking$1.View.Helpers.distanceOfTimeInWords(fromTime, toTime), '2 minutes');

	        toTime.setTime(fromTime.getTime() + 59..minutes() + 29..seconds());
	        equal(Viking$1.View.Helpers.distanceOfTimeInWords(fromTime, toTime), '59 minutes');

	        //   59 mins, 30 secs <-> 1 hr, 29 mins, 59 secs                                # => an hour
	        toTime.setTime(fromTime.getTime() + 59..minutes() + 30..seconds());
	        equal(Viking$1.View.Helpers.distanceOfTimeInWords(fromTime, toTime), 'an hour');

	        toTime.setTime(fromTime.getTime() + 1..hour() + 29..minutes() + 59..seconds());
	        equal(Viking$1.View.Helpers.distanceOfTimeInWords(fromTime, toTime), 'an hour');

	        //   1 hr, 30 mins, 0 secs <-> 23 hrs, 29 mins, 59 secs                         # => [2..23] hours
	        toTime.setTime(fromTime.getTime() + 1..hour() + 30..minutes());
	        equal(Viking$1.View.Helpers.distanceOfTimeInWords(fromTime, toTime), '2 hours');

	        toTime.setTime(fromTime.getTime() + 23..hours() + 29..minutes() + 59..seconds());
	        equal(Viking$1.View.Helpers.distanceOfTimeInWords(fromTime, toTime), '23 hours');

	        //   23 hrs, 30 mins, 0 secs <-> 1 day, 11 hrs, 59 mins, 59 secs                # => a day
	        toTime.setTime(fromTime.getTime() + 23..hours() + 30..minutes());
	        equal(Viking$1.View.Helpers.distanceOfTimeInWords(fromTime, toTime), 'a day');

	        toTime.setTime(fromTime.getTime() + 1..day() + 11..hours() + 59..minutes() + 59..seconds());
	        equal(Viking$1.View.Helpers.distanceOfTimeInWords(fromTime, toTime), 'a day');

	        //   1 day, 12 hrs, 0 mins, 0 secs <-> 29 days, 11 hrs, 59 mins, 59 secs        # => [2..29] days
	        toTime.setTime(fromTime.getTime() + 1..day() + 12..hours());
	        equal(Viking$1.View.Helpers.distanceOfTimeInWords(fromTime, toTime), '2 days');

	        toTime.setTime(fromTime.getTime() + 29..days() + 11..hours() + 59..minutes() + 59..seconds());
	        equal(Viking$1.View.Helpers.distanceOfTimeInWords(fromTime, toTime), '29 days');

	        //   29 days, 12 hrs, 0 mins, 0 secs <-> 44 days, 23 hrs, 59 mins, 59 secs       # => a month
	        toTime.setTime(fromTime.getTime() + 29..days() + 12..hours());
	        equal(Viking$1.View.Helpers.distanceOfTimeInWords(fromTime, toTime), 'a month');

	        toTime.setTime(fromTime.getTime() + 44..days() + 23..hours() + 59..minutes() + 59..seconds());
	        equal(Viking$1.View.Helpers.distanceOfTimeInWords(fromTime, toTime), 'a month');

	        //   45 days, 0 hrs, 0 mins, 0 secs <-> 1 yr minus 1 sec                        # => [2..12] months
	        toTime.setTime(fromTime.getTime() + 45..days());
	        equal(Viking$1.View.Helpers.distanceOfTimeInWords(fromTime, toTime), '2 months');

	        toTime.setTime(fromTime.getTime() + 365..days() - 1..second());
	        equal(Viking$1.View.Helpers.distanceOfTimeInWords(fromTime, toTime), '12 months');

	        //   1 yr <-> 1 yr, 3 months                                                    # => a year
	        var one_year = 526213.5675 * 60000;
	        toTime.setTime(fromTime.getTime() + one_year);
	        equal(Viking$1.View.Helpers.distanceOfTimeInWords(fromTime, toTime), 'a year');

	        toTime.setTime(fromTime.getTime() + one_year * 1.32);
	        equal(Viking$1.View.Helpers.distanceOfTimeInWords(fromTime, toTime), 'a year');

	        //   1 yr, 3 months <-> 1 yr, 9 months                                          # => over a year
	        toTime.setTime(fromTime.getTime() + one_year * 1.34);
	        equal(Viking$1.View.Helpers.distanceOfTimeInWords(fromTime, toTime), 'over a year');

	        toTime.setTime(fromTime.getTime() + one_year * 1.65);
	        equal(Viking$1.View.Helpers.distanceOfTimeInWords(fromTime, toTime), 'over a year');

	        //   1 yr, 9 months <-> 2 yr minus 1 sec                                        # => almost 2 years
	        toTime.setTime(fromTime.getTime() + one_year * 1.66);
	        equal(Viking$1.View.Helpers.distanceOfTimeInWords(fromTime, toTime), 'almost 2 years');

	        toTime.setTime(fromTime.getTime() + one_year * 1.99);
	        equal(Viking$1.View.Helpers.distanceOfTimeInWords(fromTime, toTime), 'almost 2 years');

	        //   2 yrs <-> max time or date                                                 # => (same rules as 1 yr)
	        toTime.setTime(fromTime.getTime() + one_year * 2);
	        equal(Viking$1.View.Helpers.distanceOfTimeInWords(fromTime, toTime), '2 years');

	        toTime.setTime(fromTime.getTime() + one_year * 2.7);
	        equal(Viking$1.View.Helpers.distanceOfTimeInWords(fromTime, toTime), 'almost 3 years');
	    });

	    // Now test the input / output combos
	    test("distanceOfTimeInWords output with includeSeconds option", function () {
	        var fromTime = new Date();
	        var toTime = new Date();

	        //   0-1   secs      # => a second
	        toTime.setTime(fromTime.getTime() + 0);
	        equal(Viking$1.View.Helpers.distanceOfTimeInWords(fromTime, toTime, { includeSeconds: true }), 'a second');

	        toTime.setTime(fromTime.getTime() + 1..second());
	        equal(Viking$1.View.Helpers.distanceOfTimeInWords(fromTime, toTime, { includeSeconds: true }), 'a second');

	        //   2-9   secs      # => [1..9] seconds
	        toTime.setTime(fromTime.getTime() + 2..seconds());
	        equal(Viking$1.View.Helpers.distanceOfTimeInWords(fromTime, toTime, { includeSeconds: true }), '2 seconds');

	        toTime.setTime(fromTime.getTime() + 9..seconds());
	        equal(Viking$1.View.Helpers.distanceOfTimeInWords(fromTime, toTime, { includeSeconds: true }), '9 seconds');

	        //   10-54 secs      # => [10,20...50] seconds
	        toTime.setTime(fromTime.getTime() + 10..seconds());
	        equal(Viking$1.View.Helpers.distanceOfTimeInWords(fromTime, toTime, { includeSeconds: true }), '10 seconds');

	        toTime.setTime(fromTime.getTime() + 54..seconds());
	        equal(Viking$1.View.Helpers.distanceOfTimeInWords(fromTime, toTime, { includeSeconds: true }), '50 seconds');

	        //   55-89 secs      # => a minute
	        toTime.setTime(fromTime.getTime() + 55..seconds());
	        equal(Viking$1.View.Helpers.distanceOfTimeInWords(fromTime, toTime, { includeSeconds: true }), 'a minute');

	        toTime.setTime(fromTime.getTime() + 89..seconds());
	        equal(Viking$1.View.Helpers.distanceOfTimeInWords(fromTime, toTime, { includeSeconds: true }), 'a minute');
	    });
	})();

	(function () {
	       module("Viking.View.Helpers#check_box", {
	              setup: function setup() {
	                     this.Model = Viking$1.Model.extend("model");
	                     this.model = new this.Model();
	              }
	       });

	       // checkBox(model, attribute, options, checkedValue, uncheckedValue)
	       // =================================================================
	       test("checkBox(model, attribute)", function () {
	              this.model.set('key', true);
	              equal(Viking$1.View.Helpers.checkBox(this.model, 'key'), '<input name="model[key]" type="hidden" value="false"><input checked id="model_key" name="model[key]" type="checkbox" value="true">');

	              this.model.set('key', false);
	              equal(Viking$1.View.Helpers.checkBox(this.model, 'key'), '<input name="model[key]" type="hidden" value="false"><input id="model_key" name="model[key]" type="checkbox" value="true">');
	       });

	       test("checkBox(model, attribute, {}, yesValue, noValue)", function () {
	              this.model.set('key', 'yes');
	              equal(Viking$1.View.Helpers.checkBox(this.model, 'key', {}, 'yes', 'no'), '<input name="model[key]" type="hidden" value="no"><input checked id="model_key" name="model[key]" type="checkbox" value="yes">');

	              this.model.set('key', 'no');
	              equal(Viking$1.View.Helpers.checkBox(this.model, 'key', {}, 'yes', 'no'), '<input name="model[key]" type="hidden" value="no"><input id="model_key" name="model[key]" type="checkbox" value="yes">');
	       });

	       test("checkBox(model, attribute, options)", function () {
	              this.model.set('key', 'yes');
	              equal(Viking$1.View.Helpers.checkBox(this.model, 'key', { 'class': 'eula_check' }, 'yes', 'no'), '<input name="model[key]" type="hidden" value="no"><input checked class="eula_check" id="model_key" name="model[key]" type="checkbox" value="yes">');

	              this.model.set('key', 'no');
	              equal(Viking$1.View.Helpers.checkBox(this.model, 'key', { 'class': 'eula_check' }, 'yes', 'no'), '<input name="model[key]" type="hidden" value="no"><input class="eula_check" id="model_key" name="model[key]" type="checkbox" value="yes">');
	       });

	       test("checkBox(model, attribute) with error on attribute", function () {
	              this.model.validationError = { 'eula': ['must be accepted'] };

	              equal(Viking$1.View.Helpers.checkBox(this.model, 'eula'), '<input name="model[eula]" type="hidden" value="false"><input class="error" id="model_eula" name="model[eula]" type="checkbox" value="true">');

	              equal(Viking$1.View.Helpers.checkBox(this.model, 'eula', { 'class': 'eula' }, 'yes', 'no'), '<input name="model[eula]" type="hidden" value="no"><input class="eula error" id="model_eula" name="model[eula]" type="checkbox" value="yes">');
	       });

	       test("checkBox(model, attribute, options) allows you to override the name attribute on the html tag", function () {
	              this.model.set('key', 'yes');
	              equal(Viking$1.View.Helpers.checkBox(this.model, 'key', { name: 'eula_yes' }, 'yes', 'no'), '<input name="eula_yes" type="hidden" value="no"><input checked id="eula_yes" name="eula_yes" type="checkbox" value="yes">');
	       });

	       test("checkBox(model, attribute, options, yes_value, no_value, escape) passes along escape", function () {
	              this.model.set('key', 'yes');
	              equal(Viking$1.View.Helpers.checkBox(this.model, 'key', { "data-icon": "&#xf123;" }, 'yes', 'no', false), '<input name="model[key]" type="hidden" value="no"><input checked data-icon="&#xf123;" id="model_key" name="model[key]" type="checkbox" value="yes">');
	       });
	})();

	(function () {
	    module("Viking.View.Helpers#checkBoxGroup", {
	        setup: function setup() {
	            this.Model = Viking$1.Model.extend("model");
	            this.model = new this.Model();
	            this.model.set('roles', ['admin']);
	        }
	    });

	    // checkBoxGroup(model, attribute, options, content())
	    // ===================================================
	    test("checkBoxGroup(model, attribute, content())", function () {
	        equal(Viking$1.View.Helpers.checkBoxGroup(this.model, 'roles', function (b) {
	            return b.checkBox('agent') + b.checkBox('admin');
	        }), '<input id="model_roles_agent" name="model[roles][]" type="checkbox" value="agent"><input checked id="model_roles_admin" name="model[roles][]" type="checkbox" value="admin">');
	    });

	    test("checkBoxGroup(model, attribute, options, content())", function () {
	        equal(Viking$1.View.Helpers.checkBoxGroup(this.model, 'roles', { namespace: 'ns' }, function (b) {
	            return b.checkBox('agent') + b.checkBox('admin');
	        }), '<input id="ns_model_roles_agent" name="ns[model][roles][]" type="checkbox" value="agent"><input checked id="ns_model_roles_admin" name="ns[model][roles][]" type="checkbox" value="admin">');
	    });
	})();

	(function () {
	    module("Viking.View.Helpers#collection_select", {
	        setup: function setup() {
	            this.Model = Viking$1.Model.extend("model");
	            this.model = new this.Model();
	        }
	    });

	    // collectionSelect(model, attribute, collection, valueAttribute, textAttribute, options)
	    // ====================================================================================
	    test("collectionSelect(model, attribute, collection, valueAttribute, textAttribute)", function () {
	        var Post = Viking$1.Model.extend('post', {
	            belongsTo: ['author']
	        });

	        var Author = Viking$1.Model.extend('author', {
	            nameWithInitial: function nameWithInitial() {
	                return this.get('first_name')[0] + '. ' + this.get("last_name");
	            }
	        });

	        var AuthorCollection = Viking$1.Collection.extend({
	            model: Author
	        });

	        var post = new Post();
	        var authors = new AuthorCollection([{ id: 1, first_name: 'Jon', last_name: 'Bracy' }, { id: 2, first_name: "Daniel", last_name: "O'Shea" }]);
	        equal(Viking$1.View.Helpers.collectionSelect(post, 'author_id', authors, 'id', 'nameWithInitial', { prompt: true }), '<select id="post_author_id" name="post[author_id]"><option value="">Select</option><option value="1">J. Bracy</option>\n<option value="2">D. O&#x27;Shea</option></select>');
	    });

	    test("collectionSelect(model, attribute, collection, valueAttribute, textAttribute) allows html name attribute to be overridden", function () {
	        var Post = Viking$1.Model.extend('post', {
	            belongsTo: ['author']
	        });

	        var Author = Viking$1.Model.extend('author', {
	            nameWithInitial: function nameWithInitial() {
	                return this.get('first_name')[0] + '. ' + this.get("last_name");
	            }
	        });

	        var AuthorCollection = Viking$1.Collection.extend({
	            model: Author
	        });

	        var post = new Post();
	        var authors = new AuthorCollection([{ id: 1, first_name: 'Jon', last_name: 'Bracy' }, { id: 2, first_name: "Daniel", last_name: "O'Shea" }]);
	        equal(Viking$1.View.Helpers.collectionSelect(post, 'author_id', authors, 'id', 'nameWithInitial', { name: 'overridden' }), '<select id="overridden" name="overridden"><option value="1">J. Bracy</option>\n<option value="2">D. O&#x27;Shea</option></select>');
	    });
	})();

	(function () {
	    module("Viking.View.Helpers#formFor", {
	        setup: function setup() {
	            this.Model = Viking$1.Model.extend("model");
	            this.model = new this.Model();
	        }
	    });

	    // formFor(model, options, content())
	    // =================================
	    test("formFor(model, content())", function () {
	        equal(Viking$1.View.Helpers.formFor(this.model, function () {
	            return '';
	        }), '<form method="get"></form>');
	    });

	    test("formFor(model, {method: 'get'}, content())", function () {
	        equal(Viking$1.View.Helpers.formFor(this.model, { method: 'get' }, function () {
	            return '';
	        }), '<form method="get"></form>');
	    });

	    test("formFor(model, {method: 'post'}, content())", function () {
	        equal(Viking$1.View.Helpers.formFor(this.model, { method: "post" }, function () {
	            return '';
	        }), '<form method="post"></form>');
	    });

	    test("formFor(model, {method: 'patch'}, content())", function () {
	        equal(Viking$1.View.Helpers.formFor(this.model, { method: 'patch' }, function () {
	            return '';
	        }), '<form method="post"><div style="margin:0;padding:0;display:inline"><input name="_method" type="hidden" value="patch"></div></form>');
	    });

	    test("formFor(model, {method: 'put'}, content())", function () {
	        equal(Viking$1.View.Helpers.formFor(this.model, { method: 'put' }, function () {
	            return '';
	        }), '<form method="post"><div style="margin:0;padding:0;display:inline"><input name="_method" type="hidden" value="put"></div></form>');
	    });

	    test("formFor(model, {method: 'delete'}, content())", function () {
	        equal(Viking$1.View.Helpers.formFor(this.model, { method: 'delete' }, function () {
	            return '';
	        }), '<form method="post"><div style="margin:0;padding:0;display:inline"><input name="_method" type="hidden" value="delete"></div></form>');
	    });

	    test("formFor(model, {multipart: true}, content())", function () {
	        equal(Viking$1.View.Helpers.formFor(this.model, { multipart: true }, function () {
	            return '';
	        }), '<form enctype="multipart/form-data" method="post"></form>');
	    });

	    test("formFor(model, {multipart: true, method: 'patch'}, content())", function () {
	        equal(Viking$1.View.Helpers.formFor(this.model, { multipart: true, method: 'patch' }, function () {
	            return '';
	        }), '<form enctype="multipart/form-data" method="post"><div style="margin:0;padding:0;display:inline"><input name="_method" type="hidden" value="patch"></div></form>');
	    });

	    test("formFor(model, {multipart: true, method: 'get'}, content())", function () {
	        equal(Viking$1.View.Helpers.formFor(this.model, { multipart: true, method: 'get' }, function () {
	            return '';
	        }), '<form enctype="multipart/form-data" method="post"><div style="margin:0;padding:0;display:inline"><input name="_method" type="hidden" value="get"></div></form>');
	    });
	})();

	(function () {
	    module("Viking.View.Helpers#hidden_field", {
	        setup: function setup() {
	            this.Model = Viking$1.Model.extend("model");
	            this.model = new this.Model();
	        }
	    });

	    // hiddenField(model, attribute, options)
	    // ======================================
	    test("hiddenField(model, attribute)", function () {
	        equal(Viking$1.View.Helpers.hiddenField(this.model, 'key'), '<input name="model[key]" type="hidden" value="">');

	        this.model.set('key', 'token');
	        equal(Viking$1.View.Helpers.hiddenField(this.model, 'key'), '<input name="model[key]" type="hidden" value="token">');
	    });

	    test("hiddenField(model, attribute, options)", function () {
	        equal(Viking$1.View.Helpers.hiddenField(this.model, 'key', { 'class': 'test' }), '<input class="test" name="model[key]" type="hidden" value="">');
	    });

	    test("hiddenField(model, attribute, options) allows name to be overridden", function () {
	        equal(Viking$1.View.Helpers.hiddenField(this.model, 'key', { name: 'overridden' }), '<input name="overridden" type="hidden" value="">');
	    });
	})();

	(function () {
	    module("Viking.View.Helpers#label", {
	        setup: function setup() {
	            this.Model = Viking$1.Model.extend("model");
	            this.model = new this.Model();
	        }
	    });

	    // label(model, attribute, content, options)
	    // =========================================
	    test("label(model, attribute)", function () {
	        equal(Viking$1.View.Helpers.label(this.model, 'key'), '<label for="model_key">Key</label>');
	    });

	    test("label(model, attribute, options)", function () {
	        equal(Viking$1.View.Helpers.label(this.model, 'key', { 'class': 'options' }), '<label class="options" for="model_key">Key</label>');
	    });

	    test("label(model, attribute, content)", function () {
	        equal(Viking$1.View.Helpers.label(this.model, 'key', 'Content'), '<label for="model_key">Content</label>');

	        equal(Viking$1.View.Helpers.label(this.model, 'key', function () {
	            return "Content";
	        }), '<label for="model_key">Content</label>');
	    });

	    test("label(model, attribute, content, options)", function () {
	        equal(Viking$1.View.Helpers.label(this.model, 'title', 'A short title', { 'class': 'title_label' }), '<label class="title_label" for="model_title">A short title</label>');
	    });

	    test("label(model, attribute, options, content)", function () {
	        equal(Viking$1.View.Helpers.label(this.model, 'title', { 'class': 'title_label' }, function () {
	            return 'A short title';
	        }), '<label class="title_label" for="model_title">A short title</label>');
	    });

	    test("label(model, attribute) with error on attribute", function () {
	        this.model.validationError = { 'eula': ['must be accepted'] };

	        equal(Viking$1.View.Helpers.label(this.model, 'eula'), '<label class="error" for="model_eula">Eula</label>');
	    });

	    test("label(model, attribute, {for: 'override'}) uses 'override' for the `for` attribute", function () {
	        equal(Viking$1.View.Helpers.label(this.model, 'key', { 'for': 'override' }), '<label for="override">Key</label>');
	    });

	    test("label(model, attribute, content, options, escape)", function () {
	        equal(Viking$1.View.Helpers.label(this.model, 'key', '<key>', { 'class': 'options' }, false), '<label class="options" for="model_key"><key></label>');
	    });
	})();

	(function () {
	    module("Viking.View.Helpers#numberField", {
	        setup: function setup() {
	            this.Model = Viking$1.Model.extend("model");
	            this.model = new this.Model();
	        }
	    });

	    // numberField(model, attribute, options)
	    // ===================================
	    test("numberField(model, attribute)", function () {
	        equal(Viking$1.View.Helpers.numberField(this.model, 'age'), '<input id="model_age" name="model[age]" type="number">');

	        this.model.set('age', 27);
	        equal(Viking$1.View.Helpers.numberField(this.model, 'age'), '<input id="model_age" name="model[age]" type="number" value="27">');
	    });

	    test("numberField(model, attribute, options)", function () {
	        equal(Viking$1.View.Helpers.numberField(this.model, 'age', { min: 0, max: 100, step: 25 }), '<input id="model_age" max="100" min="0" name="model[age]" step="25" type="number">');
	    });

	    test("numberField(model, attribute) with error on attribute", function () {
	        this.model.validationError = { 'age': ['must not be blank'] };

	        equal(Viking$1.View.Helpers.numberField(this.model, 'age', { min: 0, max: 100, step: 25 }), '<input class="error" id="model_age" max="100" min="0" name="model[age]" step="25" type="number">');
	    });
	})();

	(function () {
	    module("Viking.View.Helpers#password_field", {
	        setup: function setup() {
	            this.Model = Viking$1.Model.extend("model");
	            this.model = new this.Model();
	        }
	    });

	    // passwordField(model, attribute, options)
	    // ========================================
	    test("passwordField(model, attribute)", function () {
	        equal(Viking$1.View.Helpers.passwordField(this.model, 'password'), '<input id="model_password" name="model[password]" type="password">');
	    });

	    test("passwordField(model, attribute, options)", function () {
	        equal(Viking$1.View.Helpers.passwordField(this.model, 'password', { 'class': "form_input", value: 'secret' }), '<input class="form_input" id="model_password" name="model[password]" type="password" value="secret">');
	    });

	    test("passwordField(model, attribute) with error on attribute", function () {
	        this.model.validationError = { 'password': ['must be accepted'] };

	        equal(Viking$1.View.Helpers.passwordField(this.model, 'password'), '<input class="error" id="model_password" name="model[password]" type="password">');
	    });

	    test("passwordField(model, attribute, options) allows name to be overridden", function () {
	        equal(Viking$1.View.Helpers.passwordField(this.model, 'password', { name: 'overridden' }), '<input id="overridden" name="overridden" type="password">');
	    });
	})();

	(function () {
	    module("Viking.View.Helpers#radio_button", {
	        setup: function setup() {
	            this.Model = Viking$1.Model.extend("model");
	            this.model = new this.Model();
	        }
	    });

	    // radioButton(model, attribute, tag_value, options)
	    // =================================================
	    test("radioButton(model, attribute, tag_value)", function () {
	        this.model.set('category', 'rails');

	        equal(Viking$1.View.Helpers.radioButton(this.model, "category", "rails"), '<input checked id="model_category_rails" name="model[category]" type="radio" value="rails">');
	        equal(Viking$1.View.Helpers.radioButton(this.model, "category", "java"), '<input id="model_category_java" name="model[category]" type="radio" value="java">');
	    });

	    test("radioButton(model, attribute, tag_value, options)", function () {
	        equal(Viking$1.View.Helpers.radioButton(this.model, "category", "yes", { id: 'test' }), '<input id="test" name="model[category]" type="radio" value="yes">');
	        equal(Viking$1.View.Helpers.radioButton(this.model, "category", "no", { checked: true }), '<input checked id="model_category_no" name="model[category]" type="radio" value="no">');
	    });

	    test("radioButton(model, attribute) with error on attribute", function () {
	        this.model.validationError = { 'eula': ['must be accepted'] };

	        equal(Viking$1.View.Helpers.radioButton(this.model, 'eula', 'true'), '<input class="error" id="model_eula_true" name="model[eula]" type="radio" value="true">');
	    });

	    test("radioButton(model, attribute) allows name to be overridden", function () {
	        equal(Viking$1.View.Helpers.radioButton(this.model, 'eula', 'true', { name: 'overridden' }), '<input id="overridden_true" name="overridden" type="radio" value="true">');
	    });
	})();

	(function () {
	    module("Viking.View.Helpers#select", {
	        setup: function setup() {
	            this.Model = Viking$1.Model.extend("model");
	            this.model = new this.Model();
	        }
	    });

	    // function select(model, attribute, collection, options)
	    // ======================================================
	    //TODO: add test for unset key
	    test("select(model, attribute, simple_array)", function () {
	        this.model.set("key", "value");

	        equal('<select id="model_key" name="model[key]"><option selected>value</option>\n<option>another_value</option></select>', Viking$1.View.Helpers.select(this.model, 'key', ['value', 'another_value']));
	    });

	    //TODO: add test for unset key   
	    test("select(model, attribute, tuple_array)", function () {
	        this.model.set("key", "1");

	        equal('<select id="model_key" name="model[key]"><option selected value="1">one</option>\n<option value="2">two</option></select>', Viking$1.View.Helpers.select(this.model, 'key', [['one', '1'], ['two', '2']]));
	    });

	    //TODO: add test for unset key
	    test("select(model, attribute, hash)", function () {
	        this.model.set("key", "$");

	        equal('<select id="model_key" name="model[key]"><option selected value="$">Dollar</option>\n<option value="DKK">Kroner</option></select>', Viking$1.View.Helpers.select(this.model, 'key', { "Dollar": "$", "Kroner": "DKK" }));
	    });

	    test("select(model, has_many_attribute, collection) Assumes multiple select", function () {
	        var Post = Viking$1.Model.extend('post', {
	            hasMany: ['authors']
	        });

	        var Author = Viking$1.Model.extend('author', {});

	        var AuthorCollection = Viking$1.Collection.extend({
	            model: Author
	        });

	        var post = new Post();
	        var authors = new AuthorCollection([{ id: 1, first_name: 'Jon', last_name: 'Bracy' }, { id: 2, first_name: "Daniel", last_name: "O'Shea" }]);
	        equal(Viking$1.View.Helpers.select(post, 'authors', authors.map(function (a) {
	            return [a.get('last_name'), a.get('id')];
	        })), '<select id="post_authors" multiple name="post[authors][]"><option value="1">Bracy</option>\n<option value="2">O&#x27;Shea</option></select>');
	    });

	    //TODO: add test for model, attribute, simple_array, {selected: nil} (key set)
	    //TODO: add test for model, attribute, simple_array, {selected: nil} (key unset)   
	    //TODO: add test for model, attribute, simple_array, {selected: string} (key set)
	    //TODO: add test for model, attribute, simple_array, {selected: string} (key unset)
	    //TODO: add test for model, attribute, simple_array, {selected: simple_array} (key set)
	    //TODO: add test for model, attribute, simple_array, {selected: simple_array} (key unset)
	    //TODO: add test for model, attribute, simple_array, {selected: func} (key set)
	    //TODO: add test for model, attribute, simple_array, {selected: func} (key unset)
	    // tuple_array
	    // hash

	    //TODO: add test for model, attribute, simple_array, {disabled: nil} (key set)
	    //TODO: add test for model, attribute, simple_array, {disabled: nil} (key unset)   
	    //TODO: add test for model, attribute, simple_array, {disabled: string} (key set)
	    //TODO: add test for model, attribute, simple_array, {disabled: string} (key unset)
	    //TODO: add test for model, attribute, simple_array, {disabled: simple_array} (key set)
	    //TODO: add test for model, attribute, simple_array, {disabled: simple_array} (key unset)
	    //TODO: add test for model, attribute, simple_array, {disabled: func} (key set)
	    //TODO: add test for model, attribute, simple_array, {disabled: func} (key unset)
	    // tuple_array
	    // hash

	    //TODO: test this:
	    // * A nested collection (see +groupedOptionsForSelect+).

	    //TODO: test this:   
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

	    test("select(model, attribute, simple_array, {name: 'custom'})", function () {
	        this.model.set("key", "value");

	        equal('<select id="custom" name="custom"><option selected>value</option>\n<option>another_value</option></select>', Viking$1.View.Helpers.select(this.model, 'key', ['value', 'another_value'], { "name": 'custom' }));
	    });
	})();

	(function () {
	    module("Viking.View.Helpers#text_area", {
	        setup: function setup() {
	            this.Model = Viking$1.Model.extend("model");
	            this.model = new this.Model();
	        }
	    });

	    // textArea(model, attribute, options)
	    // ===================================
	    test("textArea(model, attribute)", function () {
	        equal(Viking$1.View.Helpers.textArea(this.model, 'notes'), '<textarea id="model_notes" name="model[notes]"></textarea>');

	        this.model.set('notes', 'test');
	        equal(Viking$1.View.Helpers.textArea(this.model, 'notes'), '<textarea id="model_notes" name="model[notes]">test</textarea>');
	    });

	    test("textArea(model, attribute, options)", function () {
	        equal(Viking$1.View.Helpers.textArea(this.model, 'notes', { size: '20x40' }), '<textarea cols="20" id="model_notes" name="model[notes]" rows="40"></textarea>');
	    });

	    test("textArea(model, attribute) with error on attribute", function () {
	        this.model.validationError = { 'notes': ['must not be blank'] };

	        equal(Viking$1.View.Helpers.textArea(this.model, 'notes'), '<textarea class="error" id="model_notes" name="model[notes]"></textarea>');
	    });
	})();

	(function () {
	    module("Viking.View.Helpers#text_field", {
	        setup: function setup() {
	            this.Model = Viking$1.Model.extend("model");
	            this.model = new this.Model();
	        }
	    });

	    // textField(model, attribute, options)
	    // ====================================
	    test("textField(model, attribute)", function () {
	        equal(Viking$1.View.Helpers.textField(this.model, 'name'), '<input id="model_name" name="model[name]" type="text">');

	        this.model.set('name', 'My Name');
	        equal(Viking$1.View.Helpers.textField(this.model, 'name'), '<input id="model_name" name="model[name]" type="text" value="My Name">');
	    });

	    test("textField(model, attribute, options)", function () {
	        equal(Viking$1.View.Helpers.textField(this.model, 'name', { 'class': "create_input", size: 20 }), '<input class="create_input" id="model_name" name="model[name]" size="20" type="text">');
	    });

	    test("textField(model, attribute) with error on attribute", function () {
	        this.model.validationError = { 'notes': ['must not be blank'] };

	        equal(Viking$1.View.Helpers.textField(this.model, 'notes'), '<input class="error" id="model_notes" name="model[notes]" type="text">');
	    });

	    test("textField(model, attribute, {name: 'custom'})", function () {
	        equal(Viking$1.View.Helpers.textField(this.model, 'name', { "name": 'custom' }), '<input id="custom" name="custom" type="text">');
	    });
	})();

	(function () {
	    module("Viking.View.Helpers#button_tag");

	    // // buttonTag(content, options) buttonTag(options, block)
	    // // =======================================================
	    test("buttonTag()", function () {
	        equal(Viking$1.View.Helpers.buttonTag("Button"), '<button name="button" type="submit">Button</button>');
	    });

	    test("buttonTag(content, options)", function () {
	        equal(Viking$1.View.Helpers.buttonTag("Checkout", { disabled: true }), '<button disabled name="button" type="submit">Checkout</button>');
	    });

	    test("buttonTag(options, block)", function () {
	        equal(Viking$1.View.Helpers.buttonTag({ type: "button" }, function () {
	            return "Ask me!";
	        }), '<button name="button" type="button">Ask me!</button>');
	    });
	})();

	(function () {
	    module("Viking.View.Helpers#check_box_tag");

	    // // checkBoxTag(name, value="1", checked=false, options)
	    // // ======================================================
	    test("checkBoxTag(name)", function () {
	        equal(Viking$1.View.Helpers.checkBoxTag("accept"), '<input id="accept" name="accept" type="checkbox" value="1">');
	    });

	    test("checkBoxTag(name, value)", function () {
	        equal(Viking$1.View.Helpers.checkBoxTag('rock', 'rock music'), '<input id="rock" name="rock" type="checkbox" value="rock music">');
	    });

	    test("checkBoxTag(name, value, checked)", function () {
	        equal(Viking$1.View.Helpers.checkBoxTag('receive_email', 'yes', true), '<input checked id="receive_email" name="receive_email" type="checkbox" value="yes">');
	    });

	    test("checkBoxTag(name, value, checked, options)", function () {
	        equal(Viking$1.View.Helpers.checkBoxTag('tos', 'yes', false, { 'class': 'accept_tos' }), '<input class="accept_tos" id="tos" name="tos" type="checkbox" value="yes">');
	    });
	})();

	(function () {
	    module("Viking.View.Helpers#content_tag");

	    // // contentTag(name, content, [options], [escape])
	    // // ========================================
	    test("contentTag(name, content)", function () {
	        equal(Viking$1.View.Helpers.contentTag('p', 'Hello world & all!'), "<p>Hello world &amp; all!</p>");
	    });

	    test("contentTag(name, content, escape)", function () {
	        equal(Viking$1.View.Helpers.contentTag("p", "Hello world & all!", false), "<p>Hello world & all!</p>");
	    });

	    test("contentTag(name, content, options)", function () {
	        equal(Viking$1.View.Helpers.contentTag('p', 'Hello world & all!', { 'class': "strong" }), '<p class="strong">Hello world &amp; all!</p>');
	    });

	    test("contentTag(name, content, options, escape)", function () {
	        equal(Viking$1.View.Helpers.contentTag('p', 'Hello world & all!', { 'class': "strong" }, false), '<p class="strong">Hello world & all!</p>');
	    });

	    test("contentTag(name, block)", function () {
	        equal(Viking$1.View.Helpers.contentTag('p', function () {
	            return "Hello world&!";
	        }), '<p>Hello world&amp;!</p>');
	    });

	    test("contentTag(name, options, block)", function () {
	        equal(Viking$1.View.Helpers.contentTag('p', { 'class': "strong" }, function () {
	            return "Hello world&!";
	        }), '<p class="strong">Hello world&amp;!</p>');
	    });

	    test("contentTag(name, escape, block)", function () {
	        equal(Viking$1.View.Helpers.contentTag('p', false, function () {
	            return "Hello world&!";
	        }), '<p>Hello world&!</p>');
	    });

	    test("contentTag(name, options, escape, block)", function () {
	        equal(Viking$1.View.Helpers.contentTag('p', { 'class': "strong" }, false, function () {
	            return "Hello world&!";
	        }), '<p class="strong">Hello world&!</p>');
	    });
	})();

	(function () {
	    module("Viking.View.Helpers#form_tag");

	    // formTag(options, [&content])
	    // =============================
	    test("formTag()", function () {
	        equal(Viking$1.View.Helpers.formTag(), "<form>");
	    });

	    test("formTag({action: URL})", function () {
	        equal(Viking$1.View.Helpers.formTag({ action: '/action' }), '<form action="/action" method="post">');
	    });

	    test("formTag({action: URL, method: METHOD})", function () {
	        equal(Viking$1.View.Helpers.formTag({ action: '/action', method: 'get' }), '<form action="/action" method="get">');
	    });

	    test("formTag({action: URL, method: NON_BROWSER_METHOD})", function () {
	        equal(Viking$1.View.Helpers.formTag({ action: '/action', method: 'put' }), '<form action="/action" method="post"><input name="_method" type="hidden" value="put">');
	    });

	    test("formTag({multipart: true})", function () {
	        equal(Viking$1.View.Helpers.formTag({ multipart: true }), '<form enctype="multipart/form-data">');
	    });

	    test("formTag(content)", function () {
	        equal(Viking$1.View.Helpers.formTag('data'), "<form>data</form>");
	    });

	    test("formTag(emptyContent)", function () {
	        equal(Viking$1.View.Helpers.formTag(''), "<form></form>");
	    });

	    test("formTag(content, options)", function () {
	        equal(Viking$1.View.Helpers.formTag('data', { action: '/action', method: 'get' }), '<form action="/action" method="get">data</form>');
	    });

	    test("formTag(contentFunc, options)", function () {
	        var contentFunc = function contentFunc() {
	            return 'data';
	        };

	        equal(Viking$1.View.Helpers.formTag(contentFunc, { action: '/action', method: 'get' }), '<form action="/action" method="get">data</form>');
	    });

	    test("formTag(options, content)", function () {
	        equal(Viking$1.View.Helpers.formTag({ action: '/action', method: 'get' }, 'data'), '<form action="/action" method="get">data</form>');
	    });

	    test("formTag(options, contentFunc)", function () {
	        var contentFunc = function contentFunc() {
	            return 'data';
	        };

	        equal(Viking$1.View.Helpers.formTag({ action: '/action', method: 'get' }, contentFunc), '<form action="/action" method="get">data</form>');
	    });

	    test("formTag(content, {method: NON_BROWSER_METHOD})", function () {
	        equal(Viking$1.View.Helpers.formTag('data', { method: 'put' }), '<form method="post"><input name="_method" type="hidden" value="put">data</form>');
	    });
	})();

	(function () {
	    module("Viking.View.Helpers#hidden_field_tag");

	    // // hiddenFieldTag(name, value = nil, options = {})
	    // // ===============================================
	    test("hiddenFieldTag(name)", function () {
	        equal(Viking$1.View.Helpers.hiddenFieldTag('tags_list'), '<input name="tags_list" type="hidden">');
	    });

	    test("hiddenFieldTag(name, value)", function () {
	        equal(Viking$1.View.Helpers.hiddenFieldTag('token', 'VUBJKB23UIVI1UU1VOBVI@'), '<input name="token" type="hidden" value="VUBJKB23UIVI1UU1VOBVI@">');
	    });

	    test("hiddenFieldTag(name, value, options)", function () {
	        equal(Viking$1.View.Helpers.hiddenFieldTag('token', 'VUBJKB23UIVI1UU1VOBVI@', { 'class': 'mine' }), '<input class="mine" name="token" type="hidden" value="VUBJKB23UIVI1UU1VOBVI@">');
	    });
	})();

	(function () {
	    module("Viking.View.Helpers#label_tag");

	    // // labelTag(name, content, options) (name, options, block)
	    // // =======================================================
	    test("labelTag(content)", function () {
	        equal(Viking$1.View.Helpers.labelTag("Name"), '<label>Name</label>');
	    });

	    test("labelTag(content, options)", function () {
	        equal(Viking$1.View.Helpers.labelTag("Name", { 'for': "input" }), '<label for="input">Name</label>');
	    });

	    test("labelTag(content, options, escape)", function () {
	        equal(Viking$1.View.Helpers.labelTag("<Name>", { 'for': "input" }, false), '<label for="input"><Name></label>');
	    });

	    test("labelTag(block)", function () {
	        equal(Viking$1.View.Helpers.labelTag(function () {
	            return "Name";
	        }), '<label>Name</label>');
	    });

	    test("labelTag(options, block)", function () {
	        equal(Viking$1.View.Helpers.labelTag({ 'for': "input" }, function () {
	            return "Name";
	        }), '<label for="input">Name</label>');
	    });
	})();

	(function () {
	    module("Viking.View.Helpers#number_field_tag");

	    // numberFieldTag(name, value = nil, options = {})
	    // ===============================================
	    test("numberFieldTag(name)", function () {
	        equal(Viking$1.View.Helpers.numberFieldTag('count'), '<input id="count" name="count" type="number">');
	    });

	    test("numberFieldTag(name, value)", function () {
	        equal(Viking$1.View.Helpers.numberFieldTag('count', 10), '<input id="count" name="count" type="number" value="10">');
	    });

	    test("numberFieldTag(name, value, {min: X, max: Y})", function () {
	        equal(Viking$1.View.Helpers.numberFieldTag('count', 4, { min: 1, max: 9 }), '<input id="count" max="9" min="1" name="count" type="number" value="4">');
	    });

	    test("numberFieldTag(name, options)", function () {
	        equal(Viking$1.View.Helpers.numberFieldTag('count', { step: 25 }), '<input id="count" name="count" step="25" type="number">');
	    });
	})();

	(function () {
	    module("Viking.View.Helpers#options_for_select_tag");

	    // // optionsForSelectTag(container[, selected])
	    // // ==========================================
	    test("optionsForSelectTag(simple_array)", function () {
	        equal(Viking$1.View.Helpers.optionsForSelectTag(["VISA", "MasterCard"]), "<option>VISA</option>\n<option>MasterCard</option>");
	    });

	    test("optionsForSelectTag(tuple_array)", function () {
	        equal(Viking$1.View.Helpers.optionsForSelectTag([["Dollar", "$"], ["Kroner", "DKK"]]), '<option value="$">Dollar</option>\n<option value="DKK">Kroner</option>');
	    });

	    test("optionsForSelectTag(hash)", function () {
	        equal(Viking$1.View.Helpers.optionsForSelectTag({ "Dollar": "$", "Kroner": "DKK" }), '<option value="$">Dollar</option>\n<option value="DKK">Kroner</option>');
	    });

	    test("optionsForSelectTag(simple_array, selected)", function () {
	        equal(Viking$1.View.Helpers.optionsForSelectTag(["VISA", "MasterCard"], 'MasterCard'), "<option>VISA</option>\n<option selected>MasterCard</option>");
	    });

	    test("optionsForSelectTag(tuple_array, selected)", function () {
	        equal(Viking$1.View.Helpers.optionsForSelectTag([["Dollar", "$"], ["Kroner", "DKK"]], '$'), '<option selected value="$">Dollar</option>\n<option value="DKK">Kroner</option>');
	    });

	    test("optionsForSelectTag(hash, selected)", function () {
	        equal(Viking$1.View.Helpers.optionsForSelectTag({ "Basic": "$20", "Plus": "$40" }, "$40"), '<option value="$20">Basic</option>\n<option selected value="$40">Plus</option>');
	    });

	    test("optionsForSelectTag(simple_array, multipleSelected)", function () {
	        equal(Viking$1.View.Helpers.optionsForSelectTag(["VISA", "MasterCard", "Discover"], ['VISA', 'MasterCard']), "<option selected>VISA</option>\n<option selected>MasterCard</option>\n<option>Discover</option>");
	    });

	    test("optionsForSelectTag(tuple_array, multipleSelected)", function () {
	        equal(Viking$1.View.Helpers.optionsForSelectTag([["Dollar", "$"], ["Kroner", "DKK"], ["Ruble", "RUB"]], ['$', 'RUB']), '<option selected value="$">Dollar</option>\n<option value="DKK">Kroner</option>\n<option selected value="RUB">Ruble</option>');
	    });

	    test("optionsForSelectTag(hash, multipleSelected)", function () {
	        equal(Viking$1.View.Helpers.optionsForSelectTag({ "Basic": "$20", "Plus": "$40", "Royalty": "$60" }, ["$40", "$60"]), '<option value="$20">Basic</option>\n<option selected value="$40">Plus</option>\n<option selected value="$60">Royalty</option>');
	    });

	    test("optionsForSelectTag(simple_array_with_options)", function () {
	        equal(Viking$1.View.Helpers.optionsForSelectTag(["Denmark", ["USA", { 'class': 'bold' }], "Sweden"]), '<option>Denmark</option>\n<option class="bold">USA</option>\n<option>Sweden</option>');
	    });

	    test("optionsForSelectTag(tuple_array_with_options)", function () {
	        equal(Viking$1.View.Helpers.optionsForSelectTag([["Dollar", "$", { 'class': 'underscore' }], ["Kroner", "DKK"]]), '<option class="underscore" value="$">Dollar</option>\n<option value="DKK">Kroner</option>');
	    });

	    test("optionsForSelectTag(simple_array, {disabled: string})", function () {
	        equal(Viking$1.View.Helpers.optionsForSelectTag(["VISA", "MasterCard", "Discover"], { disabled: 'MasterCard' }), "<option>VISA</option>\n<option disabled>MasterCard</option>\n<option>Discover</option>");
	    });

	    test("optionsForSelectTag(simple_array, {disabled: []})", function () {
	        equal(Viking$1.View.Helpers.optionsForSelectTag(["VISA", "MasterCard", "Discover"], { disabled: ['VISA', 'MasterCard'] }), "<option disabled>VISA</option>\n<option disabled>MasterCard</option>\n<option>Discover</option>");
	    });

	    test("optionsForSelectTag(simple_array, {selected: string, disabled: string})", function () {
	        equal(Viking$1.View.Helpers.optionsForSelectTag(["VISA", "MasterCard", "Discover"], { selected: 'VISA', disabled: 'MasterCard' }), "<option selected>VISA</option>\n<option disabled>MasterCard</option>\n<option>Discover</option>");
	    });

	    test("optionsForSelectTag(simple_array, {selected: [], disabled: []})", function () {
	        equal(Viking$1.View.Helpers.optionsForSelectTag(["VISA", "MasterCard", "Discover"], { selected: ['VISA'], disabled: ['MasterCard'] }), "<option selected>VISA</option>\n<option disabled>MasterCard</option>\n<option>Discover</option>");
	    });

	    test("optionsForSelectTag(hash, {selected: [], disabled: []})", function () {
	        equal(Viking$1.View.Helpers.optionsForSelectTag({ "VISA": 'V', "MasterCard": "M" }, { selected: ['V'], disabled: ['M'] }), '<option selected value="V">VISA</option>\n<option disabled value="M">MasterCard</option>');
	    });

	    test("optionsForSelectTag(simple_array, {selected: func, disabled: func})", function () {
	        equal(Viking$1.View.Helpers.optionsForSelectTag(["VISA", "MasterCard", "Discover"], {
	            selected: function selected(v) {
	                return v === 'VISA';
	            },
	            disabled: function disabled(v) {
	                return v === 'MasterCard';
	            }
	        }), "<option selected>VISA</option>\n<option disabled>MasterCard</option>\n<option>Discover</option>");
	    });

	    test("optionsForSelectTag(hash, {selected: func, disabled: func})", function () {
	        equal(Viking$1.View.Helpers.optionsForSelectTag({ "VISA": 'V', "MasterCard": "M" }, {
	            selected: function selected(v) {
	                return v === 'V';
	            },
	            disabled: function disabled(v) {
	                return v === 'M';
	            }
	        }), '<option selected value="V">VISA</option>\n<option disabled value="M">MasterCard</option>');
	    });
	})();

	(function () {
	    module("Viking.View.Helpers#options_from_collection_for_select_tag");

	    // optionsFromCollectionForSelectTag(collection, valueAttribute, textAttribute, selected)
	    // ===================================================================================
	    test("optionsFromCollectionForSelectTag(collection, valueAttribute, textAttribute)", function () {
	        var Model = Viking$1.Model.extend("model");
	        var Collection = Viking$1.Collection.extend({ model: Model });

	        var c = new Collection([{ id: 1, name: 'one' }, { id: 2, name: 'two' }, { id: 3, name: 'three' }]);

	        equal(Viking$1.View.Helpers.optionsFromCollectionForSelectTag(c, 'id', 'name'), '<option value="1">one</option>\n<option value="2">two</option>\n<option value="3">three</option>');
	    });

	    test("optionsFromCollectionForSelectTag(collection, valueFunc, textFunc)", function () {
	        var Model = Viking$1.Model.extend("model");
	        var Collection = Viking$1.Collection.extend({ model: Model });

	        var c = new Collection([{ id: 1, name: 'one' }, { id: 2, name: 'two' }, { id: 3, name: 'three' }]);

	        equal(Viking$1.View.Helpers.optionsFromCollectionForSelectTag(c, function (m) {
	            return m.id;
	        }, function (m) {
	            return m.get('name');
	        }), '<option value="1">one</option>\n<option value="2">two</option>\n<option value="3">three</option>');
	    });

	    test("optionsFromCollectionForSelectTag(collection, valueAttribute, textAttribute, selected)", function () {
	        var Model = Viking$1.Model.extend("model");
	        var Collection = Viking$1.Collection.extend({ model: Model });

	        var c = new Collection([{ id: 1, name: 'one' }, { id: 2, name: 'two' }, { id: 3, name: 'three' }]);

	        equal(Viking$1.View.Helpers.optionsFromCollectionForSelectTag(c, 'id', 'name', 2), '<option value="1">one</option>\n<option selected value="2">two</option>\n<option value="3">three</option>');
	    });

	    test("optionsFromCollectionForSelectTag(collection, valueAttribute, textAttribute, [selected...])", function () {
	        var Model = Viking$1.Model.extend("model");
	        var Collection = Viking$1.Collection.extend({ model: Model });

	        var c = new Collection([{ id: 1, name: 'one' }, { id: 2, name: 'two' }, { id: 3, name: 'three' }]);

	        equal(Viking$1.View.Helpers.optionsFromCollectionForSelectTag(c, 'id', 'name', [2, 3]), '<option value="1">one</option>\n<option selected value="2">two</option>\n<option selected value="3">three</option>');
	    });

	    test("optionsFromCollectionForSelectTag(collection, valueAttribute, textAttribute, {selected: ?, disabled: ?})", function () {
	        var Model = Viking$1.Model.extend("model");
	        var Collection = Viking$1.Collection.extend({ model: Model });

	        var c = new Collection([{ id: 1, name: 'one' }, { id: 2, name: 'two' }, { id: 3, name: 'three' }]);

	        equal(Viking$1.View.Helpers.optionsFromCollectionForSelectTag(c, 'id', 'name', { selected: 1, disabled: 3 }), '<option selected value="1">one</option>\n<option value="2">two</option>\n<option disabled value="3">three</option>');
	    });

	    test("optionsFromCollectionForSelectTag(collection, valueAttribute, textAttribute, {selected: [?], disabled: [?]})", function () {
	        var Model = Viking$1.Model.extend("model");
	        var Collection = Viking$1.Collection.extend({ model: Model });

	        var c = new Collection([{ id: 1, name: 'one' }, { id: 2, name: 'two' }, { id: 3, name: 'three' }]);

	        equal(Viking$1.View.Helpers.optionsFromCollectionForSelectTag(c, 'id', 'name', { selected: [1], disabled: [3] }), '<option selected value="1">one</option>\n<option value="2">two</option>\n<option disabled value="3">three</option>');
	    });

	    test("optionsFromCollectionForSelectTag(collection, valueAttribute, textAttribute, selectedFunc)", function () {
	        var Model = Viking$1.Model.extend("model");
	        var Collection = Viking$1.Collection.extend({ model: Model });

	        var c = new Collection([{ id: 1, name: 'one' }, { id: 2, name: 'two' }, { id: 3, name: 'three' }]);

	        equal(Viking$1.View.Helpers.optionsFromCollectionForSelectTag(c, 'id', 'name', function (m) {
	            return m === 1;
	        }), '<option selected value="1">one</option>\n<option value="2">two</option>\n<option value="3">three</option>');
	    });

	    test("optionsFromCollectionForSelectTag(collection, valueAttribute, textAttribute, {selected: selectedFunc, disabled: disabledFunc})", function () {
	        var Model = Viking$1.Model.extend("model");
	        var Collection = Viking$1.Collection.extend({ model: Model });

	        var c = new Collection([{ id: 1, name: 'one' }, { id: 2, name: 'two' }, { id: 3, name: 'three' }]);

	        equal(Viking$1.View.Helpers.optionsFromCollectionForSelectTag(c, 'id', 'name', {
	            selected: function selected(m) {
	                return m === 1;
	            },
	            disabled: function disabled(m) {
	                return m === 3;
	            } }), '<option selected value="1">one</option>\n<option value="2">two</option>\n<option disabled value="3">three</option>');
	    });
	})();

	(function () {
	    module("Viking.View.Helpers#password_field_tag");

	    // // passwordFieldTag(name = "password", value = nil, options = {})
	    // // ================================================================
	    test("passwordFieldTag()", function () {
	        equal(Viking$1.View.Helpers.passwordFieldTag(), '<input id="password" name="password" type="password">');
	    });

	    test("passwordFieldTag(name)", function () {
	        equal(Viking$1.View.Helpers.passwordFieldTag('pass'), '<input id="pass" name="pass" type="password">');
	    });

	    test("passwordFieldTag(name, value)", function () {
	        equal(Viking$1.View.Helpers.passwordFieldTag('pass', 'secret'), '<input id="pass" name="pass" type="password" value="secret">');
	    });

	    test("passwordFieldTag(name, value, options)", function () {
	        equal(Viking$1.View.Helpers.passwordFieldTag('pin', '1234', { maxlength: 4, size: 6, 'class': "pin_input" }), '<input class="pin_input" id="pin" maxlength="4" name="pin" size="6" type="password" value="1234">');
	    });
	})();

	(function () {
	    module("Viking.View.Helpers#radio_button_tag");

	    // // radioButtonTag(name, value, checked, options)
	    // // =============================================
	    test("radioButtonTag(name, value)", function () {
	        equal(Viking$1.View.Helpers.radioButtonTag('gender', 'male'), '<input id="gender" name="gender" type="radio" value="male">');
	    });

	    test("radioButtonTag(name, value, checked)", function () {
	        equal(Viking$1.View.Helpers.radioButtonTag('gender', 'male', true), '<input checked id="gender" name="gender" type="radio" value="male">');
	    });

	    test("radioButtonTag(name, value, checked, options)", function () {
	        equal(Viking$1.View.Helpers.radioButtonTag('gender', 'male', false, { disabled: true }), '<input disabled id="gender" name="gender" type="radio" value="male">');

	        equal(Viking$1.View.Helpers.radioButtonTag('gender', 'male', false, { 'class': "myClass" }), '<input class="myClass" id="gender" name="gender" type="radio" value="male">');
	    });
	})();

	(function () {
	    module("Viking.View.Helpers#select_tag");

	    // // selectTag(name, option_tags, options)
	    // // ======================================
	    test("selectTag(name, option_tags)", function () {
	        equal(Viking$1.View.Helpers.selectTag('people', '<option value="$20">Basic</option>'), '<select id="people" name="people"><option value="$20">Basic</option></select>');
	    });

	    test("selectTag(name, option_tags, options)", function () {
	        equal(Viking$1.View.Helpers.selectTag("colors", "<option>Red</option><option>Green</option><option>Blue</option>", { multiple: true }), '<select id="colors" multiple name="colors[]"><option>Red</option><option>Green</option><option>Blue</option></select>');
	    });

	    test("selectTag(name, option_tags, {includeBlank: true})", function () {
	        equal(Viking$1.View.Helpers.selectTag('people', '<option value="$20">Basic</option>', { includeBlank: true }), '<select id="people" name="people"><option value=""></option><option value="$20">Basic</option></select>');
	    });

	    test("selectTag(name, option_tags, {prompt: 'Select somthing'})", function () {
	        equal(Viking$1.View.Helpers.selectTag('people', '<option value="$20">Basic</option>', { prompt: 'Select somthing' }), '<select id="people" name="people"><option value="">Select somthing</option><option value="$20">Basic</option></select>');
	    });
	})();

	(function () {
	    module("Viking.View.Helpers#submit_tag");

	    // // submitTag(value="Save", options)
	    // // =================================
	    test("submitTag()", function () {
	        equal(Viking$1.View.Helpers.submitTag(), '<input name="commit" type="submit" value="Save">');
	    });

	    test("submitTag(value)", function () {
	        equal(Viking$1.View.Helpers.submitTag("Edit this article"), '<input name="commit" type="submit" value="Edit this article">');
	    });

	    test("submitTag(value, options)", function () {
	        equal(Viking$1.View.Helpers.submitTag("Edit", { disabled: true, 'class': 'butn' }), '<input class="butn" disabled name="commit" type="submit" value="Edit">');
	    });

	    test("submitTag(value)", function () {
	        equal(Viking$1.View.Helpers.submitTag(null, { 'class': 'btn' }), '<input class="btn" name="commit" type="submit" value="Save">');
	    });
	})();

	(function () {
	    module("Viking.View.Helpers#tag");

	    // tag(name, [options = {}, escape = true])
	    // ========================================
	    test("tag(name)", function () {
	        equal(Viking$1.View.Helpers.tag("br"), "<br>");
	    });

	    test("tag(name, options)", function () {
	        equal(Viking$1.View.Helpers.tag("input", { type: "text" }), '<input type="text">');
	    });

	    test("tag(name, options) options are escaped by default", function () {
	        equal(Viking$1.View.Helpers.tag("img", { src: "open & shut.png" }), '<img src="open &amp; shut.png">');
	    });

	    test("tag(name, options, false) options are not escaped", function () {
	        equal(Viking$1.View.Helpers.tag("img", { src: "open &amp; shut.png" }, false), '<img src="open &amp; shut.png">');
	    });

	    test("tag(name, boolean_options)", function () {
	        equal(Viking$1.View.Helpers.tag("input", { selected: true }), '<input selected>');
	    });

	    test("tag(name, data_options)", function () {
	        equal(Viking$1.View.Helpers.tag("div", { data: { name: 'Stephen', city_state: ["Chicago", "IL"] } }), '<div data-city_state="[&quot;Chicago&quot;,&quot;IL&quot;]" data-name="Stephen">');
	    });
	})();

	(function () {
	    module("Viking.View.Helpers#text_area_tag");

	    // // textAreaTag(name, [content], [options], [escape=true])
	    // // ========================================================
	    test("textAreaTag(name)", function () {
	        equal(Viking$1.View.Helpers.textAreaTag('post'), '<textarea id="post" name="post"></textarea>');
	    });

	    test("textAreaTag(name, content)", function () {
	        equal(Viking$1.View.Helpers.textAreaTag('post', 'paragraph'), '<textarea id="post" name="post">paragraph</textarea>');
	    });

	    test("textAreaTag(name, null, {rows: 10, cols: 25})", function () {
	        equal(Viking$1.View.Helpers.textAreaTag('post', null, { rows: 10, cols: 25 }), '<textarea cols="25" id="post" name="post" rows="10"></textarea>');
	    });

	    test("textAreaTag(name, null, {size: '10x25'})", function () {
	        equal(Viking$1.View.Helpers.textAreaTag('post', null, { size: '10x25' }), '<textarea cols="10" id="post" name="post" rows="25"></textarea>');
	    });
	})();

	(function () {
	    module("Viking.View.Helpers#text_field_tag");

	    // // textFieldTag(name, [value], [options])
	    // // =========================================
	    test("textFieldTag(name)", function () {
	        equal(Viking$1.View.Helpers.textFieldTag('name'), '<input id="name" name="name" type="text">');
	    });

	    test("textFieldTag(name, value)", function () {
	        equal(Viking$1.View.Helpers.textFieldTag('query', 'search'), '<input id="query" name="query" type="text" value="search">');
	    });

	    test("textFieldTag(name, {placeholder: value})", function () {
	        equal(Viking$1.View.Helpers.textFieldTag('query', { placeholder: 'search' }), '<input id="query" name="query" placeholder="search" type="text">');
	    });

	    test("textFieldTag(name, {maxlength: 5})", function () {
	        equal(Viking$1.View.Helpers.textFieldTag('query', { maxlength: 5 }), '<input id="query" maxlength="5" name="query" type="text">');
	    });

	    test("textFieldTag(name, options)", function () {
	        equal(Viking$1.View.Helpers.textFieldTag('query', { 'class': 'search' }), '<input class="search" id="query" name="query" type="text">');
	    });

	    test("textFieldTag(name, value, options)", function () {
	        equal(Viking$1.View.Helpers.textFieldTag('query', '', { size: 75 }), '<input id="query" name="query" size="75" type="text" value="">');
	    });

	    test("textFieldTag(name, value, disabled_option)", function () {
	        equal(Viking$1.View.Helpers.textFieldTag('payment_amount', '$0.00', { disabled: true }), '<input disabled id="payment_amount" name="payment_amount" type="text" value="$0.00">');
	    });

	    test("testFieldTag(name, model)", function () {
	        equal(Viking$1.View.Helpers.textFieldTag('payment_amount', new Backbone.Model(), { disabled: true, value: 10 }), '<input disabled id="payment_amount" name="payment_amount" type="text" value="10">');
	    });
	})();

	(function () {
	    module("Viking.View.Helpers#timeTag");

	    // // timeTag(date, [options], [value])
	    // // =================================
	    test("timeTag(date)", function () {
	        var date = new Date(1395441025655);

	        equal(Viking$1.View.Helpers.timeTag(date), '<time datetime="2014-03-21T22:30:25.655Z">' + date.toString() + '</time>');
	    });

	    test("timeTag(date, content)", function () {
	        var date = new Date(1395441025655);

	        equal(Viking$1.View.Helpers.timeTag(date, 'Yesterday'), '<time datetime="2014-03-21T22:30:25.655Z">Yesterday</time>');
	    });

	    test("timeTag(date, options, content)", function () {
	        var date = new Date(1395441025655);

	        equal(Viking$1.View.Helpers.timeTag(date, { item: 'two' }, 'Yesterday'), '<time datetime="2014-03-21T22:30:25.655Z" item="two">Yesterday</time>');
	    });

	    test("timeTag(date, {pubdate: true})", function () {
	        var date = new Date(1395441025655);

	        equal(Viking$1.View.Helpers.timeTag(date, { pubdate: true }), '<time datetime="2014-03-21T22:30:25.655Z" pubdate>' + date.toString() + '</time>');
	    });

	    test("timeTag(date, {datetime: 'myvalue'})", function () {
	        var date = new Date(1395441025655);

	        equal(Viking$1.View.Helpers.timeTag(date, { datetime: 'myvalue' }), '<time datetime="myvalue">' + date.toString() + '</time>');
	    });

	    test("timeTag(date, options, content{format: 'myformat'})", function () {
	        var date = new Date(1395441025655);

	        equal(Viking$1.View.Helpers.timeTag(date, { format: '%Y %m %d' }), '<time datetime="2014-03-21T22:30:25.655Z">2014 03 21</time>');
	    });

	    test("timeTag(date, contentFunc)", function () {
	        var date = new Date(1395441025655);

	        equal(Viking$1.View.Helpers.timeTag(date, function () {
	            return 'data';
	        }), '<time datetime="2014-03-21T22:30:25.655Z">data</time>');
	    });

	    test("timeTag(date, options, contentFunc)", function () {
	        var date = new Date(1395441025655);

	        equal(Viking$1.View.Helpers.timeTag(date, { item: 'two' }, function () {
	            return 'data';
	        }), '<time datetime="2014-03-21T22:30:25.655Z" item="two">data</time>');
	    });
	})();

	(function () {
	    module("Viking.View.Helpers#linkTo");

	    test("linkTo(content, url)", function () {
	        equal(Viking$1.View.Helpers.linkTo('Example', 'http://example.com'), '<a href="http://example.com">Example</a>');
	    });

	    test("linkTo(contentFunc, url)", function () {
	        equal(Viking$1.View.Helpers.linkTo(function () {
	            return 'Example';
	        }, 'http://example.com'), '<a href="http://example.com">Example</a>');
	    });

	    test("linkTo(content, url, options)", function () {
	        equal(Viking$1.View.Helpers.linkTo('Example', 'http://example.com', { 'class': 'myclass' }), '<a class="myclass" href="http://example.com">Example</a>');
	    });

	    test("linkTo(contentFunc, url, options)", function () {
	        equal(Viking$1.View.Helpers.linkTo(function () {
	            return 'Example';
	        }, 'http://example.com', { 'class': 'myclass' }), '<a class="myclass" href="http://example.com">Example</a>');
	    });

	    test("linkTo(url, options, contentFunc)", function () {
	        equal(Viking$1.View.Helpers.linkTo('http://example.com', { 'class': 'myclass' }, function () {
	            return 'Example';
	        }), '<a class="myclass" href="http://example.com">Example</a>');
	    });

	    test("linkTo(content, model)", function () {
	        var Workshop = Viking$1.Model.extend('workshop');
	        var workshopPath = function workshopPath(m) {
	            return '/workshops/' + m.toParam();
	        };

	        equal(Viking$1.View.Helpers.linkTo('Model', new Workshop({ id: 10 })), '<a href="' + window.location.protocol + '//' + window.location.host + '/workshops/10' + '">Model</a>');
	    });

	    test("linkTo(model, contentFunc)", function () {
	        var Workshop = Viking$1.Model.extend('workshop');
	        var workshopPath = function workshopPath(m) {
	            return '/workshops/' + m.toParam();
	        };

	        equal(Viking$1.View.Helpers.linkTo(new Workshop({ id: 10 }), function () {
	            return 'Example';
	        }), '<a href="' + window.location.protocol + '//' + window.location.host + '/workshops/10' + '">Example</a>');
	    });

	    test("linkTo(model, options, contentFunc)", function () {
	        var Workshop = Viking$1.Model.extend('workshop');
	        var workshopPath = function workshopPath(m) {
	            return '/workshops/' + m.toParam();
	        };

	        equal(Viking$1.View.Helpers.linkTo(new Workshop({ id: 10 }), { 'class': 'myclass' }, function () {
	            return 'Example';
	        }), '<a class="myclass" href="' + window.location.protocol + '//' + window.location.host + '/workshops/10' + '">Example</a>');
	    });
	})();

	(function () {
	    module("Viking.View.Helpers#mailTo");

	    test("mailTo(email)", function () {
	        equal(Viking$1.View.Helpers.mailTo('me@domain.com'), '<a href="mailto:me@domain.com">me@domain.com</a>');
	    });

	    test("mailTo(email, name)", function () {
	        equal(Viking$1.View.Helpers.mailTo('me@domain.com', 'My email'), '<a href="mailto:me@domain.com">My email</a>');
	    });

	    test("mailTo(email, options)", function () {
	        equal(Viking$1.View.Helpers.mailTo('me@domain.com', { key: 'value' }), '<a href="mailto:me@domain.com" key="value">me@domain.com</a>');
	    });

	    test("mailTo(email, name, options)", function () {
	        equal(Viking$1.View.Helpers.mailTo('me@domain.com', 'My email', {
	            cc: 'ccaddress@domain.com',
	            subject: 'This is an example email'
	        }), '<a href="mailto:me@domain.com?cc=ccaddress@domain.com&subject=This%20is%20an%20example%20email">My email</a>');
	    });

	    test("mailTo(email, contentFunc)", function () {
	        equal(Viking$1.View.Helpers.mailTo('me@domain.com', function () {
	            return "<strong>Email me:</strong> <span>me@domain.com</span>";
	        }), '<a href="mailto:me@domain.com"><strong>Email me:</strong> <span>me@domain.com</span></a>');
	    });

	    test("mailTo(email, options, contentFunc)", function () {
	        equal(Viking$1.View.Helpers.mailTo('me@domain.com', { key: 'value' }, function () {
	            return "Email me";
	        }), '<a href="mailto:me@domain.com" key="value">Email me</a>');
	    });

	    test("mailTo(email, contentFunc, options)", function () {
	        equal(Viking$1.View.Helpers.mailTo('me@domain.com', function () {
	            return "Email me";
	        }, { key: 'value' }), '<a href="mailto:me@domain.com" key="value">Email me</a>');
	    });
	})();

	(function () {
	    module("Viking.View.Helpers#urlFor");

	    test("urlFor(Class)", function () {
	        expect(2);

	        var Workshop = Viking$1.Model.extend('workshop');
	        var workshopsPath = function workshopsPath() {
	            ok(true);return '/workshops';
	        };

	        equal(Viking$1.View.urlFor(Workshop), window.location.protocol + '//' + window.location.host + '/workshops');
	    });

	    test("urlFor(new Class())", function () {
	        expect(2);

	        var Workshop = Viking$1.Model.extend('workshop');
	        var workshopsPath = function workshopsPath() {
	            ok(true);return '/workshops';
	        };

	        equal(Viking$1.View.urlFor(new Workshop()), window.location.protocol + '//' + window.location.host + '/workshops');
	    });

	    test("urlFor(model)", function () {
	        expect(2);

	        var Workshop = Viking$1.Model.extend('workshop');
	        var workshopPath = function workshopPath(m) {
	            ok(true);return '/workshops/' + m.toParam();
	        };

	        equal(Viking$1.View.urlFor(new Workshop({ id: 10 })), window.location.protocol + '//' + window.location.host + '/workshops/10');
	    });

	    test("urlFor(STIModel)", function () {
	        expect(2);

	        var Workshop = Viking$1.Model.extend('workshop');
	        var SantaWorkshop = Workshop.extend('santa_workshop');
	        var workshopPath = function workshopPath(m) {
	            ok(true);return '/workshops/' + m.toParam();
	        };

	        equal(Viking$1.View.urlFor(new SantaWorkshop({ id: 10 })), window.location.protocol + '//' + window.location.host + '/workshops/10');
	    });

	    test("urlFor(class, {anchor: STRING})", function () {
	        var Workshop = Viking$1.Model.extend('workshop');
	        var workshopPath = function workshopPath(m) {
	            return '/workshops/' + m.toParam();
	        };

	        equal(Viking$1.View.urlFor(new Workshop({ id: 10 }), { anchor: 'location' }), window.location.protocol + '//' + window.location.host + '/workshops/10#location');
	    });

	    test("urlFor(class, {onlyPath: true})", function () {
	        var Workshop = Viking$1.Model.extend('workshop');
	        var workshopPath = function workshopPath(m) {
	            return '/workshops/' + m.toParam();
	        };

	        equal(Viking$1.View.urlFor(new Workshop({ id: 10 }), { onlyPath: true }), '/workshops/10');
	    });

	    test("urlFor(class, {trailingSlash: true})", function () {
	        var Workshop = Viking$1.Model.extend('workshop');
	        var workshopPath = function workshopPath(m) {
	            return '/workshops/' + m.toParam();
	        };

	        equal(Viking$1.View.urlFor(new Workshop({ id: 10 }), { trailingSlash: true }), window.location.protocol + '//' + window.location.host + '/workshops/10/');
	    });

	    test("urlFor(class, {host: STRING})", function () {
	        var Workshop = Viking$1.Model.extend('workshop');
	        var workshopPath = function workshopPath(m) {
	            return '/workshops/' + m.toParam();
	        };

	        equal(Viking$1.View.urlFor(new Workshop({ id: 10 }), { host: 'example.com' }), window.location.protocol + '//example.com' + (window.location.port ? ':' : '') + window.location.port + '/workshops/10');
	    });

	    test("urlFor(class, {port: NUMBER})", function () {
	        var Workshop = Viking$1.Model.extend('workshop');
	        var workshopPath = function workshopPath(m) {
	            return '/workshops/' + m.toParam();
	        };

	        equal(Viking$1.View.urlFor(new Workshop({ id: 10 }), { port: 9292 }), window.location.protocol + '//' + window.location.hostname + ':9292/workshops/10');
	    });

	    test("urlFor(class, {protocol: STRING})", function () {
	        var Workshop = Viking$1.Model.extend('workshop');
	        var workshopPath = function workshopPath(m) {
	            return '/workshops/' + m.toParam();
	        };

	        equal(Viking$1.View.urlFor(new Workshop({ id: 10 }), { protocol: 'custom' }), 'custom://' + window.location.hostname + (window.location.port ? ':' : '') + window.location.port + '/workshops/10');
	    });

	    test("urlFor(class, {scriptName: STRING})", function () {
	        var Workshop = Viking$1.Model.extend('workshop');
	        var workshopPath = function workshopPath(m) {
	            return '/workshops/' + m.toParam();
	        };

	        equal(Viking$1.View.urlFor(new Workshop({ id: 10 }), { scriptName: '/base' }), window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' : '') + window.location.port + '/base/workshops/10');
	    });

	    test("urlFor(class, {user: STRING, password: STRING})", function () {
	        var Workshop = Viking$1.Model.extend('workshop');
	        var workshopPath = function workshopPath(m) {
	            return '/workshops/' + m.toParam();
	        };

	        equal(Viking$1.View.urlFor(new Workshop({ id: 10 }), { user: 'username', password: 'password' }), window.location.protocol + '//username:password@' + window.location.hostname + (window.location.port ? ':' : '') + window.location.port + '/workshops/10');
	    });

	    test("urlFor(string)", function () {
	        equal(Viking$1.View.urlFor("http://www.example.com"), "http://www.example.com");
	    });
	})();

	(function () {
	    module('Viking.View.Helpers#render', {
	        setup: function setup() {
	            Object.keys(JST).forEach(function (key) {
	                Viking$1.View.templates[key] = JST[key];
	            });
	        }
	    });

	    test('rendering without template', function () {
	        var template = undefined;
	        throws(function () {
	            Viking$1.View.Helpers.render();
	        }, new Error('Template does not exist: ' + template));
	    });

	    test('rendering with nonexistent template', function () {
	        var template = 'a/template/path/that/doesnt/exist';
	        throws(function () {
	            Viking$1.View.Helpers.render(template);
	        }, new Error('Template does not exist: ' + template));
	    });

	    test('rendering template without locals', function () {
	        var template = 'a/template/path';

	        equal(Viking$1.View.Helpers.render(template), '<h1>Some Title</h1>');
	    });

	    test('rendering template with locals', function () {
	        var template = 'a/template/path/with/locals';

	        equal(Viking$1.View.Helpers.render(template, { text: 'Some text' }), '<p>Some text</p>');
	    });
	})();

	(function () {
	    module("Viking.View - tag_helpers");

	    // tagOption(key, value, escape)
	    // =========================================================================
	    test("tagOption(string, string)", function () {
	        equal(Viking$1.View.tagOption("key", "value>"), 'key="value>"');
	    });

	    test("tagOption(string, string, false)", function () {
	        equal(Viking$1.View.tagOption("key", "<value>", false), 'key="<value>"');
	    });

	    test("tagOption(string, string, true)", function () {
	        equal(Viking$1.View.tagOption("key", "<value>", true), 'key="&lt;value&gt;"');
	    });

	    test("tagOption(string, [string, string])", function () {
	        equal(Viking$1.View.tagOption("key", ['v1', "<v2>"]), 'key="v1 <v2>"');
	    });

	    test("tagOption(string, [string, string], false)", function () {
	        equal(Viking$1.View.tagOption("key", ['v1', "<v2>"], false), 'key="v1 <v2>"');
	    });

	    test("tagOption(string, [string, string], true)", function () {
	        equal(Viking$1.View.tagOption("key", ['v1', "<v2>"], true), 'key="v1 &lt;v2&gt;"');
	    });

	    // dataTagOption(key, value, escape)
	    // =========================================================================
	    test("dataTagOption(string, string)", function () {
	        equal(Viking$1.View.dataTagOption("key", "value>"), 'data-key="value>"');
	    });

	    test("dataTagOption(string, string, true)", function () {
	        equal(Viking$1.View.dataTagOption("key", "value>", true), 'data-key="value&gt;"');
	    });

	    test("dataTagOption(string, object)", function () {
	        equal(Viking$1.View.dataTagOption("key", { key: "value>" }), 'data-key="{"key":"value>"}"');
	    });

	    test("dataTagOption(string, object, true)", function () {
	        equal(Viking$1.View.dataTagOption("key", { key: "value>" }, true), 'data-key="{&quot;key&quot;:&quot;value&gt;&quot;}"');
	    });

	    // tagOptions(options, escape)
	    // =========================================================================
	    test("tagOptions(undefined)", function () {
	        equal(Viking$1.View.tagOptions(undefined), "");
	    });

	    test('tagOptions({key: "&value", keys: [1, "two>"]})', function () {
	        equal(Viking$1.View.tagOptions({ key: "&value", keys: [1, "two>"] }, true), ' key="&amp;value" keys="1 two&gt;"');
	    });

	    test('tagOptions({key: null, keys: undefined})', function () {
	        equal(Viking$1.View.tagOptions({ key: null, keys: undefined }), '');
	    });

	    test('tagOptions({key: "&value", keys: [1, "two>"]}, true)', function () {
	        equal(Viking$1.View.tagOptions({ key: "&value", keys: [1, "two>"] }, true), ' key="&amp;value" keys="1 two&gt;"');
	    });

	    test('tagOptions({key: "&value", keys: [1, "two>"]}, false)', function () {
	        equal(Viking$1.View.tagOptions({ key: "&value", keys: [1, "two>"] }, false), ' key="&value" keys="1 two>"');
	    });

	    test('tagOptions({selected: true})', function () {
	        equal(Viking$1.View.tagOptions({ selected: true }), ' selected');
	    });

	    // sanitizeToId(name)
	    // =========================================================================
	    test("sanitizeToId(modelName)", function () {
	        equal("model_name", Viking$1.View.sanitizeToId("model[name]"));
	    });

	    // tagNameForModelAttribute(model, attribute)
	    // =========================================================================
	    test("tagNameForModelAttribute(model, attribute)", function () {
	        var Model = Viking$1.Model.extend('model');
	        var model = new Model({ name: "name" });

	        equal("model[name]", Viking$1.View.tagNameForModelAttribute(model, 'name'));
	    });

	    test("tagNameForModelAttribute(STImodel, attribute)", function () {
	        var Model = Viking$1.Model.extend('model');
	        var SubModel = Model.extend('sub_model');
	        var submodel = new SubModel({ name: "name" });

	        equal("model[name]", Viking$1.View.tagNameForModelAttribute(submodel, 'name'));
	    });

	    test("tagNameForModelAttribute(model, attribute, {namespace: ...})", function () {
	        var Model = Viking$1.Model.extend('model');
	        var model = new Model({ name: "name" });

	        equal("key[model][name]", Viking$1.View.tagNameForModelAttribute(model, 'name', { namespace: 'key[model]' }));
	    });

	    test("tagNameForModelAttribute(model, arrayAttribute)", function () {
	        var Model = Viking$1.Model.extend('model');
	        var model = new Model({ names: ["name"] });

	        equal("model[names][]", Viking$1.View.tagNameForModelAttribute(model, 'names'));
	    });

	    test("tagNameForModelAttribute(model, arrayAttribute, {namespace: ...})", function () {
	        var Model = Viking$1.Model.extend('model');
	        var model = new Model({ names: ["name"] });

	        equal("key[model][names][]", Viking$1.View.tagNameForModelAttribute(model, 'names', { namespace: 'key[model]' }));
	    });

	    test("tagNameForModelAttribute(model, vikingCollectionAttribute)", function () {
	        var Model = Viking$1.Model.extend('model');
	        var ModelCollection = Viking$1.Collection.extend({ model: Model });
	        var model = new Model({ models: new ModelCollection() });

	        equal("model[models][]", Viking$1.View.tagNameForModelAttribute(model, 'models'));
	    });

	    test("tagNameForModelAttribute(model, vikingCollectionAttribute) 2", function () {
	        var Model = Viking$1.Model.extend('model');
	        var ModelCollection = Viking$1.Collection.extend({ model: Model });
	        var model = new Model({ models: new ModelCollection() });

	        equal("key[model][models][]", Viking$1.View.tagNameForModelAttribute(model, 'models', { namespace: 'key[model]' }));
	    });

	    // addErrorClassToOptions(model, attribute, options)
	    // =========================================================================
	    test("addErrorClassToOptions(model, attribute, options) - no error", function () {
	        var Model = Viking$1.Model.extend('model');
	        var model = new Model({ name: "name" });

	        var options = {};
	        Viking$1.View.addErrorClassToOptions(model, 'name', options);
	        deepEqual({}, options);
	    });

	    test("addErrorClassToOptions(model, attribute, options) - error, no class in options", function () {
	        var Model = Viking$1.Model.extend('model');
	        var model = new Model({ name: "name" });
	        model.errorsOn = function () {
	            return true;
	        };

	        var options = {};
	        Viking$1.View.addErrorClassToOptions(model, 'name', options);
	        deepEqual({ "class": "error" }, options);
	    });

	    test("addErrorClassToOptions(model, attribute, options) - error, class is string", function () {
	        var Model = Viking$1.Model.extend('model');
	        var model = new Model({ name: "name" });
	        model.errorsOn = function () {
	            return true;
	        };

	        var options = { "class": "myclass" };
	        Viking$1.View.addErrorClassToOptions(model, 'name', options);
	        deepEqual({ "class": "myclass error" }, options);
	    });

	    test("addErrorClassToOptions(model, attribute, options) - error, class is array", function () {
	        var Model = Viking$1.Model.extend('model');
	        var model = new Model({ name: "name" });
	        model.errorsOn = function () {
	            return true;
	        };

	        var options = { "class": ["myclass"] };
	        Viking$1.View.addErrorClassToOptions(model, 'name', options);
	        deepEqual({ "class": "myclass error" }, options);
	    });
	})();

	(function () {
	    module("Viking.View.subView", {
	        setup: function setup() {
	            Object.keys(JST).forEach(function (key) {
	                Viking$1.View.templates[key] = JST[key];
	            });
	        }
	    });

	    test("Initalization setups a new array for subView", function () {
	        var view = new Viking$1.View();
	        var view2 = new Viking$1.View();

	        deepEqual(view.subViews, []);
	        ok(view.subViews !== view2.subViews);
	    });

	    test("#subView", function () {
	        var SubView = Viking$1.View.extend();

	        var view = new Viking$1.View();
	        var mysubview = view.subView(SubView);

	        ok(_.contains(view.subViews, mysubview));
	        ok(mysubview instanceof SubView);
	    });

	    test("#subView passes options to subView", function () {
	        var SubView = Viking$1.View.extend({
	            initialize: function initialize(options) {
	                deepEqual(options, { 'my': 'options' });
	            }
	        });

	        var view = new Viking$1.View();
	        var mysubview = view.subView(SubView, { 'my': 'options' });
	    });

	    test("#removeSubView", function () {
	        expect(3);

	        var view = new Viking$1.View();
	        var mysubview = view.subView(Viking$1.View);

	        mysubview.remove = function () {
	            ok(true);
	        }; // Assert SubView.remove is called
	        view.stopListening = function (obj) {
	            strictEqual(obj, mysubview);
	        }; // Assert stops listening to view

	        view.removeSubView(mysubview);

	        ok(!_.contains(view.subViews, mysubview)); // Assert removed from array
	    });

	    test("#remove", function () {
	        var view = new Viking$1.View();
	        var mysubview = view.subView(Viking$1.View);

	        mysubview.remove = function () {
	            ok(true);
	        }; // Assert SubView.remove is called
	        view.remove();
	    });

	    test("subview#remove() removes itself from the parent subViews", function () {
	        var view = new Viking$1.View();
	        var mysubview = view.subView(Viking$1.View);

	        mysubview.remove();
	        deepEqual([], view.subViews);
	    });
	})();

	(function () {

	    module("Viking.View", {
	        setup: function setup() {
	            Object.keys(JST).forEach(function (key) {
	                Viking$1.View.templates[key] = JST[key];
	            });
	        }
	    });

	    test("inherits events", function () {
	        var View = Viking$1.View.extend({
	            events: {
	                'click': 'click'
	            }
	        });
	        var SubView = View.extend({
	            events: {
	                'hover': 'hover'
	            }
	        });

	        deepEqual(SubView.prototype.events, {
	            'hover': 'hover',
	            'click': 'click'
	        });
	    });

	    test("overrides inherited events", function () {
	        var View = Viking$1.View.extend({
	            events: {
	                'click': 'click',
	                'hover': 'hover'
	            }
	        });
	        var SubView = View.extend({
	            events: {
	                'hover': "newHover"
	            }
	        });

	        deepEqual(SubView.prototype.events, {
	            'click': 'click',
	            'hover': 'newHover'
	        });
	    });

	    test('calls the original extend', function () {
	        expect(1);

	        var originalFunction = Backbone.View.extend;

	        Backbone.View.extend = function () {
	            ok(true);
	        };

	        Viking$1.View.extend();
	        Backbone.View.extend = originalFunction;
	    });

	    test('renderTemplate with template set on view', function () {
	        var View = Viking$1.View.extend({
	            'template': 'a/template/path'
	        });

	        equal(new View().renderTemplate(), '<h1>Some Title</h1>');
	    });

	    test('renderTemplate without template set on view', function () {
	        var template = undefined;
	        var View = Viking$1.View.extend({
	            'template': template
	        });

	        throws(function () {
	            new View().renderTemplate();
	        }, new Error('Template does not exist: ' + template));
	    });

	    test("#remove() triggers a 'remove' event on the view", function () {
	        expect(1);

	        var view = new Viking$1.View();
	        view.on('remove', function () {
	            ok(true);
	        });
	        view.remove();
	        view.off('remmove');
	    });

	    test('#bindEl() with a model', function () {
	        expect(2);

	        var model = new Viking$1.Model();
	        var view = new Viking$1.View({ model: model });

	        view.$ = function (selector) {
	            equal(selector, '.name');
	            return {
	                html: function html(_html) {
	                    equal(_html, 'Dr. DJ');
	                }
	            };
	        };

	        view.bindEl('name', '.name');
	        model.set('name', 'Dr. DJ');
	    });

	    test('#bindEl() with a model with custom render', function () {
	        expect(2);

	        var model = new Viking$1.Model();
	        var view = new Viking$1.View({ model: model });

	        view.$ = function (selector) {
	            equal(selector, '.name');
	            return {
	                html: function html(_html2) {
	                    equal(_html2, 'Name: Dr. DJ');
	                }
	            };
	        };

	        view.bindEl('name', '.name', function (model) {
	            return 'Name: ' + model.get('name');
	        });
	        model.set('name', 'Dr. DJ');
	    });
	})();

}());