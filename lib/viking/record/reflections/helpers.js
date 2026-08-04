const isProxy = Symbol("isProxy")
const shielded = Symbol("shielded")
function wrappingFunction () { }

// Promise resolution assimilates any thenable returned from a `then`
// callback. Chained values that are thenable but not real Promises (e.g. a
// thenable CollectionAssociation) must travel the proxy chain intact, so
// they are wrapped in a non-thenable carrier and unwrapped where the chain
// consumes them. Real Promises (async method return values) still
// assimilate so chaining past them resolves their values.
function shield(value) {
    if (value && typeof value.then === 'function' && !(value instanceof Promise)) {
        return {[shielded]: value};
    }
    return value;
}

function unshield(value) {
    if (value && typeof value === 'object' && shielded in value) {
        return value[shielded];
    }
    return value;
}

export function neverEndingProxy(target) {
    return new Proxy(wrappingFunction, {
        get: (fn, prop, receiver) => {
            if (prop === isProxy) { return target; }

            if ( prop === 'then' || prop === 'catch') {
                // Terminal await: unshielding inside `then` lets a shielded
                // thenable assimilate, so `await model.parent.children`
                // loads and resolves to the records.
                const resolved = target.then(unshield);
                return resolved[prop].bind(resolved);
            } else {
                return neverEndingProxy(target.then(t => {
                    t = unshield(t);
                    let value = t[prop]
                    if (typeof value === 'function') {
                        let proxyPromise = value[isProxy];
                        if (proxyPromise) {
                            return proxyPromise.then ( (r) => {
                                return shield(typeof r === 'function' ? r.bind(t) : r)
                            });
                        } else {
                            return value.bind(t);
                        }
                    } else {
                        return shield(value);
                    }
                }));
            }
        },
        apply: (fn, thisArg, args) => {
            return neverEndingProxy(target.then((t) => shield(unshield(t)(...args))));
        }
    });
}
