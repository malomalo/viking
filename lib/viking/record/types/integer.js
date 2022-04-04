export default {

    // load: function(value)
    load: (value) => {
        if (typeof value === 'string') {
            if (value.trim() === '') {
                return null;
            }
        }
        
        if (value === null || value === undefined) {
            return value;
        }

        return Number(value);
    },

    dump: (value) => {
        return value;
    }

};
