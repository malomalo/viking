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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjpudWxsLCJzb3VyY2VzIjpbIi9Vc2Vycy93YXJhdHVtYW4vc3JjL3Zpa2luZy9saWIvdmlraW5nL3N1cHBvcnQvYXJyYXkuanMiLCIvVXNlcnMvd2FyYXR1bWFuL3NyYy92aWtpbmcvbGliL3Zpa2luZy9zdXBwb3J0L2Jvb2xlYW4uanMiLCIvVXNlcnMvd2FyYXR1bWFuL3NyYy92aWtpbmcvbGliL3Zpa2luZy9zdXBwb3J0L2RhdGUuanMiLCIvVXNlcnMvd2FyYXR1bWFuL3NyYy92aWtpbmcvbGliL3Zpa2luZy9zdXBwb3J0L251bWJlci5qcyIsIi9Vc2Vycy93YXJhdHVtYW4vc3JjL3Zpa2luZy9saWIvdmlraW5nL3N1cHBvcnQvb2JqZWN0LmpzIiwiL1VzZXJzL3dhcmF0dW1hbi9zcmMvdmlraW5nL2xpYi92aWtpbmcvc3VwcG9ydC9zdHJpbmcuanMiLCIvVXNlcnMvd2FyYXR1bWFuL3NyYy92aWtpbmcvbGliL3Zpa2luZy9tb2RlbC9uYW1lLmpzIiwiX19iYWJlbEhlbHBlcnNfXyIsIi9Vc2Vycy93YXJhdHVtYW4vc3JjL3Zpa2luZy9saWIvdmlraW5nL21vZGVsL3R5cGUvZGF0ZS5qcyIsIi9Vc2Vycy93YXJhdHVtYW4vc3JjL3Zpa2luZy9saWIvdmlraW5nL21vZGVsL3R5cGUvanNvbi5qcyIsIi9Vc2Vycy93YXJhdHVtYW4vc3JjL3Zpa2luZy9saWIvdmlraW5nL21vZGVsL3R5cGUvbnVtYmVyLmpzIiwiL1VzZXJzL3dhcmF0dW1hbi9zcmMvdmlraW5nL2xpYi92aWtpbmcvbW9kZWwvdHlwZS9zdHJpbmcuanMiLCIvVXNlcnMvd2FyYXR1bWFuL3NyYy92aWtpbmcvbGliL3Zpa2luZy9tb2RlbC90eXBlL2Jvb2xlYW4uanMiLCIvVXNlcnMvd2FyYXR1bWFuL3NyYy92aWtpbmcvbGliL3Zpa2luZy9tb2RlbC90eXBlLmpzIiwiL1VzZXJzL3dhcmF0dW1hbi9zcmMvdmlraW5nL2xpYi92aWtpbmcvbW9kZWwvcmVmbGVjdGlvbi5qcyIsIi9Vc2Vycy93YXJhdHVtYW4vc3JjL3Zpa2luZy9saWIvdmlraW5nL21vZGVsL3JlZmxlY3Rpb25zL2hhc19vbmVfcmVmbGVjdGlvbi5qcyIsIi9Vc2Vycy93YXJhdHVtYW4vc3JjL3Zpa2luZy9saWIvdmlraW5nL21vZGVsL3JlZmxlY3Rpb25zL2hhc19tYW55X3JlZmxlY3Rpb24uanMiLCIvVXNlcnMvd2FyYXR1bWFuL3NyYy92aWtpbmcvbGliL3Zpa2luZy9tb2RlbC9yZWZsZWN0aW9ucy9iZWxvbmdzX3RvX3JlZmxlY3Rpb24uanMiLCIvVXNlcnMvd2FyYXR1bWFuL3NyYy92aWtpbmcvbGliL3Zpa2luZy9tb2RlbC9yZWZsZWN0aW9ucy9oYXNfYW5kX2JlbG9uZ3NfdG9fbWFueV9yZWZsZWN0aW9uLmpzIiwiL1VzZXJzL3dhcmF0dW1hbi9zcmMvdmlraW5nL2xpYi92aWtpbmcvbW9kZWwvY2xhc3NfcHJvcGVydGllcy5qcyIsIi9Vc2Vycy93YXJhdHVtYW4vc3JjL3Zpa2luZy9saWIvdmlraW5nL21vZGVsLmpzIiwiL1VzZXJzL3dhcmF0dW1hbi9zcmMvdmlraW5nL2xpYi92aWtpbmcuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ2FsbHMgYHRvX3BhcmFtYCBvbiBhbGwgaXRzIGVsZW1lbnRzIGFuZCBqb2lucyB0aGUgcmVzdWx0IHdpdGggc2xhc2hlcy5cbi8vIFRoaXMgaXMgdXNlZCBieSB1cmxfZm9yIGluIFZpa2luZyBQYWNrLlxuT2JqZWN0LmRlZmluZVByb3BlcnR5KEFycmF5LnByb3RvdHlwZSwgJ3RvUGFyYW0nLCB7XG4gICAgdmFsdWU6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMubWFwKChlKSA9PiBlLnRvUGFyYW0oKSkuam9pbignLycpOyB9LFxuICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgIGNvbmZpZ3VyZWFibGU6IHRydWUsXG4gICAgZW51bWVyYWJsZTogZmFsc2Vcbn0pO1xuXG4vLyBDb252ZXJ0cyBhbiBhcnJheSBpbnRvIGEgc3RyaW5nIHN1aXRhYmxlIGZvciB1c2UgYXMgYSBVUkwgcXVlcnkgc3RyaW5nLFxuLy8gdXNpbmcgdGhlIGdpdmVuIGtleSBhcyB0aGUgcGFyYW0gbmFtZS5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShBcnJheS5wcm90b3R5cGUsICd0b1F1ZXJ5Jywge1xuICAgIHZhbHVlOiBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgIGxldCBwcmVmaXggPSBrZXkgKyBcIltdXCI7XG4gICAgICAgIHJldHVybiB0aGlzLm1hcChmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBlc2NhcGUocHJlZml4KSArICc9JztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB2YWx1ZS50b1F1ZXJ5KHByZWZpeCk7XG4gICAgICAgIH0pLmpvaW4oJyYnKTtcbiAgICB9LFxuICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgIGNvbmZpZ3VyZWFibGU6IHRydWUsXG4gICAgZW51bWVyYWJsZTogZmFsc2Vcbn0pO1xuIiwiLy8gQWxpYXMgb2YgdG9fcy5cbkJvb2xlYW4ucHJvdG90eXBlLnRvUGFyYW0gPSBCb29sZWFuLnByb3RvdHlwZS50b1N0cmluZztcblxuQm9vbGVhbi5wcm90b3R5cGUudG9RdWVyeSA9IGZ1bmN0aW9uKGtleSkge1xuICAgIHJldHVybiBlc2NhcGUoa2V5LnRvUGFyYW0oKSkgKyBcIj1cIiArIGVzY2FwZSh0aGlzLnRvUGFyYW0oKSk7XG59OyIsIi8vIHN0cmZ0aW1lIHJlbGllcyBvbiBodHRwczovL2dpdGh1Yi5jb20vc2Ftc29uanMvc3RyZnRpbWUuIEl0IHN1cHBvcnRzXG4vLyBzdGFuZGFyZCBzcGVjaWZpZXJzIGZyb20gQyBhcyB3ZWxsIGFzIHNvbWUgb3RoZXIgZXh0ZW5zaW9ucyBmcm9tIFJ1YnkuXG5EYXRlLnByb3RvdHlwZS5zdHJmdGltZSA9IGZ1bmN0aW9uKGZvcm1hdCkge1xuICAgIHJldHVybiBzdHJmdGltZShmb3JtYXQsIHRoaXMpO1xufTtcblxuRGF0ZS5mcm9tSVNPID0gKHMpID0+IG5ldyBEYXRlKHMpO1xuXG4vLyBBbGlhcyBvZiB0b19zLlxuRGF0ZS5wcm90b3R5cGUudG9QYXJhbSA9IERhdGUucHJvdG90eXBlLnRvSlNPTjtcblxuRGF0ZS5wcm90b3R5cGUudG9RdWVyeSA9IGZ1bmN0aW9uKGtleSkge1xuICAgIHJldHVybiBlc2NhcGUoa2V5LnRvUGFyYW0oKSkgKyBcIj1cIiArIGVzY2FwZSh0aGlzLnRvUGFyYW0oKSk7XG59O1xuXG5EYXRlLnByb3RvdHlwZS50b2RheSA9ICgpID0+IG5ldyBEYXRlKCk7XG5cbkRhdGUucHJvdG90eXBlLmlzVG9kYXkgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gKHRoaXMuZ2V0VVRDRnVsbFllYXIoKSA9PT0gKG5ldyBEYXRlKCkpLmdldFVUQ0Z1bGxZZWFyKCkgJiYgdGhpcy5nZXRVVENNb250aCgpID09PSAobmV3IERhdGUoKSkuZ2V0VVRDTW9udGgoKSAmJiB0aGlzLmdldFVUQ0RhdGUoKSA9PT0gKG5ldyBEYXRlKCkpLmdldFVUQ0RhdGUoKSk7XG59O1xuXG5EYXRlLnByb3RvdHlwZS5pc1RoaXNNb250aCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gKHRoaXMuZ2V0VVRDRnVsbFllYXIoKSA9PT0gKG5ldyBEYXRlKCkpLmdldFVUQ0Z1bGxZZWFyKCkgJiYgdGhpcy5nZXRVVENNb250aCgpID09PSAobmV3IERhdGUoKSkuZ2V0VVRDTW9udGgoKSk7XG59XG5cbkRhdGUucHJvdG90eXBlLmlzVGhpc1llYXIgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gKHRoaXMuZ2V0VVRDRnVsbFllYXIoKSA9PT0gKG5ldyBEYXRlKCkpLmdldFVUQ0Z1bGxZZWFyKCkpO1xufTtcblxuXG5EYXRlLnByb3RvdHlwZS5wYXN0ID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAodGhpcyA8IChuZXcgRGF0ZSgpKSk7XG59IiwiLy8gb3JkaW5hbGl6ZSByZXR1cm5zIHRoZSBvcmRpbmFsIHN0cmluZyBjb3JyZXNwb25kaW5nIHRvIGludGVnZXI6XG4vL1xuLy8gICAgICgxKS5vcmRpbmFsaXplKCkgICAgLy8gPT4gJzFzdCdcbi8vICAgICAoMikub3JkaW5hbGl6ZSgpICAgIC8vID0+ICcybmQnXG4vLyAgICAgKDUzKS5vcmRpbmFsaXplKCkgICAvLyA9PiAnNTNyZCdcbi8vICAgICAoMjAwOSkub3JkaW5hbGl6ZSgpIC8vID0+ICcyMDA5dGgnXG4vLyAgICAgKC0xMzQpLm9yZGluYWxpemUoKSAvLyA9PiAnLTEzNHRoJ1xuTnVtYmVyLnByb3RvdHlwZS5vcmRpbmFsaXplID0gZnVuY3Rpb24oKSB7XG4gICAgbGV0IGFicyA9IE1hdGguYWJzKHRoaXMpO1xuICAgIFxuICAgIGlmIChhYnMgJSAxMDAgPj0gMTEgJiYgYWJzICUgMTAwIDw9IDEzKSB7XG4gICAgICAgIHJldHVybiB0aGlzICsgJ3RoJztcbiAgICB9XG4gICAgXG4gICAgYWJzID0gYWJzICUgMTA7XG4gICAgaWYgKGFicyA9PT0gMSkgeyByZXR1cm4gdGhpcyArICdzdCc7IH1cbiAgICBpZiAoYWJzID09PSAyKSB7IHJldHVybiB0aGlzICsgJ25kJzsgfVxuICAgIGlmIChhYnMgPT09IDMpIHsgcmV0dXJuIHRoaXMgKyAncmQnOyB9XG4gICAgXG4gICAgcmV0dXJuIHRoaXMgKyAndGgnO1xufTtcblxuLy8gQWxpYXMgb2YgdG9fcy5cbk51bWJlci5wcm90b3R5cGUudG9QYXJhbSA9IE51bWJlci5wcm90b3R5cGUudG9TdHJpbmc7XG5cbk51bWJlci5wcm90b3R5cGUudG9RdWVyeSA9IGZ1bmN0aW9uKGtleSkge1xuICAgIHJldHVybiBlc2NhcGUoa2V5LnRvUGFyYW0oKSkgKyBcIj1cIiArIGVzY2FwZSh0aGlzLnRvUGFyYW0oKSk7XG59O1xuXG5OdW1iZXIucHJvdG90eXBlLnNlY29uZCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzICogMTAwMDtcbn07XG5cbk51bWJlci5wcm90b3R5cGUuc2Vjb25kcyA9IE51bWJlci5wcm90b3R5cGUuc2Vjb25kO1xuXG5OdW1iZXIucHJvdG90eXBlLm1pbnV0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzICogNjAwMDA7XG59O1xuXG5OdW1iZXIucHJvdG90eXBlLm1pbnV0ZXMgPSBOdW1iZXIucHJvdG90eXBlLm1pbnV0ZTtcblxuTnVtYmVyLnByb3RvdHlwZS5ob3VyID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMgKiAzNjAwMDAwO1xufTtcblxuTnVtYmVyLnByb3RvdHlwZS5ob3VycyA9IE51bWJlci5wcm90b3R5cGUuaG91cjtcblxuTnVtYmVyLnByb3RvdHlwZS5kYXkgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcyAqIDg2NDAwMDAwO1xufTtcblxuTnVtYmVyLnByb3RvdHlwZS5kYXlzID0gTnVtYmVyLnByb3RvdHlwZS5kYXk7XG5cbk51bWJlci5wcm90b3R5cGUud2VlayA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzICogNyAqIDg2NDAwMDAwO1xufTtcblxuTnVtYmVyLnByb3RvdHlwZS53ZWVrcyA9IE51bWJlci5wcm90b3R5cGUud2VlaztcblxuTnVtYmVyLnByb3RvdHlwZS5hZ28gPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IERhdGUoKG5ldyBEYXRlKCkpLmdldFRpbWUoKSAtIHRoaXMpO1xufTtcblxuTnVtYmVyLnByb3RvdHlwZS5mcm9tTm93ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIG5ldyBEYXRlKChuZXcgRGF0ZSgpKS5nZXRUaW1lKCkgKyB0aGlzKTtcbn07XG4iLCIvLyBSZXR1cm5zIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSByZWNlaXZlciBzdWl0YWJsZSBmb3IgdXNlIGFzIGEgVVJMXG4vLyBxdWVyeSBzdHJpbmc6XG4vLyBcbi8vIHtuYW1lOiAnRGF2aWQnLCBuYXRpb25hbGl0eTogJ0RhbmlzaCd9LnRvUGFyYW0oKVxuLy8gLy8gPT4gXCJuYW1lPURhdmlkJm5hdGlvbmFsaXR5PURhbmlzaFwiXG4vLyBBbiBvcHRpb25hbCBuYW1lc3BhY2UgY2FuIGJlIHBhc3NlZCB0byBlbmNsb3NlIHRoZSBwYXJhbSBuYW1lczpcbi8vIFxuLy8ge25hbWU6ICdEYXZpZCcsIG5hdGlvbmFsaXR5OiAnRGFuaXNoJ30udG9QYXJhbSgndXNlcicpXG4vLyAvLyA9PiBcInVzZXJbbmFtZV09RGF2aWQmdXNlcltuYXRpb25hbGl0eV09RGFuaXNoXCJcbi8vXG4vLyBUaGUgc3RyaW5nIHBhaXJzIFwia2V5PXZhbHVlXCIgdGhhdCBjb25mb3JtIHRoZSBxdWVyeSBzdHJpbmcgYXJlIHNvcnRlZFxuLy8gbGV4aWNvZ3JhcGhpY2FsbHkgaW4gYXNjZW5kaW5nIG9yZGVyLlxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE9iamVjdC5wcm90b3R5cGUsICd0b1BhcmFtJywge1xuICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgIGNvbmZpZ3VyZWFibGU6IHRydWUsXG4gICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgdmFsdWU6IGZ1bmN0aW9uKG5hbWVzcGFjZSkge1xuICAgICAgICByZXR1cm4gT2JqZWN0LmtleXModGhpcykubWFwKChrZXkpID0+IHtcbiAgICAgICAgICAgIGxldCB2YWx1ZSA9IHRoaXNba2V5XTtcbiAgICAgICAgICAgIGxldCBuYW1lc3BhY2VXaXRoS2V5ID0gKG5hbWVzcGFjZSA/IChuYW1lc3BhY2UgKyBcIltcIiArIGtleSArIFwiXVwiKSA6IGtleSk7XG5cbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGVzY2FwZShuYW1lc3BhY2VXaXRoS2V5KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlLnRvUXVlcnkobmFtZXNwYWNlV2l0aEtleSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pLmpvaW4oJyYnKTtcbiAgICB9XG59KTtcblxuLy8gQ29udmVydHMgYW4gb2JqZWN0IGludG8gYSBzdHJpbmcgc3VpdGFibGUgZm9yIHVzZSBhcyBhIFVSTCBxdWVyeSBzdHJpbmcsXG4vLyB1c2luZyB0aGUgZ2l2ZW4ga2V5IGFzIHRoZSBwYXJhbSBuYW1lLlxuLy9cbi8vIE5vdGU6IFRoaXMgbWV0aG9kIGlzIGRlZmluZWQgYXMgYSBkZWZhdWx0IGltcGxlbWVudGF0aW9uIGZvciBhbGwgT2JqZWN0cyBmb3Jcbi8vIE9iamVjdCN0b1F1ZXJ5IHRvIHdvcmsuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoT2JqZWN0LnByb3RvdHlwZSwgJ3RvUXVlcnknLCB7XG4gICAgd3JpdGFibGU6IHRydWUsXG4gICAgY29uZmlndXJlYWJsZTogdHJ1ZSxcbiAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICB2YWx1ZTogT2JqZWN0LnByb3RvdHlwZS50b1BhcmFtXG59KTsiLCIvLyBDb252ZXJ0cyB0aGUgZmlyc3QgY2hhcmFjdGVyIHRvIHVwcGVyY2FzZVxuU3RyaW5nLnByb3RvdHlwZS5jYXBpdGFsaXplID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyB0aGlzLnNsaWNlKDEpO1xufTtcblxuLy8gQ29udmVydHMgdGhlIGZpcnN0IGNoYXJhY3RlciB0byBsb3dlcmNhc2VcblN0cmluZy5wcm90b3R5cGUuYW50aWNhcGl0YWxpemUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5jaGFyQXQoMCkudG9Mb3dlckNhc2UoKSArIHRoaXMuc2xpY2UoMSk7XG59O1xuXG4vLyBDYXBpdGFsaXplcyBhbGwgdGhlIHdvcmRzIGFuZCByZXBsYWNlcyBzb21lIGNoYXJhY3RlcnMgaW4gdGhlIHN0cmluZyB0b1xuLy8gY3JlYXRlIGEgbmljZXIgbG9va2luZyB0aXRsZS4gdGl0bGVpemUgaXMgbWVhbnQgZm9yIGNyZWF0aW5nIHByZXR0eSBvdXRwdXQuXG5TdHJpbmcucHJvdG90eXBlLnRpdGxlaXplID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMudW5kZXJzY29yZSgpLmh1bWFuaXplKCkucmVwbGFjZSgvXFxiKCc/W2Etel0pL2csIGZ1bmN0aW9uKG0peyByZXR1cm4gbS50b1VwcGVyQ2FzZSgpOyB9KTtcbn07XG5cbi8vIENhcGl0YWxpemVzIHRoZSBmaXJzdCB3b3JkIGFuZCB0dXJucyB1bmRlcnNjb3JlcyBpbnRvIHNwYWNlcyBhbmQgc3RyaXBzIGFcbi8vIHRyYWlsaW5nIFwiX2lkXCIsIGlmIGFueS4gTGlrZSB0aXRsZWl6ZSwgdGhpcyBpcyBtZWFudCBmb3IgY3JlYXRpbmcgcHJldHR5IG91dHB1dC5cblN0cmluZy5wcm90b3R5cGUuaHVtYW5pemUgPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgcmVzdWx0ID0gdGhpcy50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoL19pZCQvLCAnJykucmVwbGFjZSgvXy9nLCAnICcpO1xuICAgIHJlc3VsdCA9IHJlc3VsdC5yZXBsYWNlKC8oW2EtelxcZF0qKS9nLCBmdW5jdGlvbihtKSB7IHJldHVybiBtLnRvTG93ZXJDYXNlKCk7IH0pO1xuICAgIHJldHVybiByZXN1bHQuY2FwaXRhbGl6ZSgpO1xufTtcblxuLy8gTWFrZXMgYW4gdW5kZXJzY29yZWQsIGxvd2VyY2FzZSBmb3JtIGZyb20gdGhlIGV4cHJlc3Npb24gaW4gdGhlIHN0cmluZy5cbi8vXG4vLyBDaGFuZ2VzICcuJyB0byAnLycgdG8gY29udmVydCBuYW1lc3BhY2VzIHRvIHBhdGhzLlxuLy9cbi8vIEV4YW1wbGVzOlxuLy8gXG4vLyAgICAgXCJBY3RpdmVNb2RlbFwiLnVuZGVyc2NvcmUgICAgICAgICAjID0+IFwiYWN0aXZlX21vZGVsXCJcbi8vICAgICBcIkFjdGl2ZU1vZGVsLkVycm9yc1wiLnVuZGVyc2NvcmUgIyA9PiBcImFjdGl2ZV9tb2RlbC9lcnJvcnNcIlxuLy9cbi8vIEFzIGEgcnVsZSBvZiB0aHVtYiB5b3UgY2FuIHRoaW5rIG9mIHVuZGVyc2NvcmUgYXMgdGhlIGludmVyc2Ugb2YgY2FtZWxpemUsXG4vLyB0aG91Z2ggdGhlcmUgYXJlIGNhc2VzIHdoZXJlIHRoYXQgZG9lcyBub3QgaG9sZDpcbi8vXG4vLyAgICAgXCJTU0xFcnJvclwiLnVuZGVyc2NvcmUoKS5jYW1lbGl6ZSgpICMgPT4gXCJTc2xFcnJvclwiXG5TdHJpbmcucHJvdG90eXBlLnVuZGVyc2NvcmUgPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgcmVzdWx0ID0gdGhpcy5yZXBsYWNlKCcuJywgJy8nKTtcbiAgICByZXN1bHQgPSByZXN1bHQucmVwbGFjZSgvKFtBLVpcXGRdKykoW0EtWl1bYS16XSkvZywgXCIkMV8kMlwiKTtcbiAgICByZXN1bHQgPSByZXN1bHQucmVwbGFjZSgvKFthLXpcXGRdKShbQS1aXSkvZywgXCIkMV8kMlwiKTtcbiAgICByZXR1cm4gcmVzdWx0LnJlcGxhY2UoJy0nLCAnXycpLnRvTG93ZXJDYXNlKCk7XG59O1xuXG4vLyBCeSBkZWZhdWx0LCAjY2FtZWxpemUgY29udmVydHMgc3RyaW5ncyB0byBVcHBlckNhbWVsQ2FzZS4gSWYgdGhlIGFyZ3VtZW50XG4vLyB0byBjYW1lbGl6ZSBpcyBzZXQgdG8gYGZhbHNlYCB0aGVuICNjYW1lbGl6ZSBwcm9kdWNlcyBsb3dlckNhbWVsQ2FzZS5cbi8vXG4vLyBcXCNjYW1lbGl6ZSB3aWxsIGFsc28gY29udmVydCBcIi9cIiB0byBcIi5cIiB3aGljaCBpcyB1c2VmdWwgZm9yIGNvbnZlcnRpbmdcbi8vIHBhdGhzIHRvIG5hbWVzcGFjZXMuXG4vL1xuLy8gRXhhbXBsZXM6XG4vL1xuLy8gICAgIFwiYWN0aXZlX21vZGVsXCIuY2FtZWxpemUgICAgICAgICAgICAgICAvLyA9PiBcIkFjdGl2ZU1vZGVsXCJcbi8vICAgICBcImFjdGl2ZV9tb2RlbFwiLmNhbWVsaXplKHRydWUpICAgICAgICAgLy8gPT4gXCJBY3RpdmVNb2RlbFwiXG4vLyAgICAgXCJhY3RpdmVfbW9kZWxcIi5jYW1lbGl6ZShmYWxzZSkgICAgICAgIC8vID0+IFwiYWN0aXZlTW9kZWxcIlxuLy8gICAgIFwiYWN0aXZlX21vZGVsL2Vycm9yc1wiLmNhbWVsaXplICAgICAgICAvLyA9PiBcIkFjdGl2ZU1vZGVsLkVycm9yc1wiXG4vLyAgICAgXCJhY3RpdmVfbW9kZWwvZXJyb3JzXCIuY2FtZWxpemUoZmFsc2UpIC8vID0+IFwiYWN0aXZlTW9kZWwuRXJyb3JzXCJcbi8vXG4vLyBBcyBhIHJ1bGUgb2YgdGh1bWIgeW91IGNhbiB0aGluayBvZiBjYW1lbGl6ZSBhcyB0aGUgaW52ZXJzZSBvZiB1bmRlcnNjb3JlLFxuLy8gdGhvdWdoIHRoZXJlIGFyZSBjYXNlcyB3aGVyZSB0aGF0IGRvZXMgbm90IGhvbGQ6XG4vL1xuLy8gICAgIFwiU1NMRXJyb3JcIi51bmRlcnNjb3JlKCkuY2FtZWxpemUoKSAgIC8vID0+IFwiU3NsRXJyb3JcIlxuU3RyaW5nLnByb3RvdHlwZS5jYW1lbGl6ZSA9IGZ1bmN0aW9uKHVwcGVyY2FzZV9maXJzdF9sZXR0ZXIpIHtcbiAgICBsZXQgcmVzdWx0O1xuXG4gICAgaWYgKHVwcGVyY2FzZV9maXJzdF9sZXR0ZXIgPT09IHVuZGVmaW5lZCB8fCB1cHBlcmNhc2VfZmlyc3RfbGV0dGVyKSB7XG4gICAgICAgIHJlc3VsdCA9IHRoaXMuY2FwaXRhbGl6ZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc3VsdCA9IHRoaXMuYW50aWNhcGl0YWxpemUoKTtcbiAgICB9XG5cbiAgICByZXN1bHQgPSByZXN1bHQucmVwbGFjZSgvKF98KFxcLykpKFthLXpcXGRdKikvZywgZnVuY3Rpb24oX2EsIF9iLCBmaXJzdCwgcmVzdCkge1xuICAgICAgICByZXR1cm4gKGZpcnN0IHx8ICcnKSArIHJlc3QuY2FwaXRhbGl6ZSgpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHJlc3VsdC5yZXBsYWNlKCcvJywgJy4nKTtcbn07XG5cbi8vIENvbnZlcnQgYSBzdHJpbmcgdG8gYSBib29sZWFuIHZhbHVlLiBJZiB0aGUgYXJndW1lbnQgdG8gI2Jvb2xlYW5pemUgaXNcbi8vIHBhc3NlZCBpZiB0aGUgc3RyaW5nIGlzIG5vdCAndHJ1ZScgb3IgJ2ZhbHNlJyBpdCB3aWxsIHJldHVybiB0aGUgYXJndW1lbnQuXG4vL1xuLy8gRXhhbXBsZXM6XG4vL1xuLy8gICAgIFwidHJ1ZVwiLmJvb2xlYW5pemUoKSAgICAgICAvLyA9PiB0cnVlXG4vLyAgICAgXCJmYWxzZVwiLmJvb2xlYW5pemUoKSAgICAgIC8vID0+IGZhbHNlXG4vLyAgICAgXCJvdGhlclwiLmJvb2xlYW5pemUoKSAgICAgIC8vID0+IGZhbHNlXG4vLyAgICAgXCJvdGhlclwiLmJvb2xlYW5pemUodHJ1ZSkgIC8vID0+IHRydWVcblN0cmluZy5wcm90b3R5cGUuYm9vbGVhbml6ZSA9IGZ1bmN0aW9uKGRlZmF1bHRUbykge1xuICAgIGlmKHRoaXMudG9TdHJpbmcoKSA9PT0gJ3RydWUnKSB7IHJldHVybiB0cnVlOyB9XG4gICAgaWYgKHRoaXMudG9TdHJpbmcoKSA9PT0gJ2ZhbHNlJykgeyByZXR1cm4gZmFsc2U7IH1cbiAgICBcbiAgICByZXR1cm4gKGRlZmF1bHRUbyA9PT0gdW5kZWZpbmVkID8gZmFsc2UgOiBkZWZhdWx0VG8pO1xufTtcblxuLy8gUmVwbGFjZXMgdW5kZXJzY29yZXMgd2l0aCBkYXNoZXMuXG4vL1xuLy8gRXhhbXBsZTpcbi8vXG4vLyAgICAgXCJwdW5pX3B1bmlcIiAgLy8gPT4gXCJwdW5pLXB1bmlcIlxuU3RyaW5nLnByb3RvdHlwZS5kYXNoZXJpemUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5yZXBsYWNlKCdfJywgJy0nKTtcbn07XG5cbi8vIFJlcGxhY2VzIHNwZWNpYWwgY2hhcmFjdGVycyBpbiBhIHN0cmluZyBzbyB0aGF0IGl0IG1heSBiZSB1c2VkIGFzIHBhcnQgb2Zcbi8vIGEgXCJwcmV0dHlcIiBVUkwuXG4vL1xuLy8gRXhhbXBsZTpcbi8vXG4vLyAgICAgXCJEb25hbGQgRS4gS251dGhcIi5wYXJhbWV0ZXJpemUoKSAvLyA9PiAnZG9uYWxkLWUta251dGgnXG5TdHJpbmcucHJvdG90eXBlLnBhcmFtZXRlcml6ZSA9IGZ1bmN0aW9uKHNlcGVyYXRvcikge1xuICAgIHJldHVybiB0aGlzLnRvTG93ZXJDYXNlKCkucmVwbGFjZSgvW15hLXowLTlcXC1fXSsvZywgc2VwZXJhdG9yIHx8ICctJyk7XG59O1xuXG4vLyBBZGQgVW5kZXJzY29yZS5pbmZsZWN0aW9uI3BsdXJhbGl6ZSBmdW5jdGlvbiBvbiB0aGUgU3RyaW5nIG9iamVjdFxuU3RyaW5nLnByb3RvdHlwZS5wbHVyYWxpemUgPSBmdW5jdGlvbihjb3VudCwgaW5jbHVkZU51bWJlcikge1xuICAgIHJldHVybiBfLnBsdXJhbGl6ZSh0aGlzLCBjb3VudCwgaW5jbHVkZU51bWJlcik7XG59O1xuXG4vLyBBZGQgVW5kZXJzY29yZS5pbmZsZWN0aW9uI3Npbmd1bGFyaXplIGZ1bmN0aW9uIG9uIHRoZSBTdHJpbmcgb2JqZWN0XG5TdHJpbmcucHJvdG90eXBlLnNpbmd1bGFyaXplID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIF8uc2luZ3VsYXJpemUodGhpcyk7XG59O1xuXG4vLyBUcmllcyB0byBmaW5kIGEgdmFyaWFibGUgd2l0aCB0aGUgbmFtZSBzcGVjaWZpZWQgaW4gY29udGV4dCBvZiBgY29udGV4dGAuXG4vLyBgY29udGV4dGAgZGVmYXVsdHMgdG8gdGhlIGB3aW5kb3dgIHZhcmlhYmxlLlxuLy9cbi8vIEV4YW1wbGVzOlxuLy8gICAgICdNb2R1bGUnLmNvbnN0YW50aXplICAgICAjID0+IE1vZHVsZVxuLy8gICAgICdUZXN0LlVuaXQnLmNvbnN0YW50aXplICAjID0+IFRlc3QuVW5pdFxuLy8gICAgICdVbml0Jy5jb25zdGFudGl6ZShUZXN0KSAjID0+IFRlc3QuVW5pdFxuLy9cbi8vIFZpa2luZy5OYW1lRXJyb3IgaXMgcmFpc2VkIHdoZW4gdGhlIHZhcmlhYmxlIGlzIHVua25vd24uXG5TdHJpbmcucHJvdG90eXBlLmNvbnN0YW50aXplID0gZnVuY3Rpb24oY29udGV4dCkge1xuICAgIGlmKCFjb250ZXh0KSB7IGNvbnRleHQgPSB3aW5kb3c7IH1cblxuICAgIHJldHVybiB0aGlzLnNwbGl0KCcuJykucmVkdWNlKGZ1bmN0aW9uIChjb250ZXh0LCBuYW1lKSB7XG4gICAgICAgIGxldCB2ID0gY29udGV4dFtuYW1lXTtcbiAgICAgICAgaWYgKCF2KSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVmlraW5nLk5hbWVFcnJvcihcInVuaW5pdGlhbGl6ZWQgdmFyaWFibGUgXCIgKyBuYW1lKTsgXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHY7XG4gICAgfSwgY29udGV4dCk7XG59O1xuXG4vLyBSZW1vdmVzIHRoZSBtb2R1bGUgcGFydCBmcm9tIHRoZSBleHByZXNzaW9uIGluIHRoZSBzdHJpbmcuXG4vL1xuLy8gRXhhbXBsZXM6XG4vLyAgICAgJ05hbWVzcGFjZWQuTW9kdWxlJy5kZW1vZHVsaXplKCkgIyA9PiAnTW9kdWxlJ1xuLy8gICAgICdNb2R1bGUnLmRlbW9kdWxpemUoKSAjID0+ICdNb2R1bGUnXG4vLyAgICAgJycuZGVtb2R1bGl6ZSgpICMgPT4gJydcblN0cmluZy5wcm90b3R5cGUuZGVtb2R1bGl6ZSA9IGZ1bmN0aW9uIChzZXBlcmF0b3IpIHtcbiAgICBpZiAoIXNlcGVyYXRvcikge1xuICAgICAgICBzZXBlcmF0b3IgPSAnLic7XG4gICAgfVxuXG4gICAgbGV0IGluZGV4ID0gdGhpcy5sYXN0SW5kZXhPZihzZXBlcmF0b3IpO1xuXG4gICAgaWYgKGluZGV4ID09PSAtMSkge1xuICAgICAgICByZXR1cm4gU3RyaW5nKHRoaXMpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNsaWNlKGluZGV4ICsgMSk7XG4gICAgfVxufVxuXG4vLyBJZiBgbGVuZ3RoYCBpcyBncmVhdGVyIHRoYW4gdGhlIGxlbmd0aCBvZiB0aGUgc3RyaW5nLCByZXR1cm5zIGEgbmV3IFN0cmluZ1xuLy8gb2YgbGVuZ3RoIGBsZW5ndGhgIHdpdGggdGhlIHN0cmluZyByaWdodCBqdXN0aWZpZWQgYW5kIHBhZGRlZCB3aXRoIHBhZFN0cmluZztcbi8vIG90aGVyd2lzZSwgcmV0dXJucyBzdHJpbmdcblN0cmluZy5wcm90b3R5cGUucmp1c3QgPSBmdW5jdGlvbihsZW5ndGgsIHBhZFN0cmluZykge1xuICAgIGlmICghcGFkU3RyaW5nKSB7IHBhZFN0cmluZyA9ICcgJzsgfVxuICAgIFxuICAgIGxldCBwYWRkaW5nID0gJyc7XG4gICAgbGV0IHBhZGRpbmdMZW5ndGggPSBsZW5ndGggLSB0aGlzLmxlbmd0aDtcblxuICAgIHdoaWxlIChwYWRkaW5nLmxlbmd0aCA8IHBhZGRpbmdMZW5ndGgpIHtcbiAgICAgICAgaWYgKHBhZGRpbmdMZW5ndGggLSBwYWRkaW5nLmxlbmd0aCA8IHBhZFN0cmluZy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHBhZGRpbmcgPSBwYWRkaW5nICsgcGFkU3RyaW5nLnNsaWNlKDAsIHBhZGRpbmdMZW5ndGggLSBwYWRkaW5nLmxlbmd0aCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwYWRkaW5nID0gcGFkZGluZyArIHBhZFN0cmluZztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBwYWRkaW5nICsgdGhpcztcbn07XG5cbi8vIElmIGBsZW5ndGhgIGlzIGdyZWF0ZXIgdGhhbiB0aGUgbGVuZ3RoIG9mIHRoZSBzdHJpbmcsIHJldHVybnMgYSBuZXcgU3RyaW5nXG4vLyBvZiBsZW5ndGggYGxlbmd0aGAgd2l0aCB0aGUgc3RyaW5nIGxlZnQganVzdGlmaWVkIGFuZCBwYWRkZWQgd2l0aCBwYWRTdHJpbmc7XG4vLyBvdGhlcndpc2UsIHJldHVybnMgc3RyaW5nXG5TdHJpbmcucHJvdG90eXBlLmxqdXN0ID0gZnVuY3Rpb24obGVuZ3RoLCBwYWRTdHJpbmcpIHtcbiAgICBpZiAoIXBhZFN0cmluZykgeyBwYWRTdHJpbmcgPSAnICc7IH1cbiAgICBcbiAgICBsZXQgcGFkZGluZyA9ICcnO1xuICAgIGxldCBwYWRkaW5nTGVuZ3RoID0gbGVuZ3RoIC0gdGhpcy5sZW5ndGg7XG5cbiAgICB3aGlsZSAocGFkZGluZy5sZW5ndGggPCBwYWRkaW5nTGVuZ3RoKSB7XG4gICAgICAgIGlmIChwYWRkaW5nTGVuZ3RoIC0gcGFkZGluZy5sZW5ndGggPCBwYWRTdHJpbmcubGVuZ3RoKSB7XG4gICAgICAgICAgICBwYWRkaW5nID0gcGFkZGluZyArIHBhZFN0cmluZy5zbGljZSgwLCBwYWRkaW5nTGVuZ3RoIC0gcGFkZGluZy5sZW5ndGgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcGFkZGluZyA9IHBhZGRpbmcgKyBwYWRTdHJpbmc7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcyArIHBhZGRpbmc7XG59O1xuXG4vLyBBbGlhcyBvZiB0b19zLlxuU3RyaW5nLnByb3RvdHlwZS50b1BhcmFtID0gU3RyaW5nLnByb3RvdHlwZS50b1N0cmluZztcblxuU3RyaW5nLnByb3RvdHlwZS50b1F1ZXJ5ID0gZnVuY3Rpb24oa2V5KSB7XG5cdHJldHVybiBlc2NhcGUoa2V5LnRvUGFyYW0oKSkgKyBcIj1cIiArIGVzY2FwZSh0aGlzLnRvUGFyYW0oKSk7XG59O1xuXG5TdHJpbmcucHJvdG90eXBlLmRvd25jYXNlID0gU3RyaW5nLnByb3RvdHlwZS50b0xvd2VyQ2FzZTtcbiIsImNvbnN0IE5hbWUgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIGxldCBvYmplY3ROYW1lID0gbmFtZS5jYW1lbGl6ZSgpOyAvLyBOYW1lc3BhY2VkLk5hbWVcblxuICAgIHRoaXMubmFtZSA9IG9iamVjdE5hbWU7XG4gICAgdGhpcy5jb2xsZWN0aW9uTmFtZSA9IG9iamVjdE5hbWUgKyAnQ29sbGVjdGlvbic7XG4gICAgdGhpcy5zaW5ndWxhciA9IG9iamVjdE5hbWUudW5kZXJzY29yZSgpLnJlcGxhY2UoL1xcLy9nLCAnXycpOyAvLyBuYW1lc3BhY2VkX25hbWVcbiAgICB0aGlzLnBsdXJhbCA9IHRoaXMuc2luZ3VsYXIucGx1cmFsaXplKCk7IC8vIG5hbWVzcGFjZWRfbmFtZXNcbiAgICB0aGlzLmh1bWFuID0gb2JqZWN0TmFtZS5kZW1vZHVsaXplKCkuaHVtYW5pemUoKTsgLy8gTmFtZVxuICAgIHRoaXMuY29sbGVjdGlvbiA9IHRoaXMuc2luZ3VsYXIucGx1cmFsaXplKCk7IC8vIG5hbWVzcGFjZWQvbmFtZXNcbiAgICB0aGlzLnBhcmFtS2V5ID0gdGhpcy5zaW5ndWxhcjtcbiAgICB0aGlzLnJvdXRlS2V5ID0gdGhpcy5wbHVyYWw7XG4gICAgdGhpcy5lbGVtZW50ID0gb2JqZWN0TmFtZS5kZW1vZHVsaXplKCkudW5kZXJzY29yZSgpO1xuXG4gICAgdGhpcy5tb2RlbCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMuX21vZGVsKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fbW9kZWw7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9tb2RlbCA9IHRoaXMubmFtZS5jb25zdGFudGl6ZSgpO1xuICAgICAgICByZXR1cm4gdGhpcy5fbW9kZWw7XG4gICAgfVxuXG59O1xuXG5leHBvcnQgZGVmYXVsdCBOYW1lO1xuIiwidmFyIGJhYmVsSGVscGVycyA9IHt9O1xuZXhwb3J0IHZhciBfdHlwZW9mID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiBTeW1ib2wuaXRlcmF0b3IgPT09IFwic3ltYm9sXCIgPyBmdW5jdGlvbiAob2JqKSB7XG4gIHJldHVybiB0eXBlb2Ygb2JqO1xufSA6IGZ1bmN0aW9uIChvYmopIHtcbiAgcmV0dXJuIG9iaiAmJiB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgb2JqLmNvbnN0cnVjdG9yID09PSBTeW1ib2wgPyBcInN5bWJvbFwiIDogdHlwZW9mIG9iajtcbn07XG5cbmV4cG9ydCB2YXIganN4ID0gZnVuY3Rpb24gKCkge1xuICB2YXIgUkVBQ1RfRUxFTUVOVF9UWVBFID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIFN5bWJvbC5mb3IgJiYgU3ltYm9sLmZvcihcInJlYWN0LmVsZW1lbnRcIikgfHwgMHhlYWM3O1xuICByZXR1cm4gZnVuY3Rpb24gY3JlYXRlUmF3UmVhY3RFbGVtZW50KHR5cGUsIHByb3BzLCBrZXksIGNoaWxkcmVuKSB7XG4gICAgdmFyIGRlZmF1bHRQcm9wcyA9IHR5cGUgJiYgdHlwZS5kZWZhdWx0UHJvcHM7XG4gICAgdmFyIGNoaWxkcmVuTGVuZ3RoID0gYXJndW1lbnRzLmxlbmd0aCAtIDM7XG5cbiAgICBpZiAoIXByb3BzICYmIGNoaWxkcmVuTGVuZ3RoICE9PSAwKSB7XG4gICAgICBwcm9wcyA9IHt9O1xuICAgIH1cblxuICAgIGlmIChwcm9wcyAmJiBkZWZhdWx0UHJvcHMpIHtcbiAgICAgIGZvciAodmFyIHByb3BOYW1lIGluIGRlZmF1bHRQcm9wcykge1xuICAgICAgICBpZiAocHJvcHNbcHJvcE5hbWVdID09PSB2b2lkIDApIHtcbiAgICAgICAgICBwcm9wc1twcm9wTmFtZV0gPSBkZWZhdWx0UHJvcHNbcHJvcE5hbWVdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICghcHJvcHMpIHtcbiAgICAgIHByb3BzID0gZGVmYXVsdFByb3BzIHx8IHt9O1xuICAgIH1cblxuICAgIGlmIChjaGlsZHJlbkxlbmd0aCA9PT0gMSkge1xuICAgICAgcHJvcHMuY2hpbGRyZW4gPSBjaGlsZHJlbjtcbiAgICB9IGVsc2UgaWYgKGNoaWxkcmVuTGVuZ3RoID4gMSkge1xuICAgICAgdmFyIGNoaWxkQXJyYXkgPSBBcnJheShjaGlsZHJlbkxlbmd0aCk7XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2hpbGRyZW5MZW5ndGg7IGkrKykge1xuICAgICAgICBjaGlsZEFycmF5W2ldID0gYXJndW1lbnRzW2kgKyAzXTtcbiAgICAgIH1cblxuICAgICAgcHJvcHMuY2hpbGRyZW4gPSBjaGlsZEFycmF5O1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAkJHR5cGVvZjogUkVBQ1RfRUxFTUVOVF9UWVBFLFxuICAgICAgdHlwZTogdHlwZSxcbiAgICAgIGtleToga2V5ID09PSB1bmRlZmluZWQgPyBudWxsIDogJycgKyBrZXksXG4gICAgICByZWY6IG51bGwsXG4gICAgICBwcm9wczogcHJvcHMsXG4gICAgICBfb3duZXI6IG51bGxcbiAgICB9O1xuICB9O1xufSgpO1xuXG5leHBvcnQgdmFyIGFzeW5jVG9HZW5lcmF0b3IgPSBmdW5jdGlvbiAoZm4pIHtcbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZ2VuID0gZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgZnVuY3Rpb24gc3RlcChrZXksIGFyZykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHZhciBpbmZvID0gZ2VuW2tleV0oYXJnKTtcbiAgICAgICAgICB2YXIgdmFsdWUgPSBpbmZvLnZhbHVlO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIHJlamVjdChlcnJvcik7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGluZm8uZG9uZSkge1xuICAgICAgICAgIHJlc29sdmUodmFsdWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodmFsdWUpLnRoZW4oZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICByZXR1cm4gc3RlcChcIm5leHRcIiwgdmFsdWUpO1xuICAgICAgICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgIHJldHVybiBzdGVwKFwidGhyb3dcIiwgZXJyKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gc3RlcChcIm5leHRcIik7XG4gICAgfSk7XG4gIH07XG59O1xuXG5leHBvcnQgdmFyIGNsYXNzQ2FsbENoZWNrID0gZnVuY3Rpb24gKGluc3RhbmNlLCBDb25zdHJ1Y3Rvcikge1xuICBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7XG4gIH1cbn07XG5cbmV4cG9ydCB2YXIgY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07XG4gICAgICBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7XG4gICAgICBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7XG4gICAgICBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlO1xuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7XG4gICAgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTtcbiAgICBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTtcbiAgICByZXR1cm4gQ29uc3RydWN0b3I7XG4gIH07XG59KCk7XG5cbmV4cG9ydCB2YXIgZGVmaW5lRW51bWVyYWJsZVByb3BlcnRpZXMgPSBmdW5jdGlvbiAob2JqLCBkZXNjcykge1xuICBmb3IgKHZhciBrZXkgaW4gZGVzY3MpIHtcbiAgICB2YXIgZGVzYyA9IGRlc2NzW2tleV07XG4gICAgZGVzYy5jb25maWd1cmFibGUgPSBkZXNjLmVudW1lcmFibGUgPSB0cnVlO1xuICAgIGlmIChcInZhbHVlXCIgaW4gZGVzYykgZGVzYy53cml0YWJsZSA9IHRydWU7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwga2V5LCBkZXNjKTtcbiAgfVxuXG4gIHJldHVybiBvYmo7XG59O1xuXG5leHBvcnQgdmFyIGRlZmF1bHRzID0gZnVuY3Rpb24gKG9iaiwgZGVmYXVsdHMpIHtcbiAgdmFyIGtleXMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhkZWZhdWx0cyk7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGtleSA9IGtleXNbaV07XG4gICAgdmFyIHZhbHVlID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihkZWZhdWx0cywga2V5KTtcblxuICAgIGlmICh2YWx1ZSAmJiB2YWx1ZS5jb25maWd1cmFibGUgJiYgb2JqW2tleV0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwga2V5LCB2YWx1ZSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG9iajtcbn07XG5cbmV4cG9ydCB2YXIgZGVmaW5lUHJvcGVydHkgPSBmdW5jdGlvbiAob2JqLCBrZXksIHZhbHVlKSB7XG4gIGlmIChrZXkgaW4gb2JqKSB7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwga2V5LCB7XG4gICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgd3JpdGFibGU6IHRydWVcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICBvYmpba2V5XSA9IHZhbHVlO1xuICB9XG5cbiAgcmV0dXJuIG9iajtcbn07XG5cbmV4cG9ydCB2YXIgX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uICh0YXJnZXQpIHtcbiAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldO1xuXG4gICAgZm9yICh2YXIga2V5IGluIHNvdXJjZSkge1xuICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHtcbiAgICAgICAgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGFyZ2V0O1xufTtcblxuZXhwb3J0IHZhciBnZXQgPSBmdW5jdGlvbiBnZXQob2JqZWN0LCBwcm9wZXJ0eSwgcmVjZWl2ZXIpIHtcbiAgaWYgKG9iamVjdCA9PT0gbnVsbCkgb2JqZWN0ID0gRnVuY3Rpb24ucHJvdG90eXBlO1xuICB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBwcm9wZXJ0eSk7XG5cbiAgaWYgKGRlc2MgPT09IHVuZGVmaW5lZCkge1xuICAgIHZhciBwYXJlbnQgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqZWN0KTtcblxuICAgIGlmIChwYXJlbnQgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBnZXQocGFyZW50LCBwcm9wZXJ0eSwgcmVjZWl2ZXIpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChcInZhbHVlXCIgaW4gZGVzYykge1xuICAgIHJldHVybiBkZXNjLnZhbHVlO1xuICB9IGVsc2Uge1xuICAgIHZhciBnZXR0ZXIgPSBkZXNjLmdldDtcblxuICAgIGlmIChnZXR0ZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICByZXR1cm4gZ2V0dGVyLmNhbGwocmVjZWl2ZXIpO1xuICB9XG59O1xuXG5leHBvcnQgdmFyIGluaGVyaXRzID0gZnVuY3Rpb24gKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7XG4gIGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gXCJmdW5jdGlvblwiICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCBcIiArIHR5cGVvZiBzdXBlckNsYXNzKTtcbiAgfVxuXG4gIHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwge1xuICAgIGNvbnN0cnVjdG9yOiB7XG4gICAgICB2YWx1ZTogc3ViQ2xhc3MsXG4gICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfVxuICB9KTtcbiAgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzO1xufTtcblxuZXhwb3J0IHZhciBfaW5zdGFuY2VvZiA9IGZ1bmN0aW9uIChsZWZ0LCByaWdodCkge1xuICBpZiAocmlnaHQgIT0gbnVsbCAmJiB0eXBlb2YgU3ltYm9sICE9PSBcInVuZGVmaW5lZFwiICYmIHJpZ2h0W1N5bWJvbC5oYXNJbnN0YW5jZV0pIHtcbiAgICByZXR1cm4gcmlnaHRbU3ltYm9sLmhhc0luc3RhbmNlXShsZWZ0KTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbGVmdCBpbnN0YW5jZW9mIHJpZ2h0O1xuICB9XG59O1xuXG5leHBvcnQgdmFyIGludGVyb3BSZXF1aXJlRGVmYXVsdCA9IGZ1bmN0aW9uIChvYmopIHtcbiAgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHtcbiAgICBkZWZhdWx0OiBvYmpcbiAgfTtcbn07XG5cbmV4cG9ydCB2YXIgaW50ZXJvcFJlcXVpcmVXaWxkY2FyZCA9IGZ1bmN0aW9uIChvYmopIHtcbiAgaWYgKG9iaiAmJiBvYmouX19lc01vZHVsZSkge1xuICAgIHJldHVybiBvYmo7XG4gIH0gZWxzZSB7XG4gICAgdmFyIG5ld09iaiA9IHt9O1xuXG4gICAgaWYgKG9iaiAhPSBudWxsKSB7XG4gICAgICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBrZXkpKSBuZXdPYmpba2V5XSA9IG9ialtrZXldO1xuICAgICAgfVxuICAgIH1cblxuICAgIG5ld09iai5kZWZhdWx0ID0gb2JqO1xuICAgIHJldHVybiBuZXdPYmo7XG4gIH1cbn07XG5cbmV4cG9ydCB2YXIgbmV3QXJyb3dDaGVjayA9IGZ1bmN0aW9uIChpbm5lclRoaXMsIGJvdW5kVGhpcykge1xuICBpZiAoaW5uZXJUaGlzICE9PSBib3VuZFRoaXMpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGluc3RhbnRpYXRlIGFuIGFycm93IGZ1bmN0aW9uXCIpO1xuICB9XG59O1xuXG5leHBvcnQgdmFyIG9iamVjdERlc3RydWN0dXJpbmdFbXB0eSA9IGZ1bmN0aW9uIChvYmopIHtcbiAgaWYgKG9iaiA9PSBudWxsKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGRlc3RydWN0dXJlIHVuZGVmaW5lZFwiKTtcbn07XG5cbmV4cG9ydCB2YXIgb2JqZWN0V2l0aG91dFByb3BlcnRpZXMgPSBmdW5jdGlvbiAob2JqLCBrZXlzKSB7XG4gIHZhciB0YXJnZXQgPSB7fTtcblxuICBmb3IgKHZhciBpIGluIG9iaikge1xuICAgIGlmIChrZXlzLmluZGV4T2YoaSkgPj0gMCkgY29udGludWU7XG4gICAgaWYgKCFPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBpKSkgY29udGludWU7XG4gICAgdGFyZ2V0W2ldID0gb2JqW2ldO1xuICB9XG5cbiAgcmV0dXJuIHRhcmdldDtcbn07XG5cbmV4cG9ydCB2YXIgcG9zc2libGVDb25zdHJ1Y3RvclJldHVybiA9IGZ1bmN0aW9uIChzZWxmLCBjYWxsKSB7XG4gIGlmICghc2VsZikge1xuICAgIHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihcInRoaXMgaGFzbid0IGJlZW4gaW5pdGlhbGlzZWQgLSBzdXBlcigpIGhhc24ndCBiZWVuIGNhbGxlZFwiKTtcbiAgfVxuXG4gIHJldHVybiBjYWxsICYmICh0eXBlb2YgY2FsbCA9PT0gXCJvYmplY3RcIiB8fCB0eXBlb2YgY2FsbCA9PT0gXCJmdW5jdGlvblwiKSA/IGNhbGwgOiBzZWxmO1xufTtcblxuZXhwb3J0IHZhciBzZWxmR2xvYmFsID0gdHlwZW9mIGdsb2JhbCA9PT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiBnbG9iYWw7XG5cbmV4cG9ydCB2YXIgc2V0ID0gZnVuY3Rpb24gc2V0KG9iamVjdCwgcHJvcGVydHksIHZhbHVlLCByZWNlaXZlcikge1xuICB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBwcm9wZXJ0eSk7XG5cbiAgaWYgKGRlc2MgPT09IHVuZGVmaW5lZCkge1xuICAgIHZhciBwYXJlbnQgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqZWN0KTtcblxuICAgIGlmIChwYXJlbnQgIT09IG51bGwpIHtcbiAgICAgIHNldChwYXJlbnQsIHByb3BlcnR5LCB2YWx1ZSwgcmVjZWl2ZXIpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChcInZhbHVlXCIgaW4gZGVzYyAmJiBkZXNjLndyaXRhYmxlKSB7XG4gICAgZGVzYy52YWx1ZSA9IHZhbHVlO1xuICB9IGVsc2Uge1xuICAgIHZhciBzZXR0ZXIgPSBkZXNjLnNldDtcblxuICAgIGlmIChzZXR0ZXIgIT09IHVuZGVmaW5lZCkge1xuICAgICAgc2V0dGVyLmNhbGwocmVjZWl2ZXIsIHZhbHVlKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdmFsdWU7XG59O1xuXG5leHBvcnQgdmFyIHNsaWNlZFRvQXJyYXkgPSBmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIHNsaWNlSXRlcmF0b3IoYXJyLCBpKSB7XG4gICAgdmFyIF9hcnIgPSBbXTtcbiAgICB2YXIgX24gPSB0cnVlO1xuICAgIHZhciBfZCA9IGZhbHNlO1xuICAgIHZhciBfZSA9IHVuZGVmaW5lZDtcblxuICAgIHRyeSB7XG4gICAgICBmb3IgKHZhciBfaSA9IGFycltTeW1ib2wuaXRlcmF0b3JdKCksIF9zOyAhKF9uID0gKF9zID0gX2kubmV4dCgpKS5kb25lKTsgX24gPSB0cnVlKSB7XG4gICAgICAgIF9hcnIucHVzaChfcy52YWx1ZSk7XG5cbiAgICAgICAgaWYgKGkgJiYgX2Fyci5sZW5ndGggPT09IGkpIGJyZWFrO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgX2QgPSB0cnVlO1xuICAgICAgX2UgPSBlcnI7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmICghX24gJiYgX2lbXCJyZXR1cm5cIl0pIF9pW1wicmV0dXJuXCJdKCk7XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICBpZiAoX2QpIHRocm93IF9lO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBfYXJyO1xuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIChhcnIsIGkpIHtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShhcnIpKSB7XG4gICAgICByZXR1cm4gYXJyO1xuICAgIH0gZWxzZSBpZiAoU3ltYm9sLml0ZXJhdG9yIGluIE9iamVjdChhcnIpKSB7XG4gICAgICByZXR1cm4gc2xpY2VJdGVyYXRvcihhcnIsIGkpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiSW52YWxpZCBhdHRlbXB0IHRvIGRlc3RydWN0dXJlIG5vbi1pdGVyYWJsZSBpbnN0YW5jZVwiKTtcbiAgICB9XG4gIH07XG59KCk7XG5cbmV4cG9ydCB2YXIgc2xpY2VkVG9BcnJheUxvb3NlID0gZnVuY3Rpb24gKGFyciwgaSkge1xuICBpZiAoQXJyYXkuaXNBcnJheShhcnIpKSB7XG4gICAgcmV0dXJuIGFycjtcbiAgfSBlbHNlIGlmIChTeW1ib2wuaXRlcmF0b3IgaW4gT2JqZWN0KGFycikpIHtcbiAgICB2YXIgX2FyciA9IFtdO1xuXG4gICAgZm9yICh2YXIgX2l0ZXJhdG9yID0gYXJyW1N5bWJvbC5pdGVyYXRvcl0oKSwgX3N0ZXA7ICEoX3N0ZXAgPSBfaXRlcmF0b3IubmV4dCgpKS5kb25lOykge1xuICAgICAgX2Fyci5wdXNoKF9zdGVwLnZhbHVlKTtcblxuICAgICAgaWYgKGkgJiYgX2Fyci5sZW5ndGggPT09IGkpIGJyZWFrO1xuICAgIH1cblxuICAgIHJldHVybiBfYXJyO1xuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJJbnZhbGlkIGF0dGVtcHQgdG8gZGVzdHJ1Y3R1cmUgbm9uLWl0ZXJhYmxlIGluc3RhbmNlXCIpO1xuICB9XG59O1xuXG5leHBvcnQgdmFyIHRhZ2dlZFRlbXBsYXRlTGl0ZXJhbCA9IGZ1bmN0aW9uIChzdHJpbmdzLCByYXcpIHtcbiAgcmV0dXJuIE9iamVjdC5mcmVlemUoT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoc3RyaW5ncywge1xuICAgIHJhdzoge1xuICAgICAgdmFsdWU6IE9iamVjdC5mcmVlemUocmF3KVxuICAgIH1cbiAgfSkpO1xufTtcblxuZXhwb3J0IHZhciB0YWdnZWRUZW1wbGF0ZUxpdGVyYWxMb29zZSA9IGZ1bmN0aW9uIChzdHJpbmdzLCByYXcpIHtcbiAgc3RyaW5ncy5yYXcgPSByYXc7XG4gIHJldHVybiBzdHJpbmdzO1xufTtcblxuZXhwb3J0IHZhciB0ZW1wb3JhbFJlZiA9IGZ1bmN0aW9uICh2YWwsIG5hbWUsIHVuZGVmKSB7XG4gIGlmICh2YWwgPT09IHVuZGVmKSB7XG4gICAgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKG5hbWUgKyBcIiBpcyBub3QgZGVmaW5lZCAtIHRlbXBvcmFsIGRlYWQgem9uZVwiKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gdmFsO1xuICB9XG59O1xuXG5leHBvcnQgdmFyIHRlbXBvcmFsVW5kZWZpbmVkID0ge307XG5cbmV4cG9ydCB2YXIgdG9BcnJheSA9IGZ1bmN0aW9uIChhcnIpIHtcbiAgcmV0dXJuIEFycmF5LmlzQXJyYXkoYXJyKSA/IGFyciA6IEFycmF5LmZyb20oYXJyKTtcbn07XG5cbmV4cG9ydCB2YXIgdG9Db25zdW1hYmxlQXJyYXkgPSBmdW5jdGlvbiAoYXJyKSB7XG4gIGlmIChBcnJheS5pc0FycmF5KGFycikpIHtcbiAgICBmb3IgKHZhciBpID0gMCwgYXJyMiA9IEFycmF5KGFyci5sZW5ndGgpOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSBhcnIyW2ldID0gYXJyW2ldO1xuXG4gICAgcmV0dXJuIGFycjI7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIEFycmF5LmZyb20oYXJyKTtcbiAgfVxufTtcblxuYmFiZWxIZWxwZXJzO1xuXG5leHBvcnQgeyBfdHlwZW9mIGFzIHR5cGVvZiwgX2V4dGVuZHMgYXMgZXh0ZW5kcywgX2luc3RhbmNlb2YgYXMgaW5zdGFuY2VvZiB9IiwiY29uc3QgRGF0ZVR5cGUgPSB7XG5cbiAgICBsb2FkOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyB8fCB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICByZXR1cm4gRGF0ZS5mcm9tSVNPKHZhbHVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghKHZhbHVlIGluc3RhbmNlb2YgRGF0ZSkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IodHlwZW9mIHZhbHVlICsgXCIgY2FuJ3QgYmUgY29lcmNlZCBpbnRvIERhdGVcIik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgfSxcblxuICAgIGR1bXA6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZS50b0lTT1N0cmluZygpO1xuICAgIH1cblxufTtcblxuZXhwb3J0IGRlZmF1bHQgRGF0ZVR5cGU7XG4iLCJjb25zdCBKU09OVHlwZSA9IHtcblxuICAgIGxvYWQ6IGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHtcbiAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIGxldCBBbm9uTW9kZWwgPSBWaWtpbmcuTW9kZWwuZXh0ZW5kKHtcbiAgICAgICAgICAgICAgICBpbmhlcml0YW5jZUF0dHJpYnV0ZTogZmFsc2VcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgbGV0IG1vZGVsID0gbmV3IEFub25Nb2RlbCh2YWx1ZSk7XG4gICAgICAgICAgICBtb2RlbC5tb2RlbE5hbWUgPSBrZXk7XG4gICAgICAgICAgICBtb2RlbC5iYXNlTW9kZWwgPSBtb2RlbDtcbiAgICAgICAgICAgIHJldHVybiBtb2RlbDtcbiAgICAgICAgfVxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKHR5cGVvZiB2YWx1ZSArIFwiIGNhbid0IGJlIGNvZXJjZWQgaW50byBKU09OXCIpO1xuICAgIH0sXG5cbiAgICBkdW1wOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgVmlraW5nLk1vZGVsKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWUudG9KU09OKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cblxufTtcblxuZXhwb3J0IGRlZmF1bHQgSlNPTlR5cGU7XG4iLCJjb25zdCBOdW1iZXJUeXBlID0ge1xuXG4gICAgbG9hZDogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIHZhbHVlID0gdmFsdWUucmVwbGFjZSgvXFwsL2csICcnKTtcblxuICAgICAgICAgICAgaWYgKHZhbHVlLnRyaW0oKSA9PT0gJycpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gTnVtYmVyKHZhbHVlKTtcbiAgICB9LFxuXG4gICAgZHVtcDogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cblxufTtcblxuZXhwb3J0IGRlZmF1bHQgTnVtYmVyVHlwZTtcbiIsImNvbnN0IFN0cmluZ1R5cGUgPSB7XG5cbiAgICBsb2FkOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJyAmJiB2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gU3RyaW5nKHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgfSxcblxuICAgIGR1bXA6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIGlmICh0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnICYmIHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiBTdHJpbmcodmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG5cbn07XG5cbmV4cG9ydCBkZWZhdWx0IFN0cmluZ1R5cGU7XG4iLCJjb25zdCBCb29sZWFuVHlwZSA9IHtcblxuICAgIGxvYWQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgdmFsdWUgPSAodmFsdWUgPT09ICd0cnVlJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuICEhdmFsdWU7XG4gICAgfSxcblxuICAgIGR1bXA6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG5cbn07XG5cbmV4cG9ydCBkZWZhdWx0IEJvb2xlYW5UeXBlO1xuIiwiaW1wb3J0IERhdGVUeXBlIGZyb20gJy4vdHlwZS9kYXRlJztcbmltcG9ydCBKU09OVHlwZSBmcm9tICcuL3R5cGUvanNvbic7XG5pbXBvcnQgTnVtYmVyVHlwZSBmcm9tICcuL3R5cGUvbnVtYmVyJztcbmltcG9ydCBTdHJpbmdUeXBlIGZyb20gJy4vdHlwZS9zdHJpbmcnO1xuaW1wb3J0IEJvb2xlYW5UeXBlIGZyb20gJy4vdHlwZS9ib29sZWFuJztcblxuY29uc3QgVHlwZSA9IHtcbiAgICAncmVnaXN0cnknOiB7fVxufTtcblxuVHlwZS5yZWdpc3RyeVsnZGF0ZSddID0gVHlwZS5EYXRlID0gRGF0ZVR5cGU7XG5UeXBlLnJlZ2lzdHJ5Wydqc29uJ10gPSBUeXBlLkpTT04gPSBKU09OVHlwZTtcblR5cGUucmVnaXN0cnlbJ251bWJlciddID0gVHlwZS5OdW1iZXIgPSBOdW1iZXJUeXBlO1xuVHlwZS5yZWdpc3RyeVsnc3RyaW5nJ10gPSBUeXBlLlN0cmluZyA9IFN0cmluZ1R5cGU7XG5UeXBlLnJlZ2lzdHJ5Wydib29sZWFuJ10gPSBUeXBlLkJvb2xlYW4gPSBCb29sZWFuVHlwZTtcblxuZXhwb3J0IGRlZmF1bHQgVHlwZTtcbiIsImNvbnN0IFJlZmxlY3Rpb24gPSBmdW5jdGlvbiAoKSB7IH07XG5cbl8uZXh0ZW5kKFZpa2luZy5Nb2RlbC5SZWZsZWN0aW9uLnByb3RvdHlwZSwge1xuXG4gICAga2xhc3M6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5tYWNybyA9PT0gJ2hhc01hbnknKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb2xsZWN0aW9uKCk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHJldHVybiB0aGlzLm1vZGVsKCk7XG4gICAgfSxcbiAgICBcbiAgICBtb2RlbDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1vZGVsTmFtZS5tb2RlbCgpO1xuICAgIH0sXG4gICAgXG4gICAgY29sbGVjdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbGxlY3Rpb25OYW1lLmNvbnN0YW50aXplKCk7XG4gICAgfVxuXG59KTtcblxuUmVmbGVjdGlvbi5leHRlbmQgPSBCYWNrYm9uZS5Nb2RlbC5leHRlbmQ7XG5cbmV4cG9ydCBkZWZhdWx0IFJlZmxlY3Rpb247XG5cblxuIiwiY29uc3QgSGFzT25lUmVmbGVjdGlvbiA9IFZpa2luZy5Nb2RlbC5SZWZsZWN0aW9uLmV4dGVuZCh7XG4gICAgXG4gICAgY29uc3RydWN0b3I6IGZ1bmN0aW9uIChuYW1lLCBvcHRpb25zKSB7XG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgICAgIHRoaXMubWFjcm8gPSAnaGFzT25lJztcbiAgICAgICAgdGhpcy5vcHRpb25zID0gXy5leHRlbmQoe30sIG9wdGlvbnMpO1xuXG4gICAgICAgIGlmICghdGhpcy5vcHRpb25zLnBvbHltb3JwaGljKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLm1vZGVsTmFtZSkge1xuICAgICAgICAgICAgICAgIHRoaXMubW9kZWxOYW1lID0gbmV3IFZpa2luZy5Nb2RlbC5OYW1lKHRoaXMub3B0aW9ucy5tb2RlbE5hbWUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1vZGVsTmFtZSA9IG5ldyBWaWtpbmcuTW9kZWwuTmFtZShuYW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxufSk7XG5cbmV4cG9ydCBkZWZhdWx0IEhhc09uZVJlZmxlY3Rpb247IiwiSGFzTWFueVJlZmxlY3Rpb24gPSBWaWtpbmcuTW9kZWwuUmVmbGVjdGlvbi5leHRlbmQoe1xuICAgIFxuICAgIGNvbnN0cnVjdG9yOiBmdW5jdGlvbiAobmFtZSwgb3B0aW9ucykge1xuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgICAgICB0aGlzLm1hY3JvID0gJ2hhc01hbnknO1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSBfLmV4dGVuZCh7fSwgb3B0aW9ucyk7XG5cbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5tb2RlbE5hbWUpIHtcbiAgICAgICAgICAgIHRoaXMubW9kZWxOYW1lID0gbmV3IFZpa2luZy5Nb2RlbC5OYW1lKHRoaXMub3B0aW9ucy5tb2RlbE5hbWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5tb2RlbE5hbWUgPSBuZXcgVmlraW5nLk1vZGVsLk5hbWUodGhpcy5uYW1lLnNpbmd1bGFyaXplKCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5jb2xsZWN0aW9uTmFtZSkge1xuICAgICAgICAgICAgdGhpcy5jb2xsZWN0aW9uTmFtZSA9IHRoaXMub3B0aW9ucy5jb2xsZWN0aW9uTmFtZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuY29sbGVjdGlvbk5hbWUgPSB0aGlzLm1vZGVsTmFtZS5jb2xsZWN0aW9uTmFtZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbn0pO1xuXG5leHBvcnQgZGVmYXVsdCBIYXNNYW55UmVmbGVjdGlvbjsiLCJCZWxvbmdzVG9SZWZsZWN0aW9uID0gVmlraW5nLk1vZGVsLlJlZmxlY3Rpb24uZXh0ZW5kKHtcbiAgICBcbiAgICBjb25zdHJ1Y3RvcjogZnVuY3Rpb24gKG5hbWUsIG9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICAgICAgdGhpcy5tYWNybyA9ICdiZWxvbmdzVG8nO1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSBfLmV4dGVuZCh7fSwgb3B0aW9ucyk7XG4gICAgXG4gICAgICAgIGlmICghdGhpcy5vcHRpb25zLnBvbHltb3JwaGljKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLm1vZGVsTmFtZSkge1xuICAgICAgICAgICAgICAgIHRoaXMubW9kZWxOYW1lID0gbmV3IFZpa2luZy5Nb2RlbC5OYW1lKHRoaXMub3B0aW9ucy5tb2RlbE5hbWUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1vZGVsTmFtZSA9IG5ldyBWaWtpbmcuTW9kZWwuTmFtZShuYW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBcbn0pO1xuXG5leHBvcnQgZGVmYXVsdCBCZWxvbmdzVG9SZWZsZWN0aW9uO1xuIiwiSGFzQW5kQmVsb25nc1RvTWFueVJlZmxlY3Rpb24gPSBWaWtpbmcuTW9kZWwuUmVmbGVjdGlvbi5leHRlbmQoe1xuXG4gICAgY29uc3RydWN0b3I6IGZ1bmN0aW9uIChuYW1lLCBvcHRpb25zKSB7XG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgICAgIHRoaXMubWFjcm8gPSAnaGFzQW5kQmVsb25nc1RvTWFueSc7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IF8uZXh0ZW5kKHt9LCBvcHRpb25zKTtcbiAgICBcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5tb2RlbE5hbWUpIHtcbiAgICAgICAgICAgIHRoaXMubW9kZWxOYW1lID0gbmV3IFZpa2luZy5Nb2RlbC5OYW1lKHRoaXMub3B0aW9ucy5tb2RlbE5hbWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5tb2RlbE5hbWUgPSBuZXcgVmlraW5nLk1vZGVsLk5hbWUodGhpcy5uYW1lLnNpbmd1bGFyaXplKCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5jb2xsZWN0aW9uTmFtZSkge1xuICAgICAgICAgICAgdGhpcy5jb2xsZWN0aW9uTmFtZSA9IHRoaXMub3B0aW9ucy5Db2xsZWN0aW9uTmFtZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuY29sbGVjdGlvbk5hbWUgPSB0aGlzLm1vZGVsTmFtZS5jb2xsZWN0aW9uTmFtZTtcbiAgICAgICAgfVxuXG4gICAgfVxuICAgIFxufSk7XG5cbmV4cG9ydCBkZWZhdWx0IEhhc0FuZEJlbG9uZ3NUb01hbnlSZWZsZWN0aW9uOyIsIi8vIENyZWF0ZSBhIG1vZGVsIHdpdGggK2F0dHJpYnV0ZXMrLiBPcHRpb25zIGFyZSB0aGUgXG4vLyBzYW1lIGFzIFZpa2luZy5Nb2RlbCNzYXZlXG5leHBvcnQgbGV0IGNyZWF0ZSA9IGZ1bmN0aW9uKGF0dHJpYnV0ZXMsIG9wdGlvbnMpIHtcbiAgICBsZXQgbW9kZWwgPSBuZXcgdGhpcyhhdHRyaWJ1dGVzKTtcbiAgICBtb2RlbC5zYXZlKG51bGwsIG9wdGlvbnMpO1xuICAgIHJldHVybiBtb2RlbDtcbn07XG5cbi8vIEZpbmQgbW9kZWwgYnkgaWQuIEFjY2VwdHMgc3VjY2VzcyBhbmQgZXJyb3IgY2FsbGJhY2tzIGluIHRoZSBvcHRpb25zXG4vLyBoYXNoLCB3aGljaCBhcmUgYm90aCBwYXNzZWQgKG1vZGVsLCByZXNwb25zZSwgb3B0aW9ucykgYXMgYXJndW1lbnRzLlxuLy9cbi8vIEZpbmQgcmV0dXJucyB0aGUgbW9kZWwsIGhvd2V2ZXIgaXQgbW9zdCBsaWtlbHkgd29uJ3QgaGF2ZSBmZXRjaGVkIHRoZVxuLy8gZGF0YVx0ZnJvbSB0aGUgc2VydmVyIGlmIHlvdSBpbW1lZGlhdGVseSB0cnkgdG8gdXNlIGF0dHJpYnV0ZXMgb2YgdGhlXG4vLyBtb2RlbC5cbmV4cG9ydCBsZXQgZmluZCA9IGZ1bmN0aW9uKGlkLCBvcHRpb25zKSB7XG4gICAgbGV0IG1vZGVsID0gbmV3IHRoaXMoe2lkOiBpZH0pO1xuICAgIG1vZGVsLmZldGNoKG9wdGlvbnMpO1xuICAgIHJldHVybiBtb2RlbDtcbn07XG5cbi8vIEZpbmQgb3IgY3JlYXRlIG1vZGVsIGJ5IGF0dHJpYnV0ZXMuIEFjY2VwdHMgc3VjY2VzcyBjYWxsYmFja3MgaW4gdGhlXG4vLyBvcHRpb25zIGhhc2gsIHdoaWNoIGlzIHBhc3NlZCAobW9kZWwpIGFzIGFyZ3VtZW50cy5cbi8vXG4vLyBmaW5kT3JDcmVhdGVCeSByZXR1cm5zIHRoZSBtb2RlbCwgaG93ZXZlciBpdCBtb3N0IGxpa2VseSB3b24ndCBoYXZlIGZldGNoZWRcbi8vIHRoZSBkYXRhXHRmcm9tIHRoZSBzZXJ2ZXIgaWYgeW91IGltbWVkaWF0ZWx5IHRyeSB0byB1c2UgYXR0cmlidXRlcyBvZiB0aGVcbi8vIG1vZGVsLlxuZXhwb3J0IGxldCBmaW5kT3JDcmVhdGVCeSA9IGZ1bmN0aW9uKGF0dHJpYnV0ZXMsIG9wdGlvbnMpIHtcbiAgICBsZXQga2xhc3MgPSB0aGlzO1xuICAgIGtsYXNzLndoZXJlKGF0dHJpYnV0ZXMpLmZldGNoKHtcbiAgICAgICAgc3VjY2VzczogZnVuY3Rpb24gKG1vZGVsQ29sbGVjdGlvbikge1xuICAgICAgICAgICAgbGV0IG1vZGVsID0gbW9kZWxDb2xsZWN0aW9uLm1vZGVsc1swXTtcbiAgICAgICAgICAgIGlmIChtb2RlbCkge1xuICAgICAgICAgICAgICAgIGlmIChvcHRpb25zICYmIG9wdGlvbnMuc3VjY2Vzcykgb3B0aW9ucy5zdWNjZXNzKG1vZGVsKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAga2xhc3MuY3JlYXRlKGF0dHJpYnV0ZXMsIG9wdGlvbnMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG59XG5cbmV4cG9ydCBsZXQgcmVmbGVjdE9uQXNzb2NpYXRpb24gPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMuYXNzb2NpYXRpb25zW25hbWVdO1xufTtcblxuZXhwb3J0IGxldCByZWZsZWN0T25Bc3NvY2lhdGlvbnMgPSBmdW5jdGlvbihtYWNybykge1xuICAgIGxldCBhc3NvY2lhdGlvbnMgPSBfLnZhbHVlcyh0aGlzLmFzc29jaWF0aW9ucyk7XG4gICAgaWYgKG1hY3JvKSB7XG4gICAgICAgIGFzc29jaWF0aW9ucyA9IF8uc2VsZWN0KGFzc29jaWF0aW9ucywgZnVuY3Rpb24oYSkge1xuICAgICAgICAgICAgcmV0dXJuIGEubWFjcm8gPT09IG1hY3JvO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gYXNzb2NpYXRpb25zO1xufTtcblxuLy8gR2VuZXJhdGVzIHRoZSBgdXJsUm9vdGAgYmFzZWQgb2ZmIG9mIHRoZSBtb2RlbCBuYW1lLlxuZXhwb3J0IGxldCB1cmxSb290ID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMucHJvdG90eXBlLmhhc093blByb3BlcnR5KCd1cmxSb290JykpIHtcbiAgICAgICAgcmV0dXJuIF8ucmVzdWx0KHRoaXMucHJvdG90eXBlLCAndXJsUm9vdCcpXG4gICAgfSBlbHNlIGlmICh0aGlzLmJhc2VNb2RlbC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkoJ3VybFJvb3QnKSkge1xuICAgICAgICByZXR1cm4gXy5yZXN1bHQodGhpcy5iYXNlTW9kZWwucHJvdG90eXBlLCAndXJsUm9vdCcpXG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIFwiL1wiICsgdGhpcy5iYXNlTW9kZWwubW9kZWxOYW1lLnBsdXJhbDtcbiAgICB9XG59O1xuXG4vLyBSZXR1cm5zIGEgdW5mZXRjaGVkIGNvbGxlY3Rpb24gd2l0aCB0aGUgcHJlZGljYXRlIHNldCB0byB0aGUgcXVlcnlcbmV4cG9ydCBsZXQgd2hlcmUgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgLy8gVE9ETzogTW92ZSB0byBtb2RlbE5hbWUgYXMgd2VsbD9cbiAgICBsZXQgQ29sbGVjdGlvbiA9ICh0aGlzLm1vZGVsTmFtZS5uYW1lICsgJ0NvbGxlY3Rpb24nKS5jb25zdGFudGl6ZSgpO1xuICAgIFxuICAgIHJldHVybiBuZXcgQ29sbGVjdGlvbih1bmRlZmluZWQsIHtwcmVkaWNhdGU6IG9wdGlvbnN9KTtcbn07XG5cbmV4cG9ydCBsZXQgYXNzb2NpYXRpb25zID0gW107XG5cbi8vIE92ZXJpZGUgdGhlIGRlZmF1bHQgZXh0ZW5kIG1ldGhvZCB0byBzdXBwb3J0IHBhc3NpbmcgaW4gdGhlIG1vZGVsTmFtZVxuLy8gYW5kIHN1cHBvcnQgU1RJXG4vL1xuLy8gVGhlIG1vZGVsTmFtZSBpcyB1c2VkIGZvciBnZW5lcmF0aW5nIHVybHMgYW5kIHJlbGF0aW9uc2hpcHMuXG4vL1xuLy8gSWYgYSBNb2RlbCBpcyBleHRlbmRlZCBmdXJ0aGVyIGlzIGFjdHMgc2ltbGFyIHRvIEFjdGl2ZVJlY29yZHMgU1RJLlxuLy9cbi8vIGBuYW1lYCBpcyBvcHRpb25hbCwgYW5kIG11c3QgYmUgYSBzdHJpbmdcbmV4cG9ydCBsZXQgZXh0ZW5kID0gZnVuY3Rpb24obmFtZSwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHtcbiAgICBpZih0eXBlb2YgbmFtZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgc3RhdGljUHJvcHMgPSBwcm90b1Byb3BzO1xuICAgICAgICBwcm90b1Byb3BzID0gbmFtZTtcbiAgICB9XG4gICAgcHJvdG9Qcm9wcyB8fCAocHJvdG9Qcm9wcyA9IHt9KTtcblxuICAgIGxldCBjaGlsZCA9IEJhY2tib25lLk1vZGVsLmV4dGVuZC5jYWxsKHRoaXMsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKTtcblxuICAgIGlmKHR5cGVvZiBuYW1lID09PSAnc3RyaW5nJykge1xuICAgICAgICBjaGlsZC5tb2RlbE5hbWUgPSBuZXcgVmlraW5nLk1vZGVsLk5hbWUobmFtZSk7XG4gICAgfVxuXG4gICAgY2hpbGQuYXNzb2NpYXRpb25zID0ge307XG4gICAgY2hpbGQuZGVzY2VuZGFudHMgPSBbXTtcbiAgICBjaGlsZC5pbmhlcml0YW5jZUF0dHJpYnV0ZSA9IChwcm90b1Byb3BzLmluaGVyaXRhbmNlQXR0cmlidXRlID09PSB1bmRlZmluZWQpID8gdGhpcy5wcm90b3R5cGUuaW5oZXJpdGFuY2VBdHRyaWJ1dGUgOiBwcm90b1Byb3BzLmluaGVyaXRhbmNlQXR0cmlidXRlO1xuXG4gICAgaWYgKGNoaWxkLmluaGVyaXRhbmNlQXR0cmlidXRlID09PSBmYWxzZSB8fCAodGhpcy5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkoJ2Fic3RyYWN0JykgJiYgdGhpcy5wcm90b3R5cGUuYWJzdHJhY3QpKSB7XG4gICAgICAgIGNoaWxkLmJhc2VNb2RlbCA9IGNoaWxkO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGNoaWxkLmJhc2VNb2RlbC5kZXNjZW5kYW50cy5wdXNoKGNoaWxkKTtcbiAgICB9XG5cbiAgICBbJ2JlbG9uZ3NUbycsICdoYXNPbmUnLCAnaGFzTWFueScsICdoYXNBbmRCZWxvbmdzVG9NYW55J10uZm9yRWFjaChmdW5jdGlvbihtYWNybykge1xuICAgICAgICAocHJvdG9Qcm9wc1ttYWNyb10gfHwgW10pLmNvbmNhdCh0aGlzW21hY3JvXSB8fCBbXSkuZm9yRWFjaChmdW5jdGlvbihuYW1lKSB7XG4gICAgICAgICAgICBsZXQgb3B0aW9ucztcblxuICAgICAgICAgICAgLy8gSGFuZGxlIGJvdGggYHR5cGUsIGtleSwgb3B0aW9uc2AgYW5kIGB0eXBlLCBba2V5LCBvcHRpb25zXWAgc3R5bGUgYXJndW1lbnRzXG4gICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShuYW1lKSkge1xuICAgICAgICAgICAgICAgIG9wdGlvbnMgPSBuYW1lWzFdO1xuICAgICAgICAgICAgICAgIG5hbWUgPSBuYW1lWzBdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIWNoaWxkLmFzc29jaWF0aW9uc1tuYW1lXSkge1xuICAgICAgICAgICAgICAgIGxldCByZWZsZWN0aW9uQ2xhc3MgPSB7XG4gICAgICAgICAgICAgICAgICAgICdiZWxvbmdzVG8nOiBWaWtpbmcuTW9kZWwuQmVsb25nc1RvUmVmbGVjdGlvbixcbiAgICAgICAgICAgICAgICAgICAgJ2hhc09uZSc6IFZpa2luZy5Nb2RlbC5IYXNPbmVSZWZsZWN0aW9uLFxuICAgICAgICAgICAgICAgICAgICAnaGFzTWFueSc6IFZpa2luZy5Nb2RlbC5IYXNNYW55UmVmbGVjdGlvbixcbiAgICAgICAgICAgICAgICAgICAgJ2hhc0FuZEJlbG9uZ3NUb01hbnknOiBWaWtpbmcuTW9kZWwuSGFzQW5kQmVsb25nc1RvTWFueVJlZmxlY3Rpb25cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmVmbGVjdGlvbkNsYXNzID0gcmVmbGVjdGlvbkNsYXNzW21hY3JvXTtcblxuICAgICAgICAgICAgICAgIGNoaWxkLmFzc29jaWF0aW9uc1tuYW1lXSA9IG5ldyByZWZsZWN0aW9uQ2xhc3MobmFtZSwgb3B0aW9ucyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0sIHRoaXMucHJvdG90eXBlKTtcblxuICAgIGlmICh0aGlzLnByb3RvdHlwZS5zY2hlbWEgJiYgcHJvdG9Qcm9wcy5zY2hlbWEpIHtcbiAgICAgICAgT2JqZWN0LmtleXModGhpcy5wcm90b3R5cGUuc2NoZW1hKS5mb3JFYWNoKCAoa2V5KSA9PiB7XG4gICAgICAgICAgICBpZighY2hpbGQucHJvdG90eXBlLnNjaGVtYVtrZXldKSB7XG4gICAgICAgICAgICAgICAgY2hpbGQucHJvdG90eXBlLnNjaGVtYVtrZXldID0gdGhpcy5wcm90b3R5cGUuc2NoZW1hW2tleV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBjaGlsZDtcbn07XG4iLCJpbXBvcnQgTmFtZSBmcm9tICcuL21vZGVsL25hbWUnO1xuaW1wb3J0IFR5cGUgZnJvbSAnLi9tb2RlbC90eXBlJztcbmltcG9ydCBSZWZsZWN0aW9uIGZyb20gJy4vbW9kZWwvcmVmbGVjdGlvbic7XG5pbXBvcnQgSGFzT25lUmVmbGVjdGlvbiBmcm9tICcuL21vZGVsL3JlZmxlY3Rpb25zL2hhc19vbmVfcmVmbGVjdGlvbic7XG5pbXBvcnQgSGFzTWFueVJlZmxlY3Rpb24gZnJvbSAnLi9tb2RlbC9yZWZsZWN0aW9ucy9oYXNfbWFueV9yZWZsZWN0aW9uJztcbmltcG9ydCBCZWxvbmdzVG9SZWZsZWN0aW9uIGZyb20gJy4vbW9kZWwvcmVmbGVjdGlvbnMvYmVsb25nc190b19yZWZsZWN0aW9uJztcbmltcG9ydCBIYXNBbmRCZWxvbmdzVG9NYW55UmVmbGVjdGlvbiBmcm9tICcuL21vZGVsL3JlZmxlY3Rpb25zL2hhc19hbmRfYmVsb25nc190b19tYW55X3JlZmxlY3Rpb24nO1xuXG5pbXBvcnQgKiBhcyBjbGFzc1Byb3BlcnRpZXMgZnJvbSAnLi9tb2RlbC9jbGFzc19wcm9wZXJ0aWVzJztcblxuLy89IHJlcXVpcmVfdHJlZSAuL21vZGVsL2luc3RhbmNlX3Byb3BlcnRpZXNcblxuXG4vLyBWaWtpbmcuTW9kZWxcbi8vIC0tLS0tLS0tLS0tLVxuLy9cbi8vIFZpa2luZy5Nb2RlbCBpcyBhbiBleHRlbnNpb24gb2YgW0JhY2tib25lLk1vZGVsXShodHRwOi8vYmFja2JvbmVqcy5vcmcvI01vZGVsKS5cbi8vIEl0IGFkZHMgbmFtaW5nLCByZWxhdGlvbnNoaXBzLCBkYXRhIHR5cGUgY29lcmNpb25zLCBzZWxlY3Rpb24sIGFuZCBtb2RpZmllc1xuLy8gc3luYyB0byB3b3JrIHdpdGggW1J1Ynkgb24gUmFpbHNdKGh0dHA6Ly9ydWJ5b25yYWlscy5vcmcvKSBvdXQgb2YgdGhlIGJveC5cbmNvbnN0IE1vZGVsID0gQmFja2JvbmUuTW9kZWwuZXh0ZW5kKHtcblxuICAgIGFic3RyYWN0OiB0cnVlLFxuXG4gICAgLy8gaW5oZXJpdGFuY2VBdHRyaWJ1dGUgaXMgdGhlIGF0dGlyYnV0ZSB1c2VkIGZvciBTVElcbiAgICBpbmhlcml0YW5jZUF0dHJpYnV0ZTogJ3R5cGUnLFxuXG4gICAgZGVmYXVsdHM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgbGV0IGRmbHRzID0ge307XG5cbiAgICAgICAgaWYgKHR5cGVvZih0aGlzLnNjaGVtYSkgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICByZXR1cm4gZGZsdHM7XG4gICAgICAgIH1cblxuICAgICAgICBPYmplY3Qua2V5cyh0aGlzLnNjaGVtYSkuZm9yRWFjaCggKGtleSkgPT4ge1xuICAgICAgICAgICAgaWYgKHRoaXMuc2NoZW1hW2tleV1bJ2RlZmF1bHQnXSkge1xuICAgICAgICAgICAgICAgIGRmbHRzW2tleV0gPSB0aGlzLnNjaGVtYVtrZXldWydkZWZhdWx0J107XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBkZmx0cztcbiAgICB9LFxuXG4gICAgLy8gQmVsb3cgaXMgdGhlIHNhbWUgY29kZSBmcm9tIHRoZSBCYWNrYm9uZS5Nb2RlbCBmdW5jdGlvblxuICAgIC8vIGV4Y2VwdCB3aGVyZSB0aGVyZSBhcmUgY29tbWVudHNcbiAgICBjb25zdHJ1Y3RvcjogZnVuY3Rpb24gKGF0dHJpYnV0ZXMsIG9wdGlvbnMpIHtcbiAgICAgICAgbGV0IGF0dHJzID0gYXR0cmlidXRlcyB8fCB7fTtcbiAgICAgICAgb3B0aW9ucyB8fCAob3B0aW9ucyA9IHt9KTtcbiAgICAgICAgdGhpcy5jaWQgPSBfLnVuaXF1ZUlkKCdjJyk7XG4gICAgICAgIHRoaXMuYXR0cmlidXRlcyA9IHt9O1xuXG4gICAgICAgIGF0dHJzID0gXy5kZWZhdWx0cyh7fSwgYXR0cnMsIF8ucmVzdWx0KHRoaXMsICdkZWZhdWx0cycpKTtcblxuICAgICAgICBpZiAodGhpcy5pbmhlcml0YW5jZUF0dHJpYnV0ZSkge1xuICAgICAgICAgICAgaWYgKGF0dHJzW3RoaXMuaW5oZXJpdGFuY2VBdHRyaWJ1dGVdICYmIHRoaXMuY29uc3RydWN0b3IubW9kZWxOYW1lLm5hbWUgIT09IGF0dHJzW3RoaXMuaW5oZXJpdGFuY2VBdHRyaWJ1dGVdKSB7XG4gICAgICAgICAgICAgICAgLy8gT1BUSU1JWkU6ICBNdXRhdGluZyB0aGUgW1tQcm90b3R5cGVdXSBvZiBhbiBvYmplY3QsIG5vIG1hdHRlciBob3dcbiAgICAgICAgICAgICAgICAvLyB0aGlzIGlzIGFjY29tcGxpc2hlZCwgaXMgc3Ryb25nbHkgZGlzY291cmFnZWQsIGJlY2F1c2UgaXQgaXMgdmVyeVxuICAgICAgICAgICAgICAgIC8vIHNsb3cgYW5kIHVuYXZvaWRhYmx5IHNsb3dzIGRvd24gc3Vic2VxdWVudCBleGVjdXRpb24gaW4gbW9kZXJuXG4gICAgICAgICAgICAgICAgLy8gSmF2YVNjcmlwdCBpbXBsZW1lbnRhdGlvbnNcbiAgICAgICAgICAgICAgICAvLyBJZGVhczogTW92ZSB0byBNb2RlbC5uZXcoLi4uKSBtZXRob2Qgb2YgaW5pdGlhbGl6aW5nIG1vZGVsc1xuICAgICAgICAgICAgICAgIGxldCB0eXBlID0gYXR0cnNbdGhpcy5pbmhlcml0YW5jZUF0dHJpYnV0ZV0uY2FtZWxpemUoKS5jb25zdGFudGl6ZSgpO1xuICAgICAgICAgICAgICAgIHRoaXMuY29uc3RydWN0b3IgPSB0eXBlO1xuICAgICAgICAgICAgICAgIHRoaXMuX19wcm90b19fID0gdHlwZS5wcm90b3R5cGU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBBZGQgYSBoZWxwZXIgcmVmZXJlbmNlIHRvIGdldCB0aGUgbW9kZWwgbmFtZSBmcm9tIGFuIG1vZGVsIGluc3RhbmNlLlxuICAgICAgICB0aGlzLm1vZGVsTmFtZSA9IHRoaXMuY29uc3RydWN0b3IubW9kZWxOYW1lO1xuICAgICAgICB0aGlzLmJhc2VNb2RlbCA9IHRoaXMuY29uc3RydWN0b3IuYmFzZU1vZGVsO1xuXG4gICAgICAgIGlmICh0aGlzLmJhc2VNb2RlbCAmJiB0aGlzLm1vZGVsTmFtZSAmJiB0aGlzLmluaGVyaXRhbmNlQXR0cmlidXRlKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5iYXNlTW9kZWwgPT09IHRoaXMuY29uc3RydWN0b3IgJiYgdGhpcy5iYXNlTW9kZWwuZGVzY2VuZGFudHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIGF0dHJzW3RoaXMuaW5oZXJpdGFuY2VBdHRyaWJ1dGVdID0gdGhpcy5tb2RlbE5hbWUubmFtZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoXy5jb250YWlucyh0aGlzLmJhc2VNb2RlbC5kZXNjZW5kYW50cywgdGhpcy5jb25zdHJ1Y3RvcikpIHtcbiAgICAgICAgICAgICAgICBhdHRyc1t0aGlzLmluaGVyaXRhbmNlQXR0cmlidXRlXSA9IHRoaXMubW9kZWxOYW1lLm5hbWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTZXQgdXAgYXNzb2NpYXRpb25zXG4gICAgICAgIHRoaXMuYXNzb2NpYXRpb25zID0gdGhpcy5jb25zdHJ1Y3Rvci5hc3NvY2lhdGlvbnM7XG4gICAgICAgIHRoaXMucmVmbGVjdE9uQXNzb2NpYXRpb24gPSB0aGlzLmNvbnN0cnVjdG9yLnJlZmxlY3RPbkFzc29jaWF0aW9uO1xuICAgICAgICB0aGlzLnJlZmxlY3RPbkFzc29jaWF0aW9ucyA9IHRoaXMuY29uc3RydWN0b3IucmVmbGVjdE9uQXNzb2NpYXRpb25zO1xuXG4gICAgICAgIC8vIEluaXRpYWxpemUgYW55IGBoYXNNYW55YCByZWxhdGlvbnNoaXBzIHRvIGVtcHR5IGNvbGxlY3Rpb25zXG4gICAgICAgIHRoaXMucmVmbGVjdE9uQXNzb2NpYXRpb25zKCdoYXNNYW55JykuZm9yRWFjaChmdW5jdGlvbihhc3NvY2lhdGlvbikge1xuICAgICAgICAgICAgdGhpcy5hdHRyaWJ1dGVzW2Fzc29jaWF0aW9uLm5hbWVdID0gbmV3IChhc3NvY2lhdGlvbi5jb2xsZWN0aW9uKCkpKCk7XG4gICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgIGlmIChvcHRpb25zLmNvbGxlY3Rpb24pIHsgdGhpcy5jb2xsZWN0aW9uID0gb3B0aW9ucy5jb2xsZWN0aW9uOyB9XG4gICAgICAgIGlmIChvcHRpb25zLnBhcnNlKSB7IGF0dHJzID0gdGhpcy5wYXJzZShhdHRycywgb3B0aW9ucykgfHwge307IH1cblxuICAgICAgICB0aGlzLnNldChhdHRycywgb3B0aW9ucyk7XG4gICAgICAgIHRoaXMuY2hhbmdlZCA9IHt9O1xuICAgICAgICB0aGlzLmluaXRpYWxpemUuY2FsbCh0aGlzLCBhdHRyaWJ1dGVzLCBvcHRpb25zKTtcbiAgICB9XG5cbn0sIGNsYXNzUHJvcGVydGllcyk7XG5cbk1vZGVsLk5hbWUgPSBOYW1lO1xuTW9kZWwuVHlwZSA9IFR5cGU7XG5Nb2RlbC5SZWZsZWN0aW9uID0gUmVmbGVjdGlvbjtcbk1vZGVsLkhhc09uZVJlZmxlY3Rpb24gPSBIYXNPbmVSZWZsZWN0aW9uO1xuTW9kZWwuSGFzTWFueVJlZmxlY3Rpb24gID0gSGFzTWFueVJlZmxlY3Rpb247XG5Nb2RlbC5CZWxvbmdzVG9SZWZsZWN0aW9uID0gQmVsb25nc1RvUmVmbGVjdGlvbjtcbk1vZGVsLkhhc0FuZEJlbG9uZ3NUb01hbnlSZWZsZWN0aW9uID0gSGFzQW5kQmVsb25nc1RvTWFueVJlZmxlY3Rpb247XG5cbmV4cG9ydCBkZWZhdWx0IE1vZGVsOyIsIi8vIFZpa2luZy5qcyA8JT0gdmVyc2lvbiAlPiAoc2hhOjwlPSBnaXRfaW5mb1s6aGVhZF1bOnNoYV0gJT4pXG4vLyBcbi8vIChjKSAyMDEyLTwlPSBUaW1lLm5vdy55ZWFyICU+IEpvbmF0aGFuIEJyYWN5LCA0MkZsb29ycyBJbmMuXG4vLyBWaWtpbmcuanMgbWF5IGJlIGZyZWVseSBkaXN0cmlidXRlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuXG4vLyBodHRwOi8vdmlraW5nanMuY29tXG5cbmltcG9ydCAnLi92aWtpbmcvc3VwcG9ydCc7XG5pbXBvcnQgTW9kZWwgZnJvbSAnLi92aWtpbmcvbW9kZWwnO1xuXG5jb25zdCBWaWtpbmcgPSB7XG4gICAgTW9kZWw6IE1vZGVsLFxufTtcblxuZXhwb3J0IGRlZmF1bHQgVmlraW5nO1xuIl0sIm5hbWVzIjpbIkhhc01hbnlSZWZsZWN0aW9uIiwiQmVsb25nc1RvUmVmbGVjdGlvbiIsIkhhc0FuZEJlbG9uZ3NUb01hbnlSZWZsZWN0aW9uIiwiVmlraW5nIl0sIm1hcHBpbmdzIjoiOzs7OztBQUVBLEVBQUEsT0FBTyxjQUFQLENBQXNCLE1BQU0sU0FBNUIsRUFBdUMsU0FBdkMsRUFBa0Q7QUFDOUMsRUFBQSxXQUFPLGlCQUFZO0FBQUUsRUFBQSxlQUFPLEtBQUssR0FBTCxDQUFTLFVBQUMsQ0FBRDtBQUFBLEVBQUEsbUJBQU8sRUFBRSxPQUFGLEVBQVA7QUFBQSxFQUFBLFNBQVQsRUFBNkIsSUFBN0IsQ0FBa0MsR0FBbEMsQ0FBUDtBQUFnRCxFQUFBLEtBRHZCO0FBRTlDLEVBQUEsY0FBVSxJ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