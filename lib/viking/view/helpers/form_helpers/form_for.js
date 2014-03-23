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
Viking.View.Helpers.formFor = function (model, options, content) {
    if (typeof options === 'function') {
        content = options;
        options = {};
    }
    
    var method = options.method;
    if (options.multipart === true) {
        options.enctype = "multipart/form-data";
        options.method = 'post';
        delete options.multipart;
    } else if (!options.method) {
        options.method = 'get';
    }

    var builder = new FormBuilder(model, options);
    if ( (options.method !== 'get' && options.method !== 'post') || (method && method !== options.method) ) {
        options.method = 'post';
        content = _.wrap(content, function(func, form) {
            var hiddenInput = Viking.View.Helpers.hiddenFieldTag('_method', method);
            return Viking.View.Helpers.contentTag('div', hiddenInput, {style: 'margin:0;padding:0;display:inline'}, false) + func(builder);
        });
    }
    
    return Viking.View.Helpers.contentTag('form', content(builder), options, false);
};