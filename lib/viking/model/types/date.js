Viking.Model.Type.registry['date'] = Viking.Model.Type.Date = {
    load: function(value) {
        if (typeof value === 'string' || typeof value === 'number') {
            return Date.fromISO(value);
        }

        if (!(value instanceof Date)) {
            throw new TypeError(typeof value + " can't be coerced into Date");
        }

        return value;
    },

    dump: function(value) {
        return value.toISOString();
    }
};