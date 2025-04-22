const extensionMap = new Map
export function extendClass (name, superClass, newConstructor, staticAttributes={}, instanceAttributes={}) {
    
    newConstructor.prototype = Object.create(superClass.prototype, {
      constructor: {
        value: newConstructor,
        writable: true,
        configurable: true
      }
    })
    
    Object.keys(staticAttributes).forEach(attribute => {
        newConstructor[attribute] = staticAttributes[attribute]
    })
    
    Object.keys(instanceAttributes).forEach(attribute => {
        newConstructor.prototype[attribute] = instanceAttributes[attribute]
    })
    
    Object.defineProperty(newConstructor, 'name', {value: name});

    Object.setPrototypeOf(newConstructor, superClass);
    
    if (!extensionMap.get(superClass)) extensionMap.set(superClass, new Map)
    extensionMap.get(superClass).set(newConstructor, [staticAttributes, instanceAttributes])
    
    if (extensionMap.get(newConstructor)) {
        for (const extendedClass of extensionMap.get(newConstructor).keys()) {
            extendClass(extendedClass.name, newConstructor, extendedClass, ...extensionMap.get(newConstructor).get(extendedClass))
        }
    }
    return newConstructor
}


// TODO: move to support/object
function eachPrototype(obj, fn) {
    fn(obj);
    var proto = Object.getPrototypeOf(obj);
    if ( proto ) {
        eachPrototype(proto, fn);
    }
}

/**
 * Iterates over the (prototype chain)[https://developer.mozilla.org/en-US/docs/Web/JavaScript/Inheritance_and_the_prototype_chain]
 * for a specified property in each prototype
 *
 * @param {Object} obj - The object to climb the property chain with
 * @param {string} key - The property name to find on each prototype
 * @returns {Array} - An array consisting of the property for each prototype
 */
export function scanPrototypesFor(obj, key) {
    let values = [];
    eachPrototype(obj, p => {
        values.push(p[key]);
    })
    return values;
}