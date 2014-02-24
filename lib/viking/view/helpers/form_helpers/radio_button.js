// radioButton(model, attribute, tag_value, options)
// ==================================================
//
// Returns a radio button tag for accessing a specified attribute on a model.
// If the current value of attribute is tag_value the radio button will be checked.
//
// To force the radio button to be checked pass checked: true in the options hash.
// You may pass HTML options there as well.
//   
//   // Let's say that @post.category returns "rails":
//   radioButton("post", "category", "rails")
//   radioButton("post", "category", "java")
//   // => <input type="radio" id="post_category_rails" name="post[category]" value="rails" checked>
//   //    <input type="radio" id="post_category_java" name="post[category]" value="java">
//   
//   radioButton("user", "receive_newsletter", "yes")
//   radioButton("user", "receive_newsletter", "no")
//   // => <input type="radio" id="user_receive_newsletter_yes" name="user[receive_newsletter]" value="yes">
//   //    <input type="radio" id="user_receive_newsletter_no" name="user[receive_newsletter]" value="no" checked>
Viking.View.Helpers.radioButton = function (model, attribute, tag_value, options) {
    var name = Viking.View.tagNameForModelAttribute(model, attribute);

    if (options === undefined) { options = {}; }
    _.defaults(options, {
        id: Viking.View.sanitizeToId(name + "_" + tag_value)
    });
    Viking.View.addErrorClassToOptions(model, attribute, options);
    
    var value = tag_value;
    if (value === undefined || value === null) {
        value = "";
    }
    
    return Viking.View.Helpers.radioButtonTag(name, value, tag_value === model.get(attribute), options);
};