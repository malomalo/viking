import Value from './value';

export default class Integer extends Value {

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
