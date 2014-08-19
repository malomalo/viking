// TODO: test return
Viking.Model.prototype.updateAttributes = function (data, options) {
    if (!options) {
        options = {};
    }

    options.patch = true;

    return this.save(data, options);
};