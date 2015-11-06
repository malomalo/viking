Viking.Model.Type.registry['string'] = Viking.Model.Type.String = {
    load: function(value) {
        if (typeof value !== 'string' && value !== undefined && value !== null) {
            return String(value);
        }

        return value;
    },

    dump: function(value) {
        if (typeof value !== 'string' && value !== undefined && value !== null) {
            return String(value);
        }

        return value;
    }
};