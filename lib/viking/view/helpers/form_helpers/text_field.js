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
Viking.View.Helpers.textField = function (model, attribute, options) {
    if (options === undefined) { options = {}; }
    Viking.View.addErrorClassToOptions(model, attribute, options);

    var name = options['name'] || Viking.View.tagNameForModelAttribute(model, attribute, options);
    var value = model.get(attribute)
    value = value && typeof value === 'object' ? value.toString() : value
    return Viking.View.Helpers.textFieldTag(name, value, options);
};
