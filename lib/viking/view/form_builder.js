Viking.View.FormBuilder = function(model, options, template) {
    this.model = model;
    if (typeof options !== 'object') {
        this.template = options;
        this.options = {};
    } else {
        this.options = options;
        this.template = template;
    }
}

Viking.View.FormBuilder.prototype = {
    
    toString: function() {
        return Viking.View.Helpers.formTag(this.options, this.template);
    }
    
};