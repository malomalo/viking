Viking.Coercions.Array = {

    load: function(value, key) {
        if (_.isArray(value)) {
            return value;
        }

        throw new TypeError(typeof value + " can't be coerced into Array");
    },

    dump: function(value) {
        if (_.isArray(value)) {
            return value
        }

        throw new TypeError(typeof value + " can't be dumped into Array");
    }

};
