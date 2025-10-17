export default class Type {

    /**
     * Sets the key(s) in target to the coerced value(s)
     * 
     * @param {string} key - Key name in target to set
     * @param {*} value - Value to coerce and set in target
     * @param {Object} target - An Object where the key(s)/value(s) get set
     * @param {Object} attributes - Attributes currently being coerced and set
     *                              in the target
     * @param {Record|null} record - The recordAttributes that currently set on the
     *                                     record before setting attributesToCoerce
     * @param {Object} typeSettings - settings for the type (ie. {array: true})
     * @return {boolean} True is returned if the key is succesfully set to the 
     *                    coerced value in target, false otherwise. If false is 
     *                    returned this function will be called again with the keys
     *                    that could be coerced set in target. This allows you to
     *                    have a type that depends on another key that may have
     *                    not been coerced yet
     */
    static set(key, value, target, attributes, record, typeSettings) {
        if (value == undefined || value == null) {
            target[key] = value;
        } else if (typeSettings?.array) {
            target[key] = value.map(this.load);
        } else {
            target[key] = this.load(value);
        }
        
        return true;
    }
    
    /**
     * Get the serialized value for the API / Database
     * @param {*} value - the value to serialize
     * @param {Object} typeSettings - settings about the type
     * @returns {*} the serialized value
     */
    static get(value, typeSettings) {
        if (typeSettings.array) {
            if (value === null || value === undefined) {
                return null;
            } else {
                return value.map(this.dump);
            }
        } else {
            return this.dump(value);
        }
    }

    /**
     * Load/coerce a value from its serialized form (from the API / database format)
     * @param {*} value - the value to load
     * @returns {*} the loaded value
     */
    static load(value) {
        return value;
    }

    /**
     * Dump/serialize a value to its serialized form (for the API / database)
     * @param {*} value - the value to dump
     * @returns {*} the dumped value
     */
    static dump(value) {
        return value;
    }
}