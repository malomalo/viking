Viking.Model.prototype.set = function (key, val, options) {
    var attrs;
    if (key === null) { return this; }

    // Handle both `"key", value` and `{key: value}` -style arguments.
    if (typeof key === 'object') {
        attrs = key;
        options = val;
    } else {
        (attrs = {})[key] = val;
    }

    if (this.inheritanceAttribute && attrs[this.inheritanceAttribute] && this.constructor.modelName !== attrs.type) {
        // OPTIMIZE:  Mutating the [[Prototype]] of an object, no matter how
        // this is accomplished, is strongly discouraged, because it is very
        // slow and unavoidably slows down subsequent execution in modern
        // JavaScript implementations
        // Ideas: Move to Model.new(...) method of initializing models
        var type = attrs[this.inheritanceAttribute].camelize().constantize();
        this.constructor = type;
        this.__proto__ = type.prototype;
        
        // TODO: move to function, used in Model.new
        // TODO: probably move to a becomes method
        // Set up associations
        this.associations = this.constructor.associations;
        this.reflectOnAssociation = this.constructor.reflectOnAssociation;
        this.reflectOnAssociations = this.constructor.reflectOnAssociations;

        // Initialize any `hasMany` relationships to empty collections
        _.each(this.reflectOnAssociations('hasMany'), function(association) {
            if (!this.attributes[association.name]) {
                this.attributes[association.name] = new (association.collection())();
            }
        }, this);
    }

    this.coerceAttributes(attrs);
    _.each(attrs, function(value, key) {
        var association = this.reflectOnAssociation(key);
        if (association && association.macro === 'hasMany') {
            this.attributes[key].set(value.models);
            _.each(value.models, function(model) {
                model.collection = this.attributes[key];
            }, this);
            delete attrs[key];
        }
    }, this);
    
    return Backbone.Model.prototype.set.call(this, attrs, options);
};