import global from '../../global';
import Model from '../../model';

const JSONType = {

    load: function(value, key, className) {

        if (typeof value === 'object') {

            if (key) {
                let name = key.camelize();

                if (global[name]) {
                    let model = new global[name](value);
                    return model;
                }

                return value;
            }

            return value;

            
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
