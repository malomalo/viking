import { addErrorClassToOptions, tagNameForModelAttribute } from '../utils';
import { textFieldTag } from '../form_tag_helpers/text_field_tag';

// textField(model, attribute, options)
// ====================================
//
// Returns an input tag of the "text" type tailored for accessing a specified
// attribute on a model. Additional options on the input tag can be passed as
// a hash with options. These options will be tagged onto the HTML as an HTML
// element attribute as in the example shown.
//
// Examples
// ========
//   text_field(post, "title", {size: 20})
//   // => <input id="post_title" name="post[title]" size="20" type="text" value="title">
//   
//   text_field(post, "title", {class: "create_input"})
//   // => <input class="create_input" id="post_title" name="post[title]" type="text" value="title">
export const textField = function (model, attribute, options) {
    if (options === undefined) { options = {}; }
    addErrorClassToOptions(model, attribute, options);

    let name = options['name'] || tagNameForModelAttribute(model, attribute);
    let value = model.get(attribute)
    value = value && typeof value === 'object' ? value.toString() : value
    return textFieldTag(name, value, options);
};

export default textField;
