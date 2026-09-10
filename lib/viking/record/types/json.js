import Type from '../type.js';
import {each, isEqual, deepAssign, isPlainObject} from '../../support.js';

// Methods spec'd as multiple internal [[Set]]/[[Delete]] steps (e.g. pop
// deletes an index then sets .length). Left unintercepted, each internal
// step would fire the `set`/`deleteProperty` traps separately, producing
// transient "holes" and multiple partial change records for what is
// logically one mutation. These are applied atomically instead, directly
// against the raw backing array, and tracked as a single change.
const MUTATING_ARRAY_METHODS = ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse', 'fill', 'copyWithin'];

export default class JSONType extends Type {

    static set(key, value, target, attributes, record, typeSettings) {
        if (value == undefined || value == null) {
            target[key] = value;
        } else if (typeof value === 'object') {
            target[key] = this.deepProxy(value, record, key);
        } else {
            throw new TypeError(typeof value + " can't be coerced into JSON");
        }

        return true;
    }

    static dump(value) {
        return value;
    }

    static applyArrayMethod(target, method, args, record, rootAttribute) {
        switch (method) {
        case 'push':
        case 'unshift':
            return Array.prototype[method].apply(target, args.map(a => this.deepProxy(a, record, rootAttribute)));
        case 'splice': {
            const [start, deleteCount, ...items] = args;
            const proxiedItems = items.map(a => this.deepProxy(a, record, rootAttribute));
            return deleteCount === undefined
                ? target.splice(start)
                : target.splice(start, deleteCount, ...proxiedItems);
        }
        case 'fill': {
            const [value, ...rest] = args;
            return target.fill(this.deepProxy(value, record, rootAttribute), ...rest);
        }
        default:
            return Array.prototype[method].apply(target, args);
        }
    }

    static deepProxy(obj, record, rootAttribute) {
        const trackChange = (mutate) => {
            const rootObject = record[rootAttribute]
            record.attributes[rootAttribute] = deepAssign(Array.isArray(rootObject) ? [] : {}, rootObject)
            const result = mutate()
            record.setAttributes({[rootAttribute]: rootObject}, {coerced: true})
            return result
        };

        const handler = {
            set: (target, name, value) => {
                if (!isEqual(target[name], value)) {
                    return trackChange(() => {
                        target[name] = this.deepProxy(value, record, rootAttribute)
                        return true
                    })
                }
                return true
            },
            deleteProperty: (target, name) => {
                if (name in target) {
                    return trackChange(() => {
                        delete target[name]
                        return true
                    })
                }
                return true
            }
        };

        if (Array.isArray(obj)) {
            const arr = obj.map(x => this.deepProxy(x, record, rootAttribute));

            return new Proxy(arr, {
                ...handler,
                get: (target, name, receiver) => {
                    if (MUTATING_ARRAY_METHODS.includes(name)) {
                        return (...args) => trackChange(() => this.applyArrayMethod(target, name, args, record, rootAttribute))
                    }
                    return Reflect.get(target, name, receiver)
                }
            })
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

            return new Proxy(newobj, handler)
        } else {
            return obj;
        }
    }
};
