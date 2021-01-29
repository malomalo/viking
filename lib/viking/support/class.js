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