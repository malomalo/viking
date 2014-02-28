Viking.Model.prototype.coerceAttributes = function(attrs) {
    
    _.each(this.associations, function(association) {
        var Type = association.klass();

        if (attrs[association.name] && !(attrs[association.name] instanceof Type)) {
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