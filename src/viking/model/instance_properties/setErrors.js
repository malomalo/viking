export const setErrors = function(errors, options) {
    if(_.size(errors) === 0) { return; }

    let model = this;
    this.validationError = errors;

    model.trigger('invalid', this, errors, options);
};
