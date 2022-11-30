export default {

    // load: (value: string | boolean): boolean =>
    load: (value, key, changes, record, typeSettings) => {
        const normalize = v => {
            if (typeof v === 'string') {
                v = (v === 'true');
            }
            return !!v
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

    // dump: (value: boolean): any => value
    dump: (value) => value

};
