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