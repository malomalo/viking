import Type from '../type';
import {each, isEqual, deepAssign, isPlainObject} from '../../support';

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
        } else if (isPlainObject(obj)) {
            // We create a new Object here to get rid of old proxies that
            // are no longer needed or used. There was an issue where proxies
            // were building up and casuing stackoverlows.... however this is
            // not currently able to be tested. Hopefully one day we will be
            // able to test that Proxies aren't building up when setting keys
            const newobj = {};
            each(obj, (k, v) => {
                newobj[k] = this.deepProxy(v, record, rootAttribute);
            });

            return new Proxy(newobj, {
                set: (target, name, value) => {
                    if (!isEqual(target[name], value)) {
                        const rootObject = record[rootAttribute]
                        record.attributes[rootAttribute] = deepAssign({}, rootObject)
                        target[name] = this.deepProxy(value, record, rootAttribute)
                        record.setAttributes({[rootAttribute]: rootObject}, {coerced: true})
                    }
                    return true
                }
            })
        } else {
            return obj;
        }
    }
};
