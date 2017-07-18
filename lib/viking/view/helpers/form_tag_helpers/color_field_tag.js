// colorFieldTag(name, value = nil, options = {})
// ===============================================
// 
// Creates a color field.
//
// Options
// -------
//      - Accepts the same options as text_field_tag.
//
// Examples
// --------
//   
//   colorFieldTag('accent')
//   // => <input name="accent" type="color">
//   
//   colorFieldTag('accent', "#FFFFFF")
//   // => <input" name="accent" type="color" value="#FFFFFF">
Viking.View.Helpers.colorFieldTag = function (name, value, options) {
    
    // Handle both `name, value, options`, and `name, options` syntax
    if (typeof value === 'object') {
        options = value;
        value = undefined;
    }
    
    options = _.extend({type: 'color'}, options);
    if (value) { options.value = value; }

    return Viking.View.Helpers.textFieldTag(name, value, options);
};