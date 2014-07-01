function CheckBoxGroupBuilder(model, attribute, options) {
    options || (options = {});
    
    this.model = model;
    this.attribute = attribute;
    this.options = options;
}

// TODO: options passed to the helpers can be made into a helper
CheckBoxGroupBuilder.prototype = {

    checkBox: function(checkedValue, options) {
        var values = this.model.get(this.attribute);
        options || (options = {});
        
        if (!options.name && this.options.namespace) {
            options.name = Viking.View.tagNameForModelAttribute(this.model, this.attribute, {namespace: this.options.namespace});
        } else if (!options.name) {
            options.name = Viking.View.tagNameForModelAttribute(this.model, this.attribute);
        }
        if (!options.id) {
            options.id = Viking.View.sanitizeToId(options.name) + '_' + checkedValue;
        }
        
        return Viking.View.Helpers.checkBoxTag(options.name, checkedValue, _.contains(values, checkedValue), options);
    }
    
}
