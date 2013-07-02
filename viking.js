//     Viking.js 0.1.0
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
// in Javascript projects outside of Rails.
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
// Viking.Model
// ------------
//
// Viking.Model is an extension of [Backbone.Model](http://backbonejs.org/#Model).
// It adds naming, relationships, data type coerions, selection, and modifies
// sync to work with [Ruby on Rails](http://rubyonrails.org/) out of the box.
Viking.Model = Backbone.Model.extend({
    
    constructor: function () {
        // Initialize the object as a Backbone Model
        Backbone.Model.apply(this, arguments);
        
        // Add a helper reference to get the model name from an model instance.
        this.modelName = this.constructor.modelName;
        
        // Initialize any `hasMany` relationships to empty collections if
        // they are not defined yet.
        var rel, i;
        if (this.hasMany) {
            for (i = 0; i < this.hasMany.length; i++) {
                rel = Viking.Model.getRelationshipDetails('hasMany', this.hasMany[i]);
                if(!this.attributes[rel.key]) {
                    this.attributes[rel.key] = new rel.type();
                }
            }
        }
    },
    
    // When the model is part of a collection and you want to select a single
    // or multiple items from a collection. If a model is selected 
	// `model.selected` will be set `true`, otherwise it will be `false`.
    //
    // By default any other models in the collection with be unselected. To
    // prevent other models in the collection from being unselected you can
    // pass `true`.
    //
    // The `selected` and `unselected` events are fired when appropriate.
    select: function(multiple) {
        this.collection.select(this, multiple);
    },
    
    // TODO: implement
    unselect: function() {
		if(this.selected) {
	        this.selected = false;
			this.trigger('unselected', this);			
		}
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

        return Backbone.Model.prototype.set.call(this, attrs, options);
    },
    
    // Override [Backbone.Model#sync](http://backbonejs.org/#Model-sync).
    // [Ruby on Rails](http://rubyonrails.org/) expects the attributes to be
    // namespaced
    sync: function(method, model, options) {
        options || (options = {});
        
        if (!options.data && (method === 'create' || method === 'update' || method === 'patch')) {
            options.contentType = 'application/json';
            options.data = {};
            options.data[_.result(model, 'paramRoot')] = (options.attrs || model.toJSON(options));
            options.data = JSON.stringify(options.data);
        }

        return Backbone.sync.call(this, method, model, options);
    },
    
    coerceAttributes: function(attrs) {
        var rel, i, type, klass;

        if (this.belongsTo) {
            for (i = 0; i < this.belongsTo.length; i++) {
                rel = Viking.Model.getRelationshipDetails('belongsTo', this.belongsTo[i]);
                if (attrs[rel.key] && !(attrs[rel.key] instanceof rel.type)) {
                    attrs[rel.key] = new rel.type(attrs[rel.key]);
                }
            }
        }

        if (this.hasMany) {
            for (i = 0; i < this.hasMany.length; i++) {
                rel = Viking.Model.getRelationshipDetails('hasMany', this.hasMany[i]);
                if (attrs[rel.key] && !(attrs[rel.key] instanceof rel.type)) {
                    attrs[rel.key] = new rel.type(attrs[rel.key]);
                }
            }
        }

        _.each(this.coercions, function (type, key) {
            if (attrs[key]) {
                klass = window[type];
                if (klass === Date) {
                    if (typeof attrs[key] === 'string' || typeof attrs[key] === 'number') {
                        attrs[key] = Date.fromISO(attrs[key]);
                    } else if (!(attrs[key] instanceof Date)) {
                        throw new TypeError(typeof attrs[key] + " can't be coerced into " + type);
                    }
                } else {
                    throw new TypeError("Coercion of " + type + " unsupported");
                }
            }
        });

        return attrs;
    },
    
    toJSON: function (options) {
        var rel, i;
        var data = _.clone(this.attributes);

        if (this.belongsTo) {
            for (i = 0; i < this.belongsTo.length; i++) {
                rel = Viking.Model.getRelationshipDetails('belongsTo', this.belongsTo[i]);

                if (data[rel.key]) {
                    data[rel.key+'_attributes'] = data[rel.key].toJSON();
                    delete data[rel.key];
                } else if (data[rel.key] === null) {
                    data[rel.key+'_attributes'] = null;
                    delete data[rel.key];
                }
            }
        }

        if (this.hasMany) {
            for (i = 0; i < this.hasMany.length; i++) {
                rel = Viking.Model.getRelationshipDetails('hasMany', this.hasMany[i]);

                if (data[rel.key]) {
                    data[rel.key + '_attributes'] = data[rel.key].toJSON();
                    delete data[rel.key];
                }
            }
        }

        _.each(this.coercions, function (type, key) {
            if (data[key]) {
                if (type === 'Date') {
                    data[key] = data[key].toISOString();
                } else {
                    throw new TypeError("Coercion of " + type + " unsupported");
                }
            }
        });

        return data;
    }
    
}, {
    
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
        var child = Backbone.Model.extend.call(this, protoProps, staticProps);
        if(typeof name === 'string') { child.modelName = name; }
        return child;
    },
    
    // Generates the `urlRoot` based off of the model name.
    urlRoot: function() {
        return "/" + this.modelName.pluralize();
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
    },
    
	// Used internally by Viking to translate relation arguments to key and
	// Model
    getRelationshipDetails: function (type, key, options) {
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

    // Sets `'selected'` to `true` on the `model`. If `clearCurrentlySelected`
    // is truthy all other models will have `selected` set to `false`.
    // Also triggers the `selected` event on the collection. If the model is
    // already selected the `selected` event is not triggered
    select: function(model, clearCurrentlySelected) {
        if(!clearCurrentlySelected) {
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
    
    sync: function(method, model, options) {
        if(method === 'read' && this.predicate) {
            options.data || (options.data = {});
            options.data.where = this.predicate.attributes;
        }
        return Backbone.sync.call(this, method, model, options);
    }
    
});
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
    var data;
    (data = {})[key] = value;
    this.updateAttributes(data, options);
};

Backbone.Model.prototype.updateAttributes = function (data, options) {
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






