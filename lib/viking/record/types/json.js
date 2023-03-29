import Type from '../type.js';

export default class JSONType extends Type {
    
    // load(value: any)
    static load(value) {
        if (typeof value === 'object') {
            // if (value instanceof Model) {
            //     value = value.attributes;
            // }

            return value;
        }

        throw new TypeError(typeof value + " can't be coerced into JSON");
    }

    static dump(value) {
        // if (value instanceof Model) {
        //     const output = value.toJSON();
        //     _.each(output, (v, k) => {
        //         if (v instanceof Model) {
        //             output[k] = JSONType.dump(v);
        //         }
        //     });
        //     return output;
        // }

        return value;
    }

};
