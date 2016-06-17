// collectionSelect(model, attribute, collection, valueAttribute, textAttribute, options)
// ====================================================================================
//
// Returns <select> and <option> tags for the collection of existing return
// values of method for object's class. The value returned from calling method
// on the instance object will be selected. If calling method returns nil, no
// selection is made without including :prompt or :includeBlank in the options
// hash.
//
// The :value_method and :text_method parameters are methods to be called on
// each member of collection. The return values are used as the value attribute
// and contents of each <option> tag, respectively. They can also be any object
// that responds to call, such as a proc, that will be called for each member
// of the collection to retrieve the value/text.
//
// Example object structure for use with this method:
//
//   Post = Viking.Model.extend('post', {
//       belongsTo: ['author']
//   });
//   
//   Author = Viking.Model.extend('author', {
//       hasMany: ['posts'],
//       
//       nameWithInitial: function() {
//           return this.get('first_name')[0] + '. ' + this.get("last_name");
//       }
//   });
// 
// Sample usage (selecting the associated Author for an instance of Post):
//
//   collectionSelect(post, 'author_id', Author.all, 'id', 'nameWithInitial', {prompt: true})
// 
// If post.get('author_id') is already 1, this would return:
// 
//   <select name="post[author_id]">
//     <option value="">Please select</option>
//     <option value="1" selected>D. Heinemeier Hansson</option>
//     <option value="2">D. Thomas</option>
//     <option value="3">M. Clark</option>
//   </select>
Viking.View.Helpers.collectionSelect = function (model, attribute, collection, valueAttribute, textAttribute, options) {
    if (options === undefined) { options = {}; }

    let optionOptions = _.pick(options, 'selected');
    let selectOptions = _.omit(options, 'selected');
    if (model.get(attribute) && optionOptions.selected === undefined) {
        optionOptions.selected = Viking.View.methodOrAttribute(model.get(attribute), valueAttribute);
    }
    
    let name = options.name || Viking.View.tagNameForModelAttribute(model, attribute);
    let optionsTags = Viking.View.Helpers.optionsFromCollectionForSelectTag(collection, valueAttribute, textAttribute, selectOptions);
    return Viking.View.Helpers.selectTag(name, optionsTags, selectOptions);
};