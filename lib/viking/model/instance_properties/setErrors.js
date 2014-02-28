Viking.Model.prototype.setErrors = function(errors, options) {
    if(_.size(errors) === 0) { return; }

    var model = this;
    this.validationError = errors;

    model.trigger('invalid', this, errors, options);
};