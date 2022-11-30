export default {

    // load: function (value: any): string
    load: (value, key, changes, record, typeSettings) => {
        if (value == undefined || value == null) {
            changes[key] = value
        } else if (typeSettings?.array) {
            changes[key] = value.map(v => String(v))
        } else {
            changes[key] = String(value)
        }

        return true;
    },

    // dump: function (value: string | null | undefined): any
    dump: (value) => {
        if (typeof value !== 'string' && value !== undefined && value !== null) {
            return String(value);
        }

        return value;
    }
};