let booleanAttributes = ['disabled', 'readonly', 'multiple', 'checked',
    'autobuffer', 'autoplay', 'controls', 'loop', 'selected', 'hidden',
    'scoped', 'async', 'defer', 'reversed', 'ismap', 'seemless', 'muted',
    'required', 'autofocus', 'novalidate', 'formnovalidate', 'open',
    'pubdate', 'itemscope'];

export const tagOption = function (key, value, escape) {
    if (Array.isArray(value)) {
        value = value.join(" ");
    }

    if (escape) {
        value = _.escape(value);
    }

    return key + '="' + value + '"';
};

export const dataTagOption = function (key, value, escape) {
    key = "data-" + key;

    if (_.isObject(value)) {
        value = JSON.stringify(value);
    }

    return tagOption(key, value, escape);
};

export const tagOptions = function (options, escape) {
    if (options === undefined) {
        return "";
    }

    if (escape === undefined) {
        escape = true;
    }

    let attrs = [];
    _.each(options, function(value, key) {
        if (key === "data" && _.isObject(value)) {
            // TODO testme
            _.each(value, function(value, key) {
                attrs.push(dataTagOption(key, value, escape));
            });
        } else if (value === true && _.contains(booleanAttributes, key)) {
            attrs.push(key);
        } else if (value !== null && value !== undefined) {
            attrs.push(tagOption(key, value, escape));
        }
    });

    if (attrs.length === 0) {
        return '';
    }

    return " " + attrs.sort().join(' ');
};
    
// see http://www.w3.org/TR/html4/types.html#type-name
export const sanitizeToId = function (name) {
    return name.replace(/[^\-a-zA-Z0-9:.]/g, "_").replace(/_+/g, '_').replace(/_+$/, '').replace(/_+/g, '_');
};

// TODO: move to model_helpers?
export const tagNameForModelAttribute = function (model, attribute, options) {
    options || (options = {});
        
    let value = model.get(attribute);
    let name;

    if (options.namespace) {
        name = options.namespace + '[' + attribute + ']';
    } else {
        name = model.baseModel.modelName.paramKey + '[' + attribute + ']';
    }
        
    if (value instanceof Viking.Collection || Array.isArray(value)) {
        name = name + '[]';
    }
     
    return name;
};

// TODO: move to model_helpers?
export const addErrorClassToOptions = function(model, attribute, options) {
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
export const methodOrAttribute = function (model, funcOrAttribute) {
    if (typeof funcOrAttribute !== 'function') {
        if (model[funcOrAttribute]) {
            return _.result(model, funcOrAttribute);
        }
            
        return model.get(funcOrAttribute);
    }

    return funcOrAttribute(model);
};
