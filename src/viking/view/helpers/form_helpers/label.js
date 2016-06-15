// label(model, attribute, content, options)
// =========================================
//
// Returns a label tag tailored for labelling an input field for a specified
// attribute (identified by method) on an object assigned to the template
// (identified by object). The text of label will default to the attribute
// name unless a translation is found in the current I18n locale (through
// helpers.label.<modelname>.<attribute>) or you specify it explicitly.
// Additional options on the label tag can be passed as a hash with options.
// These options will be tagged onto the HTML as an HTML element attribute as
// in the example shown, except for the :value option, which is designed to
// target labels for #radioButton tags (where the value is used in the ID
// of the input tag).
//
// Examples
// --------
//   label(post, "title")
//   // => <label for="post_title">Title</label>
//   
//   label(post, "title", "A short title")
//   // => <label for="post_title">A short title</label>
//   
//   label(post, "title", "A short title", {class: "title_label"})
//   // => <label for="post_title" class="title_label">A short title</label>
//   
//   label(post, "privacy", "Public Post", {value: "public"})
//   // => <label for="post_privacy_public">Public Post</label>
//   
//   label(post, "terms", function() {
//       return 'Accept <a href="/terms">Terms</a>.';
//   })
//   // => <label for="post_privacy_public">Public Post</label>
Viking.View.Helpers.label = function (model, attribute, content, options, escape) {
    let tmp;
    if (typeof content === 'object') {
        tmp = options;
        options = content;
        content = tmp;
    }
    
    if (options === undefined) { options = {}; }
    if (content === undefined) { content = attribute.humanize(); }
    if (typeof content === 'function') { content = content(); }        
    if (!options['for']) {
        let name = Viking.View.tagNameForModelAttribute(model, attribute);
        options['for'] = Viking.View.sanitizeToId(name);
    }
    
    Viking.View.addErrorClassToOptions(model, attribute, options);
    
    return Viking.View.Helpers.labelTag(content, options, escape);
};