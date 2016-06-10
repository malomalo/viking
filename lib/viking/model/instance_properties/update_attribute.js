// TODO: test return
export const updateAttribute = function (key, value, options) {
    let data = {};
    data[key] = value;
    
    return this.updateAttributes(data, options);
};
