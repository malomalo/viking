export default {

    // load: function(value)
    load: (value) => {
        if (typeof value === 'string') {
            value = value.replace(/\,/g, '');

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
