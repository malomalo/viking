import Type from '../type.js';
import {toISODateString} from '../../support/date.js';

export default class DateTime extends Type {

    // load: (value: string | Date | number): Date
    static load(value) {
        if (typeof value === 'string') {
            if(!value.match(/T\d{2}:\d{2}:\d{2}/) && value.match(/\d{4}-\d{2}-\d{2}/)){
                return new Date(value+"T00:00:00");
            } else {
                return new Date(value);
            }
        }
        
        if (typeof value === 'number') {
            return new Date(value);
        }

        if (!(value instanceof Date) && value !== null) {
            throw new TypeError(typeof value + " can't be coerced into Date");
        }

        return value;
    }

    // dump: (value: Date): string
    static dump(value) {
        return value ? value.toISOString() : null;
    }

};
