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
  // `context` defaults to the `window` variable.
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
              throw new Viking.NameError("uninitialized variable " + name);
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

          this._model = this.name.constantize();
          return this._model;
      };
  };

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
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

      load: function load(value, key) {
          if ((typeof value === "undefined" ? "undefined" : _typeof(value)) === 'object') {
              var AnonModel = Viking.Model.extend({
                  inheritanceAttribute: false
              });
              var model = new AnonModel(value);
              model.modelName = key;
              model.baseModel = model;
              return model;
          }
          throw new TypeError((typeof value === "undefined" ? "undefined" : _typeof(value)) + " can't be coerced into JSON");
      },

      dump: function dump(value) {
          if (value instanceof Viking.Model) {
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

  _.extend(Viking.Model.Reflection.prototype, {

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
          return this.collectionName.constantize();
      }

  });

  Reflection.extend = Backbone.Model.extend;

  var HasOneReflection = Viking.Model.Reflection.extend({

      constructor: function constructor(name, options) {
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

  HasManyReflection = Viking.Model.Reflection.extend({

      constructor: function constructor(name, options) {
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

  var HasManyReflection$1 = HasManyReflection;

  BelongsToReflection = Viking.Model.Reflection.extend({

      constructor: function constructor(name, options) {
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

  var BelongsToReflection$1 = BelongsToReflection;

  HasAndBelongsToManyReflection = Viking.Model.Reflection.extend({

      constructor: function constructor(name, options) {
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

  var HasAndBelongsToManyReflection$1 = HasAndBelongsToManyReflection;

  var coerceAttributes = function coerceAttributes(attrs) {

      _.each(this.associations, function (association) {
          var Type = void 0;
          var polymorphic = association.options.polymorphic;

          if (!attrs[association.name]) {
              return;
          }

          if (polymorphic && attrs[association.name] instanceof Viking.Model) {
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
              (function () {
                  var tmp = void 0,
                      klass = void 0;

                  klass = Viking.Model.Type.registry[options['type']];

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

      return Viking.sync.call(this, method, model, options);
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

                  klass = Viking.Model.Type.registry[options.type];

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
      var base = _.result(this, 'urlRoot') || _.result(this.collection, 'url') || urlError();

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
      var Collection = (this.modelName.name + 'Collection').constantize();

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

      if (typeof name !== 'string') {
          staticProps = protoProps;
          protoProps = name;
      }
      protoProps || (protoProps = {});

      var child = Backbone.Model.extend.call(this, protoProps, staticProps);

      if (typeof name === 'string') {
          child.modelName = new Viking.Model.Name(name);
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
                      'belongsTo': Viking.Model.BelongsToReflection,
                      'hasOne': Viking.Model.HasOneReflection,
                      'hasMany': Viking.Model.HasManyReflection,
                      'hasAndBelongsToMany': Viking.Model.HasAndBelongsToManyReflection
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
  Model.HasOneReflection = HasOneReflection;
  Model.HasManyReflection = HasManyReflection$1;
  Model.BelongsToReflection = BelongsToReflection$1;
  Model.HasAndBelongsToManyReflection = HasAndBelongsToManyReflection$1;

  var Viking$1 = {
      Model: Model
  };

  return Viking$1;

}());
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjpudWxsLCJzb3VyY2VzIjpbIi9Vc2Vycy93YXJhdHVtYW4vc3JjL3Zpa2luZy9saWIvdmlraW5nL3N1cHBvcnQvYXJyYXkuanMiLCIvVXNlcnMvd2FyYXR1bWFuL3NyYy92aWtpbmcvbGliL3Zpa2luZy9zdXBwb3J0L2Jvb2xlYW4uanMiLCIvVXNlcnMvd2FyYXR1bWFuL3NyYy92aWtpbmcvbGliL3Zpa2luZy9zdXBwb3J0L2RhdGUuanMiLCIvVXNlcnMvd2FyYXR1bWFuL3NyYy92aWtpbmcvbGliL3Zpa2luZy9zdXBwb3J0L251bWJlci5qcyIsIi9Vc2Vycy93YXJhdHVtYW4vc3JjL3Zpa2luZy9saWIvdmlraW5nL3N1cHBvcnQvb2JqZWN0LmpzIiwiL1VzZXJzL3dhcmF0dW1hbi9zcmMvdmlraW5nL2xpYi92aWtpbmcvc3VwcG9ydC9zdHJpbmcuanMiLCIvVXNlcnMvd2FyYXR1bWFuL3NyYy92aWtpbmcvbGliL3Zpa2luZy9tb2RlbC9uYW1lLmpzIiwiX19iYWJlbEhlbHBlcnNfXyIsIi9Vc2Vycy93YXJhdHVtYW4vc3JjL3Zpa2luZy9saWIvdmlraW5nL21vZGVsL3R5cGUvZGF0ZS5qcyIsIi9Vc2Vycy93YXJhdHVtYW4vc3JjL3Zpa2luZy9saWIvdmlraW5nL21vZGVsL3R5cGUvanNvbi5qcyIsIi9Vc2Vycy93YXJhdHVtYW4vc3JjL3Zpa2luZy9saWIvdmlraW5nL21vZGVsL3R5cGUvbnVtYmVyLmpzIiwiL1VzZXJzL3dhcmF0dW1hbi9zcmMvdmlraW5nL2xpYi92aWtpbmcvbW9kZWwvdHlwZS9zdHJpbmcuanMiLCIvVXNlcnMvd2FyYXR1bWFuL3NyYy92aWtpbmcvbGliL3Zpa2luZy9tb2RlbC90eXBlL2Jvb2xlYW4uanMiLCIvVXNlcnMvd2FyYXR1bWFuL3NyYy92aWtpbmcvbGliL3Zpa2luZy9tb2RlbC90eXBlLmpzIiwiL1VzZXJzL3dhcmF0dW1hbi9zcmMvdmlraW5nL2xpYi92aWtpbmcvbW9kZWwvcmVmbGVjdGlvbi5qcyIsIi9Vc2Vycy93YXJhdHVtYW4vc3JjL3Zpa2luZy9saWIvdmlraW5nL21vZGVsL3JlZmxlY3Rpb25zL2hhc19vbmVfcmVmbGVjdGlvbi5qcyIsIi9Vc2Vycy93YXJhdHVtYW4vc3JjL3Zpa2luZy9saWIvdmlraW5nL21vZGVsL3JlZmxlY3Rpb25zL2hhc19tYW55X3JlZmxlY3Rpb24uanMiLCIvVXNlcnMvd2FyYXR1bWFuL3NyYy92aWtpbmcvbGliL3Zpa2luZy9tb2RlbC9yZWZsZWN0aW9ucy9iZWxvbmdzX3RvX3JlZmxlY3Rpb24uanMiLCIvVXNlcnMvd2FyYXR1bWFuL3NyYy92aWtpbmcvbGliL3Zpa2luZy9tb2RlbC9yZWZsZWN0aW9ucy9oYXNfYW5kX2JlbG9uZ3NfdG9fbWFueV9yZWZsZWN0aW9uLmpzIiwiL1VzZXJzL3dhcmF0dW1hbi9zcmMvdmlraW5nL2xpYi92aWtpbmcvbW9kZWwvaW5zdGFuY2VfcHJvcGVydGllcy9jb2VyY2VBdHRyaWJ1dGVzLmpzIiwiL1VzZXJzL3dhcmF0dW1hbi9zcmMvdmlraW5nL2xpYi92aWtpbmcvbW9kZWwvaW5zdGFuY2VfcHJvcGVydGllcy9jb25zdHJ1Y3Rvci5qcyIsIi9Vc2Vycy93YXJhdHVtYW4vc3JjL3Zpa2luZy9saWIvdmlraW5nL21vZGVsL2luc3RhbmNlX3Byb3BlcnRpZXMvZGVmYXVsdHMuanMiLCIvVXNlcnMvd2FyYXR1bWFuL3NyYy92aWtpbmcvbGliL3Zpa2luZy9tb2RlbC9pbnN0YW5jZV9wcm9wZXJ0aWVzL2Vycm9yc09uLmpzIiwiL1VzZXJzL3dhcmF0dW1hbi9zcmMvdmlraW5nL2xpYi92aWtpbmcvbW9kZWwvaW5zdGFuY2VfcHJvcGVydGllcy9wYXJhbVJvb3QuanMiLCIvVXNlcnMvd2FyYXR1bWFuL3NyYy92aWtpbmcvbGliL3Zpa2luZy9tb2RlbC9pbnN0YW5jZV9wcm9wZXJ0aWVzL3NhdmUuanMiLCIvVXNlcnMvd2FyYXR1bWFuL3NyYy92aWtpbmcvbGliL3Zpa2luZy9tb2RlbC9pbnN0YW5jZV9wcm9wZXJ0aWVzL3NlbGVjdC5qcyIsIi9Vc2Vycy93YXJhdHVtYW4vc3JjL3Zpa2luZy9saWIvdmlraW5nL21vZGVsL2luc3RhbmNlX3Byb3BlcnRpZXMvc2V0LmpzIiwiL1VzZXJzL3dhcmF0dW1hbi9zcmMvdmlraW5nL2xpYi92aWtpbmcvbW9kZWwvaW5zdGFuY2VfcHJvcGVydGllcy9zZXRFcnJvcnMuanMiLCIvVXNlcnMvd2FyYXR1bWFuL3NyYy92aWtpbmcvbGliL3Zpa2luZy9tb2RlbC9pbnN0YW5jZV9wcm9wZXJ0aWVzL3N5bmMuanMiLCIvVXNlcnMvd2FyYXR1bWFuL3NyYy92aWtpbmcvbGliL3Zpa2luZy9tb2RlbC9pbnN0YW5jZV9wcm9wZXJ0aWVzL3RvSlNPTi5qcyIsIi9Vc2Vycy93YXJhdHVtYW4vc3JjL3Zpa2luZy9saWIvdmlraW5nL21vZGVsL2luc3RhbmNlX3Byb3BlcnRpZXMvdG9QYXJhbS5qcyIsIi9Vc2Vycy93YXJhdHVtYW4vc3JjL3Zpa2luZy9saWIvdmlraW5nL21vZGVsL2luc3RhbmNlX3Byb3BlcnRpZXMvdG91Y2guanMiLCIvVXNlcnMvd2FyYXR1bWFuL3NyYy92aWtpbmcvbGliL3Zpa2luZy9tb2RlbC9pbnN0YW5jZV9wcm9wZXJ0aWVzL3Vuc2VsZWN0LmpzIiwiL1VzZXJzL3dhcmF0dW1hbi9zcmMvdmlraW5nL2xpYi92aWtpbmcvbW9kZWwvaW5zdGFuY2VfcHJvcGVydGllcy91cGRhdGVfYXR0cmlidXRlLmpzIiwiL1VzZXJzL3dhcmF0dW1hbi9zcmMvdmlraW5nL2xpYi92aWtpbmcvbW9kZWwvaW5zdGFuY2VfcHJvcGVydGllcy91cGRhdGVfYXR0cmlidXRlcy5qcyIsIi9Vc2Vycy93YXJhdHVtYW4vc3JjL3Zpa2luZy9saWIvdmlraW5nL21vZGVsL2luc3RhbmNlX3Byb3BlcnRpZXMvdXJsLmpzIiwiL1VzZXJzL3dhcmF0dW1hbi9zcmMvdmlraW5nL2xpYi92aWtpbmcvbW9kZWwvaW5zdGFuY2VfcHJvcGVydGllcy91cmxSb290LmpzIiwiL1VzZXJzL3dhcmF0dW1hbi9zcmMvdmlraW5nL2xpYi92aWtpbmcvbW9kZWwvaW5zdGFuY2VfcHJvcGVydGllcy5qcyIsIi9Vc2Vycy93YXJhdHVtYW4vc3JjL3Zpa2luZy9saWIvdmlraW5nL21vZGVsL2NsYXNzX3Byb3BlcnRpZXMvY3JlYXRlLmpzIiwiL1VzZXJzL3dhcmF0dW1hbi9zcmMvdmlraW5nL2xpYi92aWtpbmcvbW9kZWwvY2xhc3NfcHJvcGVydGllcy9maW5kLmpzIiwiL1VzZXJzL3dhcmF0dW1hbi9zcmMvdmlraW5nL2xpYi92aWtpbmcvbW9kZWwvY2xhc3NfcHJvcGVydGllcy9maW5kT3JDcmVhdGVCeS5qcyIsIi9Vc2Vycy93YXJhdHVtYW4vc3JjL3Zpa2luZy9saWIvdmlraW5nL21vZGVsL2NsYXNzX3Byb3BlcnRpZXMvcmVmbGVjdE9uQXNzb2NpYXRpb24uanMiLCIvVXNlcnMvd2FyYXR1bWFuL3NyYy92aWtpbmcvbGliL3Zpa2luZy9tb2RlbC9jbGFzc19wcm9wZXJ0aWVzL3JlZmxlY3RPbkFzc29jaWF0aW9ucy5qcyIsIi9Vc2Vycy93YXJhdHVtYW4vc3JjL3Zpa2luZy9saWIvdmlraW5nL21vZGVsL2NsYXNzX3Byb3BlcnRpZXMvdXJsUm9vdC5qcyIsIi9Vc2Vycy93YXJhdHVtYW4vc3JjL3Zpa2luZy9saWIvdmlraW5nL21vZGVsL2NsYXNzX3Byb3BlcnRpZXMvd2hlcmUuanMiLCIvVXNlcnMvd2FyYXR1bWFuL3NyYy92aWtpbmcvbGliL3Zpa2luZy9tb2RlbC9jbGFzc19wcm9wZXJ0aWVzL2V4dGVuZC5qcyIsIi9Vc2Vycy93YXJhdHVtYW4vc3JjL3Zpa2luZy9saWIvdmlraW5nL21vZGVsL2NsYXNzX3Byb3BlcnRpZXMuanMiLCIvVXNlcnMvd2FyYXR1bWFuL3NyYy92aWtpbmcvbGliL3Zpa2luZy9tb2RlbC5qcyIsIi9Vc2Vycy93YXJhdHVtYW4vc3JjL3Zpa2luZy9saWIvdmlraW5nLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENhbGxzIGB0b19wYXJhbWAgb24gYWxsIGl0cyBlbGVtZW50cyBhbmQgam9pbnMgdGhlIHJlc3VsdCB3aXRoIHNsYXNoZXMuXG4vLyBUaGlzIGlzIHVzZWQgYnkgdXJsX2ZvciBpbiBWaWtpbmcgUGFjay5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShBcnJheS5wcm90b3R5cGUsICd0b1BhcmFtJywge1xuICAgIHZhbHVlOiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLm1hcCgoZSkgPT4gZS50b1BhcmFtKCkpLmpvaW4oJy8nKTsgfSxcbiAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICBjb25maWd1cmVhYmxlOiB0cnVlLFxuICAgIGVudW1lcmFibGU6IGZhbHNlXG59KTtcblxuLy8gQ29udmVydHMgYW4gYXJyYXkgaW50byBhIHN0cmluZyBzdWl0YWJsZSBmb3IgdXNlIGFzIGEgVVJMIHF1ZXJ5IHN0cmluZyxcbi8vIHVzaW5nIHRoZSBnaXZlbiBrZXkgYXMgdGhlIHBhcmFtIG5hbWUuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoQXJyYXkucHJvdG90eXBlLCAndG9RdWVyeScsIHtcbiAgICB2YWx1ZTogZnVuY3Rpb24gKGtleSkge1xuICAgICAgICBsZXQgcHJlZml4ID0ga2V5ICsgXCJbXVwiO1xuICAgICAgICByZXR1cm4gdGhpcy5tYXAoZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICBpZiAodmFsdWUgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZXNjYXBlKHByZWZpeCkgKyAnPSc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdmFsdWUudG9RdWVyeShwcmVmaXgpO1xuICAgICAgICB9KS5qb2luKCcmJyk7XG4gICAgfSxcbiAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICBjb25maWd1cmVhYmxlOiB0cnVlLFxuICAgIGVudW1lcmFibGU6IGZhbHNlXG59KTtcbiIsIi8vIEFsaWFzIG9mIHRvX3MuXG5Cb29sZWFuLnByb3RvdHlwZS50b1BhcmFtID0gQm9vbGVhbi5wcm90b3R5cGUudG9TdHJpbmc7XG5cbkJvb2xlYW4ucHJvdG90eXBlLnRvUXVlcnkgPSBmdW5jdGlvbihrZXkpIHtcbiAgICByZXR1cm4gZXNjYXBlKGtleS50b1BhcmFtKCkpICsgXCI9XCIgKyBlc2NhcGUodGhpcy50b1BhcmFtKCkpO1xufTsiLCIvLyBzdHJmdGltZSByZWxpZXMgb24gaHR0cHM6Ly9naXRodWIuY29tL3NhbXNvbmpzL3N0cmZ0aW1lLiBJdCBzdXBwb3J0c1xuLy8gc3RhbmRhcmQgc3BlY2lmaWVycyBmcm9tIEMgYXMgd2VsbCBhcyBzb21lIG90aGVyIGV4dGVuc2lvbnMgZnJvbSBSdWJ5LlxuRGF0ZS5wcm90b3R5cGUuc3RyZnRpbWUgPSBmdW5jdGlvbihmb3JtYXQpIHtcbiAgICByZXR1cm4gc3RyZnRpbWUoZm9ybWF0LCB0aGlzKTtcbn07XG5cbkRhdGUuZnJvbUlTTyA9IChzKSA9PiBuZXcgRGF0ZShzKTtcblxuLy8gQWxpYXMgb2YgdG9fcy5cbkRhdGUucHJvdG90eXBlLnRvUGFyYW0gPSBEYXRlLnByb3RvdHlwZS50b0pTT047XG5cbkRhdGUucHJvdG90eXBlLnRvUXVlcnkgPSBmdW5jdGlvbihrZXkpIHtcbiAgICByZXR1cm4gZXNjYXBlKGtleS50b1BhcmFtKCkpICsgXCI9XCIgKyBlc2NhcGUodGhpcy50b1BhcmFtKCkpO1xufTtcblxuRGF0ZS5wcm90b3R5cGUudG9kYXkgPSAoKSA9PiBuZXcgRGF0ZSgpO1xuXG5EYXRlLnByb3RvdHlwZS5pc1RvZGF5ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuICh0aGlzLmdldFVUQ0Z1bGxZZWFyKCkgPT09IChuZXcgRGF0ZSgpKS5nZXRVVENGdWxsWWVhcigpICYmIHRoaXMuZ2V0VVRDTW9udGgoKSA9PT0gKG5ldyBEYXRlKCkpLmdldFVUQ01vbnRoKCkgJiYgdGhpcy5nZXRVVENEYXRlKCkgPT09IChuZXcgRGF0ZSgpKS5nZXRVVENEYXRlKCkpO1xufTtcblxuRGF0ZS5wcm90b3R5cGUuaXNUaGlzTW9udGggPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICh0aGlzLmdldFVUQ0Z1bGxZZWFyKCkgPT09IChuZXcgRGF0ZSgpKS5nZXRVVENGdWxsWWVhcigpICYmIHRoaXMuZ2V0VVRDTW9udGgoKSA9PT0gKG5ldyBEYXRlKCkpLmdldFVUQ01vbnRoKCkpO1xufVxuXG5EYXRlLnByb3RvdHlwZS5pc1RoaXNZZWFyID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuICh0aGlzLmdldFVUQ0Z1bGxZZWFyKCkgPT09IChuZXcgRGF0ZSgpKS5nZXRVVENGdWxsWWVhcigpKTtcbn07XG5cblxuRGF0ZS5wcm90b3R5cGUucGFzdCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gKHRoaXMgPCAobmV3IERhdGUoKSkpO1xufSIsIi8vIG9yZGluYWxpemUgcmV0dXJucyB0aGUgb3JkaW5hbCBzdHJpbmcgY29ycmVzcG9uZGluZyB0byBpbnRlZ2VyOlxuLy9cbi8vICAgICAoMSkub3JkaW5hbGl6ZSgpICAgIC8vID0+ICcxc3QnXG4vLyAgICAgKDIpLm9yZGluYWxpemUoKSAgICAvLyA9PiAnMm5kJ1xuLy8gICAgICg1Mykub3JkaW5hbGl6ZSgpICAgLy8gPT4gJzUzcmQnXG4vLyAgICAgKDIwMDkpLm9yZGluYWxpemUoKSAvLyA9PiAnMjAwOXRoJ1xuLy8gICAgICgtMTM0KS5vcmRpbmFsaXplKCkgLy8gPT4gJy0xMzR0aCdcbk51bWJlci5wcm90b3R5cGUub3JkaW5hbGl6ZSA9IGZ1bmN0aW9uKCkge1xuICAgIGxldCBhYnMgPSBNYXRoLmFicyh0aGlzKTtcbiAgICBcbiAgICBpZiAoYWJzICUgMTAwID49IDExICYmIGFicyAlIDEwMCA8PSAxMykge1xuICAgICAgICByZXR1cm4gdGhpcyArICd0aCc7XG4gICAgfVxuICAgIFxuICAgIGFicyA9IGFicyAlIDEwO1xuICAgIGlmIChhYnMgPT09IDEpIHsgcmV0dXJuIHRoaXMgKyAnc3QnOyB9XG4gICAgaWYgKGFicyA9PT0gMikgeyByZXR1cm4gdGhpcyArICduZCc7IH1cbiAgICBpZiAoYWJzID09PSAzKSB7IHJldHVybiB0aGlzICsgJ3JkJzsgfVxuICAgIFxuICAgIHJldHVybiB0aGlzICsgJ3RoJztcbn07XG5cbi8vIEFsaWFzIG9mIHRvX3MuXG5OdW1iZXIucHJvdG90eXBlLnRvUGFyYW0gPSBOdW1iZXIucHJvdG90eXBlLnRvU3RyaW5nO1xuXG5OdW1iZXIucHJvdG90eXBlLnRvUXVlcnkgPSBmdW5jdGlvbihrZXkpIHtcbiAgICByZXR1cm4gZXNjYXBlKGtleS50b1BhcmFtKCkpICsgXCI9XCIgKyBlc2NhcGUodGhpcy50b1BhcmFtKCkpO1xufTtcblxuTnVtYmVyLnByb3RvdHlwZS5zZWNvbmQgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcyAqIDEwMDA7XG59O1xuXG5OdW1iZXIucHJvdG90eXBlLnNlY29uZHMgPSBOdW1iZXIucHJvdG90eXBlLnNlY29uZDtcblxuTnVtYmVyLnByb3RvdHlwZS5taW51dGUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcyAqIDYwMDAwO1xufTtcblxuTnVtYmVyLnByb3RvdHlwZS5taW51dGVzID0gTnVtYmVyLnByb3RvdHlwZS5taW51dGU7XG5cbk51bWJlci5wcm90b3R5cGUuaG91ciA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzICogMzYwMDAwMDtcbn07XG5cbk51bWJlci5wcm90b3R5cGUuaG91cnMgPSBOdW1iZXIucHJvdG90eXBlLmhvdXI7XG5cbk51bWJlci5wcm90b3R5cGUuZGF5ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMgKiA4NjQwMDAwMDtcbn07XG5cbk51bWJlci5wcm90b3R5cGUuZGF5cyA9IE51bWJlci5wcm90b3R5cGUuZGF5O1xuXG5OdW1iZXIucHJvdG90eXBlLndlZWsgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcyAqIDcgKiA4NjQwMDAwMDtcbn07XG5cbk51bWJlci5wcm90b3R5cGUud2Vla3MgPSBOdW1iZXIucHJvdG90eXBlLndlZWs7XG5cbk51bWJlci5wcm90b3R5cGUuYWdvID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIG5ldyBEYXRlKChuZXcgRGF0ZSgpKS5nZXRUaW1lKCkgLSB0aGlzKTtcbn07XG5cbk51bWJlci5wcm90b3R5cGUuZnJvbU5vdyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBuZXcgRGF0ZSgobmV3IERhdGUoKSkuZ2V0VGltZSgpICsgdGhpcyk7XG59O1xuIiwiLy8gUmV0dXJucyBhIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgcmVjZWl2ZXIgc3VpdGFibGUgZm9yIHVzZSBhcyBhIFVSTFxuLy8gcXVlcnkgc3RyaW5nOlxuLy8gXG4vLyB7bmFtZTogJ0RhdmlkJywgbmF0aW9uYWxpdHk6ICdEYW5pc2gnfS50b1BhcmFtKClcbi8vIC8vID0+IFwibmFtZT1EYXZpZCZuYXRpb25hbGl0eT1EYW5pc2hcIlxuLy8gQW4gb3B0aW9uYWwgbmFtZXNwYWNlIGNhbiBiZSBwYXNzZWQgdG8gZW5jbG9zZSB0aGUgcGFyYW0gbmFtZXM6XG4vLyBcbi8vIHtuYW1lOiAnRGF2aWQnLCBuYXRpb25hbGl0eTogJ0RhbmlzaCd9LnRvUGFyYW0oJ3VzZXInKVxuLy8gLy8gPT4gXCJ1c2VyW25hbWVdPURhdmlkJnVzZXJbbmF0aW9uYWxpdHldPURhbmlzaFwiXG4vL1xuLy8gVGhlIHN0cmluZyBwYWlycyBcImtleT12YWx1ZVwiIHRoYXQgY29uZm9ybSB0aGUgcXVlcnkgc3RyaW5nIGFyZSBzb3J0ZWRcbi8vIGxleGljb2dyYXBoaWNhbGx5IGluIGFzY2VuZGluZyBvcmRlci5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShPYmplY3QucHJvdG90eXBlLCAndG9QYXJhbScsIHtcbiAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICBjb25maWd1cmVhYmxlOiB0cnVlLFxuICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgIHZhbHVlOiBmdW5jdGlvbihuYW1lc3BhY2UpIHtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKHRoaXMpLm1hcCgoa2V5KSA9PiB7XG4gICAgICAgICAgICBsZXQgdmFsdWUgPSB0aGlzW2tleV07XG4gICAgICAgICAgICBsZXQgbmFtZXNwYWNlV2l0aEtleSA9IChuYW1lc3BhY2UgPyAobmFtZXNwYWNlICsgXCJbXCIgKyBrZXkgKyBcIl1cIikgOiBrZXkpO1xuXG4gICAgICAgICAgICBpZiAodmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBlc2NhcGUobmFtZXNwYWNlV2l0aEtleSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZS50b1F1ZXJ5KG5hbWVzcGFjZVdpdGhLZXkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KS5qb2luKCcmJyk7XG4gICAgfVxufSk7XG5cbi8vIENvbnZlcnRzIGFuIG9iamVjdCBpbnRvIGEgc3RyaW5nIHN1aXRhYmxlIGZvciB1c2UgYXMgYSBVUkwgcXVlcnkgc3RyaW5nLFxuLy8gdXNpbmcgdGhlIGdpdmVuIGtleSBhcyB0aGUgcGFyYW0gbmFtZS5cbi8vXG4vLyBOb3RlOiBUaGlzIG1ldGhvZCBpcyBkZWZpbmVkIGFzIGEgZGVmYXVsdCBpbXBsZW1lbnRhdGlvbiBmb3IgYWxsIE9iamVjdHMgZm9yXG4vLyBPYmplY3QjdG9RdWVyeSB0byB3b3JrLlxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE9iamVjdC5wcm90b3R5cGUsICd0b1F1ZXJ5Jywge1xuICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgIGNvbmZpZ3VyZWFibGU6IHRydWUsXG4gICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgdmFsdWU6IE9iamVjdC5wcm90b3R5cGUudG9QYXJhbVxufSk7IiwiLy8gQ29udmVydHMgdGhlIGZpcnN0IGNoYXJhY3RlciB0byB1cHBlcmNhc2VcblN0cmluZy5wcm90b3R5cGUuY2FwaXRhbGl6ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgdGhpcy5zbGljZSgxKTtcbn07XG5cbi8vIENvbnZlcnRzIHRoZSBmaXJzdCBjaGFyYWN0ZXIgdG8gbG93ZXJjYXNlXG5TdHJpbmcucHJvdG90eXBlLmFudGljYXBpdGFsaXplID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuY2hhckF0KDApLnRvTG93ZXJDYXNlKCkgKyB0aGlzLnNsaWNlKDEpO1xufTtcblxuLy8gQ2FwaXRhbGl6ZXMgYWxsIHRoZSB3b3JkcyBhbmQgcmVwbGFjZXMgc29tZSBjaGFyYWN0ZXJzIGluIHRoZSBzdHJpbmcgdG9cbi8vIGNyZWF0ZSBhIG5pY2VyIGxvb2tpbmcgdGl0bGUuIHRpdGxlaXplIGlzIG1lYW50IGZvciBjcmVhdGluZyBwcmV0dHkgb3V0cHV0LlxuU3RyaW5nLnByb3RvdHlwZS50aXRsZWl6ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLnVuZGVyc2NvcmUoKS5odW1hbml6ZSgpLnJlcGxhY2UoL1xcYignP1thLXpdKS9nLCBmdW5jdGlvbihtKXsgcmV0dXJuIG0udG9VcHBlckNhc2UoKTsgfSk7XG59O1xuXG4vLyBDYXBpdGFsaXplcyB0aGUgZmlyc3Qgd29yZCBhbmQgdHVybnMgdW5kZXJzY29yZXMgaW50byBzcGFjZXMgYW5kIHN0cmlwcyBhXG4vLyB0cmFpbGluZyBcIl9pZFwiLCBpZiBhbnkuIExpa2UgdGl0bGVpemUsIHRoaXMgaXMgbWVhbnQgZm9yIGNyZWF0aW5nIHByZXR0eSBvdXRwdXQuXG5TdHJpbmcucHJvdG90eXBlLmh1bWFuaXplID0gZnVuY3Rpb24oKSB7XG4gICAgbGV0IHJlc3VsdCA9IHRoaXMudG9Mb3dlckNhc2UoKS5yZXBsYWNlKC9faWQkLywgJycpLnJlcGxhY2UoL18vZywgJyAnKTtcbiAgICByZXN1bHQgPSByZXN1bHQucmVwbGFjZSgvKFthLXpcXGRdKikvZywgZnVuY3Rpb24obSkgeyByZXR1cm4gbS50b0xvd2VyQ2FzZSgpOyB9KTtcbiAgICByZXR1cm4gcmVzdWx0LmNhcGl0YWxpemUoKTtcbn07XG5cbi8vIE1ha2VzIGFuIHVuZGVyc2NvcmVkLCBsb3dlcmNhc2UgZm9ybSBmcm9tIHRoZSBleHByZXNzaW9uIGluIHRoZSBzdHJpbmcuXG4vL1xuLy8gQ2hhbmdlcyAnLicgdG8gJy8nIHRvIGNvbnZlcnQgbmFtZXNwYWNlcyB0byBwYXRocy5cbi8vXG4vLyBFeGFtcGxlczpcbi8vIFxuLy8gICAgIFwiQWN0aXZlTW9kZWxcIi51bmRlcnNjb3JlICAgICAgICAgIyA9PiBcImFjdGl2ZV9tb2RlbFwiXG4vLyAgICAgXCJBY3RpdmVNb2RlbC5FcnJvcnNcIi51bmRlcnNjb3JlICMgPT4gXCJhY3RpdmVfbW9kZWwvZXJyb3JzXCJcbi8vXG4vLyBBcyBhIHJ1bGUgb2YgdGh1bWIgeW91IGNhbiB0aGluayBvZiB1bmRlcnNjb3JlIGFzIHRoZSBpbnZlcnNlIG9mIGNhbWVsaXplLFxuLy8gdGhvdWdoIHRoZXJlIGFyZSBjYXNlcyB3aGVyZSB0aGF0IGRvZXMgbm90IGhvbGQ6XG4vL1xuLy8gICAgIFwiU1NMRXJyb3JcIi51bmRlcnNjb3JlKCkuY2FtZWxpemUoKSAjID0+IFwiU3NsRXJyb3JcIlxuU3RyaW5nLnByb3RvdHlwZS51bmRlcnNjb3JlID0gZnVuY3Rpb24oKSB7XG4gICAgbGV0IHJlc3VsdCA9IHRoaXMucmVwbGFjZSgnLicsICcvJyk7XG4gICAgcmVzdWx0ID0gcmVzdWx0LnJlcGxhY2UoLyhbQS1aXFxkXSspKFtBLVpdW2Etel0pL2csIFwiJDFfJDJcIik7XG4gICAgcmVzdWx0ID0gcmVzdWx0LnJlcGxhY2UoLyhbYS16XFxkXSkoW0EtWl0pL2csIFwiJDFfJDJcIik7XG4gICAgcmV0dXJuIHJlc3VsdC5yZXBsYWNlKCctJywgJ18nKS50b0xvd2VyQ2FzZSgpO1xufTtcblxuLy8gQnkgZGVmYXVsdCwgI2NhbWVsaXplIGNvbnZlcnRzIHN0cmluZ3MgdG8gVXBwZXJDYW1lbENhc2UuIElmIHRoZSBhcmd1bWVudFxuLy8gdG8gY2FtZWxpemUgaXMgc2V0IHRvIGBmYWxzZWAgdGhlbiAjY2FtZWxpemUgcHJvZHVjZXMgbG93ZXJDYW1lbENhc2UuXG4vL1xuLy8gXFwjY2FtZWxpemUgd2lsbCBhbHNvIGNvbnZlcnQgXCIvXCIgdG8gXCIuXCIgd2hpY2ggaXMgdXNlZnVsIGZvciBjb252ZXJ0aW5nXG4vLyBwYXRocyB0byBuYW1lc3BhY2VzLlxuLy9cbi8vIEV4YW1wbGVzOlxuLy9cbi8vICAgICBcImFjdGl2ZV9tb2RlbFwiLmNhbWVsaXplICAgICAgICAgICAgICAgLy8gPT4gXCJBY3RpdmVNb2RlbFwiXG4vLyAgICAgXCJhY3RpdmVfbW9kZWxcIi5jYW1lbGl6ZSh0cnVlKSAgICAgICAgIC8vID0+IFwiQWN0aXZlTW9kZWxcIlxuLy8gICAgIFwiYWN0aXZlX21vZGVsXCIuY2FtZWxpemUoZmFsc2UpICAgICAgICAvLyA9PiBcImFjdGl2ZU1vZGVsXCJcbi8vICAgICBcImFjdGl2ZV9tb2RlbC9lcnJvcnNcIi5jYW1lbGl6ZSAgICAgICAgLy8gPT4gXCJBY3RpdmVNb2RlbC5FcnJvcnNcIlxuLy8gICAgIFwiYWN0aXZlX21vZGVsL2Vycm9yc1wiLmNhbWVsaXplKGZhbHNlKSAvLyA9PiBcImFjdGl2ZU1vZGVsLkVycm9yc1wiXG4vL1xuLy8gQXMgYSBydWxlIG9mIHRodW1iIHlvdSBjYW4gdGhpbmsgb2YgY2FtZWxpemUgYXMgdGhlIGludmVyc2Ugb2YgdW5kZXJzY29yZSxcbi8vIHRob3VnaCB0aGVyZSBhcmUgY2FzZXMgd2hlcmUgdGhhdCBkb2VzIG5vdCBob2xkOlxuLy9cbi8vICAgICBcIlNTTEVycm9yXCIudW5kZXJzY29yZSgpLmNhbWVsaXplKCkgICAvLyA9PiBcIlNzbEVycm9yXCJcblN0cmluZy5wcm90b3R5cGUuY2FtZWxpemUgPSBmdW5jdGlvbih1cHBlcmNhc2VfZmlyc3RfbGV0dGVyKSB7XG4gICAgbGV0IHJlc3VsdDtcblxuICAgIGlmICh1cHBlcmNhc2VfZmlyc3RfbGV0dGVyID09PSB1bmRlZmluZWQgfHwgdXBwZXJjYXNlX2ZpcnN0X2xldHRlcikge1xuICAgICAgICByZXN1bHQgPSB0aGlzLmNhcGl0YWxpemUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXN1bHQgPSB0aGlzLmFudGljYXBpdGFsaXplKCk7XG4gICAgfVxuXG4gICAgcmVzdWx0ID0gcmVzdWx0LnJlcGxhY2UoLyhffChcXC8pKShbYS16XFxkXSopL2csIGZ1bmN0aW9uKF9hLCBfYiwgZmlyc3QsIHJlc3QpIHtcbiAgICAgICAgcmV0dXJuIChmaXJzdCB8fCAnJykgKyByZXN0LmNhcGl0YWxpemUoKTtcbiAgICB9KTtcblxuICAgIHJldHVybiByZXN1bHQucmVwbGFjZSgnLycsICcuJyk7XG59O1xuXG4vLyBDb252ZXJ0IGEgc3RyaW5nIHRvIGEgYm9vbGVhbiB2YWx1ZS4gSWYgdGhlIGFyZ3VtZW50IHRvICNib29sZWFuaXplIGlzXG4vLyBwYXNzZWQgaWYgdGhlIHN0cmluZyBpcyBub3QgJ3RydWUnIG9yICdmYWxzZScgaXQgd2lsbCByZXR1cm4gdGhlIGFyZ3VtZW50LlxuLy9cbi8vIEV4YW1wbGVzOlxuLy9cbi8vICAgICBcInRydWVcIi5ib29sZWFuaXplKCkgICAgICAgLy8gPT4gdHJ1ZVxuLy8gICAgIFwiZmFsc2VcIi5ib29sZWFuaXplKCkgICAgICAvLyA9PiBmYWxzZVxuLy8gICAgIFwib3RoZXJcIi5ib29sZWFuaXplKCkgICAgICAvLyA9PiBmYWxzZVxuLy8gICAgIFwib3RoZXJcIi5ib29sZWFuaXplKHRydWUpICAvLyA9PiB0cnVlXG5TdHJpbmcucHJvdG90eXBlLmJvb2xlYW5pemUgPSBmdW5jdGlvbihkZWZhdWx0VG8pIHtcbiAgICBpZih0aGlzLnRvU3RyaW5nKCkgPT09ICd0cnVlJykgeyByZXR1cm4gdHJ1ZTsgfVxuICAgIGlmICh0aGlzLnRvU3RyaW5nKCkgPT09ICdmYWxzZScpIHsgcmV0dXJuIGZhbHNlOyB9XG4gICAgXG4gICAgcmV0dXJuIChkZWZhdWx0VG8gPT09IHVuZGVmaW5lZCA/IGZhbHNlIDogZGVmYXVsdFRvKTtcbn07XG5cbi8vIFJlcGxhY2VzIHVuZGVyc2NvcmVzIHdpdGggZGFzaGVzLlxuLy9cbi8vIEV4YW1wbGU6XG4vL1xuLy8gICAgIFwicHVuaV9wdW5pXCIgIC8vID0+IFwicHVuaS1wdW5pXCJcblN0cmluZy5wcm90b3R5cGUuZGFzaGVyaXplID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMucmVwbGFjZSgnXycsICctJyk7XG59O1xuXG4vLyBSZXBsYWNlcyBzcGVjaWFsIGNoYXJhY3RlcnMgaW4gYSBzdHJpbmcgc28gdGhhdCBpdCBtYXkgYmUgdXNlZCBhcyBwYXJ0IG9mXG4vLyBhIFwicHJldHR5XCIgVVJMLlxuLy9cbi8vIEV4YW1wbGU6XG4vL1xuLy8gICAgIFwiRG9uYWxkIEUuIEtudXRoXCIucGFyYW1ldGVyaXplKCkgLy8gPT4gJ2RvbmFsZC1lLWtudXRoJ1xuU3RyaW5nLnByb3RvdHlwZS5wYXJhbWV0ZXJpemUgPSBmdW5jdGlvbihzZXBlcmF0b3IpIHtcbiAgICByZXR1cm4gdGhpcy50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoL1teYS16MC05XFwtX10rL2csIHNlcGVyYXRvciB8fCAnLScpO1xufTtcblxuLy8gQWRkIFVuZGVyc2NvcmUuaW5mbGVjdGlvbiNwbHVyYWxpemUgZnVuY3Rpb24gb24gdGhlIFN0cmluZyBvYmplY3RcblN0cmluZy5wcm90b3R5cGUucGx1cmFsaXplID0gZnVuY3Rpb24oY291bnQsIGluY2x1ZGVOdW1iZXIpIHtcbiAgICByZXR1cm4gXy5wbHVyYWxpemUodGhpcywgY291bnQsIGluY2x1ZGVOdW1iZXIpO1xufTtcblxuLy8gQWRkIFVuZGVyc2NvcmUuaW5mbGVjdGlvbiNzaW5ndWxhcml6ZSBmdW5jdGlvbiBvbiB0aGUgU3RyaW5nIG9iamVjdFxuU3RyaW5nLnByb3RvdHlwZS5zaW5ndWxhcml6ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBfLnNpbmd1bGFyaXplKHRoaXMpO1xufTtcblxuLy8gVHJpZXMgdG8gZmluZCBhIHZhcmlhYmxlIHdpdGggdGhlIG5hbWUgc3BlY2lmaWVkIGluIGNvbnRleHQgb2YgYGNvbnRleHRgLlxuLy8gYGNvbnRleHRgIGRlZmF1bHRzIHRvIHRoZSBgd2luZG93YCB2YXJpYWJsZS5cbi8vXG4vLyBFeGFtcGxlczpcbi8vICAgICAnTW9kdWxlJy5jb25zdGFudGl6ZSAgICAgIyA9PiBNb2R1bGVcbi8vICAgICAnVGVzdC5Vbml0Jy5jb25zdGFudGl6ZSAgIyA9PiBUZXN0LlVuaXRcbi8vICAgICAnVW5pdCcuY29uc3RhbnRpemUoVGVzdCkgIyA9PiBUZXN0LlVuaXRcbi8vXG4vLyBWaWtpbmcuTmFtZUVycm9yIGlzIHJhaXNlZCB3aGVuIHRoZSB2YXJpYWJsZSBpcyB1bmtub3duLlxuU3RyaW5nLnByb3RvdHlwZS5jb25zdGFudGl6ZSA9IGZ1bmN0aW9uKGNvbnRleHQpIHtcbiAgICBpZighY29udGV4dCkgeyBjb250ZXh0ID0gd2luZG93OyB9XG5cbiAgICByZXR1cm4gdGhpcy5zcGxpdCgnLicpLnJlZHVjZShmdW5jdGlvbiAoY29udGV4dCwgbmFtZSkge1xuICAgICAgICBsZXQgdiA9IGNvbnRleHRbbmFtZV07XG4gICAgICAgIGlmICghdikge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFZpa2luZy5OYW1lRXJyb3IoXCJ1bmluaXRpYWxpemVkIHZhcmlhYmxlIFwiICsgbmFtZSk7IFxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2O1xuICAgIH0sIGNvbnRleHQpO1xufTtcblxuLy8gUmVtb3ZlcyB0aGUgbW9kdWxlIHBhcnQgZnJvbSB0aGUgZXhwcmVzc2lvbiBpbiB0aGUgc3RyaW5nLlxuLy9cbi8vIEV4YW1wbGVzOlxuLy8gICAgICdOYW1lc3BhY2VkLk1vZHVsZScuZGVtb2R1bGl6ZSgpICMgPT4gJ01vZHVsZSdcbi8vICAgICAnTW9kdWxlJy5kZW1vZHVsaXplKCkgIyA9PiAnTW9kdWxlJ1xuLy8gICAgICcnLmRlbW9kdWxpemUoKSAjID0+ICcnXG5TdHJpbmcucHJvdG90eXBlLmRlbW9kdWxpemUgPSBmdW5jdGlvbiAoc2VwZXJhdG9yKSB7XG4gICAgaWYgKCFzZXBlcmF0b3IpIHtcbiAgICAgICAgc2VwZXJhdG9yID0gJy4nO1xuICAgIH1cblxuICAgIGxldCBpbmRleCA9IHRoaXMubGFzdEluZGV4T2Yoc2VwZXJhdG9yKTtcblxuICAgIGlmIChpbmRleCA9PT0gLTEpIHtcbiAgICAgICAgcmV0dXJuIFN0cmluZyh0aGlzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy5zbGljZShpbmRleCArIDEpO1xuICAgIH1cbn1cblxuLy8gSWYgYGxlbmd0aGAgaXMgZ3JlYXRlciB0aGFuIHRoZSBsZW5ndGggb2YgdGhlIHN0cmluZywgcmV0dXJucyBhIG5ldyBTdHJpbmdcbi8vIG9mIGxlbmd0aCBgbGVuZ3RoYCB3aXRoIHRoZSBzdHJpbmcgcmlnaHQganVzdGlmaWVkIGFuZCBwYWRkZWQgd2l0aCBwYWRTdHJpbmc7XG4vLyBvdGhlcndpc2UsIHJldHVybnMgc3RyaW5nXG5TdHJpbmcucHJvdG90eXBlLnJqdXN0ID0gZnVuY3Rpb24obGVuZ3RoLCBwYWRTdHJpbmcpIHtcbiAgICBpZiAoIXBhZFN0cmluZykgeyBwYWRTdHJpbmcgPSAnICc7IH1cbiAgICBcbiAgICBsZXQgcGFkZGluZyA9ICcnO1xuICAgIGxldCBwYWRkaW5nTGVuZ3RoID0gbGVuZ3RoIC0gdGhpcy5sZW5ndGg7XG5cbiAgICB3aGlsZSAocGFkZGluZy5sZW5ndGggPCBwYWRkaW5nTGVuZ3RoKSB7XG4gICAgICAgIGlmIChwYWRkaW5nTGVuZ3RoIC0gcGFkZGluZy5sZW5ndGggPCBwYWRTdHJpbmcubGVuZ3RoKSB7XG4gICAgICAgICAgICBwYWRkaW5nID0gcGFkZGluZyArIHBhZFN0cmluZy5zbGljZSgwLCBwYWRkaW5nTGVuZ3RoIC0gcGFkZGluZy5sZW5ndGgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcGFkZGluZyA9IHBhZGRpbmcgKyBwYWRTdHJpbmc7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gcGFkZGluZyArIHRoaXM7XG59O1xuXG4vLyBJZiBgbGVuZ3RoYCBpcyBncmVhdGVyIHRoYW4gdGhlIGxlbmd0aCBvZiB0aGUgc3RyaW5nLCByZXR1cm5zIGEgbmV3IFN0cmluZ1xuLy8gb2YgbGVuZ3RoIGBsZW5ndGhgIHdpdGggdGhlIHN0cmluZyBsZWZ0IGp1c3RpZmllZCBhbmQgcGFkZGVkIHdpdGggcGFkU3RyaW5nO1xuLy8gb3RoZXJ3aXNlLCByZXR1cm5zIHN0cmluZ1xuU3RyaW5nLnByb3RvdHlwZS5sanVzdCA9IGZ1bmN0aW9uKGxlbmd0aCwgcGFkU3RyaW5nKSB7XG4gICAgaWYgKCFwYWRTdHJpbmcpIHsgcGFkU3RyaW5nID0gJyAnOyB9XG4gICAgXG4gICAgbGV0IHBhZGRpbmcgPSAnJztcbiAgICBsZXQgcGFkZGluZ0xlbmd0aCA9IGxlbmd0aCAtIHRoaXMubGVuZ3RoO1xuXG4gICAgd2hpbGUgKHBhZGRpbmcubGVuZ3RoIDwgcGFkZGluZ0xlbmd0aCkge1xuICAgICAgICBpZiAocGFkZGluZ0xlbmd0aCAtIHBhZGRpbmcubGVuZ3RoIDwgcGFkU3RyaW5nLmxlbmd0aCkge1xuICAgICAgICAgICAgcGFkZGluZyA9IHBhZGRpbmcgKyBwYWRTdHJpbmcuc2xpY2UoMCwgcGFkZGluZ0xlbmd0aCAtIHBhZGRpbmcubGVuZ3RoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBhZGRpbmcgPSBwYWRkaW5nICsgcGFkU3RyaW5nO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMgKyBwYWRkaW5nO1xufTtcblxuLy8gQWxpYXMgb2YgdG9fcy5cblN0cmluZy5wcm90b3R5cGUudG9QYXJhbSA9IFN0cmluZy5wcm90b3R5cGUudG9TdHJpbmc7XG5cblN0cmluZy5wcm90b3R5cGUudG9RdWVyeSA9IGZ1bmN0aW9uKGtleSkge1xuXHRyZXR1cm4gZXNjYXBlKGtleS50b1BhcmFtKCkpICsgXCI9XCIgKyBlc2NhcGUodGhpcy50b1BhcmFtKCkpO1xufTtcblxuU3RyaW5nLnByb3RvdHlwZS5kb3duY2FzZSA9IFN0cmluZy5wcm90b3R5cGUudG9Mb3dlckNhc2U7XG4iLCJjb25zdCBOYW1lID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICBsZXQgb2JqZWN0TmFtZSA9IG5hbWUuY2FtZWxpemUoKTsgLy8gTmFtZXNwYWNlZC5OYW1lXG5cbiAgICB0aGlzLm5hbWUgPSBvYmplY3ROYW1lO1xuICAgIHRoaXMuY29sbGVjdGlvbk5hbWUgPSBvYmplY3ROYW1lICsgJ0NvbGxlY3Rpb24nO1xuICAgIHRoaXMuc2luZ3VsYXIgPSBvYmplY3ROYW1lLnVuZGVyc2NvcmUoKS5yZXBsYWNlKC9cXC8vZywgJ18nKTsgLy8gbmFtZXNwYWNlZF9uYW1lXG4gICAgdGhpcy5wbHVyYWwgPSB0aGlzLnNpbmd1bGFyLnBsdXJhbGl6ZSgpOyAvLyBuYW1lc3BhY2VkX25hbWVzXG4gICAgdGhpcy5odW1hbiA9IG9iamVjdE5hbWUuZGVtb2R1bGl6ZSgpLmh1bWFuaXplKCk7IC8vIE5hbWVcbiAgICB0aGlzLmNvbGxlY3Rpb24gPSB0aGlzLnNpbmd1bGFyLnBsdXJhbGl6ZSgpOyAvLyBuYW1lc3BhY2VkL25hbWVzXG4gICAgdGhpcy5wYXJhbUtleSA9IHRoaXMuc2luZ3VsYXI7XG4gICAgdGhpcy5yb3V0ZUtleSA9IHRoaXMucGx1cmFsO1xuICAgIHRoaXMuZWxlbWVudCA9IG9iamVjdE5hbWUuZGVtb2R1bGl6ZSgpLnVuZGVyc2NvcmUoKTtcblxuICAgIHRoaXMubW9kZWwgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0aGlzLl9tb2RlbCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX21vZGVsO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fbW9kZWwgPSB0aGlzLm5hbWUuY29uc3RhbnRpemUoKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuX21vZGVsO1xuICAgIH1cblxufTtcblxuZXhwb3J0IGRlZmF1bHQgTmFtZTtcbiIsInZhciBiYWJlbEhlbHBlcnMgPSB7fTtcbmV4cG9ydCB2YXIgX3R5cGVvZiA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiB0eXBlb2YgU3ltYm9sLml0ZXJhdG9yID09PSBcInN5bWJvbFwiID8gZnVuY3Rpb24gKG9iaikge1xuICByZXR1cm4gdHlwZW9mIG9iajtcbn0gOiBmdW5jdGlvbiAob2JqKSB7XG4gIHJldHVybiBvYmogJiYgdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIG9iai5jb25zdHJ1Y3RvciA9PT0gU3ltYm9sID8gXCJzeW1ib2xcIiA6IHR5cGVvZiBvYmo7XG59O1xuXG5leHBvcnQgdmFyIGpzeCA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIFJFQUNUX0VMRU1FTlRfVFlQRSA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBTeW1ib2wuZm9yICYmIFN5bWJvbC5mb3IoXCJyZWFjdC5lbGVtZW50XCIpIHx8IDB4ZWFjNztcbiAgcmV0dXJuIGZ1bmN0aW9uIGNyZWF0ZVJhd1JlYWN0RWxlbWVudCh0eXBlLCBwcm9wcywga2V5LCBjaGlsZHJlbikge1xuICAgIHZhciBkZWZhdWx0UHJvcHMgPSB0eXBlICYmIHR5cGUuZGVmYXVsdFByb3BzO1xuICAgIHZhciBjaGlsZHJlbkxlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGggLSAzO1xuXG4gICAgaWYgKCFwcm9wcyAmJiBjaGlsZHJlbkxlbmd0aCAhPT0gMCkge1xuICAgICAgcHJvcHMgPSB7fTtcbiAgICB9XG5cbiAgICBpZiAocHJvcHMgJiYgZGVmYXVsdFByb3BzKSB7XG4gICAgICBmb3IgKHZhciBwcm9wTmFtZSBpbiBkZWZhdWx0UHJvcHMpIHtcbiAgICAgICAgaWYgKHByb3BzW3Byb3BOYW1lXSA9PT0gdm9pZCAwKSB7XG4gICAgICAgICAgcHJvcHNbcHJvcE5hbWVdID0gZGVmYXVsdFByb3BzW3Byb3BOYW1lXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoIXByb3BzKSB7XG4gICAgICBwcm9wcyA9IGRlZmF1bHRQcm9wcyB8fCB7fTtcbiAgICB9XG5cbiAgICBpZiAoY2hpbGRyZW5MZW5ndGggPT09IDEpIHtcbiAgICAgIHByb3BzLmNoaWxkcmVuID0gY2hpbGRyZW47XG4gICAgfSBlbHNlIGlmIChjaGlsZHJlbkxlbmd0aCA+IDEpIHtcbiAgICAgIHZhciBjaGlsZEFycmF5ID0gQXJyYXkoY2hpbGRyZW5MZW5ndGgpO1xuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNoaWxkcmVuTGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY2hpbGRBcnJheVtpXSA9IGFyZ3VtZW50c1tpICsgM107XG4gICAgICB9XG5cbiAgICAgIHByb3BzLmNoaWxkcmVuID0gY2hpbGRBcnJheTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgJCR0eXBlb2Y6IFJFQUNUX0VMRU1FTlRfVFlQRSxcbiAgICAgIHR5cGU6IHR5cGUsXG4gICAgICBrZXk6IGtleSA9PT0gdW5kZWZpbmVkID8gbnVsbCA6ICcnICsga2V5LFxuICAgICAgcmVmOiBudWxsLFxuICAgICAgcHJvcHM6IHByb3BzLFxuICAgICAgX293bmVyOiBudWxsXG4gICAgfTtcbiAgfTtcbn0oKTtcblxuZXhwb3J0IHZhciBhc3luY1RvR2VuZXJhdG9yID0gZnVuY3Rpb24gKGZuKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGdlbiA9IGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIGZ1bmN0aW9uIHN0ZXAoa2V5LCBhcmcpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB2YXIgaW5mbyA9IGdlbltrZXldKGFyZyk7XG4gICAgICAgICAgdmFyIHZhbHVlID0gaW5mby52YWx1ZTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpbmZvLmRvbmUpIHtcbiAgICAgICAgICByZXNvbHZlKHZhbHVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHZhbHVlKS50aGVuKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgcmV0dXJuIHN0ZXAoXCJuZXh0XCIsIHZhbHVlKTtcbiAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICByZXR1cm4gc3RlcChcInRocm93XCIsIGVycik7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHN0ZXAoXCJuZXh0XCIpO1xuICAgIH0pO1xuICB9O1xufTtcblxuZXhwb3J0IHZhciBjbGFzc0NhbGxDaGVjayA9IGZ1bmN0aW9uIChpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHtcbiAgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpO1xuICB9XG59O1xuXG5leHBvcnQgdmFyIGNyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldO1xuICAgICAgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlO1xuICAgICAgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlO1xuICAgICAgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTtcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykge1xuICAgIGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7XG4gICAgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7XG4gICAgcmV0dXJuIENvbnN0cnVjdG9yO1xuICB9O1xufSgpO1xuXG5leHBvcnQgdmFyIGRlZmluZUVudW1lcmFibGVQcm9wZXJ0aWVzID0gZnVuY3Rpb24gKG9iaiwgZGVzY3MpIHtcbiAgZm9yICh2YXIga2V5IGluIGRlc2NzKSB7XG4gICAgdmFyIGRlc2MgPSBkZXNjc1trZXldO1xuICAgIGRlc2MuY29uZmlndXJhYmxlID0gZGVzYy5lbnVtZXJhYmxlID0gdHJ1ZTtcbiAgICBpZiAoXCJ2YWx1ZVwiIGluIGRlc2MpIGRlc2Mud3JpdGFibGUgPSB0cnVlO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwgZGVzYyk7XG4gIH1cblxuICByZXR1cm4gb2JqO1xufTtcblxuZXhwb3J0IHZhciBkZWZhdWx0cyA9IGZ1bmN0aW9uIChvYmosIGRlZmF1bHRzKSB7XG4gIHZhciBrZXlzID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoZGVmYXVsdHMpO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBrZXkgPSBrZXlzW2ldO1xuICAgIHZhciB2YWx1ZSA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoZGVmYXVsdHMsIGtleSk7XG5cbiAgICBpZiAodmFsdWUgJiYgdmFsdWUuY29uZmlndXJhYmxlICYmIG9ialtrZXldID09PSB1bmRlZmluZWQpIHtcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwgdmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBvYmo7XG59O1xuXG5leHBvcnQgdmFyIGRlZmluZVByb3BlcnR5ID0gZnVuY3Rpb24gKG9iaiwga2V5LCB2YWx1ZSkge1xuICBpZiAoa2V5IGluIG9iaikge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwge1xuICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgb2JqW2tleV0gPSB2YWx1ZTtcbiAgfVxuXG4gIHJldHVybiBvYmo7XG59O1xuXG5leHBvcnQgdmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7XG4gIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTtcblxuICAgIGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHtcbiAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7XG4gICAgICAgIHRhcmdldFtrZXldID0gc291cmNlW2tleV07XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRhcmdldDtcbn07XG5cbmV4cG9ydCB2YXIgZ2V0ID0gZnVuY3Rpb24gZ2V0KG9iamVjdCwgcHJvcGVydHksIHJlY2VpdmVyKSB7XG4gIGlmIChvYmplY3QgPT09IG51bGwpIG9iamVjdCA9IEZ1bmN0aW9uLnByb3RvdHlwZTtcbiAgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iamVjdCwgcHJvcGVydHkpO1xuXG4gIGlmIChkZXNjID09PSB1bmRlZmluZWQpIHtcbiAgICB2YXIgcGFyZW50ID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iamVjdCk7XG5cbiAgICBpZiAocGFyZW50ID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZ2V0KHBhcmVudCwgcHJvcGVydHksIHJlY2VpdmVyKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoXCJ2YWx1ZVwiIGluIGRlc2MpIHtcbiAgICByZXR1cm4gZGVzYy52YWx1ZTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgZ2V0dGVyID0gZGVzYy5nZXQ7XG5cbiAgICBpZiAoZ2V0dGVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIGdldHRlci5jYWxsKHJlY2VpdmVyKTtcbiAgfVxufTtcblxuZXhwb3J0IHZhciBpbmhlcml0cyA9IGZ1bmN0aW9uIChzdWJDbGFzcywgc3VwZXJDbGFzcykge1xuICBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09IFwiZnVuY3Rpb25cIiAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgXCIgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7XG4gIH1cblxuICBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHtcbiAgICBjb25zdHJ1Y3Rvcjoge1xuICAgICAgdmFsdWU6IHN1YkNsYXNzLFxuICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH1cbiAgfSk7XG4gIGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzcztcbn07XG5cbmV4cG9ydCB2YXIgX2luc3RhbmNlb2YgPSBmdW5jdGlvbiAobGVmdCwgcmlnaHQpIHtcbiAgaWYgKHJpZ2h0ICE9IG51bGwgJiYgdHlwZW9mIFN5bWJvbCAhPT0gXCJ1bmRlZmluZWRcIiAmJiByaWdodFtTeW1ib2wuaGFzSW5zdGFuY2VdKSB7XG4gICAgcmV0dXJuIHJpZ2h0W1N5bWJvbC5oYXNJbnN0YW5jZV0obGVmdCk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGxlZnQgaW5zdGFuY2VvZiByaWdodDtcbiAgfVxufTtcblxuZXhwb3J0IHZhciBpbnRlcm9wUmVxdWlyZURlZmF1bHQgPSBmdW5jdGlvbiAob2JqKSB7XG4gIHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7XG4gICAgZGVmYXVsdDogb2JqXG4gIH07XG59O1xuXG5leHBvcnQgdmFyIGludGVyb3BSZXF1aXJlV2lsZGNhcmQgPSBmdW5jdGlvbiAob2JqKSB7XG4gIGlmIChvYmogJiYgb2JqLl9fZXNNb2R1bGUpIHtcbiAgICByZXR1cm4gb2JqO1xuICB9IGVsc2Uge1xuICAgIHZhciBuZXdPYmogPSB7fTtcblxuICAgIGlmIChvYmogIT0gbnVsbCkge1xuICAgICAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwga2V5KSkgbmV3T2JqW2tleV0gPSBvYmpba2V5XTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBuZXdPYmouZGVmYXVsdCA9IG9iajtcbiAgICByZXR1cm4gbmV3T2JqO1xuICB9XG59O1xuXG5leHBvcnQgdmFyIG5ld0Fycm93Q2hlY2sgPSBmdW5jdGlvbiAoaW5uZXJUaGlzLCBib3VuZFRoaXMpIHtcbiAgaWYgKGlubmVyVGhpcyAhPT0gYm91bmRUaGlzKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBpbnN0YW50aWF0ZSBhbiBhcnJvdyBmdW5jdGlvblwiKTtcbiAgfVxufTtcblxuZXhwb3J0IHZhciBvYmplY3REZXN0cnVjdHVyaW5nRW1wdHkgPSBmdW5jdGlvbiAob2JqKSB7XG4gIGlmIChvYmogPT0gbnVsbCkgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBkZXN0cnVjdHVyZSB1bmRlZmluZWRcIik7XG59O1xuXG5leHBvcnQgdmFyIG9iamVjdFdpdGhvdXRQcm9wZXJ0aWVzID0gZnVuY3Rpb24gKG9iaiwga2V5cykge1xuICB2YXIgdGFyZ2V0ID0ge307XG5cbiAgZm9yICh2YXIgaSBpbiBvYmopIHtcbiAgICBpZiAoa2V5cy5pbmRleE9mKGkpID49IDApIGNvbnRpbnVlO1xuICAgIGlmICghT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgaSkpIGNvbnRpbnVlO1xuICAgIHRhcmdldFtpXSA9IG9ialtpXTtcbiAgfVxuXG4gIHJldHVybiB0YXJnZXQ7XG59O1xuXG5leHBvcnQgdmFyIHBvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4gPSBmdW5jdGlvbiAoc2VsZiwgY2FsbCkge1xuICBpZiAoIXNlbGYpIHtcbiAgICB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJ0aGlzIGhhc24ndCBiZWVuIGluaXRpYWxpc2VkIC0gc3VwZXIoKSBoYXNuJ3QgYmVlbiBjYWxsZWRcIik7XG4gIH1cblxuICByZXR1cm4gY2FsbCAmJiAodHlwZW9mIGNhbGwgPT09IFwib2JqZWN0XCIgfHwgdHlwZW9mIGNhbGwgPT09IFwiZnVuY3Rpb25cIikgPyBjYWxsIDogc2VsZjtcbn07XG5cbmV4cG9ydCB2YXIgc2VsZkdsb2JhbCA9IHR5cGVvZiBnbG9iYWwgPT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogZ2xvYmFsO1xuXG5leHBvcnQgdmFyIHNldCA9IGZ1bmN0aW9uIHNldChvYmplY3QsIHByb3BlcnR5LCB2YWx1ZSwgcmVjZWl2ZXIpIHtcbiAgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iamVjdCwgcHJvcGVydHkpO1xuXG4gIGlmIChkZXNjID09PSB1bmRlZmluZWQpIHtcbiAgICB2YXIgcGFyZW50ID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iamVjdCk7XG5cbiAgICBpZiAocGFyZW50ICE9PSBudWxsKSB7XG4gICAgICBzZXQocGFyZW50LCBwcm9wZXJ0eSwgdmFsdWUsIHJlY2VpdmVyKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoXCJ2YWx1ZVwiIGluIGRlc2MgJiYgZGVzYy53cml0YWJsZSkge1xuICAgIGRlc2MudmFsdWUgPSB2YWx1ZTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgc2V0dGVyID0gZGVzYy5zZXQ7XG5cbiAgICBpZiAoc2V0dGVyICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHNldHRlci5jYWxsKHJlY2VpdmVyLCB2YWx1ZSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHZhbHVlO1xufTtcblxuZXhwb3J0IHZhciBzbGljZWRUb0FycmF5ID0gZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBzbGljZUl0ZXJhdG9yKGFyciwgaSkge1xuICAgIHZhciBfYXJyID0gW107XG4gICAgdmFyIF9uID0gdHJ1ZTtcbiAgICB2YXIgX2QgPSBmYWxzZTtcbiAgICB2YXIgX2UgPSB1bmRlZmluZWQ7XG5cbiAgICB0cnkge1xuICAgICAgZm9yICh2YXIgX2kgPSBhcnJbU3ltYm9sLml0ZXJhdG9yXSgpLCBfczsgIShfbiA9IChfcyA9IF9pLm5leHQoKSkuZG9uZSk7IF9uID0gdHJ1ZSkge1xuICAgICAgICBfYXJyLnB1c2goX3MudmFsdWUpO1xuXG4gICAgICAgIGlmIChpICYmIF9hcnIubGVuZ3RoID09PSBpKSBicmVhaztcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIF9kID0gdHJ1ZTtcbiAgICAgIF9lID0gZXJyO1xuICAgIH0gZmluYWxseSB7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoIV9uICYmIF9pW1wicmV0dXJuXCJdKSBfaVtcInJldHVyblwiXSgpO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgaWYgKF9kKSB0aHJvdyBfZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gX2FycjtcbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbiAoYXJyLCBpKSB7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkge1xuICAgICAgcmV0dXJuIGFycjtcbiAgICB9IGVsc2UgaWYgKFN5bWJvbC5pdGVyYXRvciBpbiBPYmplY3QoYXJyKSkge1xuICAgICAgcmV0dXJuIHNsaWNlSXRlcmF0b3IoYXJyLCBpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkludmFsaWQgYXR0ZW1wdCB0byBkZXN0cnVjdHVyZSBub24taXRlcmFibGUgaW5zdGFuY2VcIik7XG4gICAgfVxuICB9O1xufSgpO1xuXG5leHBvcnQgdmFyIHNsaWNlZFRvQXJyYXlMb29zZSA9IGZ1bmN0aW9uIChhcnIsIGkpIHtcbiAgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkge1xuICAgIHJldHVybiBhcnI7XG4gIH0gZWxzZSBpZiAoU3ltYm9sLml0ZXJhdG9yIGluIE9iamVjdChhcnIpKSB7XG4gICAgdmFyIF9hcnIgPSBbXTtcblxuICAgIGZvciAodmFyIF9pdGVyYXRvciA9IGFycltTeW1ib2wuaXRlcmF0b3JdKCksIF9zdGVwOyAhKF9zdGVwID0gX2l0ZXJhdG9yLm5leHQoKSkuZG9uZTspIHtcbiAgICAgIF9hcnIucHVzaChfc3RlcC52YWx1ZSk7XG5cbiAgICAgIGlmIChpICYmIF9hcnIubGVuZ3RoID09PSBpKSBicmVhaztcbiAgICB9XG5cbiAgICByZXR1cm4gX2FycjtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiSW52YWxpZCBhdHRlbXB0IHRvIGRlc3RydWN0dXJlIG5vbi1pdGVyYWJsZSBpbnN0YW5jZVwiKTtcbiAgfVxufTtcblxuZXhwb3J0IHZhciB0YWdnZWRUZW1wbGF0ZUxpdGVyYWwgPSBmdW5jdGlvbiAoc3RyaW5ncywgcmF3KSB7XG4gIHJldHVybiBPYmplY3QuZnJlZXplKE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKHN0cmluZ3MsIHtcbiAgICByYXc6IHtcbiAgICAgIHZhbHVlOiBPYmplY3QuZnJlZXplKHJhdylcbiAgICB9XG4gIH0pKTtcbn07XG5cbmV4cG9ydCB2YXIgdGFnZ2VkVGVtcGxhdGVMaXRlcmFsTG9vc2UgPSBmdW5jdGlvbiAoc3RyaW5ncywgcmF3KSB7XG4gIHN0cmluZ3MucmF3ID0gcmF3O1xuICByZXR1cm4gc3RyaW5ncztcbn07XG5cbmV4cG9ydCB2YXIgdGVtcG9yYWxSZWYgPSBmdW5jdGlvbiAodmFsLCBuYW1lLCB1bmRlZikge1xuICBpZiAodmFsID09PSB1bmRlZikge1xuICAgIHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihuYW1lICsgXCIgaXMgbm90IGRlZmluZWQgLSB0ZW1wb3JhbCBkZWFkIHpvbmVcIik7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHZhbDtcbiAgfVxufTtcblxuZXhwb3J0IHZhciB0ZW1wb3JhbFVuZGVmaW5lZCA9IHt9O1xuXG5leHBvcnQgdmFyIHRvQXJyYXkgPSBmdW5jdGlvbiAoYXJyKSB7XG4gIHJldHVybiBBcnJheS5pc0FycmF5KGFycikgPyBhcnIgOiBBcnJheS5mcm9tKGFycik7XG59O1xuXG5leHBvcnQgdmFyIHRvQ29uc3VtYWJsZUFycmF5ID0gZnVuY3Rpb24gKGFycikge1xuICBpZiAoQXJyYXkuaXNBcnJheShhcnIpKSB7XG4gICAgZm9yICh2YXIgaSA9IDAsIGFycjIgPSBBcnJheShhcnIubGVuZ3RoKTsgaSA8IGFyci5sZW5ndGg7IGkrKykgYXJyMltpXSA9IGFycltpXTtcblxuICAgIHJldHVybiBhcnIyO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBBcnJheS5mcm9tKGFycik7XG4gIH1cbn07XG5cbmJhYmVsSGVscGVycztcblxuZXhwb3J0IHsgX3R5cGVvZiBhcyB0eXBlb2YsIF9leHRlbmRzIGFzIGV4dGVuZHMsIF9pbnN0YW5jZW9mIGFzIGluc3RhbmNlb2YgfSIsImNvbnN0IERhdGVUeXBlID0ge1xuXG4gICAgbG9hZDogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgfHwgdHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgcmV0dXJuIERhdGUuZnJvbUlTTyh2YWx1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoISh2YWx1ZSBpbnN0YW5jZW9mIERhdGUpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKHR5cGVvZiB2YWx1ZSArIFwiIGNhbid0IGJlIGNvZXJjZWQgaW50byBEYXRlXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH0sXG5cbiAgICBkdW1wOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICByZXR1cm4gdmFsdWUudG9JU09TdHJpbmcoKTtcbiAgICB9XG5cbn07XG5cbmV4cG9ydCBkZWZhdWx0IERhdGVUeXBlO1xuIiwiY29uc3QgSlNPTlR5cGUgPSB7XG5cbiAgICBsb2FkOiBmdW5jdGlvbih2YWx1ZSwga2V5KSB7XG4gICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICBsZXQgQW5vbk1vZGVsID0gVmlraW5nLk1vZGVsLmV4dGVuZCh7XG4gICAgICAgICAgICAgICAgaW5oZXJpdGFuY2VBdHRyaWJ1dGU6IGZhbHNlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGxldCBtb2RlbCA9IG5ldyBBbm9uTW9kZWwodmFsdWUpO1xuICAgICAgICAgICAgbW9kZWwubW9kZWxOYW1lID0ga2V5O1xuICAgICAgICAgICAgbW9kZWwuYmFzZU1vZGVsID0gbW9kZWw7XG4gICAgICAgICAgICByZXR1cm4gbW9kZWw7XG4gICAgICAgIH1cbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcih0eXBlb2YgdmFsdWUgKyBcIiBjYW4ndCBiZSBjb2VyY2VkIGludG8gSlNPTlwiKTtcbiAgICB9LFxuXG4gICAgZHVtcDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIFZpa2luZy5Nb2RlbCkge1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlLnRvSlNPTigpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG5cbn07XG5cbmV4cG9ydCBkZWZhdWx0IEpTT05UeXBlO1xuIiwiY29uc3QgTnVtYmVyVHlwZSA9IHtcblxuICAgIGxvYWQ6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IHZhbHVlLnJlcGxhY2UoL1xcLC9nLCAnJyk7XG5cbiAgICAgICAgICAgIGlmICh2YWx1ZS50cmltKCkgPT09ICcnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIE51bWJlcih2YWx1ZSk7XG4gICAgfSxcblxuICAgIGR1bXA6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG5cbn07XG5cbmV4cG9ydCBkZWZhdWx0IE51bWJlclR5cGU7XG4iLCJjb25zdCBTdHJpbmdUeXBlID0ge1xuXG4gICAgbG9hZDogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ3N0cmluZycgJiYgdmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIFN0cmluZyh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH0sXG5cbiAgICBkdW1wOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJyAmJiB2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gU3RyaW5nKHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuXG59O1xuXG5leHBvcnQgZGVmYXVsdCBTdHJpbmdUeXBlO1xuIiwiY29uc3QgQm9vbGVhblR5cGUgPSB7XG5cbiAgICBsb2FkOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIHZhbHVlID0gKHZhbHVlID09PSAndHJ1ZScpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAhIXZhbHVlO1xuICAgIH0sXG5cbiAgICBkdW1wOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuXG59O1xuXG5leHBvcnQgZGVmYXVsdCBCb29sZWFuVHlwZTtcbiIsImltcG9ydCBEYXRlVHlwZSBmcm9tICcuL3R5cGUvZGF0ZSc7XG5pbXBvcnQgSlNPTlR5cGUgZnJvbSAnLi90eXBlL2pzb24nO1xuaW1wb3J0IE51bWJlclR5cGUgZnJvbSAnLi90eXBlL251bWJlcic7XG5pbXBvcnQgU3RyaW5nVHlwZSBmcm9tICcuL3R5cGUvc3RyaW5nJztcbmltcG9ydCBCb29sZWFuVHlwZSBmcm9tICcuL3R5cGUvYm9vbGVhbic7XG5cbmNvbnN0IFR5cGUgPSB7XG4gICAgJ3JlZ2lzdHJ5Jzoge31cbn07XG5cblR5cGUucmVnaXN0cnlbJ2RhdGUnXSA9IFR5cGUuRGF0ZSA9IERhdGVUeXBlO1xuVHlwZS5yZWdpc3RyeVsnanNvbiddID0gVHlwZS5KU09OID0gSlNPTlR5cGU7XG5UeXBlLnJlZ2lzdHJ5WydudW1iZXInXSA9IFR5cGUuTnVtYmVyID0gTnVtYmVyVHlwZTtcblR5cGUucmVnaXN0cnlbJ3N0cmluZyddID0gVHlwZS5TdHJpbmcgPSBTdHJpbmdUeXBlO1xuVHlwZS5yZWdpc3RyeVsnYm9vbGVhbiddID0gVHlwZS5Cb29sZWFuID0gQm9vbGVhblR5cGU7XG5cbmV4cG9ydCBkZWZhdWx0IFR5cGU7XG4iLCJjb25zdCBSZWZsZWN0aW9uID0gZnVuY3Rpb24gKCkgeyB9O1xuXG5fLmV4dGVuZChWaWtpbmcuTW9kZWwuUmVmbGVjdGlvbi5wcm90b3R5cGUsIHtcblxuICAgIGtsYXNzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMubWFjcm8gPT09ICdoYXNNYW55Jykge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29sbGVjdGlvbigpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gdGhpcy5tb2RlbCgpO1xuICAgIH0sXG4gICAgXG4gICAgbW9kZWw6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5tb2RlbE5hbWUubW9kZWwoKTtcbiAgICB9LFxuICAgIFxuICAgIGNvbGxlY3Rpb246IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jb2xsZWN0aW9uTmFtZS5jb25zdGFudGl6ZSgpO1xuICAgIH1cblxufSk7XG5cblJlZmxlY3Rpb24uZXh0ZW5kID0gQmFja2JvbmUuTW9kZWwuZXh0ZW5kO1xuXG5leHBvcnQgZGVmYXVsdCBSZWZsZWN0aW9uO1xuXG5cbiIsImNvbnN0IEhhc09uZVJlZmxlY3Rpb24gPSBWaWtpbmcuTW9kZWwuUmVmbGVjdGlvbi5leHRlbmQoe1xuICAgIFxuICAgIGNvbnN0cnVjdG9yOiBmdW5jdGlvbiAobmFtZSwgb3B0aW9ucykge1xuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgICAgICB0aGlzLm1hY3JvID0gJ2hhc09uZSc7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IF8uZXh0ZW5kKHt9LCBvcHRpb25zKTtcblxuICAgICAgICBpZiAoIXRoaXMub3B0aW9ucy5wb2x5bW9ycGhpYykge1xuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5tb2RlbE5hbWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1vZGVsTmFtZSA9IG5ldyBWaWtpbmcuTW9kZWwuTmFtZSh0aGlzLm9wdGlvbnMubW9kZWxOYW1lKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tb2RlbE5hbWUgPSBuZXcgVmlraW5nLk1vZGVsLk5hbWUobmFtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbn0pO1xuXG5leHBvcnQgZGVmYXVsdCBIYXNPbmVSZWZsZWN0aW9uOyIsIkhhc01hbnlSZWZsZWN0aW9uID0gVmlraW5nLk1vZGVsLlJlZmxlY3Rpb24uZXh0ZW5kKHtcbiAgICBcbiAgICBjb25zdHJ1Y3RvcjogZnVuY3Rpb24gKG5hbWUsIG9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICAgICAgdGhpcy5tYWNybyA9ICdoYXNNYW55JztcbiAgICAgICAgdGhpcy5vcHRpb25zID0gXy5leHRlbmQoe30sIG9wdGlvbnMpO1xuXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMubW9kZWxOYW1lKSB7XG4gICAgICAgICAgICB0aGlzLm1vZGVsTmFtZSA9IG5ldyBWaWtpbmcuTW9kZWwuTmFtZSh0aGlzLm9wdGlvbnMubW9kZWxOYW1lKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMubW9kZWxOYW1lID0gbmV3IFZpa2luZy5Nb2RlbC5OYW1lKHRoaXMubmFtZS5zaW5ndWxhcml6ZSgpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuY29sbGVjdGlvbk5hbWUpIHtcbiAgICAgICAgICAgIHRoaXMuY29sbGVjdGlvbk5hbWUgPSB0aGlzLm9wdGlvbnMuY29sbGVjdGlvbk5hbWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmNvbGxlY3Rpb25OYW1lID0gdGhpcy5tb2RlbE5hbWUuY29sbGVjdGlvbk5hbWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG59KTtcblxuZXhwb3J0IGRlZmF1bHQgSGFzTWFueVJlZmxlY3Rpb247IiwiQmVsb25nc1RvUmVmbGVjdGlvbiA9IFZpa2luZy5Nb2RlbC5SZWZsZWN0aW9uLmV4dGVuZCh7XG4gICAgXG4gICAgY29uc3RydWN0b3I6IGZ1bmN0aW9uIChuYW1lLCBvcHRpb25zKSB7XG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgICAgIHRoaXMubWFjcm8gPSAnYmVsb25nc1RvJztcbiAgICAgICAgdGhpcy5vcHRpb25zID0gXy5leHRlbmQoe30sIG9wdGlvbnMpO1xuICAgIFxuICAgICAgICBpZiAoIXRoaXMub3B0aW9ucy5wb2x5bW9ycGhpYykge1xuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5tb2RlbE5hbWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1vZGVsTmFtZSA9IG5ldyBWaWtpbmcuTW9kZWwuTmFtZSh0aGlzLm9wdGlvbnMubW9kZWxOYW1lKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tb2RlbE5hbWUgPSBuZXcgVmlraW5nLk1vZGVsLk5hbWUobmFtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG59KTtcblxuZXhwb3J0IGRlZmF1bHQgQmVsb25nc1RvUmVmbGVjdGlvbjtcbiIsIkhhc0FuZEJlbG9uZ3NUb01hbnlSZWZsZWN0aW9uID0gVmlraW5nLk1vZGVsLlJlZmxlY3Rpb24uZXh0ZW5kKHtcblxuICAgIGNvbnN0cnVjdG9yOiBmdW5jdGlvbiAobmFtZSwgb3B0aW9ucykge1xuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgICAgICB0aGlzLm1hY3JvID0gJ2hhc0FuZEJlbG9uZ3NUb01hbnknO1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSBfLmV4dGVuZCh7fSwgb3B0aW9ucyk7XG4gICAgXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMubW9kZWxOYW1lKSB7XG4gICAgICAgICAgICB0aGlzLm1vZGVsTmFtZSA9IG5ldyBWaWtpbmcuTW9kZWwuTmFtZSh0aGlzLm9wdGlvbnMubW9kZWxOYW1lKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMubW9kZWxOYW1lID0gbmV3IFZpa2luZy5Nb2RlbC5OYW1lKHRoaXMubmFtZS5zaW5ndWxhcml6ZSgpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuY29sbGVjdGlvbk5hbWUpIHtcbiAgICAgICAgICAgIHRoaXMuY29sbGVjdGlvbk5hbWUgPSB0aGlzLm9wdGlvbnMuQ29sbGVjdGlvbk5hbWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmNvbGxlY3Rpb25OYW1lID0gdGhpcy5tb2RlbE5hbWUuY29sbGVjdGlvbk5hbWU7XG4gICAgICAgIH1cblxuICAgIH1cbiAgICBcbn0pO1xuXG5leHBvcnQgZGVmYXVsdCBIYXNBbmRCZWxvbmdzVG9NYW55UmVmbGVjdGlvbjsiLCJleHBvcnQgY29uc3QgY29lcmNlQXR0cmlidXRlcyA9IGZ1bmN0aW9uKGF0dHJzKSB7XG4gICAgXG4gICAgXy5lYWNoKHRoaXMuYXNzb2NpYXRpb25zLCBmdW5jdGlvbihhc3NvY2lhdGlvbikge1xuICAgICAgICBsZXQgVHlwZTtcbiAgICAgICAgbGV0IHBvbHltb3JwaGljID0gYXNzb2NpYXRpb24ub3B0aW9ucy5wb2x5bW9ycGhpYztcbiAgICAgICAgXG4gICAgICAgIGlmICghYXR0cnNbYXNzb2NpYXRpb24ubmFtZV0pIHsgcmV0dXJuOyB9XG4gICAgICAgIFxuICAgICAgICBpZiAocG9seW1vcnBoaWMgJiYgKGF0dHJzW2Fzc29jaWF0aW9uLm5hbWVdIGluc3RhbmNlb2YgVmlraW5nLk1vZGVsKSkge1xuICAgICAgICAgICAgLy8gVE9ETzogcmVtb3ZlIHNldHRpbmcgdGhlIGlkP1xuICAgICAgICAgICAgYXR0cnNbYXNzb2NpYXRpb24ubmFtZSArICdfaWQnXSA9IGF0dHJzW2Fzc29jaWF0aW9uLm5hbWVdLmlkO1xuICAgICAgICAgICAgYXR0cnNbYXNzb2NpYXRpb24ubmFtZSArICdfdHlwZSddID0gYXR0cnNbYXNzb2NpYXRpb24ubmFtZV0ubW9kZWxOYW1lLm5hbWU7XG4gICAgICAgIH0gZWxzZSBpZiAocG9seW1vcnBoaWMgJiYgYXR0cnNbYXNzb2NpYXRpb24ubmFtZSArICdfdHlwZSddKSB7XG4gICAgICAgICAgICBUeXBlID0gYXR0cnNbYXNzb2NpYXRpb24ubmFtZSArICdfdHlwZSddLmNhbWVsaXplKCkuY29uc3RhbnRpemUoKTtcbiAgICAgICAgICAgIGF0dHJzW2Fzc29jaWF0aW9uLm5hbWVdID0gbmV3IFR5cGUoYXR0cnNbYXNzb2NpYXRpb24ubmFtZV0pO1xuICAgICAgICB9IGVsc2UgaWYgKCEoYXR0cnNbYXNzb2NpYXRpb24ubmFtZV0gaW5zdGFuY2VvZiBhc3NvY2lhdGlvbi5rbGFzcygpKSkge1xuICAgICAgICAgICAgVHlwZSA9IGFzc29jaWF0aW9uLmtsYXNzKCk7XG4gICAgICAgICAgICBhdHRyc1thc3NvY2lhdGlvbi5uYW1lXSA9IG5ldyBUeXBlKGF0dHJzW2Fzc29jaWF0aW9uLm5hbWVdKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgXy5lYWNoKHRoaXMuc2NoZW1hLCBmdW5jdGlvbiAob3B0aW9ucywga2V5KSB7XG4gICAgICAgIGlmIChhdHRyc1trZXldIHx8IGF0dHJzW2tleV0gPT09IGZhbHNlKSB7XG4gICAgICAgICAgICBsZXQgdG1wLCBrbGFzcztcbiAgICAgICAgICAgIFxuICAgICAgICAgICAga2xhc3MgPSBWaWtpbmcuTW9kZWwuVHlwZS5yZWdpc3RyeVtvcHRpb25zWyd0eXBlJ11dO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAoa2xhc3MpIHtcbiAgICAgICAgICAgICAgICBpZiAob3B0aW9uc1snYXJyYXknXSkge1xuICAgICAgICAgICAgICAgICAgICB0bXAgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgXy5lYWNoKGF0dHJzW2tleV0sIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0bXAucHVzaChrbGFzcy5sb2FkKHZhbHVlLCBrZXkpKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGF0dHJzW2tleV0gPSB0bXA7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgYXR0cnNba2V5XSA9IGtsYXNzLmxvYWQoYXR0cnNba2V5XSwga2V5KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDb2VyY2lvbiBvZiBcIiArIG9wdGlvbnNbJ3R5cGUnXSArIFwiIHVuc3VwcG9ydGVkXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gYXR0cnM7XG59OyIsIi8vIEJlbG93IGlzIHRoZSBzYW1lIGNvZGUgZnJvbSB0aGUgQmFja2JvbmUuTW9kZWwgZnVuY3Rpb25cbi8vIGV4Y2VwdCB3aGVyZSB0aGVyZSBhcmUgY29tbWVudHNcbmV4cG9ydCBjb25zdCBjb25zdHJ1Y3RvciA9IGZ1bmN0aW9uIChhdHRyaWJ1dGVzLCBvcHRpb25zKSB7XG4gICAgbGV0IGF0dHJzID0gYXR0cmlidXRlcyB8fCB7fTtcbiAgICBvcHRpb25zIHx8IChvcHRpb25zID0ge30pO1xuICAgIHRoaXMuY2lkID0gXy51bmlxdWVJZCgnYycpO1xuICAgIHRoaXMuYXR0cmlidXRlcyA9IHt9O1xuXG4gICAgYXR0cnMgPSBfLmRlZmF1bHRzKHt9LCBhdHRycywgXy5yZXN1bHQodGhpcywgJ2RlZmF1bHRzJykpO1xuXG4gICAgaWYgKHRoaXMuaW5oZXJpdGFuY2VBdHRyaWJ1dGUpIHtcbiAgICAgICAgaWYgKGF0dHJzW3RoaXMuaW5oZXJpdGFuY2VBdHRyaWJ1dGVdICYmIHRoaXMuY29uc3RydWN0b3IubW9kZWxOYW1lLm5hbWUgIT09IGF0dHJzW3RoaXMuaW5oZXJpdGFuY2VBdHRyaWJ1dGVdKSB7XG4gICAgICAgICAgICAvLyBPUFRJTUlaRTogIE11dGF0aW5nIHRoZSBbW1Byb3RvdHlwZV1dIG9mIGFuIG9iamVjdCwgbm8gbWF0dGVyIGhvd1xuICAgICAgICAgICAgLy8gdGhpcyBpcyBhY2NvbXBsaXNoZWQsIGlzIHN0cm9uZ2x5IGRpc2NvdXJhZ2VkLCBiZWNhdXNlIGl0IGlzIHZlcnlcbiAgICAgICAgICAgIC8vIHNsb3cgYW5kIHVuYXZvaWRhYmx5IHNsb3dzIGRvd24gc3Vic2VxdWVudCBleGVjdXRpb24gaW4gbW9kZXJuXG4gICAgICAgICAgICAvLyBKYXZhU2NyaXB0IGltcGxlbWVudGF0aW9uc1xuICAgICAgICAgICAgLy8gSWRlYXM6IE1vdmUgdG8gTW9kZWwubmV3KC4uLikgbWV0aG9kIG9mIGluaXRpYWxpemluZyBtb2RlbHNcbiAgICAgICAgICAgIGxldCB0eXBlID0gYXR0cnNbdGhpcy5pbmhlcml0YW5jZUF0dHJpYnV0ZV0uY2FtZWxpemUoKS5jb25zdGFudGl6ZSgpO1xuICAgICAgICAgICAgdGhpcy5jb25zdHJ1Y3RvciA9IHR5cGU7XG4gICAgICAgICAgICB0aGlzLl9fcHJvdG9fXyA9IHR5cGUucHJvdG90eXBlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gQWRkIGEgaGVscGVyIHJlZmVyZW5jZSB0byBnZXQgdGhlIG1vZGVsIG5hbWUgZnJvbSBhbiBtb2RlbCBpbnN0YW5jZS5cbiAgICB0aGlzLm1vZGVsTmFtZSA9IHRoaXMuY29uc3RydWN0b3IubW9kZWxOYW1lO1xuICAgIHRoaXMuYmFzZU1vZGVsID0gdGhpcy5jb25zdHJ1Y3Rvci5iYXNlTW9kZWw7XG5cbiAgICBpZiAodGhpcy5iYXNlTW9kZWwgJiYgdGhpcy5tb2RlbE5hbWUgJiYgdGhpcy5pbmhlcml0YW5jZUF0dHJpYnV0ZSkge1xuICAgICAgICBpZiAodGhpcy5iYXNlTW9kZWwgPT09IHRoaXMuY29uc3RydWN0b3IgJiYgdGhpcy5iYXNlTW9kZWwuZGVzY2VuZGFudHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgYXR0cnNbdGhpcy5pbmhlcml0YW5jZUF0dHJpYnV0ZV0gPSB0aGlzLm1vZGVsTmFtZS5uYW1lO1xuICAgICAgICB9IGVsc2UgaWYgKF8uY29udGFpbnModGhpcy5iYXNlTW9kZWwuZGVzY2VuZGFudHMsIHRoaXMuY29uc3RydWN0b3IpKSB7XG4gICAgICAgICAgICBhdHRyc1t0aGlzLmluaGVyaXRhbmNlQXR0cmlidXRlXSA9IHRoaXMubW9kZWxOYW1lLm5hbWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBTZXQgdXAgYXNzb2NpYXRpb25zXG4gICAgdGhpcy5hc3NvY2lhdGlvbnMgPSB0aGlzLmNvbnN0cnVjdG9yLmFzc29jaWF0aW9ucztcbiAgICB0aGlzLnJlZmxlY3RPbkFzc29jaWF0aW9uID0gdGhpcy5jb25zdHJ1Y3Rvci5yZWZsZWN0T25Bc3NvY2lhdGlvbjtcbiAgICB0aGlzLnJlZmxlY3RPbkFzc29jaWF0aW9ucyA9IHRoaXMuY29uc3RydWN0b3IucmVmbGVjdE9uQXNzb2NpYXRpb25zO1xuXG4gICAgLy8gSW5pdGlhbGl6ZSBhbnkgYGhhc01hbnlgIHJlbGF0aW9uc2hpcHMgdG8gZW1wdHkgY29sbGVjdGlvbnNcbiAgICB0aGlzLnJlZmxlY3RPbkFzc29jaWF0aW9ucygnaGFzTWFueScpLmZvckVhY2goZnVuY3Rpb24oYXNzb2NpYXRpb24pIHtcbiAgICAgICAgdGhpcy5hdHRyaWJ1dGVzW2Fzc29jaWF0aW9uLm5hbWVdID0gbmV3IChhc3NvY2lhdGlvbi5jb2xsZWN0aW9uKCkpKCk7XG4gICAgfSwgdGhpcyk7XG5cbiAgICBpZiAob3B0aW9ucy5jb2xsZWN0aW9uKSB7IHRoaXMuY29sbGVjdGlvbiA9IG9wdGlvbnMuY29sbGVjdGlvbjsgfVxuICAgIGlmIChvcHRpb25zLnBhcnNlKSB7IGF0dHJzID0gdGhpcy5wYXJzZShhdHRycywgb3B0aW9ucykgfHwge307IH1cblxuICAgIHRoaXMuc2V0KGF0dHJzLCBvcHRpb25zKTtcbiAgICB0aGlzLmNoYW5nZWQgPSB7fTtcbiAgICB0aGlzLmluaXRpYWxpemUuY2FsbCh0aGlzLCBhdHRyaWJ1dGVzLCBvcHRpb25zKTtcbn1cbiIsImV4cG9ydCBjb25zdCBkZWZhdWx0cyA9IGZ1bmN0aW9uICgpIHtcbiAgICBsZXQgZGZsdHMgPSB7fTtcblxuICAgIGlmICh0eXBlb2YodGhpcy5zY2hlbWEpID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICByZXR1cm4gZGZsdHM7XG4gICAgfVxuXG4gICAgT2JqZWN0LmtleXModGhpcy5zY2hlbWEpLmZvckVhY2goIChrZXkpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuc2NoZW1hW2tleV1bJ2RlZmF1bHQnXSkge1xuICAgICAgICAgICAgZGZsdHNba2V5XSA9IHRoaXMuc2NoZW1hW2tleV1bJ2RlZmF1bHQnXTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIGRmbHRzO1xufTtcbiIsIi8vIFRPRE86IHRlc3RtZVxuZXhwb3J0IGNvbnN0IGVycm9yc09uID0gZnVuY3Rpb24oYXR0cmlidXRlKSB7XG4gICAgaWYgKHRoaXMudmFsaWRhdGlvbkVycm9yKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnZhbGlkYXRpb25FcnJvclthdHRyaWJ1dGVdO1xuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbn07XG4iLCIvLyBSZXR1cm5zIHN0cmluZyB0byB1c2UgZm9yIHBhcmFtcyBuYW1lcy4gVGhpcyBpcyB0aGUga2V5IGF0dHJpYnV0ZXMgZnJvbVxuLy8gdGhlIG1vZGVsIHdpbGwgYmUgbmFtZXNwYWNlZCB1bmRlciB3aGVuIHNhdmluZyB0byB0aGUgc2VydmVyXG5leHBvcnQgY29uc3QgcGFyYW1Sb290ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuYmFzZU1vZGVsLm1vZGVsTmFtZS5wYXJhbUtleTtcbn07XG4iLCIvLyBPdmVyd3JpdGUgQmFja2JvbmUuTW9kZWwjc2F2ZSBzbyB0aGF0IHdlIGNhbiBjYXRjaCBlcnJvcnMgd2hlbiBhIHNhdmVcbi8vIGZhaWxzLlxuZXhwb3J0IGNvbnN0IHNhdmUgPSBmdW5jdGlvbihrZXksIHZhbCwgb3B0aW9ucykge1xuICAgIGxldCBhdHRycywgbWV0aG9kLCB4aHIsIGF0dHJpYnV0ZXMgPSB0aGlzLmF0dHJpYnV0ZXM7XG5cbiAgICAvLyBIYW5kbGUgYm90aCBgXCJrZXlcIiwgdmFsdWVgIGFuZCBge2tleTogdmFsdWV9YCAtc3R5bGUgYXJndW1lbnRzLlxuICAgIGlmIChrZXkgPT0gbnVsbCB8fCB0eXBlb2Yga2V5ID09PSAnb2JqZWN0Jykge1xuICAgICAgYXR0cnMgPSBrZXk7XG4gICAgICBvcHRpb25zID0gdmFsO1xuICAgIH0gZWxzZSB7XG4gICAgICAoYXR0cnMgPSB7fSlba2V5XSA9IHZhbDtcbiAgICB9XG5cbiAgICBvcHRpb25zID0gXy5leHRlbmQoe3ZhbGlkYXRlOiB0cnVlfSwgb3B0aW9ucyk7XG5cbiAgICAvLyBJZiB3ZSdyZSBub3Qgd2FpdGluZyBhbmQgYXR0cmlidXRlcyBleGlzdCwgc2F2ZSBhY3RzIGFzXG4gICAgLy8gYHNldChhdHRyKS5zYXZlKG51bGwsIG9wdHMpYCB3aXRoIHZhbGlkYXRpb24uIE90aGVyd2lzZSwgY2hlY2sgaWZcbiAgICAvLyB0aGUgbW9kZWwgd2lsbCBiZSB2YWxpZCB3aGVuIHRoZSBhdHRyaWJ1dGVzLCBpZiBhbnksIGFyZSBzZXQuXG4gICAgaWYgKGF0dHJzICYmICFvcHRpb25zLndhaXQpIHtcbiAgICAgIGlmICghdGhpcy5zZXQoYXR0cnMsIG9wdGlvbnMpKSB7IHJldHVybiBmYWxzZTsgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoIXRoaXMuX3ZhbGlkYXRlKGF0dHJzLCBvcHRpb25zKSkgeyByZXR1cm4gZmFsc2U7IH1cbiAgICB9XG5cbiAgICAvLyBTZXQgdGVtcG9yYXJ5IGF0dHJpYnV0ZXMgaWYgYHt3YWl0OiB0cnVlfWAuXG4gICAgaWYgKGF0dHJzICYmIG9wdGlvbnMud2FpdCkge1xuICAgICAgdGhpcy5hdHRyaWJ1dGVzID0gXy5leHRlbmQoe30sIGF0dHJpYnV0ZXMsIGF0dHJzKTtcbiAgICB9XG5cbiAgICAvLyBBZnRlciBhIHN1Y2Nlc3NmdWwgc2VydmVyLXNpZGUgc2F2ZSwgdGhlIGNsaWVudCBpcyAob3B0aW9uYWxseSlcbiAgICAvLyB1cGRhdGVkIHdpdGggdGhlIHNlcnZlci1zaWRlIHN0YXRlLlxuICAgIGlmIChvcHRpb25zLnBhcnNlID09PSB2b2lkIDApIHsgb3B0aW9ucy5wYXJzZSA9IHRydWU7IH1cbiAgICBsZXQgbW9kZWwgPSB0aGlzO1xuICAgIGxldCBzdWNjZXNzID0gb3B0aW9ucy5zdWNjZXNzO1xuICAgIG9wdGlvbnMuc3VjY2VzcyA9IGZ1bmN0aW9uKHJlc3ApIHtcbiAgICAgIC8vIEVuc3VyZSBhdHRyaWJ1dGVzIGFyZSByZXN0b3JlZCBkdXJpbmcgc3luY2hyb25vdXMgc2F2ZXMuXG4gICAgICBtb2RlbC5hdHRyaWJ1dGVzID0gYXR0cmlidXRlcztcbiAgICAgIGxldCBzZXJ2ZXJBdHRycyA9IG1vZGVsLnBhcnNlKHJlc3AsIG9wdGlvbnMpO1xuICAgICAgaWYgKG9wdGlvbnMud2FpdCkgeyBzZXJ2ZXJBdHRycyA9IF8uZXh0ZW5kKGF0dHJzIHx8IHt9LCBzZXJ2ZXJBdHRycyk7IH1cbiAgICAgIGlmIChfLmlzT2JqZWN0KHNlcnZlckF0dHJzKSAmJiAhbW9kZWwuc2V0KHNlcnZlckF0dHJzLCBvcHRpb25zKSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICBpZiAoc3VjY2VzcykgeyBzdWNjZXNzKG1vZGVsLCByZXNwLCBvcHRpb25zKTsgfVxuICAgICAgbW9kZWwudHJpZ2dlcignc3luYycsIG1vZGVsLCByZXNwLCBvcHRpb25zKTtcbiAgICB9O1xuXG4gICAgLy8gcmVwbGFjaW5nICN3cmFwRXJyb3IodGhpcywgb3B0aW9ucykgd2l0aCBjdXN0b20gZXJyb3IgaGFuZGxpbmcgdG9cbiAgICAvLyBjYXRjaCBhbmQgdGhyb3cgaW52YWxpZCBldmVudHNcbiAgICBsZXQgZXJyb3IgPSBvcHRpb25zLmVycm9yO1xuICAgIG9wdGlvbnMuZXJyb3IgPSBmdW5jdGlvbihyZXNwKSB7XG4gICAgICAgIGlmIChyZXNwLnN0YXR1cyA9PT0gNDAwKSB7XG4gICAgICAgICAgICBsZXQgZXJyb3JzID0gSlNPTi5wYXJzZShyZXNwLnJlc3BvbnNlVGV4dCkuZXJyb3JzO1xuICAgICAgICAgICAgaWYgKG9wdGlvbnMuaW52YWxpZCkge1xuICAgICAgICAgICAgICAgIG9wdGlvbnMuaW52YWxpZChtb2RlbCwgZXJyb3JzLCBvcHRpb25zKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG1vZGVsLnNldEVycm9ycyhlcnJvcnMsIG9wdGlvbnMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGVycm9yKSB7IGVycm9yKG1vZGVsLCByZXNwLCBvcHRpb25zKTsgfVxuICAgICAgICAgICAgbW9kZWwudHJpZ2dlcignZXJyb3InLCBtb2RlbCwgcmVzcCwgb3B0aW9ucyk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgbWV0aG9kID0gdGhpcy5pc05ldygpID8gJ2NyZWF0ZScgOiAob3B0aW9ucy5wYXRjaCA/ICdwYXRjaCcgOiAndXBkYXRlJyk7XG4gICAgaWYgKG1ldGhvZCA9PT0gJ3BhdGNoJykgeyBvcHRpb25zLmF0dHJzID0gYXR0cnM7IH1cbiAgICB4aHIgPSB0aGlzLnN5bmMobWV0aG9kLCB0aGlzLCBvcHRpb25zKTtcblxuICAgIC8vIFJlc3RvcmUgYXR0cmlidXRlcy5cbiAgICBpZiAoYXR0cnMgJiYgb3B0aW9ucy53YWl0KSB7IHRoaXMuYXR0cmlidXRlcyA9IGF0dHJpYnV0ZXM7IH1cblxuICAgIHJldHVybiB4aHI7XG59O1xuIiwiLy8gc2VsZWN0KG9wdGlvbnMpXG4vLyBzZWxlY3QodmFsdWVbLCBvcHRpb25zXSlcbi8vXG4vLyBXaGVuIHRoZSBtb2RlbCBpcyBwYXJ0IG9mIGEgY29sbGVjdGlvbiBhbmQgeW91IHdhbnQgdG8gc2VsZWN0IGEgc2luZ2xlXG4vLyBvciBtdWx0aXBsZSBpdGVtcyBmcm9tIGEgY29sbGVjdGlvbi4gSWYgYSBtb2RlbCBpcyBzZWxlY3RlZFxuLy8gYG1vZGVsLnNlbGVjdGVkYCB3aWxsIGJlIHNldCBgdHJ1ZWAsIG90aGVyd2lzZSBpdCB3aWxsIGJlIGBmYWxzZWAuXG4vL1xuLy8gSWYgeW91IHBhc3MgYHRydWVgIG9yIGBmYWxzZWAgYXMgdGhlIGZpcnN0IHBhcmFtYXRlciB0byBgc2VsZWN0YCBpdCB3aWxsXG4vLyBzZWxlY3QgdGhlIG1vZGVsIGlmIHRydWUsIG9yIHVuc2VsZWN0IGlmIGl0IGlzIGZhbHNlLlxuLy9cbi8vIEJ5IGRlZmF1bHQgYW55IG90aGVyIG1vZGVscyBpbiB0aGUgY29sbGVjdGlvbiB3aXRoIGJlIHVuc2VsZWN0ZWQuIFRvXG4vLyBwcmV2ZW50IG90aGVyIG1vZGVscyBpbiB0aGUgY29sbGVjdGlvbiBmcm9tIGJlaW5nIHVuc2VsZWN0ZWQgeW91IGNhblxuLy8gcGFzcyBge211bHRpcGxlOiB0cnVlfWAgYXMgYW4gb3B0aW9uLlxuLy9cbi8vIFRoZSBgc2VsZWN0ZWRgIGFuZCBgdW5zZWxlY3RlZGAgZXZlbnRzIGFyZSBmaXJlZCB3aGVuIGFwcHJvcHJpYXRlLlxuZXhwb3J0IGNvbnN0IHNlbGVjdCA9IGZ1bmN0aW9uKHZhbHVlLCBvcHRpb25zKSB7XG5cbiAgICAvLyBIYW5kbGUgYm90aCBgdmFsdWVbLCBvcHRpb25zXWAgYW5kIGBvcHRpb25zYCAtc3R5bGUgYXJndW1lbnRzLlxuICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgIG9wdGlvbnMgPSB2YWx1ZTtcbiAgICAgIHZhbHVlID0gdHJ1ZTtcbiAgICB9XG4gICAgXG4gICAgaWYgKHZhbHVlID09PSB0cnVlKSB7XG4gICAgICAgIGlmICh0aGlzLmNvbGxlY3Rpb24pIHtcbiAgICAgICAgICAgIHRoaXMuY29sbGVjdGlvbi5zZWxlY3QodGhpcywgb3B0aW9ucyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICh0aGlzLnNlbGVjdGVkKSB7XG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLnRyaWdnZXIoJ3Vuc2VsZWN0ZWQnLCB0aGlzKTtcbiAgICAgICAgfVxuICAgIH1cbn07XG4iLCJleHBvcnQgY29uc3Qgc2V0ID0gZnVuY3Rpb24gKGtleSwgdmFsLCBvcHRpb25zKSB7XG4gICAgaWYgKGtleSA9PT0gbnVsbCkgeyByZXR1cm4gdGhpczsgfVxuXG4gICAgLy8gSGFuZGxlIGJvdGggYFwia2V5XCIsIHZhbHVlYCBhbmQgYHtrZXk6IHZhbHVlfWAgLXN0eWxlIGFyZ3VtZW50cy5cbiAgICBsZXQgYXR0cnM7XG4gICAgaWYgKHR5cGVvZiBrZXkgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIGF0dHJzID0ga2V5O1xuICAgICAgICBvcHRpb25zID0gdmFsO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIChhdHRycyA9IHt9KVtrZXldID0gdmFsO1xuICAgIH1cbiAgICBcbiAgICBvcHRpb25zIHx8IChvcHRpb25zID0ge30pO1xuXG4gICAgaWYgKHRoaXMuaW5oZXJpdGFuY2VBdHRyaWJ1dGUgJiYgYXR0cnNbdGhpcy5pbmhlcml0YW5jZUF0dHJpYnV0ZV0gJiYgdGhpcy5jb25zdHJ1Y3Rvci5tb2RlbE5hbWUubmFtZSAhPT0gYXR0cnMudHlwZSkge1xuICAgICAgICAvLyBPUFRJTUlaRTogIE11dGF0aW5nIHRoZSBbW1Byb3RvdHlwZV1dIG9mIGFuIG9iamVjdCwgbm8gbWF0dGVyIGhvd1xuICAgICAgICAvLyB0aGlzIGlzIGFjY29tcGxpc2hlZCwgaXMgc3Ryb25nbHkgZGlzY291cmFnZWQsIGJlY2F1c2UgaXQgaXMgdmVyeVxuICAgICAgICAvLyBzbG93IGFuZCB1bmF2b2lkYWJseSBzbG93cyBkb3duIHN1YnNlcXVlbnQgZXhlY3V0aW9uIGluIG1vZGVyblxuICAgICAgICAvLyBKYXZhU2NyaXB0IGltcGxlbWVudGF0aW9uc1xuICAgICAgICAvLyBJZGVhczogTW92ZSB0byBNb2RlbC5uZXcoLi4uKSBtZXRob2Qgb2YgaW5pdGlhbGl6aW5nIG1vZGVsc1xuICAgICAgICBsZXQgdHlwZSA9IGF0dHJzW3RoaXMuaW5oZXJpdGFuY2VBdHRyaWJ1dGVdLmNhbWVsaXplKCkuY29uc3RhbnRpemUoKTtcbiAgICAgICAgdGhpcy5jb25zdHJ1Y3RvciA9IHR5cGU7XG4gICAgICAgIHRoaXMuX19wcm90b19fID0gdHlwZS5wcm90b3R5cGU7XG5cdFx0dGhpcy5tb2RlbE5hbWUgPSB0eXBlLm1vZGVsTmFtZTtcbiAgICAgICAgXG4gICAgICAgIC8vIFRPRE86IG1vdmUgdG8gZnVuY3Rpb24sIHVzZWQgaW4gTW9kZWwubmV3XG4gICAgICAgIC8vIFRPRE86IHByb2JhYmx5IG1vdmUgdG8gYSBiZWNvbWVzIG1ldGhvZFxuICAgICAgICAvLyBTZXQgdXAgYXNzb2NpYXRpb25zXG4gICAgICAgIHRoaXMuYXNzb2NpYXRpb25zID0gdGhpcy5jb25zdHJ1Y3Rvci5hc3NvY2lhdGlvbnM7XG4gICAgICAgIHRoaXMucmVmbGVjdE9uQXNzb2NpYXRpb24gPSB0aGlzLmNvbnN0cnVjdG9yLnJlZmxlY3RPbkFzc29jaWF0aW9uO1xuICAgICAgICB0aGlzLnJlZmxlY3RPbkFzc29jaWF0aW9ucyA9IHRoaXMuY29uc3RydWN0b3IucmVmbGVjdE9uQXNzb2NpYXRpb25zO1xuXG4gICAgICAgIC8vIEluaXRpYWxpemUgYW55IGBoYXNNYW55YCByZWxhdGlvbnNoaXBzIHRvIGVtcHR5IGNvbGxlY3Rpb25zXG4gICAgICAgIF8uZWFjaCh0aGlzLnJlZmxlY3RPbkFzc29jaWF0aW9ucygnaGFzTWFueScpLCBmdW5jdGlvbihhc3NvY2lhdGlvbikge1xuICAgICAgICAgICAgaWYgKCF0aGlzLmF0dHJpYnV0ZXNbYXNzb2NpYXRpb24ubmFtZV0pIHtcbiAgICAgICAgICAgICAgICB0aGlzLmF0dHJpYnV0ZXNbYXNzb2NpYXRpb24ubmFtZV0gPSBuZXcgKGFzc29jaWF0aW9uLmNvbGxlY3Rpb24oKSkoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgdGhpcyk7XG4gICAgfVxuXG4gICAgdGhpcy5jb2VyY2VBdHRyaWJ1dGVzKGF0dHJzKTtcbiAgICBfLmVhY2goYXR0cnMsIGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHtcbiAgICAgICAgbGV0IGFzc29jaWF0aW9uID0gdGhpcy5yZWZsZWN0T25Bc3NvY2lhdGlvbihrZXkpO1xuICAgICAgICBpZiAoYXNzb2NpYXRpb24gJiYgYXNzb2NpYXRpb24ubWFjcm8gPT09ICdoYXNNYW55Jykge1xuICAgICAgICAgICAgaWYgKCF2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuYXR0cmlidXRlc1trZXldLnNldChbXSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuYXR0cmlidXRlc1trZXldLnNldCh2YWx1ZS5tb2RlbHMpO1xuICAgICAgICAgICAgICAgIF8uZWFjaCh2YWx1ZS5tb2RlbHMsIGZ1bmN0aW9uKG1vZGVsKSB7XG4gICAgICAgICAgICAgICAgICAgIG1vZGVsLmNvbGxlY3Rpb24gPSB0aGlzLmF0dHJpYnV0ZXNba2V5XTtcbiAgICAgICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZGVsZXRlIGF0dHJzW2tleV07XG4gICAgICAgIH0gZWxzZSBpZiAoYXNzb2NpYXRpb24gJiYgYXNzb2NpYXRpb24ubWFjcm8gPT0gJ2JlbG9uZ3NUbycpIHtcbiAgICAgICAgICAgIGlmICghdmFsdWUpIHtcbiAgICAgICAgICAgICAgICBvcHRpb25zLnVuc2V0ID8gZGVsZXRlIHRoaXMuYXR0cmlidXRlc1trZXkgKyAnX2lkJ10gOiB0aGlzLmF0dHJpYnV0ZXNba2V5ICsgJ19pZCddID0gdmFsdWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuYXR0cmlidXRlc1trZXkgKyAnX2lkJ10gPSB2YWx1ZS5pZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sIHRoaXMpO1xuICAgIFxuICAgIHJldHVybiBCYWNrYm9uZS5Nb2RlbC5wcm90b3R5cGUuc2V0LmNhbGwodGhpcywgYXR0cnMsIG9wdGlvbnMpO1xufTtcbiIsImV4cG9ydCBjb25zdCBzZXRFcnJvcnMgPSBmdW5jdGlvbihlcnJvcnMsIG9wdGlvbnMpIHtcbiAgICBpZihfLnNpemUoZXJyb3JzKSA9PT0gMCkgeyByZXR1cm47IH1cblxuICAgIGxldCBtb2RlbCA9IHRoaXM7XG4gICAgdGhpcy52YWxpZGF0aW9uRXJyb3IgPSBlcnJvcnM7XG5cbiAgICBtb2RlbC50cmlnZ2VyKCdpbnZhbGlkJywgdGhpcywgZXJyb3JzLCBvcHRpb25zKTtcbn07XG4iLCIvLyBPdmVycmlkZSBbQmFja2JvbmUuTW9kZWwjc3luY10oaHR0cDovL2JhY2tib25lanMub3JnLyNNb2RlbC1zeW5jKS5cbi8vIFtSdWJ5IG9uIFJhaWxzXShodHRwOi8vcnVieW9ucmFpbHMub3JnLykgZXhwZWN0cyB0aGUgYXR0cmlidXRlcyB0byBiZVxuLy8gbmFtZXNwYWNlZFxuZXhwb3J0IGNvbnN0IHN5bmMgPSBmdW5jdGlvbihtZXRob2QsIG1vZGVsLCBvcHRpb25zKSB7XG4gICAgb3B0aW9ucyB8fCAob3B0aW9ucyA9IHt9KTtcblxuICAgIGlmIChvcHRpb25zLmRhdGEgPT0gbnVsbCAmJiAobWV0aG9kID09PSAnY3JlYXRlJyB8fCBtZXRob2QgPT09ICd1cGRhdGUnIHx8IG1ldGhvZCA9PT0gJ3BhdGNoJykpIHtcbiAgICAgICAgb3B0aW9ucy5jb250ZW50VHlwZSA9ICdhcHBsaWNhdGlvbi9qc29uJztcbiAgICAgICAgb3B0aW9ucy5kYXRhID0ge307XG4gICAgICAgIG9wdGlvbnMuZGF0YVtfLnJlc3VsdChtb2RlbCwgJ3BhcmFtUm9vdCcpXSA9IChvcHRpb25zLmF0dHJzIHx8IG1vZGVsLnRvSlNPTihvcHRpb25zKSk7XG4gICAgICAgIG9wdGlvbnMuZGF0YSA9IEpTT04uc3RyaW5naWZ5KG9wdGlvbnMuZGF0YSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIFZpa2luZy5zeW5jLmNhbGwodGhpcywgbWV0aG9kLCBtb2RlbCwgb3B0aW9ucyk7XG59O1xuIiwiLy8gc2ltaWxhciB0byBSYWlscyBhc19qc29uIG1ldGhvZFxuZXhwb3J0IGNvbnN0IHRvSlNPTiA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgbGV0IGRhdGEgPSBfLmNsb25lKHRoaXMuYXR0cmlidXRlcyk7XG4gICAgXG4gICAgaWYgKG9wdGlvbnMgPT09IHVuZGVmaW5lZCkgeyBvcHRpb25zID0ge307IH1cblxuICAgIGlmIChvcHRpb25zLmluY2x1ZGUpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zLmluY2x1ZGUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICBsZXQga2V5ID0gb3B0aW9ucy5pbmNsdWRlO1xuICAgICAgICAgICAgb3B0aW9ucy5pbmNsdWRlID0ge307XG4gICAgICAgICAgICBvcHRpb25zLmluY2x1ZGVba2V5XSA9IHt9O1xuICAgICAgICB9IGVsc2UgaWYgKF8uaXNBcnJheShvcHRpb25zLmluY2x1ZGUpKSB7XG4gICAgICAgICAgICBsZXQgYXJyYXkgPSBvcHRpb25zLmluY2x1ZGU7XG4gICAgICAgICAgICBvcHRpb25zLmluY2x1ZGUgPSB7fTtcbiAgICAgICAgICAgIF8uZWFjaChhcnJheSwgZnVuY3Rpb24oa2V5KSB7XG4gICAgICAgICAgICAgICAgb3B0aW9ucy5pbmNsdWRlW2tleV0gPSB7fTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgb3B0aW9ucy5pbmNsdWRlID0ge307XG4gICAgfVxuXG4gICAgXy5lYWNoKHRoaXMuYXNzb2NpYXRpb25zLCBmdW5jdGlvbihhc3NvY2lhdGlvbikge1xuICAgICAgICBpZiAoIW9wdGlvbnMuaW5jbHVkZVthc3NvY2lhdGlvbi5uYW1lXSkge1xuICAgICAgICAgICAgZGVsZXRlIGRhdGFbYXNzb2NpYXRpb24ubmFtZV07XG4gICAgICAgICAgICBpZiAoYXNzb2NpYXRpb24ubWFjcm8gPT09ICdiZWxvbmdzVG8nICYmIGRhdGFbYXNzb2NpYXRpb24ubmFtZSArICdfaWQnXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgZGVsZXRlIGRhdGFbYXNzb2NpYXRpb24ubmFtZSArICdfaWQnXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChhc3NvY2lhdGlvbi5tYWNybyA9PT0gJ2JlbG9uZ3NUbycgfHwgYXNzb2NpYXRpb24ubWFjcm8gPT09ICdoYXNPbmUnKSB7XG4gICAgICAgICAgICBpZiAoZGF0YVthc3NvY2lhdGlvbi5uYW1lXSkge1xuICAgICAgICAgICAgICAgIGRhdGFbYXNzb2NpYXRpb24ubmFtZSArICdfYXR0cmlidXRlcyddID0gZGF0YVthc3NvY2lhdGlvbi5uYW1lXS50b0pTT04ob3B0aW9ucy5pbmNsdWRlW2Fzc29jaWF0aW9uLm5hbWVdKTtcbiAgICAgICAgICAgICAgICBkZWxldGUgZGF0YVthc3NvY2lhdGlvbi5uYW1lXTtcbiAgICAgICAgICAgICAgICBkZWxldGUgZGF0YVthc3NvY2lhdGlvbi5uYW1lICsgJ19pZCddO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChkYXRhW2Fzc29jaWF0aW9uLm5hbWVdID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgZGF0YVthc3NvY2lhdGlvbi5uYW1lICsgJ19hdHRyaWJ1dGVzJ10gPSBudWxsO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBkYXRhW2Fzc29jaWF0aW9uLm5hbWVdO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBkYXRhW2Fzc29jaWF0aW9uLm5hbWUgKyAnX2lkJ107XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoYXNzb2NpYXRpb24ubWFjcm8gPT09ICdoYXNNYW55Jykge1xuICAgICAgICAgICAgaWYgKGRhdGFbYXNzb2NpYXRpb24ubmFtZV0pIHtcbiAgICAgICAgICAgICAgICBkYXRhW2Fzc29jaWF0aW9uLm5hbWUgKyAnX2F0dHJpYnV0ZXMnXSA9IGRhdGFbYXNzb2NpYXRpb24ubmFtZV0udG9KU09OKG9wdGlvbnMuaW5jbHVkZVthc3NvY2lhdGlvbi5uYW1lXSk7XG4gICAgICAgICAgICAgICAgZGVsZXRlIGRhdGFbYXNzb2NpYXRpb24ubmFtZV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIF8uZWFjaCh0aGlzLnNjaGVtYSwgZnVuY3Rpb24gKG9wdGlvbnMsIGtleSkge1xuICAgICAgICBpZiAoZGF0YVtrZXldIHx8IGRhdGFba2V5XSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIGxldCB0bXAsIGtsYXNzO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBrbGFzcyA9IFZpa2luZy5Nb2RlbC5UeXBlLnJlZ2lzdHJ5W29wdGlvbnMudHlwZV07XG5cbiAgICAgICAgICAgIGlmIChrbGFzcykge1xuICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLmFycmF5KSB7XG4gICAgICAgICAgICAgICAgICAgIHRtcCA9IFtdO1xuICAgICAgICAgICAgICAgICAgICBfLmVhY2goZGF0YVtrZXldLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdG1wLnB1c2goa2xhc3MuZHVtcCh2YWx1ZSwga2V5KSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBkYXRhW2tleV0gPSB0bXA7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YVtrZXldID0ga2xhc3MuZHVtcChkYXRhW2tleV0sIGtleSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ29lcmNpb24gb2YgXCIgKyBvcHRpb25zLnR5cGUgKyBcIiB1bnN1cHBvcnRlZFwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIGRhdGE7XG59O1xuIiwiLy8gUmV0dXJucyBhIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIG9iamVjdCdzIGtleSBzdWl0YWJsZSBmb3IgdXNlIGluIFVSTHMsXG4vLyBvciBuaWwgaWYgYCNpc05ld2AgaXMgdHJ1ZS5cbmV4cG9ydCBjb25zdCB0b1BhcmFtID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuaXNOZXcoKSA/IG51bGwgOiB0aGlzLmdldCgnaWQnKTtcbn07XG4iLCIvLyBTYXZlcyB0aGUgcmVjb3JkIHdpdGggdGhlIHVwZGF0ZWRfYXQgYW5kIGFueSBhdHRyaWJ1dGVzIHBhc3NlZCBpbiB0byB0aGVcbi8vIGN1cnJlbnQgdGltZS5cbi8vXG4vLyBUaGUgSlNPTiByZXNwb25zZSBpcyBleHBlY3RlZCB0byByZXR1cm4gYW4gSlNPTiBvYmplY3Qgd2l0aCB0aGUgYXR0cmlidXRlXG4vLyBuYW1lIGFuZCB0aGUgbmV3IHRpbWUuIEFueSBvdGhlciBhdHRyaWJ1dGVzIHJldHVybmVkIGluIHRoZSBKU09OIHdpbGwgYmVcbi8vIHVwZGF0ZWQgb24gdGhlIE1vZGVsIGFzIHdlbGxcbi8vXG4vLyBUT0RPOlxuLy8gTm90ZSB0aGF0IGAjdG91Y2hgIG11c3QgYmUgdXNlZCBvbiBhIHBlcnNpc3RlZCBvYmplY3QsIG9yIGVsc2UgYW5cbi8vIFZpa2luZy5Nb2RlbC5SZWNvcmRFcnJvciB3aWxsIGJlIHRocm93bi5cbmV4cG9ydCBjb25zdCB0b3VjaCA9IGZ1bmN0aW9uKGNvbHVtbnMsIG9wdGlvbnMpIHtcbiAgICBsZXQgbm93ID0gbmV3IERhdGUoKTtcbiAgICBcbiAgICBsZXQgYXR0cnMgPSB7XG4gICAgICAgIHVwZGF0ZWRfYXQ6IG5vd1xuICAgIH1cblxuICAgIG9wdGlvbnMgPSBfLmV4dGVuZCh7cGF0Y2g6IHRydWV9LCBvcHRpb25zKTtcbiAgICBcbiAgICBpZiAoXy5pc0FycmF5KGNvbHVtbnMpKSB7XG4gICAgICAgIF8uZWFjaChjb2x1bW5zLCBmdW5jdGlvbiAoY29sdW1uKSB7XG4gICAgICAgICAgICBhdHRyc1tjb2x1bW5dID0gbm93O1xuICAgICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKGNvbHVtbnMpIHtcbiAgICAgICAgYXR0cnNbY29sdW1uc10gPSBub3c7XG4gICAgfVxuICAgIFxuICAgIHJldHVybiB0aGlzLnNhdmUoYXR0cnMsIG9wdGlvbnMpO1xufTtcbiIsIi8vIE9wcG9zaXRlIG9mICNzZWxlY3QuIFRyaWdnZXJzIHRoZSBgdW5zZWxlY3RlZGAgZXZlbnQuXG5leHBvcnQgY29uc3QgdW5zZWxlY3QgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgdGhpcy5zZWxlY3QoZmFsc2UsIG9wdGlvbnMpO1xufTtcbiIsIi8vIFRPRE86IHRlc3QgcmV0dXJuXG5leHBvcnQgY29uc3QgdXBkYXRlQXR0cmlidXRlID0gZnVuY3Rpb24gKGtleSwgdmFsdWUsIG9wdGlvbnMpIHtcbiAgICBsZXQgZGF0YSA9IHt9O1xuICAgIGRhdGFba2V5XSA9IHZhbHVlO1xuICAgIFxuICAgIHJldHVybiB0aGlzLnVwZGF0ZUF0dHJpYnV0ZXMoZGF0YSwgb3B0aW9ucyk7XG59O1xuIiwiLy8gVE9ETzogdGVzdCByZXR1cm5cbmV4cG9ydCBjb25zdCB1cGRhdGVBdHRyaWJ1dGVzID0gZnVuY3Rpb24gKGRhdGEsIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zIHx8IChvcHRpb25zID0ge30pO1xuICAgIG9wdGlvbnMucGF0Y2ggPSB0cnVlO1xuICAgIFxuICAgIHJldHVybiB0aGlzLnNhdmUoZGF0YSwgb3B0aW9ucyk7XG59O1xuIiwiLy8gRGVmYXVsdCBVUkwgZm9yIHRoZSBtb2RlbCdzIHJlcHJlc2VudGF0aW9uIG9uIHRoZSBzZXJ2ZXJcbmV4cG9ydCBjb25zdCB1cmwgPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgYmFzZSA9XG4gICAgICBfLnJlc3VsdCh0aGlzLCAndXJsUm9vdCcpIHx8XG4gICAgICBfLnJlc3VsdCh0aGlzLmNvbGxlY3Rpb24sICd1cmwnKSB8fFxuICAgICAgdXJsRXJyb3IoKTtcblxuICAgIGlmICh0aGlzLmlzTmV3KCkpIHJldHVybiBiYXNlO1xuICAgICAgICBcbiAgICByZXR1cm4gYmFzZS5yZXBsYWNlKC8oW15cXC9dKSQvLCAnJDEvJykgKyB0aGlzLnRvUGFyYW0oKTtcbn07XG4iLCIvLyBBbGlhcyBmb3IgYDo6dXJsUm9vdGBcbmV4cG9ydCBjb25zdCB1cmxSb290ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuY29uc3RydWN0b3IudXJsUm9vdCgpO1xufTtcbiIsImV4cG9ydCB7IGNvZXJjZUF0dHJpYnV0ZXMgfSBmcm9tICcuL2luc3RhbmNlX3Byb3BlcnRpZXMvY29lcmNlQXR0cmlidXRlcyc7XG5leHBvcnQgeyBjb25zdHJ1Y3RvciB9IGZyb20gJy4vaW5zdGFuY2VfcHJvcGVydGllcy9jb25zdHJ1Y3Rvcic7XG5leHBvcnQgeyBkZWZhdWx0cyB9IGZyb20gJy4vaW5zdGFuY2VfcHJvcGVydGllcy9kZWZhdWx0cyc7XG5leHBvcnQgeyBlcnJvcnNPbiB9IGZyb20gJy4vaW5zdGFuY2VfcHJvcGVydGllcy9lcnJvcnNPbic7XG5leHBvcnQgeyBwYXJhbVJvb3QgfSBmcm9tICcuL2luc3RhbmNlX3Byb3BlcnRpZXMvcGFyYW1Sb290JztcbmV4cG9ydCB7IHNhdmUgfSBmcm9tICcuL2luc3RhbmNlX3Byb3BlcnRpZXMvc2F2ZSc7XG5leHBvcnQgeyBzZWxlY3QgfSBmcm9tICcuL2luc3RhbmNlX3Byb3BlcnRpZXMvc2VsZWN0JztcbmV4cG9ydCB7IHNldCB9IGZyb20gJy4vaW5zdGFuY2VfcHJvcGVydGllcy9zZXQnO1xuZXhwb3J0IHsgc2V0RXJyb3JzIH0gZnJvbSAnLi9pbnN0YW5jZV9wcm9wZXJ0aWVzL3NldEVycm9ycyc7XG5leHBvcnQgeyBzeW5jIH0gZnJvbSAnLi9pbnN0YW5jZV9wcm9wZXJ0aWVzL3N5bmMnO1xuZXhwb3J0IHsgdG9KU09OIH0gZnJvbSAnLi9pbnN0YW5jZV9wcm9wZXJ0aWVzL3RvSlNPTic7XG5leHBvcnQgeyB0b1BhcmFtIH0gZnJvbSAnLi9pbnN0YW5jZV9wcm9wZXJ0aWVzL3RvUGFyYW0nO1xuZXhwb3J0IHsgdG91Y2ggfSBmcm9tICcuL2luc3RhbmNlX3Byb3BlcnRpZXMvdG91Y2gnO1xuZXhwb3J0IHsgdW5zZWxlY3QgfSBmcm9tICcuL2luc3RhbmNlX3Byb3BlcnRpZXMvdW5zZWxlY3QnO1xuZXhwb3J0IHsgdXBkYXRlQXR0cmlidXRlIH0gZnJvbSAnLi9pbnN0YW5jZV9wcm9wZXJ0aWVzL3VwZGF0ZV9hdHRyaWJ1dGUnO1xuZXhwb3J0IHsgdXBkYXRlQXR0cmlidXRlcyB9IGZyb20gJy4vaW5zdGFuY2VfcHJvcGVydGllcy91cGRhdGVfYXR0cmlidXRlcyc7XG5leHBvcnQgeyB1cmwgfSBmcm9tICcuL2luc3RhbmNlX3Byb3BlcnRpZXMvdXJsJztcbmV4cG9ydCB7IHVybFJvb3QgfSBmcm9tICcuL2luc3RhbmNlX3Byb3BlcnRpZXMvdXJsUm9vdCc7XG5cbmV4cG9ydCBsZXQgYWJzdHJhY3QgPSB0cnVlO1xuXG4vLyBpbmhlcml0YW5jZUF0dHJpYnV0ZSBpcyB0aGUgYXR0aXJidXRlIHVzZWQgZm9yIFNUSVxuZXhwb3J0IGxldCBpbmhlcml0YW5jZUF0dHJpYnV0ZSA9ICd0eXBlJztcbiIsIi8vIENyZWF0ZSBhIG1vZGVsIHdpdGggK2F0dHJpYnV0ZXMrLiBPcHRpb25zIGFyZSB0aGUgXG4vLyBzYW1lIGFzIFZpa2luZy5Nb2RlbCNzYXZlXG5leHBvcnQgY29uc3QgY3JlYXRlID0gZnVuY3Rpb24oYXR0cmlidXRlcywgb3B0aW9ucykge1xuICAgIGxldCBtb2RlbCA9IG5ldyB0aGlzKGF0dHJpYnV0ZXMpO1xuICAgIG1vZGVsLnNhdmUobnVsbCwgb3B0aW9ucyk7XG4gICAgcmV0dXJuIG1vZGVsO1xufTtcbiIsIi8vIEZpbmQgbW9kZWwgYnkgaWQuIEFjY2VwdHMgc3VjY2VzcyBhbmQgZXJyb3IgY2FsbGJhY2tzIGluIHRoZSBvcHRpb25zXG4vLyBoYXNoLCB3aGljaCBhcmUgYm90aCBwYXNzZWQgKG1vZGVsLCByZXNwb25zZSwgb3B0aW9ucykgYXMgYXJndW1lbnRzLlxuLy9cbi8vIEZpbmQgcmV0dXJucyB0aGUgbW9kZWwsIGhvd2V2ZXIgaXQgbW9zdCBsaWtlbHkgd29uJ3QgaGF2ZSBmZXRjaGVkIHRoZVxuLy8gZGF0YVx0ZnJvbSB0aGUgc2VydmVyIGlmIHlvdSBpbW1lZGlhdGVseSB0cnkgdG8gdXNlIGF0dHJpYnV0ZXMgb2YgdGhlXG4vLyBtb2RlbC5cbmV4cG9ydCBjb25zdCBmaW5kID0gZnVuY3Rpb24oaWQsIG9wdGlvbnMpIHtcbiAgICBsZXQgbW9kZWwgPSBuZXcgdGhpcyh7aWQ6IGlkfSk7XG4gICAgbW9kZWwuZmV0Y2gob3B0aW9ucyk7XG4gICAgcmV0dXJuIG1vZGVsO1xufTtcbiIsIi8vIEZpbmQgb3IgY3JlYXRlIG1vZGVsIGJ5IGF0dHJpYnV0ZXMuIEFjY2VwdHMgc3VjY2VzcyBjYWxsYmFja3MgaW4gdGhlXG4vLyBvcHRpb25zIGhhc2gsIHdoaWNoIGlzIHBhc3NlZCAobW9kZWwpIGFzIGFyZ3VtZW50cy5cbi8vXG4vLyBmaW5kT3JDcmVhdGVCeSByZXR1cm5zIHRoZSBtb2RlbCwgaG93ZXZlciBpdCBtb3N0IGxpa2VseSB3b24ndCBoYXZlIGZldGNoZWRcbi8vIHRoZSBkYXRhXHRmcm9tIHRoZSBzZXJ2ZXIgaWYgeW91IGltbWVkaWF0ZWx5IHRyeSB0byB1c2UgYXR0cmlidXRlcyBvZiB0aGVcbi8vIG1vZGVsLlxuZXhwb3J0IGNvbnN0IGZpbmRPckNyZWF0ZUJ5ID0gZnVuY3Rpb24oYXR0cmlidXRlcywgb3B0aW9ucykge1xuICAgIGxldCBrbGFzcyA9IHRoaXM7XG4gICAga2xhc3Mud2hlcmUoYXR0cmlidXRlcykuZmV0Y2goe1xuICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbiAobW9kZWxDb2xsZWN0aW9uKSB7XG4gICAgICAgICAgICBsZXQgbW9kZWwgPSBtb2RlbENvbGxlY3Rpb24ubW9kZWxzWzBdO1xuICAgICAgICAgICAgaWYgKG1vZGVsKSB7XG4gICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMgJiYgb3B0aW9ucy5zdWNjZXNzKSBvcHRpb25zLnN1Y2Nlc3MobW9kZWwpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBrbGFzcy5jcmVhdGUoYXR0cmlidXRlcywgb3B0aW9ucyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcbn1cbiIsImV4cG9ydCBjb25zdCByZWZsZWN0T25Bc3NvY2lhdGlvbiA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICByZXR1cm4gdGhpcy5hc3NvY2lhdGlvbnNbbmFtZV07XG59O1xuIiwiZXhwb3J0IGNvbnN0IHJlZmxlY3RPbkFzc29jaWF0aW9ucyA9IGZ1bmN0aW9uKG1hY3JvKSB7XG4gICAgbGV0IGFzc29jaWF0aW9ucyA9IF8udmFsdWVzKHRoaXMuYXNzb2NpYXRpb25zKTtcbiAgICBpZiAobWFjcm8pIHtcbiAgICAgICAgYXNzb2NpYXRpb25zID0gXy5zZWxlY3QoYXNzb2NpYXRpb25zLCBmdW5jdGlvbihhKSB7XG4gICAgICAgICAgICByZXR1cm4gYS5tYWNybyA9PT0gbWFjcm87XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBhc3NvY2lhdGlvbnM7XG59O1xuIiwiLy8gR2VuZXJhdGVzIHRoZSBgdXJsUm9vdGAgYmFzZWQgb2ZmIG9mIHRoZSBtb2RlbCBuYW1lLlxuZXhwb3J0IGNvbnN0IHVybFJvb3QgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkoJ3VybFJvb3QnKSkge1xuICAgICAgICByZXR1cm4gXy5yZXN1bHQodGhpcy5wcm90b3R5cGUsICd1cmxSb290JylcbiAgICB9IGVsc2UgaWYgKHRoaXMuYmFzZU1vZGVsLnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eSgndXJsUm9vdCcpKSB7XG4gICAgICAgIHJldHVybiBfLnJlc3VsdCh0aGlzLmJhc2VNb2RlbC5wcm90b3R5cGUsICd1cmxSb290JylcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gXCIvXCIgKyB0aGlzLmJhc2VNb2RlbC5tb2RlbE5hbWUucGx1cmFsO1xuICAgIH1cbn07XG4iLCIvLyBSZXR1cm5zIGEgdW5mZXRjaGVkIGNvbGxlY3Rpb24gd2l0aCB0aGUgcHJlZGljYXRlIHNldCB0byB0aGUgcXVlcnlcbmV4cG9ydCBjb25zdCB3aGVyZSA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAvLyBUT0RPOiBNb3ZlIHRvIG1vZGVsTmFtZSBhcyB3ZWxsP1xuICAgIGxldCBDb2xsZWN0aW9uID0gKHRoaXMubW9kZWxOYW1lLm5hbWUgKyAnQ29sbGVjdGlvbicpLmNvbnN0YW50aXplKCk7XG4gICAgXG4gICAgcmV0dXJuIG5ldyBDb2xsZWN0aW9uKHVuZGVmaW5lZCwge3ByZWRpY2F0ZTogb3B0aW9uc30pO1xufTtcbiIsIi8vIE92ZXJpZGUgdGhlIGRlZmF1bHQgZXh0ZW5kIG1ldGhvZCB0byBzdXBwb3J0IHBhc3NpbmcgaW4gdGhlIG1vZGVsTmFtZVxuLy8gYW5kIHN1cHBvcnQgU1RJXG4vL1xuLy8gVGhlIG1vZGVsTmFtZSBpcyB1c2VkIGZvciBnZW5lcmF0aW5nIHVybHMgYW5kIHJlbGF0aW9uc2hpcHMuXG4vL1xuLy8gSWYgYSBNb2RlbCBpcyBleHRlbmRlZCBmdXJ0aGVyIGlzIGFjdHMgc2ltbGFyIHRvIEFjdGl2ZVJlY29yZHMgU1RJLlxuLy9cbi8vIGBuYW1lYCBpcyBvcHRpb25hbCwgYW5kIG11c3QgYmUgYSBzdHJpbmdcbmV4cG9ydCBjb25zdCBleHRlbmQgPSBmdW5jdGlvbihuYW1lLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykge1xuICAgIGlmKHR5cGVvZiBuYW1lICE9PSAnc3RyaW5nJykge1xuICAgICAgICBzdGF0aWNQcm9wcyA9IHByb3RvUHJvcHM7XG4gICAgICAgIHByb3RvUHJvcHMgPSBuYW1lO1xuICAgIH1cbiAgICBwcm90b1Byb3BzIHx8IChwcm90b1Byb3BzID0ge30pO1xuXG4gICAgbGV0IGNoaWxkID0gQmFja2JvbmUuTW9kZWwuZXh0ZW5kLmNhbGwodGhpcywgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpO1xuXG4gICAgaWYodHlwZW9mIG5hbWUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIGNoaWxkLm1vZGVsTmFtZSA9IG5ldyBWaWtpbmcuTW9kZWwuTmFtZShuYW1lKTtcbiAgICB9XG5cbiAgICBjaGlsZC5hc3NvY2lhdGlvbnMgPSB7fTtcbiAgICBjaGlsZC5kZXNjZW5kYW50cyA9IFtdO1xuICAgIGNoaWxkLmluaGVyaXRhbmNlQXR0cmlidXRlID0gKHByb3RvUHJvcHMuaW5oZXJpdGFuY2VBdHRyaWJ1dGUgPT09IHVuZGVmaW5lZCkgPyB0aGlzLnByb3RvdHlwZS5pbmhlcml0YW5jZUF0dHJpYnV0ZSA6IHByb3RvUHJvcHMuaW5oZXJpdGFuY2VBdHRyaWJ1dGU7XG5cbiAgICBpZiAoY2hpbGQuaW5oZXJpdGFuY2VBdHRyaWJ1dGUgPT09IGZhbHNlIHx8ICh0aGlzLnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eSgnYWJzdHJhY3QnKSAmJiB0aGlzLnByb3RvdHlwZS5hYnN0cmFjdCkpIHtcbiAgICAgICAgY2hpbGQuYmFzZU1vZGVsID0gY2hpbGQ7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgY2hpbGQuYmFzZU1vZGVsLmRlc2NlbmRhbnRzLnB1c2goY2hpbGQpO1xuICAgIH1cblxuICAgIFsnYmVsb25nc1RvJywgJ2hhc09uZScsICdoYXNNYW55JywgJ2hhc0FuZEJlbG9uZ3NUb01hbnknXS5mb3JFYWNoKGZ1bmN0aW9uKG1hY3JvKSB7XG4gICAgICAgIChwcm90b1Byb3BzW21hY3JvXSB8fCBbXSkuY29uY2F0KHRoaXNbbWFjcm9dIHx8IFtdKS5mb3JFYWNoKGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgICAgICAgIGxldCBvcHRpb25zO1xuXG4gICAgICAgICAgICAvLyBIYW5kbGUgYm90aCBgdHlwZSwga2V5LCBvcHRpb25zYCBhbmQgYHR5cGUsIFtrZXksIG9wdGlvbnNdYCBzdHlsZSBhcmd1bWVudHNcbiAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KG5hbWUpKSB7XG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9IG5hbWVbMV07XG4gICAgICAgICAgICAgICAgbmFtZSA9IG5hbWVbMF07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghY2hpbGQuYXNzb2NpYXRpb25zW25hbWVdKSB7XG4gICAgICAgICAgICAgICAgbGV0IHJlZmxlY3Rpb25DbGFzcyA9IHtcbiAgICAgICAgICAgICAgICAgICAgJ2JlbG9uZ3NUbyc6IFZpa2luZy5Nb2RlbC5CZWxvbmdzVG9SZWZsZWN0aW9uLFxuICAgICAgICAgICAgICAgICAgICAnaGFzT25lJzogVmlraW5nLk1vZGVsLkhhc09uZVJlZmxlY3Rpb24sXG4gICAgICAgICAgICAgICAgICAgICdoYXNNYW55JzogVmlraW5nLk1vZGVsLkhhc01hbnlSZWZsZWN0aW9uLFxuICAgICAgICAgICAgICAgICAgICAnaGFzQW5kQmVsb25nc1RvTWFueSc6IFZpa2luZy5Nb2RlbC5IYXNBbmRCZWxvbmdzVG9NYW55UmVmbGVjdGlvblxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZWZsZWN0aW9uQ2xhc3MgPSByZWZsZWN0aW9uQ2xhc3NbbWFjcm9dO1xuXG4gICAgICAgICAgICAgICAgY2hpbGQuYXNzb2NpYXRpb25zW25hbWVdID0gbmV3IHJlZmxlY3Rpb25DbGFzcyhuYW1lLCBvcHRpb25zKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSwgdGhpcy5wcm90b3R5cGUpO1xuXG4gICAgaWYgKHRoaXMucHJvdG90eXBlLnNjaGVtYSAmJiBwcm90b1Byb3BzLnNjaGVtYSkge1xuICAgICAgICBPYmplY3Qua2V5cyh0aGlzLnByb3RvdHlwZS5zY2hlbWEpLmZvckVhY2goIChrZXkpID0+IHtcbiAgICAgICAgICAgIGlmKCFjaGlsZC5wcm90b3R5cGUuc2NoZW1hW2tleV0pIHtcbiAgICAgICAgICAgICAgICBjaGlsZC5wcm90b3R5cGUuc2NoZW1hW2tleV0gPSB0aGlzLnByb3RvdHlwZS5zY2hlbWFba2V5XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNoaWxkO1xufTtcbiIsImV4cG9ydCB7IGNyZWF0ZSB9IGZyb20gJy4vY2xhc3NfcHJvcGVydGllcy9jcmVhdGUnO1xuZXhwb3J0IHsgZmluZCB9IGZyb20gJy4vY2xhc3NfcHJvcGVydGllcy9maW5kJztcbmV4cG9ydCB7IGZpbmRPckNyZWF0ZUJ5IH0gZnJvbSAnLi9jbGFzc19wcm9wZXJ0aWVzL2ZpbmRPckNyZWF0ZUJ5JztcbmV4cG9ydCB7IHJlZmxlY3RPbkFzc29jaWF0aW9uIH0gZnJvbSAnLi9jbGFzc19wcm9wZXJ0aWVzL3JlZmxlY3RPbkFzc29jaWF0aW9uJztcbmV4cG9ydCB7IHJlZmxlY3RPbkFzc29jaWF0aW9ucyB9IGZyb20gJy4vY2xhc3NfcHJvcGVydGllcy9yZWZsZWN0T25Bc3NvY2lhdGlvbnMnO1xuZXhwb3J0IHsgdXJsUm9vdCB9IGZyb20gJy4vY2xhc3NfcHJvcGVydGllcy91cmxSb290JztcbmV4cG9ydCB7IHdoZXJlIH0gZnJvbSAnLi9jbGFzc19wcm9wZXJ0aWVzL3doZXJlJztcbmV4cG9ydCB7IGV4dGVuZCB9IGZyb20gJy4vY2xhc3NfcHJvcGVydGllcy9leHRlbmQnO1xuXG5leHBvcnQgY29uc3QgYXNzb2NpYXRpb25zID0gW107IiwiaW1wb3J0IE5hbWUgZnJvbSAnLi9tb2RlbC9uYW1lJztcbmltcG9ydCBUeXBlIGZyb20gJy4vbW9kZWwvdHlwZSc7XG5pbXBvcnQgUmVmbGVjdGlvbiBmcm9tICcuL21vZGVsL3JlZmxlY3Rpb24nO1xuaW1wb3J0IEhhc09uZVJlZmxlY3Rpb24gZnJvbSAnLi9tb2RlbC9yZWZsZWN0aW9ucy9oYXNfb25lX3JlZmxlY3Rpb24nO1xuaW1wb3J0IEhhc01hbnlSZWZsZWN0aW9uIGZyb20gJy4vbW9kZWwvcmVmbGVjdGlvbnMvaGFzX21hbnlfcmVmbGVjdGlvbic7XG5pbXBvcnQgQmVsb25nc1RvUmVmbGVjdGlvbiBmcm9tICcuL21vZGVsL3JlZmxlY3Rpb25zL2JlbG9uZ3NfdG9fcmVmbGVjdGlvbic7XG5pbXBvcnQgSGFzQW5kQmVsb25nc1RvTWFueVJlZmxlY3Rpb24gZnJvbSAnLi9tb2RlbC9yZWZsZWN0aW9ucy9oYXNfYW5kX2JlbG9uZ3NfdG9fbWFueV9yZWZsZWN0aW9uJztcblxuaW1wb3J0ICogYXMgaW5zdGFuY2VQcm9wZXJ0aWVzIGZyb20gJy4vbW9kZWwvaW5zdGFuY2VfcHJvcGVydGllcyc7XG5pbXBvcnQgKiBhcyBjbGFzc1Byb3BlcnRpZXMgZnJvbSAnLi9tb2RlbC9jbGFzc19wcm9wZXJ0aWVzJztcblxuXG4vLz0gcmVxdWlyZV90cmVlIC4vbW9kZWwvaW5zdGFuY2VfcHJvcGVydGllc1xuXG5cbi8vIFZpa2luZy5Nb2RlbFxuLy8gLS0tLS0tLS0tLS0tXG4vL1xuLy8gVmlraW5nLk1vZGVsIGlzIGFuIGV4dGVuc2lvbiBvZiBbQmFja2JvbmUuTW9kZWxdKGh0dHA6Ly9iYWNrYm9uZWpzLm9yZy8jTW9kZWwpLlxuLy8gSXQgYWRkcyBuYW1pbmcsIHJlbGF0aW9uc2hpcHMsIGRhdGEgdHlwZSBjb2VyY2lvbnMsIHNlbGVjdGlvbiwgYW5kIG1vZGlmaWVzXG4vLyBzeW5jIHRvIHdvcmsgd2l0aCBbUnVieSBvbiBSYWlsc10oaHR0cDovL3J1YnlvbnJhaWxzLm9yZy8pIG91dCBvZiB0aGUgYm94LlxuY29uc3QgTW9kZWwgPSBCYWNrYm9uZS5Nb2RlbC5leHRlbmQoaW5zdGFuY2VQcm9wZXJ0aWVzLCBjbGFzc1Byb3BlcnRpZXMpO1xuXG5Nb2RlbC5OYW1lID0gTmFtZTtcbk1vZGVsLlR5cGUgPSBUeXBlO1xuTW9kZWwuUmVmbGVjdGlvbiA9IFJlZmxlY3Rpb247XG5Nb2RlbC5IYXNPbmVSZWZsZWN0aW9uID0gSGFzT25lUmVmbGVjdGlvbjtcbk1vZGVsLkhhc01hbnlSZWZsZWN0aW9uICA9IEhhc01hbnlSZWZsZWN0aW9uO1xuTW9kZWwuQmVsb25nc1RvUmVmbGVjdGlvbiA9IEJlbG9uZ3NUb1JlZmxlY3Rpb247XG5Nb2RlbC5IYXNBbmRCZWxvbmdzVG9NYW55UmVmbGVjdGlvbiA9IEhhc0FuZEJlbG9uZ3NUb01hbnlSZWZsZWN0aW9uO1xuXG5leHBvcnQgZGVmYXVsdCBNb2RlbDsiLCIvLyBWaWtpbmcuanMgPCU9IHZlcnNpb24gJT4gKHNoYTo8JT0gZ2l0X2luZm9bOmhlYWRdWzpzaGFdICU+KVxuLy8gXG4vLyAoYykgMjAxMi08JT0gVGltZS5ub3cueWVhciAlPiBKb25hdGhhbiBCcmFjeSwgNDJGbG9vcnMgSW5jLlxuLy8gVmlraW5nLmpzIG1heSBiZSBmcmVlbHkgZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlLlxuLy8gaHR0cDovL3Zpa2luZ2pzLmNvbVxuXG5pbXBvcnQgJy4vdmlraW5nL3N1cHBvcnQnO1xuaW1wb3J0IE1vZGVsIGZyb20gJy4vdmlraW5nL21vZGVsJztcblxuY29uc3QgVmlraW5nID0ge1xuICAgIE1vZGVsOiBNb2RlbCxcbn07XG5cbmV4cG9ydCBkZWZhdWx0IFZpa2luZztcbiJdLCJuYW1lcyI6WyJkZWZhdWx0cyIsInNldCIsInVybFJvb3QiLCJIYXNNYW55UmVmbGVjdGlvbiIsIkJlbG9uZ3NUb1JlZmxlY3Rpb24iLCJIYXNBbmRCZWxvbmdzVG9NYW55UmVmbGVjdGlvbiIsIlZpa2luZyJdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFFQSxFQUFBLE9BQU8sY0FBUCxDQUFzQixNQUFNLFNBQTVCLEVBQXVDLFNBQXZDLEVBQWtEO0FBQzlDLEVBQUEsV0FBTyxpQkFBWTtBQUFFLEVBQUEsZUFBTyxLQUFLLEdBQUwsQ0FBUyxVQUFDLENBQUQ7QUFBQSxFQUFBLG1CQUFPLEVBQUUsT0FBRixFQUFQO0FBQUEsRUFBQSxTQUFULEVBQTZCLElBQTdCLENBQWtDLEdBQWxDLENBQVA7QUFBZ0QsRUFBQSxLQUR2QjtBQUU5QyxFQUFBLGNBQVUsSUFGb0M7QUFHOUMsRUFBQSxtQkFBZSxJQUgrQjtB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