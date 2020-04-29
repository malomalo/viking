export default {

    // load: function(value)
    load: (value) => {
        if (typeof value === 'string') {
            if (value.trim() === '') {
                return null;
            }
        }

        return Number(value);
    },

    dump: (value) => {
        return value;
    }

};
