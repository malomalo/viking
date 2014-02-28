// TODO: test return
Viking.Model.prototype.updateAttribute = function (key, value, options) {
    var data = {};
    data[key] = value;
    
    return this.updateAttributes(data, options);
};
