// Generates the `urlRoot` based off of the model name.
Viking.Model.urlRoot = function() {
    if (this.prototype.hasOwnProperty('urlRoot')) {
        return _.result(this.prototype, 'urlRoot')
    } else if (this.baseModel.prototype.hasOwnProperty('urlRoot')) {
        return _.result(this.baseModel.prototype, 'urlRoot')
    } else {
        return "/" + this.baseModel.modelName.pluralize();
    }
};