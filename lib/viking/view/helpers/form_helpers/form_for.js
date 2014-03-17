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
    
    var form = new FormBuilder(model, options, content);
    
    return form.render();
};