(function () {
    module("Viking.View - FormBuilder", {
        setup: function() {
            this.Model = Viking.Model.extend("model");
            this.model = new this.Model();
        }
    });
    
    // new FormBuilder(model, options)
    // ===============================
    test("new FormBuilder(model)", function() {
        var form = new FormBuilder(this.model);

        equal(form.model, this.model);
    });

    test("new FormBuilder(model, options)", function() {
        var options = {key: 'value', foo: 3};
        var form = new FormBuilder(this.model, options);

        equal(form.model, this.model);
        equal(form.options, options);
    });

    // render()
    // ========
    test("#render()", function () {
        var form = new FormBuilder(this.model, function() { return ''; })
        
        equal( form.render(), '<form method="get"></form>' );
    });
    
    test("#render() - options: {method: get}", function() {
        var form = new FormBuilder(this.model, {method: "get"}, function() { return ''; })
        
        equal( form.render(), '<form method="get"></form>' );
    });
    
    test("#render() - options: {method: post}", function() {
        var form = new FormBuilder(this.model, {method: "post"}, function() { return ''; })
        
        equal( form.render(), '<form method="post"></form>' );
    });
    
    test("#render() - options: {method: patch}", function() {
        var form = new FormBuilder(this.model, {method: "patch"}, function() { return ''; })
        
        equal( form.render(), '<form method="post"><div style="margin:0;padding:0;display:inline"><input name="_method" type="hidden" value="patch"></div></form>' );
    });
    
    test("#render() - options: {method: put}", function() {
        var form = new FormBuilder(this.model, {method: "put"}, function() { return ''; })
        
        equal( form.render(), '<form method="post"><div style="margin:0;padding:0;display:inline"><input name="_method" type="hidden" value="put"></div></form>' );
    });
    
    test("#render() - options: {method: delete}", function() {
        var form = new FormBuilder(this.model, {method: "delete"}, function() { return ''; })
        
        equal( form.render(), '<form method="post"><div style="margin:0;padding:0;display:inline"><input name="_method" type="hidden" value="delete"></div></form>' );
    });
    
    test("#render() - options: {multipart: true}", function() {
        var form = new FormBuilder(this.model, {multipart: true}, function() { return ''; })
        
        equal( form.render(), '<form enctype="multipart/form-data" method="post"></form>' );
    });
    
    test("#render() - options: {multipart: true, method: patch}", function() {
        var form = new FormBuilder(this.model, {multipart: true, method: 'patch'}, function() { return ''; })
        
        equal( form.render(), '<form enctype="multipart/form-data" method="post"><div style="margin:0;padding:0;display:inline"><input name="_method" type="hidden" value="patch"></div></form>' );
    });
    
    test("#render() - options: {multipart: true, method: get}", function() {
        var form = new FormBuilder(this.model, {multipart: true, method: 'get'}, function() { return ''; })
        
        equal( form.render(), '<form enctype="multipart/form-data" method="post"><div style="margin:0;padding:0;display:inline"><input name="_method" type="hidden" value="get"></div></form>' );
    });
    
    // checkBox()
    // ==========
    test("#checkBox() passes to Viking.View.Helpers.checkBox", function () {
        expect(5);
        
        var model = this.model;
        var form = new FormBuilder(this.model, function() { return ''; })
        old_func = Viking.View.Helpers.checkBox
        
        Viking.View.Helpers.checkBox = function(m, attribute, options, checkedValue, uncheckedValue) {
            strictEqual(model, m);
            strictEqual('key', attribute);
            strictEqual(1, options);
            strictEqual(2, checkedValue);
            strictEqual(3, uncheckedValue);
        }
        form.checkBox('key', 1, 2, 3);
        
        Viking.View.Helpers.checkBox = old_func;
    });
    
    // collectionSelect()
    // ==================
    test("#collectionSelect() passes to Viking.View.Helpers.collectionSelect", function () {
        expect(6);
        
        var model = this.model;
        var form = new FormBuilder(this.model, function() { return ''; })
        old_func = Viking.View.Helpers.collectionSelect
        
        Viking.View.Helpers.collectionSelect = function(m, attribute, collection, valueAttribute, textAttribute, options) {
            strictEqual(model, m);
            strictEqual('key', attribute);
            strictEqual(1, collection);
            strictEqual(2, valueAttribute);
            strictEqual(3, textAttribute);
            strictEqual(4, options);
        }
        form.collectionSelect('key', 1, 2, 3, 4);
        
        Viking.View.Helpers.collectionSelect = old_func;
    });
    
    // hiddenField()
    // ==========
    test("#hiddenField() passes to Viking.View.Helpers.hiddenField", function () {
        expect(3);
        
        var model = this.model;
        var form = new FormBuilder(this.model, function() { return ''; })
        old_func = Viking.View.Helpers.hiddenField
        
        Viking.View.Helpers.hiddenField = function(m, attribute, options) {
            strictEqual(model, m);
            strictEqual('key', attribute);
            strictEqual(1, options);
        }
        form.hiddenField('key', 1);
        
        Viking.View.Helpers.hiddenField = old_func;
    });
    
    // label()
    // ==========
    test("#label() passes to Viking.View.Helpers.label", function () {
        expect(4);
        
        var model = this.model;
        var form = new FormBuilder(this.model, function() { return ''; })
        old_func = Viking.View.Helpers.label
        
        Viking.View.Helpers.label = function(m, attribute, content, options) {
            strictEqual(model, m);
            strictEqual('key', attribute);
            strictEqual(1, content);
            strictEqual(2, options);
        }
        form.label('key', 1, 2);
        
        Viking.View.Helpers.label = old_func;
    });

    // passwordField()
    // ==========
    test("#passwordField() passes to Viking.View.Helpers.passwordField", function () {
        expect(3);
        
        var model = this.model;
        var form = new FormBuilder(this.model, function() { return ''; })
        old_func = Viking.View.Helpers.passwordField
        
        Viking.View.Helpers.passwordField = function(m, attribute, options) {
            strictEqual(model, m);
            strictEqual('key', attribute);
            strictEqual(1, options);
        }
        form.passwordField('key', 1);
        
        Viking.View.Helpers.passwordField = old_func;
    });
    
    // radioButton()
    // ==========
    test("#radioButton() passes to Viking.View.Helpers.radioButton", function () {
        expect(4);
        
        var model = this.model;
        var form = new FormBuilder(this.model, function() { return ''; })
        old_func = Viking.View.Helpers.radioButton
        
        Viking.View.Helpers.radioButton = function(m, attribute, tagValue, options) {
            strictEqual(model, m);
            strictEqual('key', attribute);
            strictEqual(1, tagValue);
            strictEqual(2, options);
        }
        form.radioButton('key', 1, 2);
        
        Viking.View.Helpers.radioButton = old_func;
    });
    
    // select()
    // ==========
    test("#select() passes to Viking.View.Helpers.select", function () {
        expect(4);
        
        var model = this.model;
        var form = new FormBuilder(this.model, function() { return ''; })
        old_func = Viking.View.Helpers.select
        
        Viking.View.Helpers.select = function(m, attribute, collection, options) {
            strictEqual(model, m);
            strictEqual('key', attribute);
            strictEqual(1, collection);
            strictEqual(2, options);
        }
        form.select('key', 1, 2);
        
        Viking.View.Helpers.select = old_func;
    });
    
    // textArea()
    // ==========
    test("#textArea() passes to Viking.View.Helpers.textArea", function () {
        expect(3);
        
        var model = this.model;
        var form = new FormBuilder(this.model, function() { return ''; })
        old_func = Viking.View.Helpers.textArea
        
        Viking.View.Helpers.textArea = function(m, attribute, options) {
            strictEqual(model, m);
            strictEqual('key', attribute);
            strictEqual(1, options);
        }
        form.textArea('key', 1);
        
        Viking.View.Helpers.textArea = old_func;
    });
    
    // textField()
    // ==========
    test("#textField() passes to Viking.View.Helpers.textField", function () {
        expect(3);
        
        var model = this.model;
        var form = new FormBuilder(this.model, function() { return ''; })
        old_func = Viking.View.Helpers.textField
        
        Viking.View.Helpers.textField = function(m, attribute, options) {
            strictEqual(model, m);
            strictEqual('key', attribute);
            strictEqual(1, options);
        }
        form.textField('key', 1);
        
        Viking.View.Helpers.textField = old_func;
    });
    
}());