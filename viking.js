//     Viking.js 0.1.0

//     (c) 2012-2013 Jonathan Bracy, 42Floors Inc.
//     Viking.js may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://vikingjs.com

Viking = {};
Date.prototype.strftime = function(fmt) {
    return strftime(fmt, this);
};

Date.prototype.strftimeUTC = function(fmt) {
    return strftimeUTC(fmt, this);
};
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
//    "ActiveModel".underscore         # => "active_model"
//    "ActiveModel::Errors".underscore # => "active_model/errors"
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

// By default, camelize converts strings to UpperCamelCase. If the argument
// to camelize is set to :lower then camelize produces lowerCamelCase.
//
// camelize will also convert '/' to '::' which is useful for converting paths
// to namespaces.
//
// Examples:
//
//    "active_model".camelize               # => "ActiveModel"
//    "active_model".camelize(true)         # => "ActiveModel"
//    "active_model".camelize(false)        # => "activeModel"
//    "active_model/errors".camelize        # => "ActiveModel::Errors"
//    "active_model/errors".camelize(false) # => "activeModel::Errors"
//
// As a rule of thumb you can think of camelize as the inverse of underscore,
// though there are cases where that does not hold:
//
//    "SSLError".underscore.camelize # => "SslError"
String.prototype.camelize = function(uppercase_first_letter) {
    var result = uppercase_first_letter === undefined || uppercase_first_letter ? this.capitalize() : this.anticapitalize();
    result = result.replace(/(_|(\/))([a-z\d]*)/g, function(_a, _b, first, rest) { return (first || '') + rest.capitalize(); });
    return result.replace('/', '::');
};

// Convert a string to a boolean value. If the argument to booleanize() is
// passed if the string is not 'true' or 'false' it will return the argument
//
// Examples:
//
//    "true".booleanize()       # => true
//    "false".booleanize()      # => false
//    "other".booleanize()      # => false
//    "other".booleanize(true)  # => true
String.prototype.booleanize = function(defaultTo) {
    if(this.toString() === 'true') { return true; }
    if (this.toString() === 'false') { return false; }
    
    return (defaultTo === undefined ? false : defaultTo);
};

// Replaces underscores with dashes in the string.
//
// Example:
//
//    "puni_puni" # => "puni-puni"
String.prototype.dasherize = function() {
    return this.replace('_','-');
};

// Replaces special characters in a string so that it may be used as part of a ‘pretty’ URL.
//
// Example:
//
// "Donald E. Knuth".parameterize() # => 'donald-e-knuth'
String.prototype.parameterize = function(seperator) {
    return this.toLowerCase().replace(/[^a-z0-9\-_]+/g, seperator || '-');
};

