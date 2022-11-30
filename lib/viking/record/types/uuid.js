import Value from './value';

export default class UUID extends Value {

    // load: function (value: any): string
    static load(value) {
        if (typeof value === 'string') {
            return value;
        }
        
        if (value === undefined || value === null) {
            return value;
        }
        
        throw new TypeError(typeof value + " can't be coerced into UUID");
    }

    // dump: function (value: string | null | undefined): any
    static dump(value) {
        return value;
    }

};