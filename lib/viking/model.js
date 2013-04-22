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
                rel = Backbone.Model.getRelationshipDetails('hasMany', this.hasMany[i]);
                if(!this.attributes[rel.key]) {
                    this.attributes[rel.key] = new rel.type();
                }
            }
        }
    },
    
    // TODO: make the select method work as described below
    //
    // When the model is part of a collection and you want to select a single
    // or multiple items from a collection. If a model is selected `selected`
    // will be set `true`, otherwise it will be `false`.
    //
    // By default any other models in the collection with be unselected. To
    // prevent other models in the collection from being unselected you can
    // pass `true`.
    //
    // The `selected` event is fired when the object is selected.
    select: function(multiple) {
        this.collection.select(this, multiple);
    },
    
    // TODO: implement
    unselect: function() {
        
    },
    
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
    }
    
}, {
    
    // TODO: support not passing in name and just protoProps & staticProps
    // Overide the default extend method to support passing in the model name
    // to be used for url generation and replationships.
    //
    // `name` is optional, and must be a string
    extend: function(name, protoProps, staticProps) {
        var child = Backbone.Model.extend.call(this, protoProps, staticProps);
        child.modelName = name;
        return child;
    },
    
    // Generates the `urlRoot` based off of the model name.
    urlRoot: function() {
        return "/" + this.modelName.pluralize();
    },

    // TODO
    find: function(id, options) {
        Backbone.sync('GET', new this({id: id}), options);
    }
    
});