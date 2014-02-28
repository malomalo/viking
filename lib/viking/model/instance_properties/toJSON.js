// similar to Rails as_json method
Viking.Model.prototype.toJSON = function (options) {
    var data = _.clone(this.attributes);
    
    if (options === undefined) { options = {}; }

    if (options.include) {
        if (typeof options.include === 'string') {
            var key = options.include;
            options.include = {};
            options.include[key] = {};
        } else if (_.isArray(options.include)) {
            var array = options.include;
            options.include = {};
            _.each(array, function(key) {
                options.include[key] = {};
            });
        }
    } else {
        options.include = {};
    }

    _.each(this.associations, function(association) {
        if (!options.include[association.name]) {
            delete data[association.name];
        } else if (association.macro === 'belongsTo' || association.macro === 'hasOne') {
            if (data[association.name]) {
                data[association.name+'_attributes'] = data[association.name].toJSON(options.include[association.name]);
                delete data[association.name];
            } else if (data[association.name] === null) {
                data[association.name+'_attributes'] = null;
                delete data[association.name];
            }
        } else if (association.macro === 'hasMany') {
            if (data[association.name]) {
                data[association.name + '_attributes'] = data[association.name].toJSON(options.include[association.name]);
                delete data[association.name];
            }
        }
    });

    _.each(this.coercions, function (type, key) {
        if (data[key] || data[key] === false) {
            var klass = Viking.Coercions[type];

            if (klass) {
                data[key] = klass.dump(data[key], key);
            } else {
                throw new TypeError("Coercion of " + type + " unsupported");
            }
        }
    });

    return data;
};