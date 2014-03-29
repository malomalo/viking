Viking.Coercions.JSON = {

    load: function(value, key) {
        if (typeof value === 'object') {
            var model = new Viking.Model(value);
            model.modelName = key;
            return model;
        }

        throw new TypeError(typeof value + " can't be coerced into JSON");
    },

    dump: function(value) {
        if (value instanceof Viking.Model) {
            return value.toJSON();
        }

        return value;
    }

};