Viking = {};

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