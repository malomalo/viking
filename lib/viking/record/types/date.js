export default {

    // load: (value: string | Date | number): Date
    load: (value) => {
        if (typeof value === 'string') {
            return new Date(value);
        }
        
        if (typeof value === 'number') {
            return new Date(value);
        }

        if (!(value instanceof Date)) {
            throw new TypeError(typeof value + " can't be coerced into Date");
        }

        return value;
    },

    // dump: (value: Date): string
    dump: (value) => {
        return value.toISOString();
    }

};
