import { sanitizeToId } from './../utils';
import tag from './tag';

// checkBoxTag(name, value="1", checked=false, options)
// ======================================================
//
// Creates a check box form input tag.
//
// Options
// -------
//      - disabled: If true, the user will not be able to use this input.
//      - Any other key creates standard HTML attributes for the tag
//
// Examples
// --------
//   checkBoxTag('accept')
//   // => <input name="accept" type="checkbox" value="1" />
//   
//   checkBoxTag('rock', 'rock music')
//   // => <input name="rock" type="checkbox" value="rock music" />
//   
//   checkBoxTag('receive_email', 'yes', true)
//   // => <input checked="checked" name="receive_email" type="checkbox" value="yes" />
//   
//   checkBoxTag('tos', 'yes', false, class: 'accept_tos')
//   // => <input class="accept_tos" name="tos" type="checkbox" value="yes" />
//   
//   checkBoxTag('eula', 'accepted', false, disabled: true)
//   // => <input disabled="disabled" name="eula" type="checkbox" value="accepted" />
export const checkBoxTag = function (name, value, checked, options, escape) {
    if (value === undefined) { value = "1"; }
    if (options === undefined) { options = {}; }
    if (checked === true) { options.checked = true; }

    _.defaults(options, {
        type: "checkbox",
        value: value,
        id: sanitizeToId(name),
        name: name
    });

    return tag("input", options, escape);
};

export default checkBoxTag;