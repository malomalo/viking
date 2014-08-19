function CheckBoxGroupBuilder(model, attribute, options) {
    if (!options) {
        options = {};
    }
    
    this.model = model;
    this.attribute = attribute;
    this.options = options;
}

// TODO: options passed to the helpers can be made into a helper
CheckBoxGroupBuilder.prototype = {

    checkBox: function(checkedValue, options) {
        var values = this.model.get(this.attribute);
        if (!options) {
            options = {};
        }
        
        if (!options.name && this.options.namespace) {
            options.name = Viking.View.tagNameForModelAttribute(this.model, this.attribute, {namespace: this.options.namespace});
        } else if (!options.name) {
            options.name = Viking.View.tagNameForModelAttribute(this.model, this.attribute);
        }
        
        if (!options.id) {
            options.id = Viking.View.sanitizeToId(options.name) + '_' + checkedValue;
        }
        
        return Viking.View.Helpers.checkBoxTag(options.name, checkedValue, _.contains(values, checkedValue), options);
    },
    
    label: function(value, content, options, escape) {
        if (!options) {
            options = {};
        }
        
        //TODO shouldn't options.name be options.for?
        if (!options.name && !options['for']) {
            options['for'] = Viking.View.tagNameForModelAttribute(this.model, this.attribute, {namespace: this.options.namespace});
            options['for'] = Viking.View.sanitizeToId(options['for']) + '_' + value;
        }
        
        return Viking.View.Helpers.label(this.model, this.attribute, content, options, escape);
    }
    
};
