export default class Value {

    static set(key, value, inObject, record, typeSettings) {
        if (value == undefined || value == null) {
            inObject[key] = value;
        } else if (typeSettings?.array) {
            inObject[key] = value.map(this.load);
        } else {
            inObject[key] = this.load(value);
        }
        
        return true;
    }

    static load(value) {
        return value;
    }

    static dump(value) {
        return value;
    }
}