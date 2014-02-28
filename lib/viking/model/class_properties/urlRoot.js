// Generates the `urlRoot` based off of the model name.
Viking.Model.urlRoot = function() {
    return "/" + this.baseModel.modelName.pluralize();
};