export default {

    // load: function (value: any): string
    load: (value, key, changes, record, typeSettings) => {
        if (value == undefined || value == null) {
            changes[key] = value
        } else if (typeSettings.array) {
            changes[key] = value
        } else if (typeof value == "string") {
            changes[key] = String(value)
        } else {
            throw new TypeError(typeof value + " can't be coerced into UUID");
        }
        
        return true;
    },

    // dump: function (value: string | null | undefined): any
    dump: (value) => {
        return value;
    }
};