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