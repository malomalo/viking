// Returns string to use for params names. This is the key attributes from
// the model will be namespaced under when saving to the server
Viking.Model.prototype.paramRoot = function() {
    return this.baseModel.modelName.underscore();
};
