import Value from './value';
import {toISODateString} from '../../support/date';

export default class DateType extends Value {

    // load: (value: string | Date | number): Date
    static load(value) {
        if (typeof value === 'string') {
            var parts = value.split("-");
            return new Date(parts[0], parseInt(parts[1])-1, parts[2])
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
        return value ? toISODateString(value) : null;
    }

};