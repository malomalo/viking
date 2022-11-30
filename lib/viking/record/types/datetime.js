import {toISODateString} from '../../support/date';

export default {

    // load: (value: string | Date | number): Date
    load: (value, key, changes, record, typeSettings) => {
        const normalize = v => {
            if (typeof v === 'string') {
                if(!v.match(/T\d{2}:\d{2}:\d{2}/) && v.match(/\d{4}-\d{2}-\d{2}/)){
                    return new Date(v+"T00:00:00");
                } else {
                    return new Date(v);
                }
            }
        
            if (typeof v === 'number') {
                return new Date(v);
            }
            
            if (v instanceof Date) {
                return v
            }

            if (!(v instanceof Date) && v !== null) {
                throw new TypeError(typeof v + " can't be coerced into Date");
            }
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
        return value ? value.toISOString() : null;
    }

};
