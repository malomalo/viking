var Viking = (function () {
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

      return this.split('.').reduce(function (context, name, index, array) {
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
  var _label = function label(model, attribute, content, options, escape) {
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
          var name = tagNameForModelAttribute(model, attribute);
          options['for'] = sanitizeToId(name);
      }

      addErrorClassToOptions(model, attribute, options);

      return labelTag(content, options, escape);
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

      label: function label(value, content, options, escape) {
          options || (options = {});

          //TODO shouldn't options.name be options.for?
          if (!options.name && !options['for']) {
              options['for'] = tagNameForModelAttribute(this.model, this.attribute, { namespace: this.options.namespace });
              options['for'] = sanitizeToId(options['for']) + '_' + value;
          }

          return _label(this.model, this.attribute, content, options, escape);
      }

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
  var checkBoxGroup = function checkBoxGroup(model, attribute, options, content) {
      if (typeof options === 'function') {
          content = options;
          options = {};
      }

      var builder = new CheckBoxGroupBuilder(model, attribute, options);

      return content(builder);
  };

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
  var checkBox = function checkBox(model, attribute, options, checkedValue, uncheckedValue, escape) {
      var output = '';
      var value = model.get(attribute);

      if (options === undefined) {
          options = {};
      }
      if (checkedValue === undefined) {
          checkedValue = true;
      }
      if (uncheckedValue === undefined) {
          uncheckedValue = false;
      }
      addErrorClassToOptions(model, attribute, options);

      var name = options.name || tagNameForModelAttribute(model, attribute);
      output += hiddenFieldTag(name, uncheckedValue, undefined, escape);
      output += checkBoxTag(name, checkedValue, checkedValue === value, options, escape);

      return output;
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
  //   Post = Viking.Model.extend('post', {
  //       belongsTo: ['author']
  //   });
  //  
  //   Author = Viking.Model.extend('author', {
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
  var collectionSelect = function collectionSelect(model, attribute, collection, valueAttribute, textAttribute, options) {
      if (options === undefined) {
          options = {};
      }

      var optionOptions = _.pick(options, 'selected');
      var selectOptions = _.omit(options, 'selected');
      if (model.get(attribute) && optionOptions.selected === undefined) {
          optionOptions.selected = methodOrAttribute(model.get(attribute), valueAttribute);
      }

      var name = options.name || tagNameForModelAttribute(model, attribute);
      var optionsTags = optionsFromCollectionForSelectTag(collection, valueAttribute, textAttribute, selectOptions);
      return selectTag(name, optionsTags, selectOptions);
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
  var formFor = function formFor(model, options, content) {
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
      if (options.method !== 'get' && options.method !== 'post' || method && method !== options.method) {
          options.method = 'post';
          content = _.wrap(content, function (func, form) {
              var hiddenInput = hiddenFieldTag('_method', method);
              return contentTag('div', hiddenInput, { style: 'margin:0;padding:0;display:inline' }, false) + func(builder);
          });
      }

      return contentTag('form', content(builder), options, false);
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
  var hiddenField = function hiddenField(model, attribute, options) {
      var value = model.get(attribute);
      var name = tagNameForModelAttribute(model, attribute);

      return hiddenFieldTag(name, value || '', options);
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
  var numberField = function numberField(model, attribute, options) {
      options = _.extend({}, options);
      var name = options.name || tagNameForModelAttribute(model, attribute);

      addErrorClassToOptions(model, attribute, options);

      return numberFieldTag(name, model.get(attribute), options);
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
  var passwordField = function passwordField(model, attribute, options) {
      options || (options = {});
      var name = options.name || tagNameForModelAttribute(model, attribute);

      if (options === undefined) {
          options = {};
      }
      addErrorClassToOptions(model, attribute, options);

      return passwordFieldTag(name, undefined, options);
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
  var radioButton = function radioButton(model, attribute, tagValue, options) {
      if (options === undefined) {
          options = {};
      }
      var name = options.name || tagNameForModelAttribute(model, attribute);

      _.defaults(options, {
          id: sanitizeToId(name + "_" + tagValue)
      });
      addErrorClassToOptions(model, attribute, options);

      var value = tagValue;
      if (value === undefined || value === null) {
          value = "";
      }

      return radioButtonTag(name, value, tagValue === model.get(attribute), options);
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
  var select$1 = function select(model, attribute, collection, options) {
      if (options === undefined) {
          options = {};
      }

      var name = options['name'] || tagNameForModelAttribute(model, attribute);
      var optionOptions = _.pick(options, 'selected');
      var selectOptions = _.omit(options, 'selected');
      if (model.get(attribute) && optionOptions.selected === undefined) {
          optionOptions.selected = model.get(attribute);
      }
      if (selectOptions.multiple === undefined && model.associations[attribute] && model.associations[attribute].macro === "hasMany") {
          selectOptions.multiple = true;
      }
      return selectTag(name, optionsForSelectTag(collection, optionOptions), selectOptions);
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
  var textArea = function textArea(model, attribute, options) {
      var name = tagNameForModelAttribute(model, attribute);

      if (options === undefined) {
          options = {};
      }
      addErrorClassToOptions(model, attribute, options);

      return textAreaTag(name, model.get(attribute), options);
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

      checkBox: function checkBox$$(attribute, options, checkedValue, uncheckedValue, escape) {
          options || (options = {});

          if (!options.name && this.options.namespace) {
              options.name = tagNameForModelAttribute(this.model, attribute, { namespace: this.options.namespace });
          }

          return checkBox(this.model, attribute, options, checkedValue, uncheckedValue, escape);
      },

      collectionSelect: function collectionSelect$$(attribute, collection, valueAttribute, textAttribute, options) {
          options || (options = {});

          if (!options.name && this.options.namespace) {
              options.name = tagNameForModelAttribute(this.model, attribute, { namespace: this.options.namespace });
          }

          return collectionSelect(this.model, attribute, collection, valueAttribute, textAttribute, options);
      },

      hiddenField: function hiddenField$$(attribute, options) {
          options || (options = {});

          if (!options.name && this.options.namespace) {
              options.name = tagNameForModelAttribute(this.model, attribute, { namespace: this.options.namespace });
          }

          return hiddenField(this.model, attribute, options);
      },

      label: function label(attribute, content, options, escape) {
          options || (options = {});

          //TODO shouldn't options.name be options.for?
          if (!options['for'] && !options.name && this.options.namespace) {
              options['for'] = tagNameForModelAttribute(this.model, attribute, { namespace: this.options.namespace });
              options['for'] = sanitizeToId(options['for']);
          }

          return _label(this.model, attribute, content, options, escape);
      },

      number: function number(attribute, options) {
          options || (options = {});

          if (!options.name && this.options.namespace) {
              options.name = tagNameForModelAttribute(this.model, attribute, { namespace: this.options.namespace });
          }

          return numberField(this.model, attribute, options);
      },

      passwordField: function passwordField$$(attribute, options) {
          options || (options = {});

          if (!options.name && this.options.namespace) {
              options.name = tagNameForModelAttribute(this.model, attribute, { namespace: this.options.namespace });
          }

          return passwordField(this.model, attribute, options);
      },

      radioButton: function radioButton$$(attribute, tagValue, options) {
          options || (options = {});

          if (!options.name && this.options.namespace) {
              options.name = tagNameForModelAttribute(this.model, attribute, { namespace: this.options.namespace });
          }

          return radioButton(this.model, attribute, tagValue, options);
      },

      select: function select(attribute, collection, options) {
          options || (options = {});

          if (!options.name && this.options.namespace) {
              options.name = tagNameForModelAttribute(this.model, attribute, { namespace: this.options.namespace });
          }

          return select$1(this.model, attribute, collection, options);
      },

      textArea: function textArea$$(attribute, options) {
          options || (options = {});

          if (!options.name && this.options.namespace) {
              options.name = tagNameForModelAttribute(this.model, attribute, { namespace: this.options.namespace });
          }

          return textArea(this.model, attribute, options);
      },

      textField: function textField$$(attribute, options) {
          options || (options = {});

          if (!options.name && this.options.namespace) {
              options.name = tagNameForModelAttribute(this.model, attribute, { namespace: this.options.namespace });
          }

          return textField(this.model, attribute, options);
      },

      checkBoxGroup: function checkBoxGroup$$(attribute, options, content) {
          if (typeof options === 'function') {
              content = options;
              options = {};
          }

          if (!options.namespace && this.options.namespace) {
              options.namespace = this.options.namespace;
          }

          return checkBoxGroup(this.model, attribute, options, content);
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
  var distanceOfTimeInWords = function distanceOfTimeInWords(fromTime, toTime, options) {
      var tmp = void 0;

      if (!(toTime instanceof Date)) {
          options = toTime;
          toTime = new Date();
      }

      options = _.extend({}, options);

      if (fromTime > toTime) {
          tmp = fromTime;
          fromTime = toTime;
          toTime = tmp;
      }

      var distance_in_seconds = Math.round((toTime.getTime() - fromTime.getTime()) / 1000);
      var distance_in_minutes = Math.round(distance_in_seconds / 60);

      if (distance_in_seconds <= 60) {
          if (options.includeSeconds) {
              if (distance_in_seconds < 2) {
                  return "a second";
              } else if (distance_in_seconds < 10) {
                  return distance_in_seconds + " seconds";
              } else if (distance_in_seconds < 55) {
                  return Math.round(distance_in_seconds / 10) * 10 + " seconds";
              } else {
                  return "a minute";
              }
          } else {
              return "a minute";
          }
      } else if (distance_in_seconds < 90) {
          return "a minute";
      } else if (distance_in_seconds < 59 * 60 + 30) {
          return distance_in_minutes + " minutes";
      } else if (distance_in_seconds < 1 * 3600 + 30 * 60) {
          return "an hour";
      } else if (distance_in_seconds < 23 * 3600 + 30 * 60) {
          // Less than 23.5 Hours
          return Math.round(distance_in_seconds / 3600) + " hours";
      } else if (distance_in_seconds < 36 * 3600) {
          // Less than 36 Hours
          return "a day";
      } else if (distance_in_seconds < 29 * 86400 + 12 * 3600) {
          // Less than 29.5 Days
          return Math.round(distance_in_seconds / 86400) + " days";
      } else if (distance_in_seconds < 45 * 86400) {
          // Less than 45 Days
          return "a month";
      } else if (distance_in_seconds < 365 * 86400) {
          // Less than 365 Days
          return Math.round(distance_in_seconds / (30 * 86400)) + " months";
      } else {
          // 1 year = 525949 min
          // 1 leap year = 527040 min
          // for out calculations 400 year = 97 leap years + 303 years
          // 1 year ~= (525949 * 303 + 527040 * 97) / 400 = 526213.5675 min
          var years = Math.round(distance_in_minutes / 526213.5675 * 100) / 100;
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
              return "almost " + (years + 1) + " years";
          }
      }
  };

  var timeAgoInWords = distanceOfTimeInWords;

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
  var linkTo = function linkTo(content, modelOrUrl, options) {
      var tmp = void 0;

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

      return contentTag('a', content, options);
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
  var mailTo = function mailTo(email, name, options) {
      var tmp = void 0;

      // handle (email, name, options), (email, contentFunc), and
      // (email, options, contentFunc) formats
      if (typeof options === 'function') {
          tmp = options;
          options = name;
          name = tmp;
      } else if ((typeof name === 'undefined' ? 'undefined' : _typeof(name)) === 'object') {
          options = name;
          name = undefined;
      }
      if (name === undefined) {
          name = _.escape(email);
      }
      options || (options = {});

      var extras = _.map(_.pick(options, 'cc', 'bcc', 'body', 'subject'), function (value, key) {
          return key + '=' + encodeURI(value);
      }).join('&');
      if (extras.length > 0) {
          extras = '?' + extras;
      }
      options = _.omit(options, 'cc', 'bcc', 'body', 'subject');

      options.href = "mailto:" + email + extras;

      return contentTag('a', name, options, false);
  };

  var Helpers = {
      // Asset Helpers
      imageTag: imageTag,

      // Builders
      CheckBoxGroupBuilder: CheckBoxGroupBuilder,
      FormBuilder: FormBuilder,

      // Date Helpers
      timeAgoInWords: timeAgoInWords,
      distanceOfTimeInWords: distanceOfTimeInWords,
      // localTime: localTime,
      // localDate: localDate,
      // localTimeAgo: localTimeAgo,
      // localRelativeTime: localRelativeTime,
      // formatTime: formatTime,

      // Form Helpers
      checkBoxGroup: checkBoxGroup,
      checkBox: checkBox,
      collectionSelect: collectionSelect,
      formFor: formFor,
      hiddenField: hiddenField,
      label: _label,
      numberField: numberField,
      passwordField: passwordField,
      radioButton: radioButton,
      select: select$1,
      textArea: textArea,
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

      // URL Helpers
      linkTo: linkTo,
      mailTo: mailTo,
      urlFor: urlFor,

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

  var Controller = Backbone.Model.extend({

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

                  if (controllerClass.__super__ === Controller.prototype) {
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
      Controller: Controller,
      Router: Router,
      View: View
  };

  return Viking$1;

}());
//# sourceMappingURL=viking.js.map