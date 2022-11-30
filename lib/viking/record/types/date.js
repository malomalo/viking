import {toISODateString} from '../../support/date';

export default {

    // load: (value: string | Date | number): Date
    load: (value, key, changes, record, typeSettings) => {
        const normalize = v => {
            if (typeof v === 'string') {
                var parts = v.split("-");
                return new Date(parts[0], parseInt(parts[1])-1, parts[2])
            }
        
            if (typeof v === 'number') {
                return new Date(v);
            }

            if (!(v instanceof Date) && v !== null) {
                throw new TypeError(typeof v + " can't be coerced into Date");
            }
            return v
        }
        
        if (value == undefined || value == null) {
            changes[key] = value
        } else if (typeSettings?.array) {
            changes[key] = value.map(normalize)
        } else {
            changes[key] = normalize(value)
        }

        return true;
    },

    // dump: (value: Date): string
    dump: (value) => {
        return value ? toISODateString(value) : null;
    }

};
