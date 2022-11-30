import Value from './value';

export default class Boolean extends Value {

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
