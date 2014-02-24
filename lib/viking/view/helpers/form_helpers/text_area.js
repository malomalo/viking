// textArea(model, attribute, options)
// ====================================
//
// Returns a textarea opening and closing tag set tailored for accessing a
// specified attribute on a model. Additional options on the input tag can be
// passed as a hash with options.
//
// Examples
// ========
//   textArea(post, 'body', {cols: 20, rows: 40})
//   // => <textarea cols="20" rows="40" id="post_body" name="post[body]">
//   //      post body
//   //    </textarea>
//   
//   textArea(comment, 'text', {size: "20x30"})
//   // => <textarea cols="20" rows="30" id="comment_text" name="comment[text]">
//   //      comment text
//   //    </textarea>
//   
//   textArea(application, 'notes', {cols: 40, rows: 15, class: 'app_input'})
//   // => <textarea cols="40" rows="15" id="application_notes" name="application[notes]" class="app_input">
//   //      application notes
//   //    </textarea>
//   
//   textArea(entry, 'body', {size: "20x20", disabled: true})
//   // => <textarea cols="20" rows="20" id="entry_body" name="entry[body]" disabled>
//   //      entry body
//   //    </textarea>
Viking.View.Helpers.textArea = function (model, attribute, options) {
    var name = Viking.View.tagNameForModelAttribute(model, attribute);
    
    if (options === undefined) { options = {}; }
    Viking.View.addErrorClassToOptions(model, attribute, options);
    
    return Viking.View.Helpers.textAreaTag(name, model.get(attribute), options);
};