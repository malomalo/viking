import textFieldTag from './text_field_tag';

// passwordFieldTag(name = "password", value = nil, options = {})
// ================================================================
// 
// Creates a password field, a masked text field that will hide the users input
// behind a mask character.
//
// Options
// -------
//      - disabled:  If true, the user will not be able to use this input.
//      - size:      The number of visible characters that will fit in the input.
//      - maxlength: The maximum number of characters that the browser will allow the user to enter.
//      - Any other key creates standard HTML attributes for the tag
//
// Examples
// --------
//   
//   passwordFieldTag('pass')
//   // => <input name="pass" type="password">
//   
//   passwordFieldTag('secret', 'Your secret here')
//   // => <input" name="secret" type="password" value="Your secret here">
//   
//   passwordFieldTag('masked', nil, {class: 'masked_input_field'})
//   // => <input class="masked_input_field" name="masked" type="password">
//   
//   passwordFieldTag('token', '', {size: 15})
//   # => <input name="token" size="15" type="password" value="">
//   
//   passwordFieldTag('key', null, {maxlength: 16})
//   // => <input maxlength="16" name="key" type="password">
//   
//   passwordFieldTag('confirm_pass', null, {disabled: true})
//   // => <input disabled name="confirm_pass" type="password">
//   
//   passwordFieldTag('pin', '1234', {maxlength: 4, size: 6, class: "pin_input"})
//   // => <input class="pin_input" maxlength="4" name="pin" size="6" type="password" value="1234">
export const passwordFieldTag = function (name, value, options) {
    if (name === undefined) { name = 'password'; }
    if (options === undefined) { options = {}; }
    _.defaults(options, {type: "password"});

    return textFieldTag(name, value, options);
};

export default passwordFieldTag;
