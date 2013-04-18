Backbone.Model.prototype.updateAttribute = function (key, value, options){
    var data;
    
    (data = {})[key] = value;
    this.updateAttributes(data, options);
};

Backbone.Model.prototype.updateAttributes = function (data, options) {
    this.save(data, options)
};