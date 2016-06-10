const BooleanType = {

    load: function (value) {
        if (typeof value === 'string') {
            value = (value === 'true');
        }
        return !!value;
    },

    dump: function(value) {
        return value;
    }

};

export default BooleanType;
