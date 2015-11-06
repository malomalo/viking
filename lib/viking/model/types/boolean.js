Viking.Model.Type.registry['boolean'] = Viking.Model.Type.Boolean = {
    load: function(value) {
        if (typeof value === 'string') {
            value = (value === 'true');
        }

        return !!value;
    },

    dump: function(value) {
        return value;
    }
};