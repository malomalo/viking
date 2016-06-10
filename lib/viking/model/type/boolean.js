// @flow

const BooleanType = {

    load: function (value: string | boolean) {
        if (typeof value === 'string') {
            value = (value === 'true');
        }
        return !!value;
    },

    dump: function(value: boolean) {
        return value;
    }

};

export default BooleanType;
