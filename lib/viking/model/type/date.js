// @flow

const DateType = {

    load: function(value: Date | string) {
        if (typeof value === 'string' || typeof value === 'number') {
            return Date.fromISO(value);
        }

        if (!(value instanceof Date)) {
            throw new TypeError(typeof value + " can't be coerced into Date");
        }

        return value;
    },

    dump: function(value: Date) {
        return value.toISOString();
    }

};

export default DateType;
