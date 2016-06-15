// TODO: testme
export const errorsOn = function(attribute) {
    if (this.validationError) {
        return this.validationError[attribute];
    }

    return false;
};
