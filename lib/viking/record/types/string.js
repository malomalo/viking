export default {

    // load: function (value: any): string
    load: (value) => {
        if (typeof value !== 'string' && value !== undefined && value !== null) {
            return String(value);
        }

        return value;
    },

    // dump: function (value: string | null | undefined): any
    dump: (value) => {
        if (typeof value !== 'string' && value !== undefined && value !== null) {
            return String(value);
        }

        return value;
    }
};