// Opposite of #select. Triggers the `unselected` event.
export const unselect = function(options) {
    this.select(false, options);
};
