import Type from '../type';
import {isEqual, deepAssign} from '../../support';

export default class JSONType extends Type {
    
    static set(key, value, inObject, record, typeSettings) {
        if (value == undefined || value == null) {
            inObject[key] = value;
        } else if (typeof value === 'object') {
            inObject[key] = this.deepProxy(value, record, key);
        } else {
            throw new TypeError(typeof value + " can't be coerced into JSON");
        }
        
        return true;
    }

    static dump(value) {
        return value;
    }
    
    static deepProxy(obj, record, rootAttribute) {
        if (Array.isArray(obj)) {
            return obj.map(x => this.deepProxy(x, record, rootAttribute))
        } else if (typeof obj == "object") {
            Object.keys(obj).forEach(key => {
                obj[key] = this.deepProxy(obj[key], record, rootAttribute)
            })
            return new Proxy(obj, {
                get: (target, name) => target[name], // may not be necessary
                set: (target, name, value) => {
                    if (isEqual(target[name], value)){
                        target[name] = this.deepProxy(value, record, rootAttribute)
                    } else {
                        const rootObject = record[rootAttribute]
                        record.attributes[rootAttribute] = deepAssign({}, rootObject)
                        target[name] = this.deepProxy(value, record, rootAttribute)
                        record.setAttributes({[rootAttribute]: rootObject}, true)
                    }
                    return true
                }
            })
        } else {
            return obj
        }
    }
};
