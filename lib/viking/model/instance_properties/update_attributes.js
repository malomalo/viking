// TODO: test return
Viking.Model.prototype.updateAttributes = function (data, options) {
    options || (options = {});
    options.patch = true;
    
    return this.save(data, options);
};