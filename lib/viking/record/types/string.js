import Type from '../type';

export default class StringType extends Type {

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