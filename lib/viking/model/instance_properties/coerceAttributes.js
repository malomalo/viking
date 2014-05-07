Viking.Model.prototype.coerceAttributes = function(attrs) {
    
    _.each(this.associations, function(association) {
        var polymorphic = association.options.polymorphic;
        
        if (!attrs[association.name]) return;
        
        if (polymorphic && (attrs[association.name] instanceof Viking.Model)) {
			// TODO: remove setting the id?
            attrs[association.name + '_id'] = attrs[association.name].id;
            attrs[association.name + '_type'] = attrs[association.name].modelName;
        } else if (polymorphic && attrs[association.name + '_type']) {
            var Type = attrs[association.name + '_type'].camelize().constantize();
            attrs[association.name] = new Type(attrs[association.name]);
        } else if (!(attrs[association.name] instanceof association.klass())) {
            var Type = association.klass();
            attrs[association.name] = new Type(attrs[association.name]);
        }
    });

    _.each(this.coercions, function (type, key) {
        if (attrs[key] || attrs[key] === false) {
            var klass = Viking.Coercions[type];

            if (klass) {
                attrs[key] = klass.load(attrs[key], key);
            } else {
                throw new TypeError("Coercion of " + type + " unsupported");
            }
        }
    });

    return attrs;
    
};