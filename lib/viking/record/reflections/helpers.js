const isProxy = Symbol("isProxy")
function wrappingFunction () { }

export function neverEndingProxy(target) {
    return new Proxy(wrappingFunction, {
        get: (fn, prop, receiver) => {
            if (prop === isProxy) { return target; }

            if ( prop === 'then' || prop === 'catch') {
                return target[prop].bind(target);
            } else {
                return neverEndingProxy(target.then(t => {
                    let value = t[prop]
                    if (typeof value === 'function') {
                        let proxyPromise = value[isProxy];
                        if (proxyPromise) {
                            return proxyPromise.then ( (r) => {
                                return typeof r === 'function' ? r.bind(t) : r
                            });
                        } else {
                            return value.bind(t);
                        }
                    } else {
                        return value;
                    }
                }));
            }
        },
        apply: (fn, thisArg, args) => {
            return neverEndingProxy(target.then((t) => t(...args)));
        }
    });
}