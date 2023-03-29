import Type from '../type.js';

export default class Float extends Type {

    // load: function(value)
    static load(value) {
        if (typeof value === 'string') {
            if (value.trim() === '') {
                return null;
            }
        }
        
        if (value === null || value === undefined) {
            return value;
        }

        return Number(value);
    }

    static dump(value) {
        return value;
    }

};
