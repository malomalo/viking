Viking.Coercions.Number = {
    load: function(value) {
        if (typeof value === 'string') {
            value = value.replace(/\,/g, '');
        }

        return Number(value);
    },

    dump: function(value) {
        if (typeof value === 'string') {
            value = value.replace(/\,/g, '');
        }

        return Number(value);
    }
};
