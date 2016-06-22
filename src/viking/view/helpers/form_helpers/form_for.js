import { FormBuilder } from '../builders';
import { contentTag, hiddenFieldTag } from '../form_tag_helpers';

// formFor(model, options = {}, content = func(f))
// ===============================================
// 
// Creates a FormBuilder for the model and passes it as the first argument to
// the `content` function.
//
// Examples
// --------
//   formFor(account, function (f) { return f.hiddenField('pass_confirm'); })
//   // => <input type="hidden" name="account[pass_confirm]" value="">
export const formFor = function (model, options, content) {
    if (typeof options === 'function') {
        content = options;
        options = {};
    }
    
    let method = options.method;
    if (options.multipart === true) {
        options.enctype = "multipart/form-data";
        options.method = 'post';
        delete options.multipart;
    } else if (!options.method) {
        options.method = 'get';
    }

    let builder = new FormBuilder(model, options);
    if ( (options.method !== 'get' && options.method !== 'post') || (method && method !== options.method) ) {
        options.method = 'post';
        content = _.wrap(content, function(func, form) {
            let hiddenInput = hiddenFieldTag('_method', method);
            return contentTag('div', hiddenInput, {style: 'margin:0;padding:0;display:inline'}, false) + func(builder);
        });
    }
    
    return contentTag('form', content(builder), options, false);
};

export default formFor;
