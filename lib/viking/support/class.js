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
    
    return newConstructor
}


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