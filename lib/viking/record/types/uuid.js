export default {

    // load: function (value: any): string
    load: (value) => {
        if (typeof value === 'string') {
            return value;
        }
        
        if (value === undefined || value === null) {
            return value;
        }
        
        throw new TypeError(typeof value + " can't be coerced into UUID");
    },

    // dump: function (value: string | null | undefined): any
    dump: (value) => {
        return value;
    }
};