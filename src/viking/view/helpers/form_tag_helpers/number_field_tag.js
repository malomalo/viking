import textFieldTag from './text_field_tag';

// numberFieldTag(name, value = nil, options = {})
// ===============================================
// 
// Creates a number field.
//
// Options
// -------
//      - min:  The minimum acceptable value.
//      - max:  The maximum acceptable value.
//      - step: The acceptable value granularity.
//      - Otherwise accepts the same options as text_field_tag.
//
// Examples
// --------
//   
//   numberFieldTag('count')
//   // => <input name="count" type="number">
//   
//   nubmerFieldTag('count', 10)
//   // => <input" name="count" type="number" value="10">
//   
//   numberFieldTag('count', 4, {min: 1, max: 9})
//   // => <input min="1" max="9" name="count" type="number" value="4">
//   
//   passwordFieldTag('count', {step: 25})
//   # => <input name="count" step="25" type="number">
export const numberFieldTag = function (name, value, options) {
    
    // Handle both `name, value, options`, and `name, options` syntax
    if (typeof value === 'object') {
        options = value;
        value = undefined;
    }
    
    options = _.extend({type: 'number'}, options);
    if (value) { options.value = value; }

    return textFieldTag(name, value, options);
};

export default numberFieldTag;
