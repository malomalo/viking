(function () {
    module("Viking.View.Helpers#select", {
        setup: function() {
            this.Model = Viking.Model.extend("model");
            this.model = new this.Model();
        }
    });
    
    // function select(model, attribute, collection, options)
    // ======================================================
    //TODO: add test for unset key
    test("select(model, attribute, simple_array)", function() {
        this.model.set("key", "value");
        
        equal(
            '<select id="model_key" name="model[key]"><option selected>value</option>\n<option>another_value</option></select>',
            Viking.View.Helpers.select(this.model, 'key', ['value', 'another_value'])
        );
    });

    //TODO: add test for unset key    
    test("select(model, attribute, tuple_array)", function() {
        this.model.set("key", "1");
        
        equal(
            '<select id="model_key" name="model[key]"><option selected value="1">one</option>\n<option value="2">two</option></select>',
            Viking.View.Helpers.select(this.model, 'key', [['one', '1'], ['two', '2']])
        );
    });
    
    //TODO: add test for unset key
    test("select(model, attribute, hash)", function() {
        this.model.set("key", "$");
        
        equal(
            '<select id="model_key" name="model[key]"><option selected value="$">Dollar</option>\n<option value="DKK">Kroner</option></select>',
            Viking.View.Helpers.select(this.model, 'key', {"Dollar": "$", "Kroner": "DKK"})
        );
    });
    
    test("select(model, has_many_attribute, collection) Assumes multiple select", function () {
        Post = Viking.Model.extend('post', {
            hasMany: ['authors']
        });
        
        Author = Viking.Model.extend('author', {
        });

        AuthorCollection = Viking.Collection.extend({
            model: Author
        });
                
        var post = new Post();
        var authors = new AuthorCollection([{id: 1, first_name: 'Jon', last_name: 'Bracy'},{id: 2, first_name: "Daniel", last_name: "O'Shea"}]);
        equal(
            Viking.View.Helpers.select(post, 'authors', authors.map(function(a){ return [a.get('last_name'), a.get('id')]})),
            '<select id="post_authors" multiple name="post[authors][]"><option value="1">Bracy</option>\n<option value="2">O&#x27;Shea</option></select>');
        delete Post
        delete AuthorCollection
        delete Author
    });

    //TODO: add test for model, attribute, simple_array, {selected: nil} (key set)
    //TODO: add test for model, attribute, simple_array, {selected: nil} (key unset)    
    //TODO: add test for model, attribute, simple_array, {selected: string} (key set)
    //TODO: add test for model, attribute, simple_array, {selected: string} (key unset)
    //TODO: add test for model, attribute, simple_array, {selected: simple_array} (key set)
    //TODO: add test for model, attribute, simple_array, {selected: simple_array} (key unset)
    //TODO: add test for model, attribute, simple_array, {selected: func} (key set)
    //TODO: add test for model, attribute, simple_array, {selected: func} (key unset)
    // tuple_array
    // hash

    //TODO: add test for model, attribute, simple_array, {disabled: nil} (key set)
    //TODO: add test for model, attribute, simple_array, {disabled: nil} (key unset)    
    //TODO: add test for model, attribute, simple_array, {disabled: string} (key set)
    //TODO: add test for model, attribute, simple_array, {disabled: string} (key unset)
    //TODO: add test for model, attribute, simple_array, {disabled: simple_array} (key set)
    //TODO: add test for model, attribute, simple_array, {disabled: simple_array} (key unset)
    //TODO: add test for model, attribute, simple_array, {disabled: func} (key set)
    //TODO: add test for model, attribute, simple_array, {disabled: func} (key unset)
    // tuple_array
    // hash

    //TODO: test this:
    // * A nested collection (see +groupedOptionsForSelect+).

    //TODO: test this:    
    // ==== Gotcha
    //
    // The HTML specification says when +multiple+ parameter passed to select and
    // all options got deselected web browsers do not send any value to server.
    // Unfortunately this introduces a gotcha: if an +User+ model has many +roles+
    // and have +role_ids+ accessor, and in the form that edits roles of the user
    // the user deselects all roles from +role_ids+ multiple select box, no
    // +role_ids+ parameter is sent. So, any mass-assignment idiom like
    //
    //   @user.update(params[:user])
    //
    // wouldn't update roles.
    //
    // To prevent this the helper generates an auxiliary hidden field before every
    // multiple select. The hidden field has the same name as multiple select and
    // blank value.
    //
    // This way, the client either sends only the hidden field (representing
    // the deselected multiple select box), or both fields. Since the HTML
    // specification says key/value pairs have to be sent in the same order they
    // appear in the form, and parameters extraction gets the last occurrence of
    // any repeated key in the query string, that works for ordinary forms.
    //
    // In case if you don't want the helper to generate this hidden field you can
    // specify `include_hidden: false` option.
}());
