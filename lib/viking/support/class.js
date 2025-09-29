const extensionMap = new Map
    
/**
 * @module Support.Class
 * @memberof Support
 * @ignore
 */

/**
 * Extends a class with a superclass and adds attributes
 * 
 * @ignore
 * @param {string} name - The name for the new class
 * @param {Function} superClass - The class to extend from
 * @param {Function} newConstructor - The constructor function for the new class
 * @param {Object} [staticAttributes={}] - Static attributes to add to the class
 * @param {Object} [instanceAttributes={}] - Instance attributes to add to the class prototype
 * @returns {Function} The extended class
 */
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


/**
 * Helper function to iterate through each prototype in the prototype chain
 * TODO: move to support/object
 * 
 * @ignore
 * @param {Object} obj - The object to traverse the prototype chain of
 * @param {Function} fn - Function to call for each prototype in the chain
 * @private
 */
function eachPrototype(obj, fn) {
    fn(obj);
    var proto = Object.getPrototypeOf(obj);
    if ( proto ) {
        eachPrototype(proto, fn);
    }
}

/**
 * Iterates over the [prototype chain](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Inheritance_and_the_prototype_chain)
 * for a specified property in each prototype
 *
 * @ignore
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