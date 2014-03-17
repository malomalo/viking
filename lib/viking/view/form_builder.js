/*global contentTag, checkBox, hiddenField, hiddenFieldTag, label, passwordField, radioButton, textArea, textField*/

function FormBuilder(model, options, content) {
    if (typeof options === 'function') {
        content = options;
        options = {};
    }
    
    this.model = model;
    this.options = options;
    this.content = content;
}

FormBuilder.prototype = {

    render: function () {
        var content = this.content;
        var options = _.clone(this.options);
        var method = options.method;
        
        if (options.multipart === true) {
            options.enctype = "multipart/form-data";
            options.method = 'post';
            delete options.multipart;
        } else if (!options.method) {
            options.method = 'get';
        }
    

        if ( (options.method !== 'get' && options.method !== 'post') || (method && method !== options.method) ) {
            var form = this;
            options.method = 'post';
            content = _.wrap(content, function(func, form) {
                var hiddenInput = Viking.View.Helpers.hiddenFieldTag('_method', method);
                return Viking.View.Helpers.contentTag('div', hiddenInput, {style: 'margin:0;padding:0;display:inline'}, false) + func(form);
            });
        }

        return Viking.View.Helpers.contentTag('form', content(this), options, false);
    },

    checkBox: function(attribute, options, checkedValue, uncheckedValue) {
        return Viking.View.Helpers.checkBox(this.model, attribute, options, checkedValue, uncheckedValue);
    },

    collectionSelect: function(attribute, collection, valueAttribute, textAttribute, options) {
        return Viking.View.Helpers.collectionSelect(this.model, attribute, collection, valueAttribute, textAttribute, options);
    },

    hiddenField: function(attribute, options) {
        return Viking.View.Helpers.hiddenField(this.model, attribute, options);
    },
    
    label: function(attribute, content, options) {
        return Viking.View.Helpers.label(this.model, attribute, content, options);
    },

    passwordField: function(attribute, options) {
        return Viking.View.Helpers.passwordField(this.model, attribute, options);
    },
    
    radioButton: function(attribute, tagValue, options) {
        return Viking.View.Helpers.radioButton(this.model, attribute, tagValue, options);
    },
    
    select: function(attribute, collection, options) {
        return Viking.View.Helpers.select(this.model, attribute, collection, options);
    },

    textArea: function(attribute, options) {
        return Viking.View.Helpers.textArea(this.model, attribute, options);
    },

    textField: function(attribute, options) {
        return Viking.View.Helpers.textField(this.model, attribute, options);
    }
    
};