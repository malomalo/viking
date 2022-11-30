import Value from './value';

export default class StringType extends Value {

    // load: function (value: any): string
    static load(value) {
        if (typeof value !== 'string' && value !== undefined && value !== null) {
            return String(value);
        }

        return value;
    }

    // dump: function (value: string | null | undefined): any
    static dump(value) {
        if (typeof value !== 'string' && value !== undefined && value !== null) {
            return String(value);
        }

        return value;
    }
};