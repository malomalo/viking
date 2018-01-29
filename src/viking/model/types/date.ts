export const DateType = {

    load: (value: string | Date | number): Date => {
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

    dump: (value: Date): string => {
        return value.toISOString();
    }

};
