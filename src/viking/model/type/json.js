import global from '../../global';
import Model from '../../model';

const JSONType = {

    load: function(value, key, klass) {

        if (typeof value === 'object') {
            if (klass) {
                let model = new global[klass](value);
                return model;
            } else {
                return value;
            }
        }

        throw new TypeError(typeof value + " can't be coerced into JSON");
    },

    dump: function (value) {
        if (value instanceof Model) {
            return value.toJSON();
        }
        return value;
    }

};

export default JSONType;
