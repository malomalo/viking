//= require_self
//= require viking/view/helpers/form_tag_helpers
//= require viking/view/helpers/builders
//= require viking/view/helpers/form_helpers
//= require viking/view/helpers/url_helpers
//= require viking/view/helpers/asset_helpers
//= require viking/view/helpers/render_helper

(function () {
    var booleanAttributes = ['disabled', 'readonly', 'multiple', 'checked',
        'autobuffer', 'autoplay', 'controls', 'loop', 'selected', 'hidden',
        'scoped', 'async', 'defer', 'reversed', 'ismap', 'seemless', 'muted',
        'required', 'autofocus', 'novalidate', 'formnovalidate', 'open',
        'pubdate', 'itemscope'];
    
    Viking.View.tagOption = function (key, value, escape) {
        if (_.isArray(value)) { value = value.join(" "); }
        if (escape) { value = _.escape(value); }
    
        return key + '="' + value + '"';
    };

    Viking.View.dataTagOption = function (key, value, escape) {
        key = "data-" + key;
        if (_.isObject(value)) { value = JSON.stringify(value); }
    
        return Viking.View.tagOption(key, value, escape);
    };

    Viking.View.tagOptions = function (options, escape) {
        if (options === undefined) { return ""; }
        if (escape === undefined) { escape = true; }
    
        var attrs = [];
        _.each(options, function(value, key) {
            if (key === "data" && _.isObject(value)) {
                // TODO testme
                _.each(value, function(value, key) {
                    attrs.push(Viking.View.dataTagOption(key, value, escape));
                });
            } else if (value === true && _.contains(booleanAttributes, key)) {
                attrs.push(key);
            } else if (value !== null && value !== undefined) {
                attrs.push(Viking.View.tagOption(key, value, escape));
            }
        });

        if (attrs.length === 0) {
           return '';
        }
        
        return " " + attrs.sort().join(' ');
    };
    
    // see http://www.w3.org/TR/html4/types.html#type-name
    Viking.View.sanitizeToId = function (name) {
        return name.replace(/[^\-a-zA-Z0-9:.]/g, "_").replace(/_+/g, '_').replace(/_+$/, '').replace(/_+/g, '_');
    };

    // TODO: move to model_helpers?
    Viking.View.tagNameForModelAttribute = function (model, attribute, options) {
        options || (options = {});
        
        var value = model.get(attribute);
        var name;
        if (options.namespace) {
            name = options.namespace + '[' + model.baseModel.modelName + '][' + attribute + ']';
        } else {
            name = model.baseModel.modelName + '[' + attribute + ']';
        }
        
         if (value instanceof Viking.Collection || _.isArray(value)) {
             name = name + '[]';
         }
     
         return name;
    };

    // TODO: move to model_helpers?
    Viking.View.addErrorClassToOptions = function(model, attribute, options) {
        if (model.errorsOn(attribute)) {
            if (options['class']) {
                options['class'] = options['class'] + ' error';
            } else {
                options['class'] = 'error';
            }
        }
    };

    // TODO: move to model_helpers?
    // TODO: testme
    Viking.View.methodOrAttribute = function (model, funcOrAttribute) {
        if (typeof funcOrAttribute !== 'function') {
            if (model[funcOrAttribute]) {
                return _.result(model, funcOrAttribute);
            }
            
            return model.get(funcOrAttribute);
        }

        return funcOrAttribute(model);
    };
    
}());
