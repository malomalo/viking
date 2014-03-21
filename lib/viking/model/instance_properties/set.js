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

    if (attrs.type && this.constructor.modelName !== attrs.type) {
        // OPTIMIZE:  Mutating the [[Prototype]] of an object, no matter how
        // this is accomplished, is strongly discouraged, because it is very
        // slow and unavoidably slows down subsequent execution in modern
        // JavaScript implementations
        // Ideas: Move to Model.new(...) method of initializing models
        var type = attrs.type.camelize().constantize();
        this.constructor = type;
        this.__proto__ = type.prototype;
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