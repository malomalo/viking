// select(options)
// select(value[, options])
//
// When the model is part of a collection and you want to select a single
// or multiple items from a collection. If a model is selected
// `model.selected` will be set `true`, otherwise it will be `false`.
//
// If you pass `true` or `false` as the first paramater to `select` it will
// select the model if true, or unselect if it is false.
//
// By default any other models in the collection with be unselected. To
// prevent other models in the collection from being unselected you can
// pass `{multiple: true}` as an option.
//
// The `selected` and `unselected` events are fired when appropriate.
export const select = function(value, options) {

    // Handle both `value[, options]` and `options` -style arguments.
    if (value === undefined || typeof value === 'object') {
      options = value;
      value = true;
    }
    
    if (value === true) {
        if (this.collection) {
            this.collection.select(this, options);
        } else {
            this.selected = true;
        }
    } else {
        if (this.selected) {
            this.selected = false;
            this.trigger('unselected', this);
        }
    }
};
