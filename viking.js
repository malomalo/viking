//     Viking.js 0.1.0
//
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
jQuery(document).ajaxSend(function(event, xhr, settings) {
    var token = jQuery('meta[name="csrf-token"]').attr('content');
    if (token) { xhr.setRequestHeader('X-CSRF-Token', token); }
});
Backbone.Model.prototype.updateAttribute = function (key, value, options){
    var data;
    
    (data = {})[key] = value;
    this.updateAttributes(data, options);
};

Backbone.Model.prototype.updateAttributes = function (data, options) {
    this.save(data, options)
};
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
Viking.config = function(obj, key, val) {
    var attrs;
    
    // Handle both `"key", value` and `{key: value}` -style arguments.
    if (typeof key === 'object') {
      attrs = key;
    } else {
      (attrs = {})[key] = val;
    }
    
    return _.extend(obj.prototype.defaults, attrs);
}
;
Viking.Model = Backbone.Model.extend({
    constructor: function() {
        // Initialize the object as a Backbone Model
        Backbone.Model.apply(this, arguments);
        
        // Add a helper reference to get the model name from an instance
        // of the model
        this.modelName = this.constructor.modelName;
        
        // Initialize the `hasMany` collections to an empty collection if
        // they are not defined
        var rel, i;
        if (this.hasMany) {
            for (i = 0; i < this.hasMany.length; i++) {
                rel = Backbone.Model.getRelationshipDetails('hasMany', this.hasMany[i]);
                if(!this.attributes[rel.key]) {
                    this.attributes[rel.key] = new rel.type();
                }
            }
        }
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
    },
    
    // Override the default Backbone.Model.sync. Rails expects namespaced
    // attribute
    sync: function(method, model, options) {
        options || (options = {});
        
        if (!options.data && model && (method === 'create' || method === 'update' || method === 'patch')) {
            options.contentType = 'application/json';
            options.data = {};
            options.data[_.result(model, 'paramRoot')] = (options.attrs || model.toJSON(options));
            options.data = JSON.stringify(options.data);
        }

        return Backbone.sync.call(this, method, model, options);
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
        
        if(options && options.predicate) {
            this.setPredicate(options.predicate, {silent: true});
        }
    },
    
    url: function() {
        return "/" + this.model.modelName.underscore().pluralize();
    },
    paramRoot: function() {
        return this.model.modelName.underscore().pluralize();
    },
    
    // If a predicate is set it's paramaters will be passed under the
    // predicate namespace when querying the server. #predicateChanged is
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

    // Sets `'selected'` to `true` on the `model`. If `clearCurrentlySelected`
    // is truthy all other models will have `selected` set to `false`.
    // Also triggers the `selected` event on the collection. If the model is
    // already selected the `selected` event is not triggered
    select: function(model, clearCurrentlySelected) {
        if(!clearCurrentlySelected) {
            this.clearSelected(model);
        }
        if(!model.get('selected')) {
            model.set('selected', true);
            this.trigger('selected', this.selected());
        }
    },
    
    // returns all the models where `selected` == true
    selected: function() {
        return this.filter(function(m) { return m.get('selected'); });
    },
    
    // Sets `'selected'` to `false` on all models
    clearSelected: function(exceptModel) {
        if(exceptModel instanceof Viking.Model) {
            exceptModel = exceptModel.cid;
        }
        this.each(function(m) {
            if(m.cid !== exceptModel) {
                m.set('selected', false);
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
        
        var complete = options.complete
        options.complete = _.bind(function() {
            delete this.xhr;
            if(complete) { complete(); }
        }, this);
        
        if (this.xhr) { this.xhr.abort(); }
        this.xhr = Backbone.Collection.prototype.fetch.call(this, options);
    },
    
    sync: function(method, model, options) {
        if(method === 'read' && this.predicate) {
            options.data || (options.data = {});
            options.data.predicate = this.predicate.attributes;
        }
        return Backbone.sync.call(this, method, model, options);
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
    
    predicateChanged: function(predicate, options) {
        this.cursor.reset({silent: true});
        this.cursorChanged();
    },
    
    cursorChanged: function(cursor, options) {
        this.fetch();
    },
    
    parse: function(attrs, xhr) {
        this.cursor.set({
            page: parseInt(attrs.page, 10),
            per_page: parseInt(attrs.per_page, 10),
            offset: parseInt(attrs.offset, 10),
            total: parseInt(attrs.total, 10),
            total_pages: parseInt(attrs.total_pages, 10),
            count: parseInt(attrs.count, 10)
        });
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













