(function () {
    module("Viking.View.Helpers#formFor", {
        setup: function() {
            this.Model = Viking.Model.extend("model");
            this.model = new this.Model();
        }
    });

    // form_for(model, options, content())
    // =================================
    test("formFor(model, content())", function() {
        equal(Viking.View.Helpers.formFor(this.model, function() { return ''; }), '<form method="get"></form>');
    });

    test("formFor(model, {method: 'get'}, content())", function() {
        equal( Viking.View.Helpers.formFor(this.model, {method: 'get'}, function() { return ''; }),
               '<form method="get"></form>');
    });
    
    test("formFor(model, {method: 'post'}, content())", function() {
        equal( Viking.View.Helpers.formFor(this.model, {method: "post"}, function() { return ''; }),
               '<form method="post"></form>');
    });

    test("formFor(model, {method: 'patch'}, content())", function() {
        equal( Viking.View.Helpers.formFor(this.model, {method: 'patch'}, function() { return ''; }),
               '<form method="post"><div style="margin:0;padding:0;display:inline"><input name="_method" type="hidden" value="patch"></div></form>');
    });

    test("formFor(model, {method: 'put'}, content())", function() {
        equal( Viking.View.Helpers.formFor(this.model, {method: 'put'}, function() { return ''; }),
               '<form method="post"><div style="margin:0;padding:0;display:inline"><input name="_method" type="hidden" value="put"></div></form>');
    });

    test("formFor(model, {method: 'delete'}, content())", function() {
        equal( Viking.View.Helpers.formFor(this.model, {method: 'delete'}, function() { return ''; }),
               '<form method="post"><div style="margin:0;padding:0;display:inline"><input name="_method" type="hidden" value="delete"></div></form>');
    });
    
    test("formFor(model, {multipart: true}, content())", function() {
        equal( Viking.View.Helpers.formFor(this.model, {multipart: true}, function() { return ''; }),
               '<form enctype="multipart/form-data" method="post"></form>');
    });

    test("formFor(model, {multipart: true, method: 'patch'}, content())", function() {
        equal( Viking.View.Helpers.formFor(this.model, {multipart: true, method: 'patch'}, function() { return ''; }),
               '<form enctype="multipart/form-data" method="post"><div style="margin:0;padding:0;display:inline"><input name="_method" type="hidden" value="patch"></div></form>');
    });

    test("formFor(model, {multipart: true, method: 'get'}, content())", function() {
        equal( Viking.View.Helpers.formFor(this.model, {multipart: true, method: 'get'}, function() { return ''; }),
               '<form enctype="multipart/form-data" method="post"><div style="margin:0;padding:0;display:inline"><input name="_method" type="hidden" value="get"></div></form>');
    });

}());