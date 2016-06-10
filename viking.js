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
  Date.prototype.strftime = function (fmt) {
      return strftime(fmt, this);
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
  var urlRoot = function urlRoot() {
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

  var associations = [];

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

var classProperties = Object.freeze({
      create: create,
      find: find,
      findOrCreateBy: findOrCreateBy,
      reflectOnAssociation: reflectOnAssociation,
      reflectOnAssociations: reflectOnAssociations,
      urlRoot: urlRoot,
      where: where,
      associations: associations,
      extend: extend
  });

  //= require_tree ./model/instance_properties

  // Viking.Model
  // ------------
  //
  // Viking.Model is an extension of [Backbone.Model](http://backbonejs.org/#Model).
  // It adds naming, relationships, data type coercions, selection, and modifies
  // sync to work with [Ruby on Rails](http://rubyonrails.org/) out of the box.
  var Model = Backbone.Model.extend({

      abstract: true,

      // inheritanceAttribute is the attirbute used for STI
      inheritanceAttribute: 'type',

      defaults: function defaults() {
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
      },

      // Below is the same code from the Backbone.Model function
      // except where there are comments
      constructor: function constructor(attributes, options) {
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
      }

  }, classProperties);

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjpudWxsLCJzb3VyY2VzIjpbIi9Vc2Vycy93YXJhdHVtYW4vc3JjL3Zpa2luZy9saWIvdmlraW5nL3N1cHBvcnQvYXJyYXkuanMiLCIvVXNlcnMvd2FyYXR1bWFuL3NyYy92aWtpbmcvbGliL3Zpa2luZy9zdXBwb3J0L2Jvb2xlYW4uanMiLCIvVXNlcnMvd2FyYXR1bWFuL3NyYy92aWtpbmcvbGliL3Zpa2luZy9zdXBwb3J0L2RhdGUuanMiLCIvVXNlcnMvd2FyYXR1bWFuL3NyYy92aWtpbmcvbGliL3Zpa2luZy9zdXBwb3J0L251bWJlci5qcyIsIi9Vc2Vycy93YXJhdHVtYW4vc3JjL3Zpa2luZy9saWIvdmlraW5nL3N1cHBvcnQvb2JqZWN0LmpzIiwiL1VzZXJzL3dhcmF0dW1hbi9zcmMvdmlraW5nL2xpYi92aWtpbmcvc3VwcG9ydC9zdHJpbmcuanMiLCIvVXNlcnMvd2FyYXR1bWFuL3NyYy92aWtpbmcvbGliL3Zpa2luZy9tb2RlbC9uYW1lLmpzIiwiX19iYWJlbEhlbHBlcnNfXyIsIi9Vc2Vycy93YXJhdHVtYW4vc3JjL3Zpa2luZy9saWIvdmlraW5nL21vZGVsL3R5cGUvZGF0ZS5qcyIsIi9Vc2Vycy93YXJhdHVtYW4vc3JjL3Zpa2luZy9saWIvdmlraW5nL21vZGVsL3R5cGUvanNvbi5qcyIsIi9Vc2Vycy93YXJhdHVtYW4vc3JjL3Zpa2luZy9saWIvdmlraW5nL21vZGVsL3R5cGUvbnVtYmVyLmpzIiwiL1VzZXJzL3dhcmF0dW1hbi9zcmMvdmlraW5nL2xpYi92aWtpbmcvbW9kZWwvdHlwZS9zdHJpbmcuanMiLCIvVXNlcnMvd2FyYXR1bWFuL3NyYy92aWtpbmcvbGliL3Zpa2luZy9tb2RlbC90eXBlL2Jvb2xlYW4uanMiLCIvVXNlcnMvd2FyYXR1bWFuL3NyYy92aWtpbmcvbGliL3Zpa2luZy9tb2RlbC90eXBlLmpzIiwiL1VzZXJzL3dhcmF0dW1hbi9zcmMvdmlraW5nL2xpYi92aWtpbmcvbW9kZWwvcmVmbGVjdGlvbi5qcyIsIi9Vc2Vycy93YXJhdHVtYW4vc3JjL3Zpa2luZy9saWIvdmlraW5nL21vZGVsL3JlZmxlY3Rpb25zL2hhc19vbmVfcmVmbGVjdGlvbi5qcyIsIi9Vc2Vycy93YXJhdHVtYW4vc3JjL3Zpa2luZy9saWIvdmlraW5nL21vZGVsL3JlZmxlY3Rpb25zL2hhc19tYW55X3JlZmxlY3Rpb24uanMiLCIvVXNlcnMvd2FyYXR1bWFuL3NyYy92aWtpbmcvbGliL3Zpa2luZy9tb2RlbC9yZWZsZWN0aW9ucy9iZWxvbmdzX3RvX3JlZmxlY3Rpb24uanMiLCIvVXNlcnMvd2FyYXR1bWFuL3NyYy92aWtpbmcvbGliL3Zpa2luZy9tb2RlbC9yZWZsZWN0aW9ucy9oYXNfYW5kX2JlbG9uZ3NfdG9fbWFueV9yZWZsZWN0aW9uLmpzIiwiL1VzZXJzL3dhcmF0dW1hbi9zcmMvdmlraW5nL2xpYi92aWtpbmcvbW9kZWwvY2xhc3NfcHJvcGVydGllcy5qcyIsIi9Vc2Vycy93YXJhdHVtYW4vc3JjL3Zpa2luZy9saWIvdmlraW5nL21vZGVsLmpzIiwiL1VzZXJzL3dhcmF0dW1hbi9zcmMvdmlraW5nL2xpYi92aWtpbmcuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ2FsbHMgYHRvX3BhcmFtYCBvbiBhbGwgaXRzIGVsZW1lbnRzIGFuZCBqb2lucyB0aGUgcmVzdWx0IHdpdGggc2xhc2hlcy5cbi8vIFRoaXMgaXMgdXNlZCBieSB1cmxfZm9yIGluIFZpa2luZyBQYWNrLlxuT2JqZWN0LmRlZmluZVByb3BlcnR5KEFycmF5LnByb3RvdHlwZSwgJ3RvUGFyYW0nLCB7XG4gICAgdmFsdWU6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubWFwKChlKSA9PiBlLnRvUGFyYW0oKSkuam9pbignLycpOyB9LFxuICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgIGNvbmZpZ3VyZWFibGU6IHRydWUsXG4gICAgZW51bWVyYWJsZTogZmFsc2Vcbn0pO1xuXG4vLyBDb252ZXJ0cyBhbiBhcnJheSBpbnRvIGEgc3RyaW5nIHN1aXRhYmxlIGZvciB1c2UgYXMgYSBVUkwgcXVlcnkgc3RyaW5nLFxuLy8gdXNpbmcgdGhlIGdpdmVuIGtleSBhcyB0aGUgcGFyYW0gbmFtZS5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShBcnJheS5wcm90b3R5cGUsICd0b1F1ZXJ5Jywge1xuICAgIHZhbHVlOiBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgIGxldCBwcmVmaXggPSBrZXkgKyBcIltdXCI7XG4gICAgICAgIHJldHVybiB0aGlzLm1hcChmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBlc2NhcGUocHJlZml4KSArICc9JztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB2YWx1ZS50b1F1ZXJ5KHByZWZpeCk7XG4gICAgICAgIH0pLmpvaW4oJyYnKTtcbiAgICB9LFxuICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgIGNvbmZpZ3VyZWFibGU6IHRydWUsXG4gICAgZW51bWVyYWJsZTogZmFsc2Vcbn0pO1xuIiwiLy8gQWxpYXMgb2YgdG9fcy5cbkJvb2xlYW4ucHJvdG90eXBlLnRvUGFyYW0gPSBCb29sZWFuLnByb3RvdHlwZS50b1N0cmluZztcblxuQm9vbGVhbi5wcm90b3R5cGUudG9RdWVyeSA9IGZ1bmN0aW9uKGtleSkge1xuICAgIHJldHVybiBlc2NhcGUoa2V5LnRvUGFyYW0oKSkgKyBcIj1cIiArIGVzY2FwZSh0aGlzLnRvUGFyYW0oKSk7XG59OyIsIi8vIHN0cmZ0aW1lIHJlbGllcyBvbiBodHRwczovL2dpdGh1Yi5jb20vc2Ftc29uanMvc3RyZnRpbWUuIEl0IHN1cHBvcnRzXG4vLyBzdGFuZGFyZCBzcGVjaWZpZXJzIGZyb20gQyBhcyB3ZWxsIGFzIHNvbWUgb3RoZXIgZXh0ZW5zaW9ucyBmcm9tIFJ1YnkuXG5EYXRlLnByb3RvdHlwZS5zdHJmdGltZSA9IGZ1bmN0aW9uKGZtdCkge1xuICAgIHJldHVybiBzdHJmdGltZShmbXQsIHRoaXMpO1xufTtcblxuRGF0ZS5mcm9tSVNPID0gKHMpID0+IG5ldyBEYXRlKHMpO1xuXG4vLyBBbGlhcyBvZiB0b19zLlxuRGF0ZS5wcm90b3R5cGUudG9QYXJhbSA9IERhdGUucHJvdG90eXBlLnRvSlNPTjtcblxuRGF0ZS5wcm90b3R5cGUudG9RdWVyeSA9IGZ1bmN0aW9uKGtleSkge1xuICAgIHJldHVybiBlc2NhcGUoa2V5LnRvUGFyYW0oKSkgKyBcIj1cIiArIGVzY2FwZSh0aGlzLnRvUGFyYW0oKSk7XG59O1xuXG5EYXRlLnByb3RvdHlwZS50b2RheSA9ICgpID0+IG5ldyBEYXRlKCk7XG5cbkRhdGUucHJvdG90eXBlLmlzVG9kYXkgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gKHRoaXMuZ2V0VVRDRnVsbFllYXIoKSA9PT0gKG5ldyBEYXRlKCkpLmdldFVUQ0Z1bGxZZWFyKCkgJiYgdGhpcy5nZXRVVENNb250aCgpID09PSAobmV3IERhdGUoKSkuZ2V0VVRDTW9udGgoKSAmJiB0aGlzLmdldFVUQ0RhdGUoKSA9PT0gKG5ldyBEYXRlKCkpLmdldFVUQ0RhdGUoKSk7XG59O1xuXG5EYXRlLnByb3RvdHlwZS5pc1RoaXNNb250aCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gKHRoaXMuZ2V0VVRDRnVsbFllYXIoKSA9PT0gKG5ldyBEYXRlKCkpLmdldFVUQ0Z1bGxZZWFyKCkgJiYgdGhpcy5nZXRVVENNb250aCgpID09PSAobmV3IERhdGUoKSkuZ2V0VVRDTW9udGgoKSk7XG59XG5cbkRhdGUucHJvdG90eXBlLmlzVGhpc1llYXIgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gKHRoaXMuZ2V0VVRDRnVsbFllYXIoKSA9PT0gKG5ldyBEYXRlKCkpLmdldFVUQ0Z1bGxZZWFyKCkpO1xufTtcblxuXG5EYXRlLnByb3RvdHlwZS5wYXN0ID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAodGhpcyA8IChuZXcgRGF0ZSgpKSk7XG59IiwiLy8gb3JkaW5hbGl6ZSByZXR1cm5zIHRoZSBvcmRpbmFsIHN0cmluZyBjb3JyZXNwb25kaW5nIHRvIGludGVnZXI6XG4vL1xuLy8gICAgICgxKS5vcmRpbmFsaXplKCkgICAgLy8gPT4gJzFzdCdcbi8vICAgICAoMikub3JkaW5hbGl6ZSgpICAgIC8vID0+ICcybmQnXG4vLyAgICAgKDUzKS5vcmRpbmFsaXplKCkgICAvLyA9PiAnNTNyZCdcbi8vICAgICAoMjAwOSkub3JkaW5hbGl6ZSgpIC8vID0+ICcyMDA5dGgnXG4vLyAgICAgKC0xMzQpLm9yZGluYWxpemUoKSAvLyA9PiAnLTEzNHRoJ1xuTnVtYmVyLnByb3RvdHlwZS5vcmRpbmFsaXplID0gZnVuY3Rpb24oKSB7XG4gICAgbGV0IGFicyA9IE1hdGguYWJzKHRoaXMpO1xuICAgIFxuICAgIGlmIChhYnMgJSAxMDAgPj0gMTEgJiYgYWJzICUgMTAwIDw9IDEzKSB7XG4gICAgICAgIHJldHVybiB0aGlzICsgJ3RoJztcbiAgICB9XG4gICAgXG4gICAgYWJzID0gYWJzICUgMTA7XG4gICAgaWYgKGFicyA9PT0gMSkgeyByZXR1cm4gdGhpcyArICdzdCc7IH1cbiAgICBpZiAoYWJzID09PSAyKSB7IHJldHVybiB0aGlzICsgJ25kJzsgfVxuICAgIGlmIChhYnMgPT09IDMpIHsgcmV0dXJuIHRoaXMgKyAncmQnOyB9XG4gICAgXG4gICAgcmV0dXJuIHRoaXMgKyAndGgnO1xufTtcblxuLy8gQWxpYXMgb2YgdG9fcy5cbk51bWJlci5wcm90b3R5cGUudG9QYXJhbSA9IE51bWJlci5wcm90b3R5cGUudG9TdHJpbmc7XG5cbk51bWJlci5wcm90b3R5cGUudG9RdWVyeSA9IGZ1bmN0aW9uKGtleSkge1xuICAgIHJldHVybiBlc2NhcGUoa2V5LnRvUGFyYW0oKSkgKyBcIj1cIiArIGVzY2FwZSh0aGlzLnRvUGFyYW0oKSk7XG59O1xuXG5OdW1iZXIucHJvdG90eXBlLnNlY29uZCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzICogMTAwMDtcbn07XG5cbk51bWJlci5wcm90b3R5cGUuc2Vjb25kcyA9IE51bWJlci5wcm90b3R5cGUuc2Vjb25kO1xuXG5OdW1iZXIucHJvdG90eXBlLm1pbnV0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzICogNjAwMDA7XG59O1xuXG5OdW1iZXIucHJvdG90eXBlLm1pbnV0ZXMgPSBOdW1iZXIucHJvdG90eXBlLm1pbnV0ZTtcblxuTnVtYmVyLnByb3RvdHlwZS5ob3VyID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMgKiAzNjAwMDAwO1xufTtcblxuTnVtYmVyLnByb3RvdHlwZS5ob3VycyA9IE51bWJlci5wcm90b3R5cGUuaG91cjtcblxuTnVtYmVyLnByb3RvdHlwZS5kYXkgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcyAqIDg2NDAwMDAwO1xufTtcblxuTnVtYmVyLnByb3RvdHlwZS5kYXlzID0gTnVtYmVyLnByb3RvdHlwZS5kYXk7XG5cbk51bWJlci5wcm90b3R5cGUud2VlayA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzICogNyAqIDg2NDAwMDAwO1xufTtcblxuTnVtYmVyLnByb3RvdHlwZS53ZWVrcyA9IE51bWJlci5wcm90b3R5cGUud2VlaztcblxuTnVtYmVyLnByb3RvdHlwZS5hZ28gPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IERhdGUoKG5ldyBEYXRlKCkpLmdldFRpbWUoKSAtIHRoaXMpO1xufTtcblxuTnVtYmVyLnByb3RvdHlwZS5mcm9tTm93ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIG5ldyBEYXRlKChuZXcgRGF0ZSgpKS5nZXRUaW1lKCkgKyB0aGlzKTtcbn07XG4iLCIvLyBSZXR1cm5zIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSByZWNlaXZlciBzdWl0YWJsZSBmb3IgdXNlIGFzIGEgVVJMXG4vLyBxdWVyeSBzdHJpbmc6XG4vLyBcbi8vIHtuYW1lOiAnRGF2aWQnLCBuYXRpb25hbGl0eTogJ0RhbmlzaCd9LnRvUGFyYW0oKVxuLy8gLy8gPT4gXCJuYW1lPURhdmlkJm5hdGlvbmFsaXR5PURhbmlzaFwiXG4vLyBBbiBvcHRpb25hbCBuYW1lc3BhY2UgY2FuIGJlIHBhc3NlZCB0byBlbmNsb3NlIHRoZSBwYXJhbSBuYW1lczpcbi8vIFxuLy8ge25hbWU6ICdEYXZpZCcsIG5hdGlvbmFsaXR5OiAnRGFuaXNoJ30udG9QYXJhbSgndXNlcicpXG4vLyAvLyA9PiBcInVzZXJbbmFtZV09RGF2aWQmdXNlcltuYXRpb25hbGl0eV09RGFuaXNoXCJcbi8vXG4vLyBUaGUgc3RyaW5nIHBhaXJzIFwia2V5PXZhbHVlXCIgdGhhdCBjb25mb3JtIHRoZSBxdWVyeSBzdHJpbmcgYXJlIHNvcnRlZFxuLy8gbGV4aWNvZ3JhcGhpY2FsbHkgaW4gYXNjZW5kaW5nIG9yZGVyLlxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE9iamVjdC5wcm90b3R5cGUsICd0b1BhcmFtJywge1xuICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgIGNvbmZpZ3VyZWFibGU6IHRydWUsXG4gICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgdmFsdWU6IGZ1bmN0aW9uKG5hbWVzcGFjZSkge1xuICAgICAgICByZXR1cm4gT2JqZWN0LmtleXModGhpcykubWFwKChrZXkpID0+IHtcbiAgICAgICAgICAgIGxldCB2YWx1ZSA9IHRoaXNba2V5XTtcbiAgICAgICAgICAgIGxldCBuYW1lc3BhY2VXaXRoS2V5ID0gKG5hbWVzcGFjZSA/IChuYW1lc3BhY2UgKyBcIltcIiArIGtleSArIFwiXVwiKSA6IGtleSk7XG5cbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGVzY2FwZShuYW1lc3BhY2VXaXRoS2V5KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlLnRvUXVlcnkobmFtZXNwYWNlV2l0aEtleSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pLmpvaW4oJyYnKTtcbiAgICB9XG59KTtcblxuLy8gQ29udmVydHMgYW4gb2JqZWN0IGludG8gYSBzdHJpbmcgc3VpdGFibGUgZm9yIHVzZSBhcyBhIFVSTCBxdWVyeSBzdHJpbmcsXG4vLyB1c2luZyB0aGUgZ2l2ZW4ga2V5IGFzIHRoZSBwYXJhbSBuYW1lLlxuLy9cbi8vIE5vdGU6IFRoaXMgbWV0aG9kIGlzIGRlZmluZWQgYXMgYSBkZWZhdWx0IGltcGxlbWVudGF0aW9uIGZvciBhbGwgT2JqZWN0cyBmb3Jcbi8vIE9iamVjdCN0b1F1ZXJ5IHRvIHdvcmsuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoT2JqZWN0LnByb3RvdHlwZSwgJ3RvUXVlcnknLCB7XG4gICAgd3JpdGFibGU6IHRydWUsXG4gICAgY29uZmlndXJlYWJsZTogdHJ1ZSxcbiAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICB2YWx1ZTogT2JqZWN0LnByb3RvdHlwZS50b1BhcmFtXG59KTsiLCIvLyBDb252ZXJ0cyB0aGUgZmlyc3QgY2hhcmFjdGVyIHRvIHVwcGVyY2FzZVxuU3RyaW5nLnByb3RvdHlwZS5jYXBpdGFsaXplID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyB0aGlzLnNsaWNlKDEpO1xufTtcblxuLy8gQ29udmVydHMgdGhlIGZpcnN0IGNoYXJhY3RlciB0byBsb3dlcmNhc2VcblN0cmluZy5wcm90b3R5cGUuYW50aWNhcGl0YWxpemUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5jaGFyQXQoMCkudG9Mb3dlckNhc2UoKSArIHRoaXMuc2xpY2UoMSk7XG59O1xuXG4vLyBDYXBpdGFsaXplcyBhbGwgdGhlIHdvcmRzIGFuZCByZXBsYWNlcyBzb21lIGNoYXJhY3RlcnMgaW4gdGhlIHN0cmluZyB0b1xuLy8gY3JlYXRlIGEgbmljZXIgbG9va2luZyB0aXRsZS4gdGl0bGVpemUgaXMgbWVhbnQgZm9yIGNyZWF0aW5nIHByZXR0eSBvdXRwdXQuXG5TdHJpbmcucHJvdG90eXBlLnRpdGxlaXplID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMudW5kZXJzY29yZSgpLmh1bWFuaXplKCkucmVwbGFjZSgvXFxiKCc/W2Etel0pL2csIGZ1bmN0aW9uKG0peyByZXR1cm4gbS50b1VwcGVyQ2FzZSgpOyB9KTtcbn07XG5cbi8vIENhcGl0YWxpemVzIHRoZSBmaXJzdCB3b3JkIGFuZCB0dXJucyB1bmRlcnNjb3JlcyBpbnRvIHNwYWNlcyBhbmQgc3RyaXBzIGFcbi8vIHRyYWlsaW5nIFwiX2lkXCIsIGlmIGFueS4gTGlrZSB0aXRsZWl6ZSwgdGhpcyBpcyBtZWFudCBmb3IgY3JlYXRpbmcgcHJldHR5IG91dHB1dC5cblN0cmluZy5wcm90b3R5cGUuaHVtYW5pemUgPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgcmVzdWx0ID0gdGhpcy50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoL19pZCQvLCAnJykucmVwbGFjZSgvXy9nLCAnICcpO1xuICAgIHJlc3VsdCA9IHJlc3VsdC5yZXBsYWNlKC8oW2EtelxcZF0qKS9nLCBmdW5jdGlvbihtKSB7IHJldHVybiBtLnRvTG93ZXJDYXNlKCk7IH0pO1xuICAgIHJldHVybiByZXN1bHQuY2FwaXRhbGl6ZSgpO1xufTtcblxuLy8gTWFrZXMgYW4gdW5kZXJzY29yZWQsIGxvd2VyY2FzZSBmb3JtIGZyb20gdGhlIGV4cHJlc3Npb24gaW4gdGhlIHN0cmluZy5cbi8vXG4vLyBDaGFuZ2VzICcuJyB0byAnLycgdG8gY29udmVydCBuYW1lc3BhY2VzIHRvIHBhdGhzLlxuLy9cbi8vIEV4YW1wbGVzOlxuLy8gXG4vLyAgICAgXCJBY3RpdmVNb2RlbFwiLnVuZGVyc2NvcmUgICAgICAgICAjID0+IFwiYWN0aXZlX21vZGVsXCJcbi8vICAgICBcIkFjdGl2ZU1vZGVsLkVycm9yc1wiLnVuZGVyc2NvcmUgIyA9PiBcImFjdGl2ZV9tb2RlbC9lcnJvcnNcIlxuLy9cbi8vIEFzIGEgcnVsZSBvZiB0aHVtYiB5b3UgY2FuIHRoaW5rIG9mIHVuZGVyc2NvcmUgYXMgdGhlIGludmVyc2Ugb2YgY2FtZWxpemUsXG4vLyB0aG91Z2ggdGhlcmUgYXJlIGNhc2VzIHdoZXJlIHRoYXQgZG9lcyBub3QgaG9sZDpcbi8vXG4vLyAgICAgXCJTU0xFcnJvclwiLnVuZGVyc2NvcmUoKS5jYW1lbGl6ZSgpICMgPT4gXCJTc2xFcnJvclwiXG5TdHJpbmcucHJvdG90eXBlLnVuZGVyc2NvcmUgPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgcmVzdWx0ID0gdGhpcy5yZXBsYWNlKCcuJywgJy8nKTtcbiAgICByZXN1bHQgPSByZXN1bHQucmVwbGFjZSgvKFtBLVpcXGRdKykoW0EtWl1bYS16XSkvZywgXCIkMV8kMlwiKTtcbiAgICByZXN1bHQgPSByZXN1bHQucmVwbGFjZSgvKFthLXpcXGRdKShbQS1aXSkvZywgXCIkMV8kMlwiKTtcbiAgICByZXR1cm4gcmVzdWx0LnJlcGxhY2UoJy0nLCAnXycpLnRvTG93ZXJDYXNlKCk7XG59O1xuXG4vLyBCeSBkZWZhdWx0LCAjY2FtZWxpemUgY29udmVydHMgc3RyaW5ncyB0byBVcHBlckNhbWVsQ2FzZS4gSWYgdGhlIGFyZ3VtZW50XG4vLyB0byBjYW1lbGl6ZSBpcyBzZXQgdG8gYGZhbHNlYCB0aGVuICNjYW1lbGl6ZSBwcm9kdWNlcyBsb3dlckNhbWVsQ2FzZS5cbi8vXG4vLyBcXCNjYW1lbGl6ZSB3aWxsIGFsc28gY29udmVydCBcIi9cIiB0byBcIi5cIiB3aGljaCBpcyB1c2VmdWwgZm9yIGNvbnZlcnRpbmdcbi8vIHBhdGhzIHRvIG5hbWVzcGFjZXMuXG4vL1xuLy8gRXhhbXBsZXM6XG4vL1xuLy8gICAgIFwiYWN0aXZlX21vZGVsXCIuY2FtZWxpemUgICAgICAgICAgICAgICAvLyA9PiBcIkFjdGl2ZU1vZGVsXCJcbi8vICAgICBcImFjdGl2ZV9tb2RlbFwiLmNhbWVsaXplKHRydWUpICAgICAgICAgLy8gPT4gXCJBY3RpdmVNb2RlbFwiXG4vLyAgICAgXCJhY3RpdmVfbW9kZWxcIi5jYW1lbGl6ZShmYWxzZSkgICAgICAgIC8vID0+IFwiYWN0aXZlTW9kZWxcIlxuLy8gICAgIFwiYWN0aXZlX21vZGVsL2Vycm9yc1wiLmNhbWVsaXplICAgICAgICAvLyA9PiBcIkFjdGl2ZU1vZGVsLkVycm9yc1wiXG4vLyAgICAgXCJhY3RpdmVfbW9kZWwvZXJyb3JzXCIuY2FtZWxpemUoZmFsc2UpIC8vID0+IFwiYWN0aXZlTW9kZWwuRXJyb3JzXCJcbi8vXG4vLyBBcyBhIHJ1bGUgb2YgdGh1bWIgeW91IGNhbiB0aGluayBvZiBjYW1lbGl6ZSBhcyB0aGUgaW52ZXJzZSBvZiB1bmRlcnNjb3JlLFxuLy8gdGhvdWdoIHRoZXJlIGFyZSBjYXNlcyB3aGVyZSB0aGF0IGRvZXMgbm90IGhvbGQ6XG4vL1xuLy8gICAgIFwiU1NMRXJyb3JcIi51bmRlcnNjb3JlKCkuY2FtZWxpemUoKSAgIC8vID0+IFwiU3NsRXJyb3JcIlxuU3RyaW5nLnByb3RvdHlwZS5jYW1lbGl6ZSA9IGZ1bmN0aW9uKHVwcGVyY2FzZV9maXJzdF9sZXR0ZXIpIHtcbiAgICBsZXQgcmVzdWx0O1xuXG4gICAgaWYgKHVwcGVyY2FzZV9maXJzdF9sZXR0ZXIgPT09IHVuZGVmaW5lZCB8fCB1cHBlcmNhc2VfZmlyc3RfbGV0dGVyKSB7XG4gICAgICAgIHJlc3VsdCA9IHRoaXMuY2FwaXRhbGl6ZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc3VsdCA9IHRoaXMuYW50aWNhcGl0YWxpemUoKTtcbiAgICB9XG5cbiAgICByZXN1bHQgPSByZXN1bHQucmVwbGFjZSgvKF98KFxcLykpKFthLXpcXGRdKikvZywgZnVuY3Rpb24oX2EsIF9iLCBmaXJzdCwgcmVzdCkge1xuICAgICAgICByZXR1cm4gKGZpcnN0IHx8ICcnKSArIHJlc3QuY2FwaXRhbGl6ZSgpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHJlc3VsdC5yZXBsYWNlKCcvJywgJy4nKTtcbn07XG5cbi8vIENvbnZlcnQgYSBzdHJpbmcgdG8gYSBib29sZWFuIHZhbHVlLiBJZiB0aGUgYXJndW1lbnQgdG8gI2Jvb2xlYW5pemUgaXNcbi8vIHBhc3NlZCBpZiB0aGUgc3RyaW5nIGlzIG5vdCAndHJ1ZScgb3IgJ2ZhbHNlJyBpdCB3aWxsIHJldHVybiB0aGUgYXJndW1lbnQuXG4vL1xuLy8gRXhhbXBsZXM6XG4vL1xuLy8gICAgIFwidHJ1ZVwiLmJvb2xlYW5pemUoKSAgICAgICAvLyA9PiB0cnVlXG4vLyAgICAgXCJmYWxzZVwiLmJvb2xlYW5pemUoKSAgICAgIC8vID0+IGZhbHNlXG4vLyAgICAgXCJvdGhlclwiLmJvb2xlYW5pemUoKSAgICAgIC8vID0+IGZhbHNlXG4vLyAgICAgXCJvdGhlclwiLmJvb2xlYW5pemUodHJ1ZSkgIC8vID0+IHRydWVcblN0cmluZy5wcm90b3R5cGUuYm9vbGVhbml6ZSA9IGZ1bmN0aW9uKGRlZmF1bHRUbykge1xuICAgIGlmKHRoaXMudG9TdHJpbmcoKSA9PT0gJ3RydWUnKSB7IHJldHVybiB0cnVlOyB9XG4gICAgaWYgKHRoaXMudG9TdHJpbmcoKSA9PT0gJ2ZhbHNlJykgeyByZXR1cm4gZmFsc2U7IH1cbiAgICBcbiAgICByZXR1cm4gKGRlZmF1bHRUbyA9PT0gdW5kZWZpbmVkID8gZmFsc2UgOiBkZWZhdWx0VG8pO1xufTtcblxuLy8gUmVwbGFjZXMgdW5kZXJzY29yZXMgd2l0aCBkYXNoZXMuXG4vL1xuLy8gRXhhbXBsZTpcbi8vXG4vLyAgICAgXCJwdW5pX3B1bmlcIiAgLy8gPT4gXCJwdW5pLXB1bmlcIlxuU3RyaW5nLnByb3RvdHlwZS5kYXNoZXJpemUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5yZXBsYWNlKCdfJywgJy0nKTtcbn07XG5cbi8vIFJlcGxhY2VzIHNwZWNpYWwgY2hhcmFjdGVycyBpbiBhIHN0cmluZyBzbyB0aGF0IGl0IG1heSBiZSB1c2VkIGFzIHBhcnQgb2Zcbi8vIGEgXCJwcmV0dHlcIiBVUkwuXG4vL1xuLy8gRXhhbXBsZTpcbi8vXG4vLyAgICAgXCJEb25hbGQgRS4gS251dGhcIi5wYXJhbWV0ZXJpemUoKSAvLyA9PiAnZG9uYWxkLWUta251dGgnXG5TdHJpbmcucHJvdG90eXBlLnBhcmFtZXRlcml6ZSA9IGZ1bmN0aW9uKHNlcGVyYXRvcikge1xuICAgIHJldHVybiB0aGlzLnRvTG93ZXJDYXNlKCkucmVwbGFjZSgvW15hLXowLTlcXC1fXSsvZywgc2VwZXJhdG9yIHx8ICctJyk7XG59O1xuXG4vLyBBZGQgVW5kZXJzY29yZS5pbmZsZWN0aW9uI3BsdXJhbGl6ZSBmdW5jdGlvbiBvbiB0aGUgU3RyaW5nIG9iamVjdFxuU3RyaW5nLnByb3RvdHlwZS5wbHVyYWxpemUgPSBmdW5jdGlvbihjb3VudCwgaW5jbHVkZU51bWJlcikge1xuICAgIHJldHVybiBfLnBsdXJhbGl6ZSh0aGlzLCBjb3VudCwgaW5jbHVkZU51bWJlcik7XG59O1xuXG4vLyBBZGQgVW5kZXJzY29yZS5pbmZsZWN0aW9uI3Npbmd1bGFyaXplIGZ1bmN0aW9uIG9uIHRoZSBTdHJpbmcgb2JqZWN0XG5TdHJpbmcucHJvdG90eXBlLnNpbmd1bGFyaXplID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIF8uc2luZ3VsYXJpemUodGhpcyk7XG59O1xuXG4vLyBUcmllcyB0byBmaW5kIGEgdmFyaWFibGUgd2l0aCB0aGUgbmFtZSBzcGVjaWZpZWQgaW4gY29udGV4dCBvZiBgY29udGV4dGAuXG4vLyBgY29udGV4dGAgZGVmYXVsdHMgdG8gdGhlIGB3aW5kb3dgIHZhcmlhYmxlLlxuLy9cbi8vIEV4YW1wbGVzOlxuLy8gICAgICdNb2R1bGUnLmNvbnN0YW50aXplICAgICAjID0+IE1vZHVsZVxuLy8gICAgICdUZXN0LlVuaXQnLmNvbnN0YW50aXplICAjID0+IFRlc3QuVW5pdFxuLy8gICAgICdVbml0Jy5jb25zdGFudGl6ZShUZXN0KSAjID0+IFRlc3QuVW5pdFxuLy9cbi8vIFZpa2luZy5OYW1lRXJyb3IgaXMgcmFpc2VkIHdoZW4gdGhlIHZhcmlhYmxlIGlzIHVua25vd24uXG5TdHJpbmcucHJvdG90eXBlLmNvbnN0YW50aXplID0gZnVuY3Rpb24oY29udGV4dCkge1xuICAgIGlmKCFjb250ZXh0KSB7IGNvbnRleHQgPSB3aW5kb3c7IH1cblxuICAgIHJldHVybiB0aGlzLnNwbGl0KCcuJykucmVkdWNlKGZ1bmN0aW9uIChjb250ZXh0LCBuYW1lKSB7XG4gICAgICAgIGxldCB2ID0gY29udGV4dFtuYW1lXTtcbiAgICAgICAgaWYgKCF2KSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVmlraW5nLk5hbWVFcnJvcihcInVuaW5pdGlhbGl6ZWQgdmFyaWFibGUgXCIgKyBuYW1lKTsgXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHY7XG4gICAgfSwgY29udGV4dCk7XG59O1xuXG4vLyBSZW1vdmVzIHRoZSBtb2R1bGUgcGFydCBmcm9tIHRoZSBleHByZXNzaW9uIGluIHRoZSBzdHJpbmcuXG4vL1xuLy8gRXhhbXBsZXM6XG4vLyAgICAgJ05hbWVzcGFjZWQuTW9kdWxlJy5kZW1vZHVsaXplKCkgIyA9PiAnTW9kdWxlJ1xuLy8gICAgICdNb2R1bGUnLmRlbW9kdWxpemUoKSAjID0+ICdNb2R1bGUnXG4vLyAgICAgJycuZGVtb2R1bGl6ZSgpICMgPT4gJydcblN0cmluZy5wcm90b3R5cGUuZGVtb2R1bGl6ZSA9IGZ1bmN0aW9uIChzZXBlcmF0b3IpIHtcbiAgICBpZiAoIXNlcGVyYXRvcikge1xuICAgICAgICBzZXBlcmF0b3IgPSAnLic7XG4gICAgfVxuXG4gICAgbGV0IGluZGV4ID0gdGhpcy5sYXN0SW5kZXhPZihzZXBlcmF0b3IpO1xuXG4gICAgaWYgKGluZGV4ID09PSAtMSkge1xuICAgICAgICByZXR1cm4gU3RyaW5nKHRoaXMpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNsaWNlKGluZGV4ICsgMSk7XG4gICAgfVxufVxuXG4vLyBJZiBgbGVuZ3RoYCBpcyBncmVhdGVyIHRoYW4gdGhlIGxlbmd0aCBvZiB0aGUgc3RyaW5nLCByZXR1cm5zIGEgbmV3IFN0cmluZ1xuLy8gb2YgbGVuZ3RoIGBsZW5ndGhgIHdpdGggdGhlIHN0cmluZyByaWdodCBqdXN0aWZpZWQgYW5kIHBhZGRlZCB3aXRoIHBhZFN0cmluZztcbi8vIG90aGVyd2lzZSwgcmV0dXJucyBzdHJpbmdcblN0cmluZy5wcm90b3R5cGUucmp1c3QgPSBmdW5jdGlvbihsZW5ndGgsIHBhZFN0cmluZykge1xuICAgIGlmICghcGFkU3RyaW5nKSB7IHBhZFN0cmluZyA9ICcgJzsgfVxuICAgIFxuICAgIGxldCBwYWRkaW5nID0gJyc7XG4gICAgbGV0IHBhZGRpbmdMZW5ndGggPSBsZW5ndGggLSB0aGlzLmxlbmd0aDtcblxuICAgIHdoaWxlIChwYWRkaW5nLmxlbmd0aCA8IHBhZGRpbmdMZW5ndGgpIHtcbiAgICAgICAgaWYgKHBhZGRpbmdMZW5ndGggLSBwYWRkaW5nLmxlbmd0aCA8IHBhZFN0cmluZy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHBhZGRpbmcgPSBwYWRkaW5nICsgcGFkU3RyaW5nLnNsaWNlKDAsIHBhZGRpbmdMZW5ndGggLSBwYWRkaW5nLmxlbmd0aCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwYWRkaW5nID0gcGFkZGluZyArIHBhZFN0cmluZztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBwYWRkaW5nICsgdGhpcztcbn07XG5cbi8vIElmIGBsZW5ndGhgIGlzIGdyZWF0ZXIgdGhhbiB0aGUgbGVuZ3RoIG9mIHRoZSBzdHJpbmcsIHJldHVybnMgYSBuZXcgU3RyaW5nXG4vLyBvZiBsZW5ndGggYGxlbmd0aGAgd2l0aCB0aGUgc3RyaW5nIGxlZnQganVzdGlmaWVkIGFuZCBwYWRkZWQgd2l0aCBwYWRTdHJpbmc7XG4vLyBvdGhlcndpc2UsIHJldHVybnMgc3RyaW5nXG5TdHJpbmcucHJvdG90eXBlLmxqdXN0ID0gZnVuY3Rpb24obGVuZ3RoLCBwYWRTdHJpbmcpIHtcbiAgICBpZiAoIXBhZFN0cmluZykgeyBwYWRTdHJpbmcgPSAnICc7IH1cbiAgICBcbiAgICBsZXQgcGFkZGluZyA9ICcnO1xuICAgIGxldCBwYWRkaW5nTGVuZ3RoID0gbGVuZ3RoIC0gdGhpcy5sZW5ndGg7XG5cbiAgICB3aGlsZSAocGFkZGluZy5sZW5ndGggPCBwYWRkaW5nTGVuZ3RoKSB7XG4gICAgICAgIGlmIChwYWRkaW5nTGVuZ3RoIC0gcGFkZGluZy5sZW5ndGggPCBwYWRTdHJpbmcubGVuZ3RoKSB7XG4gICAgICAgICAgICBwYWRkaW5nID0gcGFkZGluZyArIHBhZFN0cmluZy5zbGljZSgwLCBwYWRkaW5nTGVuZ3RoIC0gcGFkZGluZy5sZW5ndGgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcGFkZGluZyA9IHBhZGRpbmcgKyBwYWRTdHJpbmc7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcyArIHBhZGRpbmc7XG59O1xuXG4vLyBBbGlhcyBvZiB0b19zLlxuU3RyaW5nLnByb3RvdHlwZS50b1BhcmFtID0gU3RyaW5nLnByb3RvdHlwZS50b1N0cmluZztcblxuU3RyaW5nLnByb3RvdHlwZS50b1F1ZXJ5ID0gZnVuY3Rpb24oa2V5KSB7XG5cdHJldHVybiBlc2NhcGUoa2V5LnRvUGFyYW0oKSkgKyBcIj1cIiArIGVzY2FwZSh0aGlzLnRvUGFyYW0oKSk7XG59O1xuXG5TdHJpbmcucHJvdG90eXBlLmRvd25jYXNlID0gU3RyaW5nLnByb3RvdHlwZS50b0xvd2VyQ2FzZTtcbiIsImNvbnN0IE5hbWUgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIGxldCBvYmplY3ROYW1lID0gbmFtZS5jYW1lbGl6ZSgpOyAvLyBOYW1lc3BhY2VkLk5hbWVcblxuICAgIHRoaXMubmFtZSA9IG9iamVjdE5hbWU7XG4gICAgdGhpcy5jb2xsZWN0aW9uTmFtZSA9IG9iamVjdE5hbWUgKyAnQ29sbGVjdGlvbic7XG4gICAgdGhpcy5zaW5ndWxhciA9IG9iamVjdE5hbWUudW5kZXJzY29yZSgpLnJlcGxhY2UoL1xcLy9nLCAnXycpOyAvLyBuYW1lc3BhY2VkX25hbWVcbiAgICB0aGlzLnBsdXJhbCA9IHRoaXMuc2luZ3VsYXIucGx1cmFsaXplKCk7IC8vIG5hbWVzcGFjZWRfbmFtZXNcbiAgICB0aGlzLmh1bWFuID0gb2JqZWN0TmFtZS5kZW1vZHVsaXplKCkuaHVtYW5pemUoKTsgLy8gTmFtZVxuICAgIHRoaXMuY29sbGVjdGlvbiA9IHRoaXMuc2luZ3VsYXIucGx1cmFsaXplKCk7IC8vIG5hbWVzcGFjZWQvbmFtZXNcbiAgICB0aGlzLnBhcmFtS2V5ID0gdGhpcy5zaW5ndWxhcjtcbiAgICB0aGlzLnJvdXRlS2V5ID0gdGhpcy5wbHVyYWw7XG4gICAgdGhpcy5lbGVtZW50ID0gb2JqZWN0TmFtZS5kZW1vZHVsaXplKCkudW5kZXJzY29yZSgpO1xuXG4gICAgdGhpcy5tb2RlbCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMuX21vZGVsKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fbW9kZWw7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9tb2RlbCA9IHRoaXMubmFtZS5jb25zdGFudGl6ZSgpO1xuICAgICAgICByZXR1cm4gdGhpcy5fbW9kZWw7XG4gICAgfVxuXG59O1xuXG5leHBvcnQgZGVmYXVsdCBOYW1lO1xuIiwidmFyIGJhYmVsSGVscGVycyA9IHt9O1xuZXhwb3J0IHZhciBfdHlwZW9mID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiBTeW1ib2wuaXRlcmF0b3IgPT09IFwic3ltYm9sXCIgPyBmdW5jdGlvbiAob2JqKSB7XG4gIHJldHVybiB0eXBlb2Ygb2JqO1xufSA6IGZ1bmN0aW9uIChvYmopIHtcbiAgcmV0dXJuIG9iaiAmJiB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgb2JqLmNvbnN0cnVjdG9yID09PSBTeW1ib2wgPyBcInN5bWJvbFwiIDogdHlwZW9mIG9iajtcbn07XG5cbmV4cG9ydCB2YXIganN4ID0gZnVuY3Rpb24gKCkge1xuICB2YXIgUkVBQ1RfRUxFTUVOVF9UWVBFID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIFN5bWJvbC5mb3IgJiYgU3ltYm9sLmZvcihcInJlYWN0LmVsZW1lbnRcIikgfHwgMHhlYWM3O1xuICByZXR1cm4gZnVuY3Rpb24gY3JlYXRlUmF3UmVhY3RFbGVtZW50KHR5cGUsIHByb3BzLCBrZXksIGNoaWxkcmVuKSB7XG4gICAgdmFyIGRlZmF1bHRQcm9wcyA9IHR5cGUgJiYgdHlwZS5kZWZhdWx0UHJvcHM7XG4gICAgdmFyIGNoaWxkcmVuTGVuZ3RoID0gYXJndW1lbnRzLmxlbmd0aCAtIDM7XG5cbiAgICBpZiAoIXByb3BzICYmIGNoaWxkcmVuTGVuZ3RoICE9PSAwKSB7XG4gICAgICBwcm9wcyA9IHt9O1xuICAgIH1cblxuICAgIGlmIChwcm9wcyAmJiBkZWZhdWx0UHJvcHMpIHtcbiAgICAgIGZvciAodmFyIHByb3BOYW1lIGluIGRlZmF1bHRQcm9wcykge1xuICAgICAgICBpZiAocHJvcHNbcHJvcE5hbWVdID09PSB2b2lkIDApIHtcbiAgICAgICAgICBwcm9wc1twcm9wTmFtZV0gPSBkZWZhdWx0UHJvcHNbcHJvcE5hbWVdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICghcHJvcHMpIHtcbiAgICAgIHByb3BzID0gZGVmYXVsdFByb3BzIHx8IHt9O1xuICAgIH1cblxuICAgIGlmIChjaGlsZHJlbkxlbmd0aCA9PT0gMSkge1xuICAgICAgcHJvcHMuY2hpbGRyZW4gPSBjaGlsZHJlbjtcbiAgICB9IGVsc2UgaWYgKGNoaWxkcmVuTGVuZ3RoID4gMSkge1xuICAgICAgdmFyIGNoaWxkQXJyYXkgPSBBcnJheShjaGlsZHJlbkxlbmd0aCk7XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2hpbGRyZW5MZW5ndGg7IGkrKykge1xuICAgICAgICBjaGlsZEFycmF5W2ldID0gYXJndW1lbnRzW2kgKyAzXTtcbiAgICAgIH1cblxuICAgICAgcHJvcHMuY2hpbGRyZW4gPSBjaGlsZEFycmF5O1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAkJHR5cGVvZjogUkVBQ1RfRUxFTUVOVF9UWVBFLFxuICAgICAgdHlwZTogdHlwZSxcbiAgICAgIGtleToga2V5ID09PSB1bmRlZmluZWQgPyBudWxsIDogJycgKyBrZXksXG4gICAgICByZWY6IG51bGwsXG4gICAgICBwcm9wczogcHJvcHMsXG4gICAgICBfb3duZXI6IG51bGxcbiAgICB9O1xuICB9O1xufSgpO1xuXG5leHBvcnQgdmFyIGFzeW5jVG9HZW5lcmF0b3IgPSBmdW5jdGlvbiAoZm4pIHtcbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZ2VuID0gZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgZnVuY3Rpb24gc3RlcChrZXksIGFyZykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHZhciBpbmZvID0gZ2VuW2tleV0oYXJnKTtcbiAgICAgICAgICB2YXIgdmFsdWUgPSBpbmZvLnZhbHVlO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIHJlamVjdChlcnJvcik7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGluZm8uZG9uZSkge1xuICAgICAgICAgIHJlc29sdmUodmFsdWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodmFsdWUpLnRoZW4oZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICByZXR1cm4gc3RlcChcIm5leHRcIiwgdmFsdWUpO1xuICAgICAgICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgIHJldHVybiBzdGVwKFwidGhyb3dcIiwgZXJyKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gc3RlcChcIm5leHRcIik7XG4gICAgfSk7XG4gIH07XG59O1xuXG5leHBvcnQgdmFyIGNsYXNzQ2FsbENoZWNrID0gZnVuY3Rpb24gKGluc3RhbmNlLCBDb25zdHJ1Y3Rvcikge1xuICBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7XG4gIH1cbn07XG5cbmV4cG9ydCB2YXIgY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07XG4gICAgICBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7XG4gICAgICBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7XG4gICAgICBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlO1xuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7XG4gICAgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTtcbiAgICBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTtcbiAgICByZXR1cm4gQ29uc3RydWN0b3I7XG4gIH07XG59KCk7XG5cbmV4cG9ydCB2YXIgZGVmaW5lRW51bWVyYWJsZVByb3BlcnRpZXMgPSBmdW5jdGlvbiAob2JqLCBkZXNjcykge1xuICBmb3IgKHZhciBrZXkgaW4gZGVzY3MpIHtcbiAgICB2YXIgZGVzYyA9IGRlc2NzW2tleV07XG4gICAgZGVzYy5jb25maWd1cmFibGUgPSBkZXNjLmVudW1lcmFibGUgPSB0cnVlO1xuICAgIGlmIChcInZhbHVlXCIgaW4gZGVzYykgZGVzYy53cml0YWJsZSA9IHRydWU7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwga2V5LCBkZXNjKTtcbiAgfVxuXG4gIHJldHVybiBvYmo7XG59O1xuXG5leHBvcnQgdmFyIGRlZmF1bHRzID0gZnVuY3Rpb24gKG9iaiwgZGVmYXVsdHMpIHtcbiAgdmFyIGtleXMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhkZWZhdWx0cyk7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGtleSA9IGtleXNbaV07XG4gICAgdmFyIHZhbHVlID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihkZWZhdWx0cywga2V5KTtcblxuICAgIGlmICh2YWx1ZSAmJiB2YWx1ZS5jb25maWd1cmFibGUgJiYgb2JqW2tleV0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwga2V5LCB2YWx1ZSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG9iajtcbn07XG5cbmV4cG9ydCB2YXIgZGVmaW5lUHJvcGVydHkgPSBmdW5jdGlvbiAob2JqLCBrZXksIHZhbHVlKSB7XG4gIGlmIChrZXkgaW4gb2JqKSB7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwga2V5LCB7XG4gICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgd3JpdGFibGU6IHRydWVcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICBvYmpba2V5XSA9IHZhbHVlO1xuICB9XG5cbiAgcmV0dXJuIG9iajtcbn07XG5cbmV4cG9ydCB2YXIgX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uICh0YXJnZXQpIHtcbiAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldO1xuXG4gICAgZm9yICh2YXIga2V5IGluIHNvdXJjZSkge1xuICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHtcbiAgICAgICAgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGFyZ2V0O1xufTtcblxuZXhwb3J0IHZhciBnZXQgPSBmdW5jdGlvbiBnZXQob2JqZWN0LCBwcm9wZXJ0eSwgcmVjZWl2ZXIpIHtcbiAgaWYgKG9iamVjdCA9PT0gbnVsbCkgb2JqZWN0ID0gRnVuY3Rpb24ucHJvdG90eXBlO1xuICB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBwcm9wZXJ0eSk7XG5cbiAgaWYgKGRlc2MgPT09IHVuZGVmaW5lZCkge1xuICAgIHZhciBwYXJlbnQgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqZWN0KTtcblxuICAgIGlmIChwYXJlbnQgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBnZXQocGFyZW50LCBwcm9wZXJ0eSwgcmVjZWl2ZXIpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChcInZhbHVlXCIgaW4gZGVzYykge1xuICAgIHJldHVybiBkZXNjLnZhbHVlO1xuICB9IGVsc2Uge1xuICAgIHZhciBnZXR0ZXIgPSBkZXNjLmdldDtcblxuICAgIGlmIChnZXR0ZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICByZXR1cm4gZ2V0dGVyLmNhbGwocmVjZWl2ZXIpO1xuICB9XG59O1xuXG5leHBvcnQgdmFyIGluaGVyaXRzID0gZnVuY3Rpb24gKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7XG4gIGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gXCJmdW5jdGlvblwiICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCBcIiArIHR5cGVvZiBzdXBlckNsYXNzKTtcbiAgfVxuXG4gIHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwge1xuICAgIGNvbnN0cnVjdG9yOiB7XG4gICAgICB2YWx1ZTogc3ViQ2xhc3MsXG4gICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfVxuICB9KTtcbiAgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzO1xufTtcblxuZXhwb3J0IHZhciBfaW5zdGFuY2VvZiA9IGZ1bmN0aW9uIChsZWZ0LCByaWdodCkge1xuICBpZiAocmlnaHQgIT0gbnVsbCAmJiB0eXBlb2YgU3ltYm9sICE9PSBcInVuZGVmaW5lZFwiICYmIHJpZ2h0W1N5bWJvbC5oYXNJbnN0YW5jZV0pIHtcbiAgICByZXR1cm4gcmlnaHRbU3ltYm9sLmhhc0luc3RhbmNlXShsZWZ0KTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbGVmdCBpbnN0YW5jZW9mIHJpZ2h0O1xuICB9XG59O1xuXG5leHBvcnQgdmFyIGludGVyb3BSZXF1aXJlRGVmYXVsdCA9IGZ1bmN0aW9uIChvYmopIHtcbiAgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHtcbiAgICBkZWZhdWx0OiBvYmpcbiAgfTtcbn07XG5cbmV4cG9ydCB2YXIgaW50ZXJvcFJlcXVpcmVXaWxkY2FyZCA9IGZ1bmN0aW9uIChvYmopIHtcbiAgaWYgKG9iaiAmJiBvYmouX19lc01vZHVsZSkge1xuICAgIHJldHVybiBvYmo7XG4gIH0gZWxzZSB7XG4gICAgdmFyIG5ld09iaiA9IHt9O1xuXG4gICAgaWYgKG9iaiAhPSBudWxsKSB7XG4gICAgICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBrZXkpKSBuZXdPYmpba2V5XSA9IG9ialtrZXldO1xuICAgICAgfVxuICAgIH1cblxuICAgIG5ld09iai5kZWZhdWx0ID0gb2JqO1xuICAgIHJldHVybiBuZXdPYmo7XG4gIH1cbn07XG5cbmV4cG9ydCB2YXIgbmV3QXJyb3dDaGVjayA9IGZ1bmN0aW9uIChpbm5lclRoaXMsIGJvdW5kVGhpcykge1xuICBpZiAoaW5uZXJUaGlzICE9PSBib3VuZFRoaXMpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGluc3RhbnRpYXRlIGFuIGFycm93IGZ1bmN0aW9uXCIpO1xuICB9XG59O1xuXG5leHBvcnQgdmFyIG9iamVjdERlc3RydWN0dXJpbmdFbXB0eSA9IGZ1bmN0aW9uIChvYmopIHtcbiAgaWYgKG9iaiA9PSBudWxsKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGRlc3RydWN0dXJlIHVuZGVmaW5lZFwiKTtcbn07XG5cbmV4cG9ydCB2YXIgb2JqZWN0V2l0aG91dFByb3BlcnRpZXMgPSBmdW5jdGlvbiAob2JqLCBrZXlzKSB7XG4gIHZhciB0YXJnZXQgPSB7fTtcblxuICBmb3IgKHZhciBpIGluIG9iaikge1xuICAgIGlmIChrZXlzLmluZGV4T2YoaSkgPj0gMCkgY29udGludWU7XG4gICAgaWYgKCFPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBpKSkgY29udGludWU7XG4gICAgdGFyZ2V0W2ldID0gb2JqW2ldO1xuICB9XG5cbiAgcmV0dXJuIHRhcmdldDtcbn07XG5cbmV4cG9ydCB2YXIgcG9zc2libGVDb25zdHJ1Y3RvclJldHVybiA9IGZ1bmN0aW9uIChzZWxmLCBjYWxsKSB7XG4gIGlmICghc2VsZikge1xuICAgIHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihcInRoaXMgaGFzbid0IGJlZW4gaW5pdGlhbGlzZWQgLSBzdXBlcigpIGhhc24ndCBiZWVuIGNhbGxlZFwiKTtcbiAgfVxuXG4gIHJldHVybiBjYWxsICYmICh0eXBlb2YgY2FsbCA9PT0gXCJvYmplY3RcIiB8fCB0eXBlb2YgY2FsbCA9PT0gXCJmdW5jdGlvblwiKSA/IGNhbGwgOiBzZWxmO1xufTtcblxuZXhwb3J0IHZhciBzZWxmR2xvYmFsID0gdHlwZW9mIGdsb2JhbCA9PT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiBnbG9iYWw7XG5cbmV4cG9ydCB2YXIgc2V0ID0gZnVuY3Rpb24gc2V0KG9iamVjdCwgcHJvcGVydHksIHZhbHVlLCByZWNlaXZlcikge1xuICB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBwcm9wZXJ0eSk7XG5cbiAgaWYgKGRlc2MgPT09IHVuZGVmaW5lZCkge1xuICAgIHZhciBwYXJlbnQgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqZWN0KTtcblxuICAgIGlmIChwYXJlbnQgIT09IG51bGwpIHtcbiAgICAgIHNldChwYXJlbnQsIHByb3BlcnR5LCB2YWx1ZSwgcmVjZWl2ZXIpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChcInZhbHVlXCIgaW4gZGVzYyAmJiBkZXNjLndyaXRhYmxlKSB7XG4gICAgZGVzYy52YWx1ZSA9IHZhbHVlO1xuICB9IGVsc2Uge1xuICAgIHZhciBzZXR0ZXIgPSBkZXNjLnNldDtcblxuICAgIGlmIChzZXR0ZXIgIT09IHVuZGVmaW5lZCkge1xuICAgICAgc2V0dGVyLmNhbGwocmVjZWl2ZXIsIHZhbHVlKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdmFsdWU7XG59O1xuXG5leHBvcnQgdmFyIHNsaWNlZFRvQXJyYXkgPSBmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIHNsaWNlSXRlcmF0b3IoYXJyLCBpKSB7XG4gICAgdmFyIF9hcnIgPSBbXTtcbiAgICB2YXIgX24gPSB0cnVlO1xuICAgIHZhciBfZCA9IGZhbHNlO1xuICAgIHZhciBfZSA9IHVuZGVmaW5lZDtcblxuICAgIHRyeSB7XG4gICAgICBmb3IgKHZhciBfaSA9IGFycltTeW1ib2wuaXRlcmF0b3JdKCksIF9zOyAhKF9uID0gKF9zID0gX2kubmV4dCgpKS5kb25lKTsgX24gPSB0cnVlKSB7XG4gICAgICAgIF9hcnIucHVzaChfcy52YWx1ZSk7XG5cbiAgICAgICAgaWYgKGkgJiYgX2Fyci5sZW5ndGggPT09IGkpIGJyZWFrO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgX2QgPSB0cnVlO1xuICAgICAgX2UgPSBlcnI7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmICghX24gJiYgX2lbXCJyZXR1cm5cIl0pIF9pW1wicmV0dXJuXCJdKCk7XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICBpZiAoX2QpIHRocm93IF9lO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBfYXJyO1xuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIChhcnIsIGkpIHtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShhcnIpKSB7XG4gICAgICByZXR1cm4gYXJyO1xuICAgIH0gZWxzZSBpZiAoU3ltYm9sLml0ZXJhdG9yIGluIE9iamVjdChhcnIpKSB7XG4gICAgICByZXR1cm4gc2xpY2VJdGVyYXRvcihhcnIsIGkpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiSW52YWxpZCBhdHRlbXB0IHRvIGRlc3RydWN0dXJlIG5vbi1pdGVyYWJsZSBpbnN0YW5jZVwiKTtcbiAgICB9XG4gIH07XG59KCk7XG5cbmV4cG9ydCB2YXIgc2xpY2VkVG9BcnJheUxvb3NlID0gZnVuY3Rpb24gKGFyciwgaSkge1xuICBpZiAoQXJyYXkuaXNBcnJheShhcnIpKSB7XG4gICAgcmV0dXJuIGFycjtcbiAgfSBlbHNlIGlmIChTeW1ib2wuaXRlcmF0b3IgaW4gT2JqZWN0KGFycikpIHtcbiAgICB2YXIgX2FyciA9IFtdO1xuXG4gICAgZm9yICh2YXIgX2l0ZXJhdG9yID0gYXJyW1N5bWJvbC5pdGVyYXRvcl0oKSwgX3N0ZXA7ICEoX3N0ZXAgPSBfaXRlcmF0b3IubmV4dCgpKS5kb25lOykge1xuICAgICAgX2Fyci5wdXNoKF9zdGVwLnZhbHVlKTtcblxuICAgICAgaWYgKGkgJiYgX2Fyci5sZW5ndGggPT09IGkpIGJyZWFrO1xuICAgIH1cblxuICAgIHJldHVybiBfYXJyO1xuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJJbnZhbGlkIGF0dGVtcHQgdG8gZGVzdHJ1Y3R1cmUgbm9uLWl0ZXJhYmxlIGluc3RhbmNlXCIpO1xuICB9XG59O1xuXG5leHBvcnQgdmFyIHRhZ2dlZFRlbXBsYXRlTGl0ZXJhbCA9IGZ1bmN0aW9uIChzdHJpbmdzLCByYXcpIHtcbiAgcmV0dXJuIE9iamVjdC5mcmVlemUoT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoc3RyaW5ncywge1xuICAgIHJhdzoge1xuICAgICAgdmFsdWU6IE9iamVjdC5mcmVlemUocmF3KVxuICAgIH1cbiAgfSkpO1xufTtcblxuZXhwb3J0IHZhciB0YWdnZWRUZW1wbGF0ZUxpdGVyYWxMb29zZSA9IGZ1bmN0aW9uIChzdHJpbmdzLCByYXcpIHtcbiAgc3RyaW5ncy5yYXcgPSByYXc7XG4gIHJldHVybiBzdHJpbmdzO1xufTtcblxuZXhwb3J0IHZhciB0ZW1wb3JhbFJlZiA9IGZ1bmN0aW9uICh2YWwsIG5hbWUsIHVuZGVmKSB7XG4gIGlmICh2YWwgPT09IHVuZGVmKSB7XG4gICAgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKG5hbWUgKyBcIiBpcyBub3QgZGVmaW5lZCAtIHRlbXBvcmFsIGRlYWQgem9uZVwiKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gdmFsO1xuICB9XG59O1xuXG5leHBvcnQgdmFyIHRlbXBvcmFsVW5kZWZpbmVkID0ge307XG5cbmV4cG9ydCB2YXIgdG9BcnJheSA9IGZ1bmN0aW9uIChhcnIpIHtcbiAgcmV0dXJuIEFycmF5LmlzQXJyYXkoYXJyKSA/IGFyciA6IEFycmF5LmZyb20oYXJyKTtcbn07XG5cbmV4cG9ydCB2YXIgdG9Db25zdW1hYmxlQXJyYXkgPSBmdW5jdGlvbiAoYXJyKSB7XG4gIGlmIChBcnJheS5pc0FycmF5KGFycikpIHtcbiAgICBmb3IgKHZhciBpID0gMCwgYXJyMiA9IEFycmF5KGFyci5sZW5ndGgpOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSBhcnIyW2ldID0gYXJyW2ldO1xuXG4gICAgcmV0dXJuIGFycjI7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIEFycmF5LmZyb20oYXJyKTtcbiAgfVxufTtcblxuYmFiZWxIZWxwZXJzO1xuXG5leHBvcnQgeyBfdHlwZW9mIGFzIHR5cGVvZiwgX2V4dGVuZHMgYXMgZXh0ZW5kcywgX2luc3RhbmNlb2YgYXMgaW5zdGFuY2VvZiB9IiwiY29uc3QgRGF0ZVR5cGUgPSB7XG5cbiAgICBsb2FkOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyB8fCB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICByZXR1cm4gRGF0ZS5mcm9tSVNPKHZhbHVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghKHZhbHVlIGluc3RhbmNlb2YgRGF0ZSkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IodHlwZW9mIHZhbHVlICsgXCIgY2FuJ3QgYmUgY29lcmNlZCBpbnRvIERhdGVcIik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgfSxcblxuICAgIGR1bXA6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZS50b0lTT1N0cmluZygpO1xuICAgIH1cblxufTtcblxuZXhwb3J0IGRlZmF1bHQgRGF0ZVR5cGU7XG4iLCJjb25zdCBKU09OVHlwZSA9IHtcblxuICAgIGxvYWQ6IGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHtcbiAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIGxldCBBbm9uTW9kZWwgPSBWaWtpbmcuTW9kZWwuZXh0ZW5kKHtcbiAgICAgICAgICAgICAgICBpbmhlcml0YW5jZUF0dHJpYnV0ZTogZmFsc2VcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgbGV0IG1vZGVsID0gbmV3IEFub25Nb2RlbCh2YWx1ZSk7XG4gICAgICAgICAgICBtb2RlbC5tb2RlbE5hbWUgPSBrZXk7XG4gICAgICAgICAgICBtb2RlbC5iYXNlTW9kZWwgPSBtb2RlbDtcbiAgICAgICAgICAgIHJldHVybiBtb2RlbDtcbiAgICAgICAgfVxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKHR5cGVvZiB2YWx1ZSArIFwiIGNhbid0IGJlIGNvZXJjZWQgaW50byBKU09OXCIpO1xuICAgIH0sXG5cbiAgICBkdW1wOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBWaWtpbmcuTW9kZWwpIHtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZS50b0pTT04oKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuXG59O1xuXG5leHBvcnQgZGVmYXVsdCBKU09OVHlwZTtcbiIsImNvbnN0IE51bWJlclR5cGUgPSB7XG5cbiAgICBsb2FkOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZS5yZXBsYWNlKC9cXCwvZywgJycpO1xuXG4gICAgICAgICAgICBpZiAodmFsdWUudHJpbSgpID09PSAnJykge1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBOdW1iZXIodmFsdWUpO1xuICAgIH0sXG5cbiAgICBkdW1wOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuXG59O1xuXG5leHBvcnQgZGVmYXVsdCBOdW1iZXJUeXBlO1xuIiwiY29uc3QgU3RyaW5nVHlwZSA9IHtcblxuICAgIGxvYWQ6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIGlmICh0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnICYmIHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiBTdHJpbmcodmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9LFxuXG4gICAgZHVtcDogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ3N0cmluZycgJiYgdmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIFN0cmluZyh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cblxufTtcblxuZXhwb3J0IGRlZmF1bHQgU3RyaW5nVHlwZTtcbiIsImNvbnN0IEJvb2xlYW5UeXBlID0ge1xuXG4gICAgbG9hZDogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIHZhbHVlID0gKHZhbHVlID09PSAndHJ1ZScpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAhIXZhbHVlO1xuICAgIH0sXG5cbiAgICBkdW1wOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuXG59O1xuXG5leHBvcnQgZGVmYXVsdCBCb29sZWFuVHlwZTtcbiIsImltcG9ydCBEYXRlVHlwZSBmcm9tICcuL3R5cGUvZGF0ZSc7XG5pbXBvcnQgSlNPTlR5cGUgZnJvbSAnLi90eXBlL2pzb24nO1xuaW1wb3J0IE51bWJlclR5cGUgZnJvbSAnLi90eXBlL251bWJlcic7XG5pbXBvcnQgU3RyaW5nVHlwZSBmcm9tICcuL3R5cGUvc3RyaW5nJztcbmltcG9ydCBCb29sZWFuVHlwZSBmcm9tICcuL3R5cGUvYm9vbGVhbic7XG5cbmNvbnN0IFR5cGUgPSB7XG4gICAgJ3JlZ2lzdHJ5Jzoge31cbn07XG5cblR5cGUucmVnaXN0cnlbJ2RhdGUnXSA9IFR5cGUuRGF0ZSA9IERhdGVUeXBlO1xuVHlwZS5yZWdpc3RyeVsnanNvbiddID0gVHlwZS5KU09OID0gSlNPTlR5cGU7XG5UeXBlLnJlZ2lzdHJ5WydudW1iZXInXSA9IFR5cGUuTnVtYmVyID0gTnVtYmVyVHlwZTtcblR5cGUucmVnaXN0cnlbJ3N0cmluZyddID0gVHlwZS5TdHJpbmcgPSBTdHJpbmdUeXBlO1xuVHlwZS5yZWdpc3RyeVsnYm9vbGVhbiddID0gVHlwZS5Cb29sZWFuID0gQm9vbGVhblR5cGU7XG5cbmV4cG9ydCBkZWZhdWx0IFR5cGU7XG4iLCJjb25zdCBSZWZsZWN0aW9uID0gZnVuY3Rpb24gKCkgeyB9O1xuXG5fLmV4dGVuZChWaWtpbmcuTW9kZWwuUmVmbGVjdGlvbi5wcm90b3R5cGUsIHtcblxuICAgIGtsYXNzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMubWFjcm8gPT09ICdoYXNNYW55Jykge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29sbGVjdGlvbigpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gdGhpcy5tb2RlbCgpO1xuICAgIH0sXG4gICAgXG4gICAgbW9kZWw6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5tb2RlbE5hbWUubW9kZWwoKTtcbiAgICB9LFxuICAgIFxuICAgIGNvbGxlY3Rpb246IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jb2xsZWN0aW9uTmFtZS5jb25zdGFudGl6ZSgpO1xuICAgIH1cblxufSk7XG5cblJlZmxlY3Rpb24uZXh0ZW5kID0gQmFja2JvbmUuTW9kZWwuZXh0ZW5kO1xuXG5leHBvcnQgZGVmYXVsdCBSZWZsZWN0aW9uO1xuXG5cbiIsImNvbnN0IEhhc09uZVJlZmxlY3Rpb24gPSBWaWtpbmcuTW9kZWwuUmVmbGVjdGlvbi5leHRlbmQoe1xuICAgIFxuICAgIGNvbnN0cnVjdG9yOiBmdW5jdGlvbiAobmFtZSwgb3B0aW9ucykge1xuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgICAgICB0aGlzLm1hY3JvID0gJ2hhc09uZSc7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IF8uZXh0ZW5kKHt9LCBvcHRpb25zKTtcblxuICAgICAgICBpZiAoIXRoaXMub3B0aW9ucy5wb2x5bW9ycGhpYykge1xuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5tb2RlbE5hbWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1vZGVsTmFtZSA9IG5ldyBWaWtpbmcuTW9kZWwuTmFtZSh0aGlzLm9wdGlvbnMubW9kZWxOYW1lKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tb2RlbE5hbWUgPSBuZXcgVmlraW5nLk1vZGVsLk5hbWUobmFtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbn0pO1xuXG5leHBvcnQgZGVmYXVsdCBIYXNPbmVSZWZsZWN0aW9uOyIsIkhhc01hbnlSZWZsZWN0aW9uID0gVmlraW5nLk1vZGVsLlJlZmxlY3Rpb24uZXh0ZW5kKHtcbiAgICBcbiAgICBjb25zdHJ1Y3RvcjogZnVuY3Rpb24gKG5hbWUsIG9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICAgICAgdGhpcy5tYWNybyA9ICdoYXNNYW55JztcbiAgICAgICAgdGhpcy5vcHRpb25zID0gXy5leHRlbmQoe30sIG9wdGlvbnMpO1xuXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMubW9kZWxOYW1lKSB7XG4gICAgICAgICAgICB0aGlzLm1vZGVsTmFtZSA9IG5ldyBWaWtpbmcuTW9kZWwuTmFtZSh0aGlzLm9wdGlvbnMubW9kZWxOYW1lKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMubW9kZWxOYW1lID0gbmV3IFZpa2luZy5Nb2RlbC5OYW1lKHRoaXMubmFtZS5zaW5ndWxhcml6ZSgpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuY29sbGVjdGlvbk5hbWUpIHtcbiAgICAgICAgICAgIHRoaXMuY29sbGVjdGlvbk5hbWUgPSB0aGlzLm9wdGlvbnMuY29sbGVjdGlvbk5hbWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmNvbGxlY3Rpb25OYW1lID0gdGhpcy5tb2RlbE5hbWUuY29sbGVjdGlvbk5hbWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG59KTtcblxuZXhwb3J0IGRlZmF1bHQgSGFzTWFueVJlZmxlY3Rpb247IiwiQmVsb25nc1RvUmVmbGVjdGlvbiA9IFZpa2luZy5Nb2RlbC5SZWZsZWN0aW9uLmV4dGVuZCh7XG4gICAgXG4gICAgY29uc3RydWN0b3I6IGZ1bmN0aW9uIChuYW1lLCBvcHRpb25zKSB7XG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgICAgIHRoaXMubWFjcm8gPSAnYmVsb25nc1RvJztcbiAgICAgICAgdGhpcy5vcHRpb25zID0gXy5leHRlbmQoe30sIG9wdGlvbnMpO1xuICAgIFxuICAgICAgICBpZiAoIXRoaXMub3B0aW9ucy5wb2x5bW9ycGhpYykge1xuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5tb2RlbE5hbWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1vZGVsTmFtZSA9IG5ldyBWaWtpbmcuTW9kZWwuTmFtZSh0aGlzLm9wdGlvbnMubW9kZWxOYW1lKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tb2RlbE5hbWUgPSBuZXcgVmlraW5nLk1vZGVsLk5hbWUobmFtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG59KTtcblxuZXhwb3J0IGRlZmF1bHQgQmVsb25nc1RvUmVmbGVjdGlvbjtcbiIsIkhhc0FuZEJlbG9uZ3NUb01hbnlSZWZsZWN0aW9uID0gVmlraW5nLk1vZGVsLlJlZmxlY3Rpb24uZXh0ZW5kKHtcblxuICAgIGNvbnN0cnVjdG9yOiBmdW5jdGlvbiAobmFtZSwgb3B0aW9ucykge1xuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgICAgICB0aGlzLm1hY3JvID0gJ2hhc0FuZEJlbG9uZ3NUb01hbnknO1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSBfLmV4dGVuZCh7fSwgb3B0aW9ucyk7XG4gICAgXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMubW9kZWxOYW1lKSB7XG4gICAgICAgICAgICB0aGlzLm1vZGVsTmFtZSA9IG5ldyBWaWtpbmcuTW9kZWwuTmFtZSh0aGlzLm9wdGlvbnMubW9kZWxOYW1lKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMubW9kZWxOYW1lID0gbmV3IFZpa2luZy5Nb2RlbC5OYW1lKHRoaXMubmFtZS5zaW5ndWxhcml6ZSgpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuY29sbGVjdGlvbk5hbWUpIHtcbiAgICAgICAgICAgIHRoaXMuY29sbGVjdGlvbk5hbWUgPSB0aGlzLm9wdGlvbnMuQ29sbGVjdGlvbk5hbWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmNvbGxlY3Rpb25OYW1lID0gdGhpcy5tb2RlbE5hbWUuY29sbGVjdGlvbk5hbWU7XG4gICAgICAgIH1cblxuICAgIH1cbiAgICBcbn0pO1xuXG5leHBvcnQgZGVmYXVsdCBIYXNBbmRCZWxvbmdzVG9NYW55UmVmbGVjdGlvbjsiLCIvLyBDcmVhdGUgYSBtb2RlbCB3aXRoICthdHRyaWJ1dGVzKy4gT3B0aW9ucyBhcmUgdGhlIFxuLy8gc2FtZSBhcyBWaWtpbmcuTW9kZWwjc2F2ZVxuZXhwb3J0IGxldCBjcmVhdGUgPSBmdW5jdGlvbihhdHRyaWJ1dGVzLCBvcHRpb25zKSB7XG4gICAgbGV0IG1vZGVsID0gbmV3IHRoaXMoYXR0cmlidXRlcyk7XG4gICAgbW9kZWwuc2F2ZShudWxsLCBvcHRpb25zKTtcbiAgICByZXR1cm4gbW9kZWw7XG59O1xuXG4vLyBGaW5kIG1vZGVsIGJ5IGlkLiBBY2NlcHRzIHN1Y2Nlc3MgYW5kIGVycm9yIGNhbGxiYWNrcyBpbiB0aGUgb3B0aW9uc1xuLy8gaGFzaCwgd2hpY2ggYXJlIGJvdGggcGFzc2VkIChtb2RlbCwgcmVzcG9uc2UsIG9wdGlvbnMpIGFzIGFyZ3VtZW50cy5cbi8vXG4vLyBGaW5kIHJldHVybnMgdGhlIG1vZGVsLCBob3dldmVyIGl0IG1vc3QgbGlrZWx5IHdvbid0IGhhdmUgZmV0Y2hlZCB0aGVcbi8vIGRhdGFcdGZyb20gdGhlIHNlcnZlciBpZiB5b3UgaW1tZWRpYXRlbHkgdHJ5IHRvIHVzZSBhdHRyaWJ1dGVzIG9mIHRoZVxuLy8gbW9kZWwuXG5leHBvcnQgbGV0IGZpbmQgPSBmdW5jdGlvbihpZCwgb3B0aW9ucykge1xuICAgIGxldCBtb2RlbCA9IG5ldyB0aGlzKHtpZDogaWR9KTtcbiAgICBtb2RlbC5mZXRjaChvcHRpb25zKTtcbiAgICByZXR1cm4gbW9kZWw7XG59O1xuXG4vLyBGaW5kIG9yIGNyZWF0ZSBtb2RlbCBieSBhdHRyaWJ1dGVzLiBBY2NlcHRzIHN1Y2Nlc3MgY2FsbGJhY2tzIGluIHRoZVxuLy8gb3B0aW9ucyBoYXNoLCB3aGljaCBpcyBwYXNzZWQgKG1vZGVsKSBhcyBhcmd1bWVudHMuXG4vL1xuLy8gZmluZE9yQ3JlYXRlQnkgcmV0dXJucyB0aGUgbW9kZWwsIGhvd2V2ZXIgaXQgbW9zdCBsaWtlbHkgd29uJ3QgaGF2ZSBmZXRjaGVkXG4vLyB0aGUgZGF0YVx0ZnJvbSB0aGUgc2VydmVyIGlmIHlvdSBpbW1lZGlhdGVseSB0cnkgdG8gdXNlIGF0dHJpYnV0ZXMgb2YgdGhlXG4vLyBtb2RlbC5cbmV4cG9ydCBsZXQgZmluZE9yQ3JlYXRlQnkgPSBmdW5jdGlvbihhdHRyaWJ1dGVzLCBvcHRpb25zKSB7XG4gICAgbGV0IGtsYXNzID0gdGhpcztcbiAgICBrbGFzcy53aGVyZShhdHRyaWJ1dGVzKS5mZXRjaCh7XG4gICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uIChtb2RlbENvbGxlY3Rpb24pIHtcbiAgICAgICAgICAgIGxldCBtb2RlbCA9IG1vZGVsQ29sbGVjdGlvbi5tb2RlbHNbMF07XG4gICAgICAgICAgICBpZiAobW9kZWwpIHtcbiAgICAgICAgICAgICAgICBpZiAob3B0aW9ucyAmJiBvcHRpb25zLnN1Y2Nlc3MpIG9wdGlvbnMuc3VjY2Vzcyhtb2RlbCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGtsYXNzLmNyZWF0ZShhdHRyaWJ1dGVzLCBvcHRpb25zKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG5leHBvcnQgbGV0IHJlZmxlY3RPbkFzc29jaWF0aW9uID0gZnVuY3Rpb24obmFtZSkge1xuICAgIHJldHVybiB0aGlzLmFzc29jaWF0aW9uc1tuYW1lXTtcbn07XG5cbmV4cG9ydCBsZXQgcmVmbGVjdE9uQXNzb2NpYXRpb25zID0gZnVuY3Rpb24obWFjcm8pIHtcbiAgICBsZXQgYXNzb2NpYXRpb25zID0gXy52YWx1ZXModGhpcy5hc3NvY2lhdGlvbnMpO1xuICAgIGlmIChtYWNybykge1xuICAgICAgICBhc3NvY2lhdGlvbnMgPSBfLnNlbGVjdChhc3NvY2lhdGlvbnMsIGZ1bmN0aW9uKGEpIHtcbiAgICAgICAgICAgIHJldHVybiBhLm1hY3JvID09PSBtYWNybztcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGFzc29jaWF0aW9ucztcbn07XG5cbi8vIEdlbmVyYXRlcyB0aGUgYHVybFJvb3RgIGJhc2VkIG9mZiBvZiB0aGUgbW9kZWwgbmFtZS5cbmV4cG9ydCBsZXQgdXJsUm9vdCA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eSgndXJsUm9vdCcpKSB7XG4gICAgICAgIHJldHVybiBfLnJlc3VsdCh0aGlzLnByb3RvdHlwZSwgJ3VybFJvb3QnKVxuICAgIH0gZWxzZSBpZiAodGhpcy5iYXNlTW9kZWwucHJvdG90eXBlLmhhc093blByb3BlcnR5KCd1cmxSb290JykpIHtcbiAgICAgICAgcmV0dXJuIF8ucmVzdWx0KHRoaXMuYmFzZU1vZGVsLnByb3RvdHlwZSwgJ3VybFJvb3QnKVxuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBcIi9cIiArIHRoaXMuYmFzZU1vZGVsLm1vZGVsTmFtZS5wbHVyYWw7XG4gICAgfVxufTtcblxuLy8gUmV0dXJucyBhIHVuZmV0Y2hlZCBjb2xsZWN0aW9uIHdpdGggdGhlIHByZWRpY2F0ZSBzZXQgdG8gdGhlIHF1ZXJ5XG5leHBvcnQgbGV0IHdoZXJlID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICAgIC8vIFRPRE86IE1vdmUgdG8gbW9kZWxOYW1lIGFzIHdlbGw/XG4gICAgbGV0IENvbGxlY3Rpb24gPSAodGhpcy5tb2RlbE5hbWUubmFtZSArICdDb2xsZWN0aW9uJykuY29uc3RhbnRpemUoKTtcbiAgICBcbiAgICByZXR1cm4gbmV3IENvbGxlY3Rpb24odW5kZWZpbmVkLCB7cHJlZGljYXRlOiBvcHRpb25zfSk7XG59O1xuXG5leHBvcnQgbGV0IGFzc29jaWF0aW9ucyA9IFtdO1xuXG4vLyBPdmVyaWRlIHRoZSBkZWZhdWx0IGV4dGVuZCBtZXRob2QgdG8gc3VwcG9ydCBwYXNzaW5nIGluIHRoZSBtb2RlbE5hbWVcbi8vIGFuZCBzdXBwb3J0IFNUSVxuLy9cbi8vIFRoZSBtb2RlbE5hbWUgaXMgdXNlZCBmb3IgZ2VuZXJhdGluZyB1cmxzIGFuZCByZWxhdGlvbnNoaXBzLlxuLy9cbi8vIElmIGEgTW9kZWwgaXMgZXh0ZW5kZWQgZnVydGhlciBpcyBhY3RzIHNpbWxhciB0byBBY3RpdmVSZWNvcmRzIFNUSS5cbi8vXG4vLyBgbmFtZWAgaXMgb3B0aW9uYWwsIGFuZCBtdXN0IGJlIGEgc3RyaW5nXG5leHBvcnQgbGV0IGV4dGVuZCA9IGZ1bmN0aW9uKG5hbWUsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7XG4gICAgaWYodHlwZW9mIG5hbWUgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHN0YXRpY1Byb3BzID0gcHJvdG9Qcm9wcztcbiAgICAgICAgcHJvdG9Qcm9wcyA9IG5hbWU7XG4gICAgfVxuICAgIHByb3RvUHJvcHMgfHwgKHByb3RvUHJvcHMgPSB7fSk7XG5cbiAgICBsZXQgY2hpbGQgPSBCYWNrYm9uZS5Nb2RlbC5leHRlbmQuY2FsbCh0aGlzLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcyk7XG5cbiAgICBpZih0eXBlb2YgbmFtZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgY2hpbGQubW9kZWxOYW1lID0gbmV3IFZpa2luZy5Nb2RlbC5OYW1lKG5hbWUpO1xuICAgIH1cblxuICAgIGNoaWxkLmFzc29jaWF0aW9ucyA9IHt9O1xuICAgIGNoaWxkLmRlc2NlbmRhbnRzID0gW107XG4gICAgY2hpbGQuaW5oZXJpdGFuY2VBdHRyaWJ1dGUgPSAocHJvdG9Qcm9wcy5pbmhlcml0YW5jZUF0dHJpYnV0ZSA9PT0gdW5kZWZpbmVkKSA/IHRoaXMucHJvdG90eXBlLmluaGVyaXRhbmNlQXR0cmlidXRlIDogcHJvdG9Qcm9wcy5pbmhlcml0YW5jZUF0dHJpYnV0ZTtcblxuICAgIGlmIChjaGlsZC5pbmhlcml0YW5jZUF0dHJpYnV0ZSA9PT0gZmFsc2UgfHwgKHRoaXMucHJvdG90eXBlLmhhc093blByb3BlcnR5KCdhYnN0cmFjdCcpICYmIHRoaXMucHJvdG90eXBlLmFic3RyYWN0KSkge1xuICAgICAgICBjaGlsZC5iYXNlTW9kZWwgPSBjaGlsZDtcbiAgICB9IGVsc2Uge1xuICAgICAgICBjaGlsZC5iYXNlTW9kZWwuZGVzY2VuZGFudHMucHVzaChjaGlsZCk7XG4gICAgfVxuXG4gICAgWydiZWxvbmdzVG8nLCAnaGFzT25lJywgJ2hhc01hbnknLCAnaGFzQW5kQmVsb25nc1RvTWFueSddLmZvckVhY2goZnVuY3Rpb24obWFjcm8pIHtcbiAgICAgICAgKHByb3RvUHJvcHNbbWFjcm9dIHx8IFtdKS5jb25jYXQodGhpc1ttYWNyb10gfHwgW10pLmZvckVhY2goZnVuY3Rpb24obmFtZSkge1xuICAgICAgICAgICAgbGV0IG9wdGlvbnM7XG5cbiAgICAgICAgICAgIC8vIEhhbmRsZSBib3RoIGB0eXBlLCBrZXksIG9wdGlvbnNgIGFuZCBgdHlwZSwgW2tleSwgb3B0aW9uc11gIHN0eWxlIGFyZ3VtZW50c1xuICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkobmFtZSkpIHtcbiAgICAgICAgICAgICAgICBvcHRpb25zID0gbmFtZVsxXTtcbiAgICAgICAgICAgICAgICBuYW1lID0gbmFtZVswXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCFjaGlsZC5hc3NvY2lhdGlvbnNbbmFtZV0pIHtcbiAgICAgICAgICAgICAgICBsZXQgcmVmbGVjdGlvbkNsYXNzID0ge1xuICAgICAgICAgICAgICAgICAgICAnYmVsb25nc1RvJzogVmlraW5nLk1vZGVsLkJlbG9uZ3NUb1JlZmxlY3Rpb24sXG4gICAgICAgICAgICAgICAgICAgICdoYXNPbmUnOiBWaWtpbmcuTW9kZWwuSGFzT25lUmVmbGVjdGlvbixcbiAgICAgICAgICAgICAgICAgICAgJ2hhc01hbnknOiBWaWtpbmcuTW9kZWwuSGFzTWFueVJlZmxlY3Rpb24sXG4gICAgICAgICAgICAgICAgICAgICdoYXNBbmRCZWxvbmdzVG9NYW55JzogVmlraW5nLk1vZGVsLkhhc0FuZEJlbG9uZ3NUb01hbnlSZWZsZWN0aW9uXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJlZmxlY3Rpb25DbGFzcyA9IHJlZmxlY3Rpb25DbGFzc1ttYWNyb107XG5cbiAgICAgICAgICAgICAgICBjaGlsZC5hc3NvY2lhdGlvbnNbbmFtZV0gPSBuZXcgcmVmbGVjdGlvbkNsYXNzKG5hbWUsIG9wdGlvbnMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9LCB0aGlzLnByb3RvdHlwZSk7XG5cbiAgICBpZiAodGhpcy5wcm90b3R5cGUuc2NoZW1hICYmIHByb3RvUHJvcHMuc2NoZW1hKSB7XG4gICAgICAgIE9iamVjdC5rZXlzKHRoaXMucHJvdG90eXBlLnNjaGVtYSkuZm9yRWFjaCggKGtleSkgPT4ge1xuICAgICAgICAgICAgaWYoIWNoaWxkLnByb3RvdHlwZS5zY2hlbWFba2V5XSkge1xuICAgICAgICAgICAgICAgIGNoaWxkLnByb3RvdHlwZS5zY2hlbWFba2V5XSA9IHRoaXMucHJvdG90eXBlLnNjaGVtYVtrZXldO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gY2hpbGQ7XG59O1xuIiwiaW1wb3J0IE5hbWUgZnJvbSAnLi9tb2RlbC9uYW1lJztcbmltcG9ydCBUeXBlIGZyb20gJy4vbW9kZWwvdHlwZSc7XG5pbXBvcnQgUmVmbGVjdGlvbiBmcm9tICcuL21vZGVsL3JlZmxlY3Rpb24nO1xuaW1wb3J0IEhhc09uZVJlZmxlY3Rpb24gZnJvbSAnLi9tb2RlbC9yZWZsZWN0aW9ucy9oYXNfb25lX3JlZmxlY3Rpb24nO1xuaW1wb3J0IEhhc01hbnlSZWZsZWN0aW9uIGZyb20gJy4vbW9kZWwvcmVmbGVjdGlvbnMvaGFzX21hbnlfcmVmbGVjdGlvbic7XG5pbXBvcnQgQmVsb25nc1RvUmVmbGVjdGlvbiBmcm9tICcuL21vZGVsL3JlZmxlY3Rpb25zL2JlbG9uZ3NfdG9fcmVmbGVjdGlvbic7XG5pbXBvcnQgSGFzQW5kQmVsb25nc1RvTWFueVJlZmxlY3Rpb24gZnJvbSAnLi9tb2RlbC9yZWZsZWN0aW9ucy9oYXNfYW5kX2JlbG9uZ3NfdG9fbWFueV9yZWZsZWN0aW9uJztcblxuaW1wb3J0ICogYXMgY2xhc3NQcm9wZXJ0aWVzIGZyb20gJy4vbW9kZWwvY2xhc3NfcHJvcGVydGllcyc7XG5cbi8vPSByZXF1aXJlX3RyZWUgLi9tb2RlbC9pbnN0YW5jZV9wcm9wZXJ0aWVzXG5cblxuLy8gVmlraW5nLk1vZGVsXG4vLyAtLS0tLS0tLS0tLS1cbi8vXG4vLyBWaWtpbmcuTW9kZWwgaXMgYW4gZXh0ZW5zaW9uIG9mIFtCYWNrYm9uZS5Nb2RlbF0oaHR0cDovL2JhY2tib25lanMub3JnLyNNb2RlbCkuXG4vLyBJdCBhZGRzIG5hbWluZywgcmVsYXRpb25zaGlwcywgZGF0YSB0eXBlIGNvZXJjaW9ucywgc2VsZWN0aW9uLCBhbmQgbW9kaWZpZXNcbi8vIHN5bmMgdG8gd29yayB3aXRoIFtSdWJ5IG9uIFJhaWxzXShodHRwOi8vcnVieW9ucmFpbHMub3JnLykgb3V0IG9mIHRoZSBib3guXG5jb25zdCBNb2RlbCA9IEJhY2tib25lLk1vZGVsLmV4dGVuZCh7XG5cbiAgICBhYnN0cmFjdDogdHJ1ZSxcblxuICAgIC8vIGluaGVyaXRhbmNlQXR0cmlidXRlIGlzIHRoZSBhdHRpcmJ1dGUgdXNlZCBmb3IgU1RJXG4gICAgaW5oZXJpdGFuY2VBdHRyaWJ1dGU6ICd0eXBlJyxcblxuICAgIGRlZmF1bHRzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGxldCBkZmx0cyA9IHt9O1xuXG4gICAgICAgIGlmICh0eXBlb2YodGhpcy5zY2hlbWEpID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgcmV0dXJuIGRmbHRzO1xuICAgICAgICB9XG5cbiAgICAgICAgT2JqZWN0LmtleXModGhpcy5zY2hlbWEpLmZvckVhY2goIChrZXkpID0+IHtcbiAgICAgICAgICAgIGlmICh0aGlzLnNjaGVtYVtrZXldWydkZWZhdWx0J10pIHtcbiAgICAgICAgICAgICAgICBkZmx0c1trZXldID0gdGhpcy5zY2hlbWFba2V5XVsnZGVmYXVsdCddO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gZGZsdHM7XG4gICAgfSxcblxuICAgIC8vIEJlbG93IGlzIHRoZSBzYW1lIGNvZGUgZnJvbSB0aGUgQmFja2JvbmUuTW9kZWwgZnVuY3Rpb25cbiAgICAvLyBleGNlcHQgd2hlcmUgdGhlcmUgYXJlIGNvbW1lbnRzXG4gICAgY29uc3RydWN0b3I6IGZ1bmN0aW9uIChhdHRyaWJ1dGVzLCBvcHRpb25zKSB7XG4gICAgICAgIGxldCBhdHRycyA9IGF0dHJpYnV0ZXMgfHwge307XG4gICAgICAgIG9wdGlvbnMgfHwgKG9wdGlvbnMgPSB7fSk7XG4gICAgICAgIHRoaXMuY2lkID0gXy51bmlxdWVJZCgnYycpO1xuICAgICAgICB0aGlzLmF0dHJpYnV0ZXMgPSB7fTtcblxuICAgICAgICBhdHRycyA9IF8uZGVmYXVsdHMoe30sIGF0dHJzLCBfLnJlc3VsdCh0aGlzLCAnZGVmYXVsdHMnKSk7XG5cbiAgICAgICAgaWYgKHRoaXMuaW5oZXJpdGFuY2VBdHRyaWJ1dGUpIHtcbiAgICAgICAgICAgIGlmIChhdHRyc1t0aGlzLmluaGVyaXRhbmNlQXR0cmlidXRlXSAmJiB0aGlzLmNvbnN0cnVjdG9yLm1vZGVsTmFtZS5uYW1lICE9PSBhdHRyc1t0aGlzLmluaGVyaXRhbmNlQXR0cmlidXRlXSkge1xuICAgICAgICAgICAgICAgIC8vIE9QVElNSVpFOiAgTXV0YXRpbmcgdGhlIFtbUHJvdG90eXBlXV0gb2YgYW4gb2JqZWN0LCBubyBtYXR0ZXIgaG93XG4gICAgICAgICAgICAgICAgLy8gdGhpcyBpcyBhY2NvbXBsaXNoZWQsIGlzIHN0cm9uZ2x5IGRpc2NvdXJhZ2VkLCBiZWNhdXNlIGl0IGlzIHZlcnlcbiAgICAgICAgICAgICAgICAvLyBzbG93IGFuZCB1bmF2b2lkYWJseSBzbG93cyBkb3duIHN1YnNlcXVlbnQgZXhlY3V0aW9uIGluIG1vZGVyblxuICAgICAgICAgICAgICAgIC8vIEphdmFTY3JpcHQgaW1wbGVtZW50YXRpb25zXG4gICAgICAgICAgICAgICAgLy8gSWRlYXM6IE1vdmUgdG8gTW9kZWwubmV3KC4uLikgbWV0aG9kIG9mIGluaXRpYWxpemluZyBtb2RlbHNcbiAgICAgICAgICAgICAgICBsZXQgdHlwZSA9IGF0dHJzW3RoaXMuaW5oZXJpdGFuY2VBdHRyaWJ1dGVdLmNhbWVsaXplKCkuY29uc3RhbnRpemUoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbnN0cnVjdG9yID0gdHlwZTtcbiAgICAgICAgICAgICAgICB0aGlzLl9fcHJvdG9fXyA9IHR5cGUucHJvdG90eXBlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gQWRkIGEgaGVscGVyIHJlZmVyZW5jZSB0byBnZXQgdGhlIG1vZGVsIG5hbWUgZnJvbSBhbiBtb2RlbCBpbnN0YW5jZS5cbiAgICAgICAgdGhpcy5tb2RlbE5hbWUgPSB0aGlzLmNvbnN0cnVjdG9yLm1vZGVsTmFtZTtcbiAgICAgICAgdGhpcy5iYXNlTW9kZWwgPSB0aGlzLmNvbnN0cnVjdG9yLmJhc2VNb2RlbDtcblxuICAgICAgICBpZiAodGhpcy5iYXNlTW9kZWwgJiYgdGhpcy5tb2RlbE5hbWUgJiYgdGhpcy5pbmhlcml0YW5jZUF0dHJpYnV0ZSkge1xuICAgICAgICAgICAgaWYgKHRoaXMuYmFzZU1vZGVsID09PSB0aGlzLmNvbnN0cnVjdG9yICYmIHRoaXMuYmFzZU1vZGVsLmRlc2NlbmRhbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBhdHRyc1t0aGlzLmluaGVyaXRhbmNlQXR0cmlidXRlXSA9IHRoaXMubW9kZWxOYW1lLm5hbWU7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKF8uY29udGFpbnModGhpcy5iYXNlTW9kZWwuZGVzY2VuZGFudHMsIHRoaXMuY29uc3RydWN0b3IpKSB7XG4gICAgICAgICAgICAgICAgYXR0cnNbdGhpcy5pbmhlcml0YW5jZUF0dHJpYnV0ZV0gPSB0aGlzLm1vZGVsTmFtZS5uYW1lO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gU2V0IHVwIGFzc29jaWF0aW9uc1xuICAgICAgICB0aGlzLmFzc29jaWF0aW9ucyA9IHRoaXMuY29uc3RydWN0b3IuYXNzb2NpYXRpb25zO1xuICAgICAgICB0aGlzLnJlZmxlY3RPbkFzc29jaWF0aW9uID0gdGhpcy5jb25zdHJ1Y3Rvci5yZWZsZWN0T25Bc3NvY2lhdGlvbjtcbiAgICAgICAgdGhpcy5yZWZsZWN0T25Bc3NvY2lhdGlvbnMgPSB0aGlzLmNvbnN0cnVjdG9yLnJlZmxlY3RPbkFzc29jaWF0aW9ucztcblxuICAgICAgICAvLyBJbml0aWFsaXplIGFueSBgaGFzTWFueWAgcmVsYXRpb25zaGlwcyB0byBlbXB0eSBjb2xsZWN0aW9uc1xuICAgICAgICB0aGlzLnJlZmxlY3RPbkFzc29jaWF0aW9ucygnaGFzTWFueScpLmZvckVhY2goZnVuY3Rpb24oYXNzb2NpYXRpb24pIHtcbiAgICAgICAgICAgIHRoaXMuYXR0cmlidXRlc1thc3NvY2lhdGlvbi5uYW1lXSA9IG5ldyAoYXNzb2NpYXRpb24uY29sbGVjdGlvbigpKSgpO1xuICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICBpZiAob3B0aW9ucy5jb2xsZWN0aW9uKSB7IHRoaXMuY29sbGVjdGlvbiA9IG9wdGlvbnMuY29sbGVjdGlvbjsgfVxuICAgICAgICBpZiAob3B0aW9ucy5wYXJzZSkgeyBhdHRycyA9IHRoaXMucGFyc2UoYXR0cnMsIG9wdGlvbnMpIHx8IHt9OyB9XG5cbiAgICAgICAgdGhpcy5zZXQoYXR0cnMsIG9wdGlvbnMpO1xuICAgICAgICB0aGlzLmNoYW5nZWQgPSB7fTtcbiAgICAgICAgdGhpcy5pbml0aWFsaXplLmNhbGwodGhpcywgYXR0cmlidXRlcywgb3B0aW9ucyk7XG4gICAgfVxuXG59LCBjbGFzc1Byb3BlcnRpZXMpO1xuXG5Nb2RlbC5OYW1lID0gTmFtZTtcbk1vZGVsLlR5cGUgPSBUeXBlO1xuTW9kZWwuUmVmbGVjdGlvbiA9IFJlZmxlY3Rpb247XG5Nb2RlbC5IYXNPbmVSZWZsZWN0aW9uID0gSGFzT25lUmVmbGVjdGlvbjtcbk1vZGVsLkhhc01hbnlSZWZsZWN0aW9uICA9IEhhc01hbnlSZWZsZWN0aW9uO1xuTW9kZWwuQmVsb25nc1RvUmVmbGVjdGlvbiA9IEJlbG9uZ3NUb1JlZmxlY3Rpb247XG5Nb2RlbC5IYXNBbmRCZWxvbmdzVG9NYW55UmVmbGVjdGlvbiA9IEhhc0FuZEJlbG9uZ3NUb01hbnlSZWZsZWN0aW9uO1xuXG5leHBvcnQgZGVmYXVsdCBNb2RlbDsiLCIvLyBWaWtpbmcuanMgPCU9IHZlcnNpb24gJT4gKHNoYTo8JT0gZ2l0X2luZm9bOmhlYWRdWzpzaGFdICU+KVxuLy8gXG4vLyAoYykgMjAxMi08JT0gVGltZS5ub3cueWVhciAlPiBKb25hdGhhbiBCcmFjeSwgNDJGbG9vcnMgSW5jLlxuLy8gVmlraW5nLmpzIG1heSBiZSBmcmVlbHkgZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlLlxuLy8gaHR0cDovL3Zpa2luZ2pzLmNvbVxuXG5pbXBvcnQgJy4vdmlraW5nL3N1cHBvcnQnO1xuaW1wb3J0IE1vZGVsIGZyb20gJy4vdmlraW5nL21vZGVsJztcblxuY29uc3QgVmlraW5nID0ge1xuICAgIE1vZGVsOiBNb2RlbCxcbn07XG5cbmV4cG9ydCBkZWZhdWx0IFZpa2luZztcbiJdLCJuYW1lcyI6WyJIYXNNYW55UmVmbGVjdGlvbiIsIkJlbG9uZ3NUb1JlZmxlY3Rpb24iLCJIYXNBbmRCZWxvbmdzVG9NYW55UmVmbGVjdGlvbiIsIlZpa2luZyJdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFFQSxFQUFBLE9BQU8sY0FBUCxDQUFzQixNQUFNLFNBQTVCLEVBQXVDLFNBQXZDLEVBQWtEO0FBQzlDLEVBQUEsV0FBTyxpQkFBWTtBQUFFLEVBQUEsZUFBTyxLQUFLLEdBQUwsQ0FBUyxVQUFDLENBQUQ7QUFBQSxFQUFBLG1CQUFPLEVBQUUsT0FBRixFQUFQO0FBQUEsRUFBQSxTQUFULEVBQTZCLElBQTdCLENBQWtDLEdBQWxDLENBQVA7QUFBZ0QsRUFBQSxLQUR2QjtBQUU5QyxFQUFBLGNBQVUsSUFGb0M7QUFH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