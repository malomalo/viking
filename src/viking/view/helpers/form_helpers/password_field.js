// passwordField(model, attribute, options)
// ========================================
//
// Returns an input tag of the "password" type tailored for accessing a specified
// attribute on the model. Additional options on the input tag can be passed as
// a hash with options. These options will be tagged onto the HTML as an HTML
// element attribute as in the example shown. For security reasons this field
// is blank by default; pass value via options if this is not desired.
//
// Examples
// --------
//   passwordField(user, 'pass', {size: 20})
//   // => <input id="login_pass" name="login[pass]" type="password" size="20">
//   
//   passwordField(account, 'secret', {class: "form_input", value: account.get('secret')})
//   // => <input class="form_input" id="account_secret" name="account[secret]" type="password" value="unkown">
export const passwordField = function (model, attribute, options) {
    options || (options = {});
    let name = options.name || Viking.View.tagNameForModelAttribute(model, attribute);

    if (options === undefined) { options = {}; }
    Viking.View.addErrorClassToOptions(model, attribute, options);
    
    return Viking.View.Helpers.passwordFieldTag(name, undefined, options);
};

export default passwordField;
