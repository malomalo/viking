// submitTag(value="Save", options)
// =================================
//
// Creates a submit button with the text value as the caption.
//
// Options
// -------
//    - disabled:      If set to true, the user will not be able to use this input.
//    - Any other key creates standard HTML attributes for the tag.
//   
//   submitTag()
//   // => <input name="commit" type="submit" value="Save">
//   
//   submitTag "Edit this article"
//   // => <input name="commit" type="submit" value="Edit this article">
//   
//   submitTag("Save edits", {disabled: true})
//   // => <input disabled name="commit" type="submit" value="Save edits">
//   
//   submitTag(nil, {class: "form_submit"})
//   // => <input class="form_submit" name="commit" type="submit">
//   
//   submitTag("Edit", class: "edit_button")
//   // => <input class="edit_button" name="commit" type="submit" value="Edit">
Viking.View.Helpers.submitTag = function (value, options) {
    if (options === undefined) { options = {}; }
    if (!value) { value = 'Save'; }
    _.defaults(options, {
        type: 'submit',
        name: 'commit',
        id: null,
        value: value
    });

    return Viking.View.Helpers.tag('input', options);
};
