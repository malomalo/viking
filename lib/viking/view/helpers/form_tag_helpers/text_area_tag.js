// textAreaTag(name, [content], [options], [escape=true])
// =========================================
//
// Creates a text input area; use a textarea for longer text inputs such as
// blog posts or descriptions.
//
// Options
// -------
//    - size: A string specifying the dimensions (columns by rows) of the textarea (e.g., "25x10").
//    - rows: Specify the number of rows in the textarea
//    - cols: Specify the number of columns in the textarea
//    - disabled: If set to true, the user will not be able to use this input.
//    - Any other key creates standard HTML attributes for the tag.
//
// Examples
// --------
//   
//   textAreaTag('post')
//   // => <textarea name="post"></textarea>
//   
//   textAreaTag('bio', user.bio)
//   // => <textarea name="bio">This is my biography.</textarea>
//   
//   textAreaTag('body', null, {rows: 10, cols: 25})
//   // => <textarea cols="25" name="body" rows="10"></textarea>
//   
//   textAreaTag('body', null, {size: "25x10"})
//   // => <textarea name="body" cols="25" rows="10"></textarea>
//   
//   textAreaTag('description', "Description goes here.", {disabled: true})
//   // => <textarea disabled name="description">Description goes here.</textarea>
//   
//   textAreaTag('comment', null, {class: 'comment_input'})
//   // => <textarea class="comment_input" name="comment"></textarea>
Viking.View.Helpers.textAreaTag = function (name, content, options, escape) {
    if (options === undefined) { options = {}; }
    if (escape === undefined) { escape = true; }
    _.defaults(options, {
        id: Viking.View.sanitizeToId(name),
        name: name
    });

    if (options.size) {
        options.cols = options.size.split('x')[0];
        options.rows = options.size.split('x')[1];
        delete options.size;
    }

    if (escape) { content = _.escape(content); }

    return Viking.View.Helpers.contentTag('textarea', content, options, false);
};
