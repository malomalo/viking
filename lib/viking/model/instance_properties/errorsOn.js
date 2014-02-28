// TODO: testme
Viking.Model.prototype.errorsOn = function(attribute) {
    if (this.validationError) {
        return this.validationError[attribute];
    }

    return false;
};