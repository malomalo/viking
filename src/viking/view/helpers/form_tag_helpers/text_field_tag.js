import tag from './tag';
import { sanitizeToId } from './../utils';

// textFieldTag(name, [value], [options])
// ======================================
//
// Creates a standard text field. Returns the duplicated String.
//
// Arguments
// ---------
// name:    The name of the input
// value:   The value of the input
// options: A object with any of the following:
//      - disabled: If set to true, the user will not be able to use this input
//      - size: The number of visible characters that will fit in the input
//      - maxlength: The maximum number of characters that the browser will
//                   allow the user to enter
//      - placehoder: The text contained in the field by default, which is
//                    removed when the field receives focus
//      - Any other key creates standard HTML attributes for the tag
//
// Examples
// --------
//
//   textFieldTag('name')
//   // => <input name="name" type="text" />
//   
//   textFieldTag('query', 'Enter your search')
//   // => <input name="query" value="Enter your search" type="text" />
//   
//   textFieldTag('search', {placeholder: 'Enter search term...'})
//   // => <input name="search" placeholder="Enter search term..." type="text" />
//   
//   textFieldTag('request', {class: 'special_input'})
//   // => <input class="special_input" name="request" type="text" />
//   
//   textFieldTag('address', '', {size: 75})
//   // => <input name="address" size="75" value="" type="text" />
//   
//   textFieldTag('zip', {maxlength: 5})
//   // => <input maxlength="5" name="zip" type="text" />
//   
//   textFieldTag('payment_amount', '$0.00', {disabled: true})
//   // => <input disabled="disabled" name="payment_amount" value="$0.00" type="text" />
//   
//   textFieldTag('ip', '0.0.0.0', {maxlength: 15, size: 20, class: "ip-input"})
//   // => <input class="ip-input" maxlength="15" name="ip" size="20" value="0.0.0.0" type="text" />
export const textFieldTag = function (name, value, options, escape) {

    // Handle both `name, value` && `name, options` style arguments
    if (value !== null && typeof value === 'object' && !(value instanceof Backbone.Model)) {
        options = value;
        value = undefined;
    }

    return tag('input', _.extend({
        "type": 'text',
        "id": sanitizeToId(name),
        "name": name,
        "value": value
    }, options), escape);
    
};

export default textFieldTag;
