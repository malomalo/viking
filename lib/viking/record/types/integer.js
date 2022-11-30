export default {

    // load: function(value)
    load: (value, key, changes, record, typeSettings) => {
        const normalize = v => {
            if (typeof v === 'string') {
                if (v.trim() === '') {
                    return null;
                }
            }
            return Number(v)
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

    dump: (value) => {
        return value;
    }
};
