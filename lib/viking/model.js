// Viking.Model
// ------------
//
// Viking.Model is an extension of [Backbone.Model](http://backbonejs.org/#Model).
// It adds naming,  relationships, data type coerions, and modifies sync to
// work with [Ruby on Rails](http://rubyonrails.org/) out of the box.
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