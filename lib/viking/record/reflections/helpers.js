export function neverEndingProxy(target) {
    return new Proxy(function () {}, {
        get: (fn, prop, receiver) => {
            if ( prop === 'then' ) {
                return target.then.bind(target);
            } else {
                return neverEndingProxy(target.then(t => {
                    if (typeof t[prop] === 'function') {
                        return t[prop].bind(t);
                    } else {
                        return t[prop];
                    }
                }));
            }
        },
        apply: (fn, thisArg, args) => {
            return neverEndingProxy(target.then((t) => t(...args)));
        }
    });
}