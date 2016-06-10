// TODO: test return
export const updateAttributes = function (data, options) {
    options || (options = {});
    options.patch = true;
    
    return this.save(data, options);
};
