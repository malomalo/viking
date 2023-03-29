import Type from '../type.js';

export default class Boolean extends Type {

    static load(value) {
        if (typeof value === 'string') {
            value = (value === 'true');
        }
        
        return !!value
    }

    static dump(value) {
        return value;
    }

};