// Binding on string for _.inflection
String.prototype.pluralize = function(count, includeNumber) {
    return _.pluralize(this, count, includeNumber);
};
String.prototype.singularize = function() {
    return _.singularize(this);
};
(function($) {
    // Backbone.sync
    // -------------

    // Map from CRUD to HTTP for our default `Backbone.sync` implementation.
    var methodMap = {
      'create': 'POST',
      'update': 'PUT',
      'patch':  'PATCH',
      'delete': 'DELETE',
      'read':   'GET'
    };

    var getUrl = function(object) {
      if (!(object && object.url)) { return null; }
      return _.isFunction(object.url) ? object.url() : object.url;
    };

    var urlError = function() {
      throw new Error("A 'url' property or function must be specified");
    };

    // Override this function to change the manner in which Backbone persists
    // models to the server. You will be passed the type of request, and the
    // model in question. By default, makes a RESTful Ajax request
    // to the model's `url()`. Some possible customizations could be:
    //
    // * Use `setTimeout` to batch rapid-fire updates into a single request.
    // * Send up the models as XML instead of JSON.
    // * Persist models via WebSockets instead of Ajax.
    //
    // Turn on `Backbone.emulateHTTP` in order to send `PUT` and `DELETE` requests
    // as `POST`, with a `_method` parameter containing the true HTTP method,
    // as well as all requests with the body as `application/x-www-form-urlencoded`
    // instead of `application/json` with the model in a param named `model`.
    // Useful when interfacing with server-side languages like **PHP** that make
    // it difficult to read the body of `PUT` requests.
    Backbone.sync = function(method, model, options) {
      var type = methodMap[method];

      // Default options, unless specified.
      _.defaults(options || (options = {}), {
        emulateHTTP: Backbone.emulateHTTP,
        emulateJSON: Backbone.emulateJSON
      });

      // Default JSON-request options.
      var params = {
          type: type,
          dataType: 'json',
          beforeSend: function( xhr ) {
              var token = $('meta[name="csrf-token"]').attr('content');
              if (token) { xhr.setRequestHeader('X-CSRF-Token', token); }
          }
      };

      // Ensure that we have a URL.
      if (!options.url) {
        params.url = _.result(model, 'url') || urlError();
      }

      // Ensure that we have the appropriate request data.
      if (options.data === null && model && (method === 'create' || method === 'update' || method === 'patch')) {
        params.contentType = 'application/json';
        params.data = {};
        params.data[_.result(model, 'paramRoot')] = model.toJSON(options);
        params.data = JSON.stringify(params.data);
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
      // if (params.type !== 'GET' && !options.emulateJSON) {
      //   params.processData = false;
      // }

      var success = options.success;
      options.success = function(resp) {
        if (success) { success(model, resp, options); }
        model.trigger('sync', model, resp, options);
      };

      var error = options.error;
      var invalid = options.invalid;
      options.error = function(xhr) {
          if(xhr.status >= 400 && xhr.status <= 400) {
              var resp = JSON.parse(xhr.responseText);
              if (invalid) { invalid(model, resp, options); }
              model.trigger('invalid', model, resp, options);
          } else {
              if (error) { error(model, xhr, options); }
              model.trigger('error', model, xhr, options);
          }
      };

      // Make the request, allowing the user to override any Ajax options.
      var xhr = options.xhr = Backbone.ajax(_.extend(params, options));
      model.trigger('request', model, xhr, options);
      return xhr;
    };

    Backbone.Model.prototype.updateAttribute = function (key, value){
        var data;
        
        this.set(key, value);
        (data = {})[key] = value;
        this.updateAttributes(data);
    };
    
    Backbone.Model.prototype.updateAttributes = function (data){
        this.set(data);
        var scoped_data = {};
        scoped_data[_.result(this, 'paramRoot')] = data;
        this.sync('update', this, { data: scoped_data });
    };

}(jQuery));
Backbone.Model.getRelationshipDetails = function (type, key, options) {
    // Handle both `type, key, options` and `type, [key, options]` style arguments
    if (_.isArray(key)) {
        options = key[1];
        key = key[0];
    }

    var relation = {
        key: key
    };

    if (options) {
        if (type === 'hasMany' && options.collection) {
            relation.type = window[options.collection];
        } else if (type === 'hasMany' && options.model) {
            relation.type = window[options.model + 'Collection'];
        } else {
            relation.type = window[options.model];
        }
    } else {
        if (type === 'belongsTo') {
            relation.type = window[relation.key.camelize()];
        } else if (type === 'hasMany') {
            relation.type = window[relation.key.camelize(true).replace(/s$/, '') + 'Collection'];
        }
    }
    
    return relation;
};

Backbone.Model.prototype.coerceAttributes = function (attrs) {
    var rel, i, type, klass;
    
    if (this.belongsTo) {
        for (i = 0; i < this.belongsTo.length; i++) {
            rel = Backbone.Model.getRelationshipDetails('belongsTo', this.belongsTo[i]);
            if (attrs[rel.key] && !(attrs[rel.key] instanceof rel.type)) {
                attrs[rel.key] = new rel.type(attrs[rel.key]);
            }
        }
    }
    
    if (this.hasMany) {
        for (i = 0; i < this.hasMany.length; i++) {
            rel = Backbone.Model.getRelationshipDetails('hasMany', this.hasMany[i]);
            if (attrs[rel.key] && !(attrs[rel.key] instanceof rel.type)) {
                attrs[rel.key] = new rel.type(attrs[rel.key]);
            }
        }
    }
    
    if (this.coercions) {
        _.each(this.coercions, function (type, key) {
            if (attrs[key]) {
                klass = window[type];

                if (klass === Date) {
                    if (typeof attrs[key] === 'string' || typeof attrs[key] === 'number') {
                        attrs[key] = new Date(attrs[key]);
                    } else if (!(attrs[key] instanceof Date)) {
                        throw new TypeError(typeof attrs[key] + " can't be coerced into " + type);
                    }
                } else {
                    throw new TypeError("Coercion of " + type + " unsupported");
                }
            }
        });
    }
    
    return attrs;
};


Backbone.Model.prototype.set = (function set(original) {
    return function (key, val, options) {
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

        return original.call(this, attrs, options);
    };
}(Backbone.Model.prototype.set));


Backbone.Model.prototype.toJSON = function (options) {
    var rel, i;
    var data = _.clone(this.attributes);
    
    if (this.belongsTo) {
        for (i = 0; i < this.belongsTo.length; i++) {
            rel = Backbone.Model.getRelationshipDetails('belongsTo', this.belongsTo[i]);
            
            if (data[rel.key]) {
                data[rel.key+'_attributes'] = data[rel.key].toJSON();
                delete data[rel.key];
            }
        }
    }
    
    if (this.hasMany) {
        for (i = 0; i < this.hasMany.length; i++) {
            rel = Backbone.Model.getRelationshipDetails('hasMany', this.hasMany[i]);
                        
            if (data[rel.key]) {
                data[rel.key + '_attributes'] = data[rel.key].toJSON();
                delete data[rel.key];
            }
        }
    }
    
    if (this.coercions) {
        _.each(this.coercions, function (type, key) {
            if (data[key]) {
                if (type === 'Date') {
                    data[key] = data[key].toISOString();
                } else {
                    throw new TypeError("Coercion of " + type + " unsupported");
                }
            }
        });
    }

    return data;
};
Viking.Model = Backbone.Model.extend({
    constructor: function() {
        Backbone.Model.apply(this, arguments);
        this.modelName = this.constructor.modelName;
    },
    
    select: function(clearCurrentlySelected) {
        this.collection.select(this, clearCurrentlySelected);
    },
    
    // TODO: testme
    toParam: function() {
        return this.isNew() ? null : this.get('id');
    },
    
    urlRoot: function() {
        return this.constructor.urlRoot();
    },
    paramRoot: function() {
        return this.modelName.underscore();
    }
    
}, {
    extend: function(name, protoProps, staticProps) {
        var child = Backbone.Model.extend.call(this, protoProps, staticProps);
        child.modelName = name;
        return child;
    },
    urlRoot: function() {
        return "/" + this.modelName.pluralize();
    },

    find: function(id, options) {
        Backbone.sync('GET', new this({id: id}), options);
    }
    
});
Viking.Collection = Backbone.Collection.extend({
    model: Viking.Model,

    constructor: function(models, options) {
        Backbone.Collection.apply(this, arguments);
        
        if(options && options.filter) {
            this.setFilter(options.filter, {silent: true});
        }
    },
    
    url: function() {
        return "/" + this.model.modelName.underscore().pluralize();
    },
    paramRoot: function() {
        return this.model.modelName.underscore().pluralize();
    },
    
    // If a filter is set it's paramaters will be passed as under the
    // filter namespace when querying the server
    setFilter: function(filter, options) {
        if(this._filter) {
            this.stopListening(this._filter);
        }
        
        if(filter) {
            this._filter = filter;
            this.listenTo(filter, 'change', this.filterChanged);
            if(!(options && options.silent)) {
                this.filterChanged();
            }
        } else {
            delete this._filter;
        }
    },
    
    filterChanged: function(filter, options) {
        this.fetch(options);
    },

    // Sets `'@selected'` to `true` on the `model`. If `clearCurrentlySelected`
    // is truthy all other models will have `@selected` set to `false`.
    // Also triggers the `selected` event on the collection. If the model is
    // already selected the `selected` event is not triggered
    select: function(model, clearCurrentlySelected) {
        if(!clearCurrentlySelected) {
            this.clearSelected(model);
        }
        if(!model.get('@selected')) {
            model.set('@selected', true);
            this.trigger('selected', this.selected());
        }
    },
    
    // returns all the models where `@selected` == true
    selected: function() {
        return this.filter(function(m) {
            return m.get('@selected');
        });
    },
    
    // Sets `'@selected'` to `false` on all models
    clearSelected: function(exceptModel) {
        if(exceptModel instanceof Viking.Model) {
            exceptModel = exceptModel.cid;
        }
        this.each(function(m) {
            if(m.cid !== exceptModel) {
                m.set('@selected', false);
            }
        });
    },
    
    sync: function(method, model, options) {
        if(method === 'read' && this._filter) {
            options.data || (options.data = {});
            options.data.filters = this._filter.attributes;
        }
        Backbone.sync.call(this, method, model, options);
    }
    
});
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
    
    filterChanged: function(filter, options) {
        this.cursor.reset({silent: true});
        this.cursorChanged(undefined, options);
    },
    
    cursorChanged: function(cursor, options) {
        this.fetch(options);
    },
    
    parse: function(response, xhr) {
        this.cursor.set({
            page: parseInt(response.page, 10),
            per_page: parseInt(response.per_page, 10),
            offset: parseInt(response.offset, 10),
            total: parseInt(response.total, 10),
            total_pages: parseInt(response.total_pages, 10),
            count: parseInt(response.count, 10)
        });
        return response[this.paramRoot()];
    },
    
    sync: function(method, model, options) {
        if(method === 'read') {
            options.data || (options.data = {});
            options.data.page = model.cursor.get('page');
            options.data.per_page = model.cursor.get('per_page');
            options.data.offset = model.cursor.get('offset');
        }
        Viking.Collection.prototype.sync.call(this, method, model, options);
    }
    
});
Viking.Controller = Backbone.Model.extend({}, {
    
    instance: function(onInstantiated, onInstantiation) {
        if(this._instance) {
            if(onInstantiated) { onInstantiated(this._instance); }
        } else {
            this._instance = new this();
            if(onInstantiation) { onInstantiation(this._instance); }
        }

        return this._instance;
    }
});
Viking.Filter = Backbone.Model.extend({
});
Viking.Cursor = Backbone.Model.extend({
    defaults: {
        page: 1,
        offset: 0,
        per_page: 40,
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
    
    route: function(route, callback) {
        if (!_.isRegExp(route)) { route = this._routeToRegExp(route); }
        Backbone.history.route(route, _.bind(function(fragment) {
            var args = this._extractParameters(route, fragment);
            if (window[callback.controller] && window[callback.controller][callback.action]) {
                window[callback.controller][callback.action].apply(this, args);
            }
            this.trigger.apply(this, ['route:' + callback.name].concat(args));
            this.trigger('route', callback.name, args);
            Backbone.history.trigger('route', this, route, args);
        }, this));
        return this;
    },
    
    start: function() {
        return Backbone.history.start({pushState: true});
    },
    stop: function() {
        Backbone.history.stop();
    },
    
    navigate: function(fragment, args) {
        var root_url = window.location.protocol + '//' + window.location.host;
        if(fragment.indexOf(root_url) === 0) { fragment = fragment.replace(root_url, ''); }
        
        Backbone.Router.prototype.navigate.call(this, fragment, args);
    }
    
});











