// Opposite of #select. Triggers the `unselected` event.
Viking.Model.prototype.unselect = function(options) {
    this.select(false, options);
};
