(function () {
    module("Viking.View.Helpers#collection_select", {
        setup: function() {
            this.Model = Viking.Model.extend("model");
            this.model = new this.Model();
        }
    });
    
    // collectionSelect(model, attribute, collection, valueAttribute, textAttribute, options)
    // ====================================================================================
    test("collectionSelect(model, attribute, collection, valueAttribute, textAttribute)", function() {
        Post = Viking.Model.extend('post', {
            belongsTo: ['author']
        });
        
        Author = Viking.Model.extend('author', {
          nameWithInitial: function() {
              return this.get('first_name')[0] + '. ' + this.get("last_name");
          }
        });

        AuthorCollection = Viking.Collection.extend({
            model: Author
        });
                
        var post = new Post();
        var authors = new AuthorCollection([{id: 1, first_name: 'Jon', last_name: 'Bracy'},{id: 2, first_name: "Daniel", last_name: "O'Shea"}]);
        equal( Viking.View.Helpers.collectionSelect(post, 'author_id', authors, 'id', 'nameWithInitial', {prompt: true}),
               '<select id="post_author_id" name="post[author_id]"><option value="">Select</option><option value="1">J. Bracy</option>\n<option value="2">D. O&#x27;Shea</option></select>');
        
        delete Post
        delete AuthorCollection
        delete Author
    });
    
    test("collectionSelect(model, attribute, collection, valueAttribute, textAttribute) allows html name attribute to be overridden", function() {
        Post = Viking.Model.extend('post', {
            belongsTo: ['author']
        });
        
        Author = Viking.Model.extend('author', {
          nameWithInitial: function() {
              return this.get('first_name')[0] + '. ' + this.get("last_name");
          }
        });

        AuthorCollection = Viking.Collection.extend({
            model: Author
        });
                
        var post = new Post();
        var authors = new AuthorCollection([{id: 1, first_name: 'Jon', last_name: 'Bracy'},{id: 2, first_name: "Daniel", last_name: "O'Shea"}]);
        equal( Viking.View.Helpers.collectionSelect(post, 'author_id', authors, 'id', 'nameWithInitial', {name: 'overridden'}),
               '<select id="overridden" name="overridden"><option value="1">J. Bracy</option>\n<option value="2">D. O&#x27;Shea</option></select>');
        
        delete Post
        delete AuthorCollection
        delete Author
    });
    
}());