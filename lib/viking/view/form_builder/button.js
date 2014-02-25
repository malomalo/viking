// Add the submit button for the given form. When no value is given, it checks
// if the object is a new resource or not to create the proper label:
//
//   <%= formFor(post, function(f) { %>
//     <%= f.button %>
//   <% }) %>
//
// In the example above, if `post` is a new record, it will use "Create Post"
// as button label, otherwise, it uses "Update Post".
//
// ==== Examples
//   button("Create a post")
//   // => <button name='button' type='submit'>Create post</button>
//
//   button(function() {
//      return contentTag('strong', 'Ask me!');
//   })
//   // => <button name='button' type='submit'><strong>Ask me!</strong></button>
Viking.View.FormBuilder.prototype.button = function (value, options) {
    var tmp;
    
    if (typeof value === 'object') {
        tmp = options;
        options = value;
        value = tmp;
    }
    
    if (!value) {
        value = (this.model.isNew() ? 'Create ' : 'Update ') + this.model.modelName.humanize().anticapitalize();
    }

    return Viking.View.Helpers.buttonTag(value, options); 
};