function functionsOfClass(klass, upto=Object.prototype) {
    let props = [];

    do {
        Object.getOwnPropertyNames(klass).forEach((k) => {
            if (typeof klass[k] === 'function' && props.indexOf(k) === -1) {
                props.push(k);
            }
        });
        klass = Object.getPrototypeOf(klass);
    } while (Object.getPrototypeOf(klass) !== upto);

    return props;
}