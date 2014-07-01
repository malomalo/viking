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

    // checkBox()
    // ==========
    test("#checkBox() passes to Viking.View.Helpers.checkBox", function () {
        expect(5);
        
        var model = this.model;
        var form = new FormBuilder(this.model)
        var old_func = Viking.View.Helpers.checkBox
        
        Viking.View.Helpers.checkBox = function(m, attribute, options, checkedValue, uncheckedValue) {
            strictEqual(model, m);
            strictEqual('key', attribute);
            deepEqual({}, options);
            strictEqual(2, checkedValue);
            strictEqual(3, uncheckedValue);
        }
        form.checkBox('key', {}, 2, 3);
        
        Viking.View.Helpers.checkBox = old_func;
    });
    
    test("#checkBox() uses namepsace on for attribute", function () {
        expect(5);
        
        var model = this.model;
        var form = new FormBuilder(this.model, {namespace: 'ns'})
        var old_func = Viking.View.Helpers.checkBox
        
        Viking.View.Helpers.checkBox = function(m, attribute, options, checkedValue, uncheckedValue) {
            strictEqual(model, m);
            strictEqual('key', attribute);
            deepEqual({'name': 'ns[model][key]'}, options);
            strictEqual(2, checkedValue);
            strictEqual(3, uncheckedValue);
        }
        form.checkBox('key', {}, 2, 3);
        
        Viking.View.Helpers.checkBox = old_func;
    });
    
    test("#checkBox() allows name attribute to overridden", function () {
        expect(5);
        
        var model = this.model;
        var form = new FormBuilder(this.model, {namespace: 'ns'})
        var old_func = Viking.View.Helpers.checkBox
        
        Viking.View.Helpers.checkBox = function(m, attribute, options, checkedValue, uncheckedValue) {
            strictEqual(model, m);
            strictEqual('key', attribute);
            deepEqual({'name': 'overridden'}, options);
            strictEqual(2, checkedValue);
            strictEqual(3, uncheckedValue);
        }
        form.checkBox('key', {name: 'overridden'}, 2, 3);
        
        Viking.View.Helpers.checkBox = old_func;
    });
    
    // collectionSelect()
    // ==================
    test("#collectionSelect() passes to Viking.View.Helpers.collectionSelect", function () {
        expect(6);
        
        var model = this.model;
        var form = new FormBuilder(this.model)
        var old_func = Viking.View.Helpers.collectionSelect
        
        Viking.View.Helpers.collectionSelect = function(m, attribute, collection, valueAttribute, textAttribute, options) {
            strictEqual(model, m);
            strictEqual('key', attribute);
            strictEqual(1, collection);
            strictEqual(2, valueAttribute);
            strictEqual(3, textAttribute);
            deepEqual({}, options);
        }
        form.collectionSelect('key', 1, 2, 3, {});
        
        Viking.View.Helpers.collectionSelect = old_func;
    });
    
    test("#collectionSelect() obeys namespace", function () {
        expect(6);
        
        var model = this.model;
        var form = new FormBuilder(this.model, {namespace: 'ns'})
        var old_func = Viking.View.Helpers.collectionSelect
        
        Viking.View.Helpers.collectionSelect = function(m, attribute, collection, valueAttribute, textAttribute, options) {
            strictEqual(model, m);
            strictEqual('key', attribute);
            strictEqual(1, collection);
            strictEqual(2, valueAttribute);
            strictEqual(3, textAttribute);
            deepEqual({name: 'ns[model][key]'}, options);
        }
        form.collectionSelect('key', 1, 2, 3, {});
        
        Viking.View.Helpers.collectionSelect = old_func;
    });
    
    test("#collectionSelect() allows name to be overridden", function () {
        expect(6);
        
        var model = this.model;
        var form = new FormBuilder(this.model, {namespace: 'ns'})
        var old_func = Viking.View.Helpers.collectionSelect
        
        Viking.View.Helpers.collectionSelect = function(m, attribute, collection, valueAttribute, textAttribute, options) {
            strictEqual(model, m);
            strictEqual('key', attribute);
            strictEqual(1, collection);
            strictEqual(2, valueAttribute);
            strictEqual(3, textAttribute);
            deepEqual({name: 'overridden'}, options);
        }
        form.collectionSelect('key', 1, 2, 3, {name: 'overridden'});
        
        Viking.View.Helpers.collectionSelect = old_func;
    });
    
    // hiddenField()
    // ==========
    test("#hiddenField() passes to Viking.View.Helpers.hiddenField", function () {
        expect(3);
        
        var model = this.model;
        var form = new FormBuilder(this.model)
        var old_func = Viking.View.Helpers.hiddenField
        
        Viking.View.Helpers.hiddenField = function(m, attribute, options) {
            strictEqual(model, m);
            strictEqual('key', attribute);
            deepEqual({}, options);
        }
        form.hiddenField('key', {});
        
        Viking.View.Helpers.hiddenField = old_func;
    });
    
    test("#hiddenField() obeys namespace", function () {
        expect(3);
        
        var model = this.model;
        var form = new FormBuilder(this.model, {namespace: 'ns'})
        var old_func = Viking.View.Helpers.hiddenField
        
        Viking.View.Helpers.hiddenField = function(m, attribute, options) {
            strictEqual(model, m);
            strictEqual('key', attribute);
            deepEqual({name: 'ns[model][key]'}, options);
        }
        form.hiddenField('key', {});
        
        Viking.View.Helpers.hiddenField = old_func;
    });
    
    test("#hiddenField() allows name to be overridden", function () {
        expect(3);
        
        var model = this.model;
        var form = new FormBuilder(this.model, {namespace: 'ns'})
        var old_func = Viking.View.Helpers.hiddenField
        
        Viking.View.Helpers.hiddenField = function(m, attribute, options) {
            strictEqual(model, m);
            strictEqual('key', attribute);
            deepEqual({name: 'overridden'}, options);
        }
        form.hiddenField('key', {name: 'overridden'});
        
        Viking.View.Helpers.hiddenField = old_func;
    });
    
    // label()
    // ==========
    test("#label() passes to Viking.View.Helpers.label", function () {
        expect(4);
        
        var model = this.model;
        var form = new FormBuilder(this.model)
        var old_func = Viking.View.Helpers.label
        
        Viking.View.Helpers.label = function(m, attribute, content, options) {
            strictEqual(model, m);
            strictEqual('key', attribute);
            strictEqual(1, content);
            deepEqual({}, options);
        }
        form.label('key', 1, {});
        
        Viking.View.Helpers.label = old_func;
    });
    
    test("#label() uses namepsace on for attribute", function () {
        expect(4);
        
        var model = this.model;
        var form = new FormBuilder(this.model, {namespace: 'ns'})
        var old_func = Viking.View.Helpers.label
        
        Viking.View.Helpers.label = function(m, attribute, content, options) {
            strictEqual(model, m);
            strictEqual('key', attribute);
            strictEqual(1, content);
            deepEqual({'for': 'ns_model_key'}, options);
        }
        form.label('key', 1, {});
        
        Viking.View.Helpers.label = old_func;
    });
    
    test("#label() allows for attribute to be overridden", function () {
        expect(4);
        
        var model = this.model;
        var form = new FormBuilder(this.model)
        var old_func = Viking.View.Helpers.label
        
        Viking.View.Helpers.label = function(m, attribute, content, options) {
            strictEqual(model, m);
            strictEqual('key', attribute);
            strictEqual(1, content);
            deepEqual({'for': 'me'}, options);
        }
        form.label('key', 1, {'for': 'me'});
        
        Viking.View.Helpers.label = old_func;
    });
    
    // number()
    // ==========
    test("#number() passes to Viking.View.Helpers.number", function () {
        expect(3);
        
        var model = this.model;
        var form = new FormBuilder(this.model);
        var old_func = Viking.View.Helpers.numberField;
        
        Viking.View.Helpers.numberField = function(m, attribute, options) {
            strictEqual(model, m);
            strictEqual('key', attribute);
            deepEqual({}, options);
        }
        form.number('key', {});
        
        Viking.View.Helpers.numberField = old_func;
    });
    
    test("#number() uses namepsace on for attribute", function () {
        expect(3);
        
        var model = this.model;
        var form = new FormBuilder(this.model, {namespace: 'ns'})
        var old_func = Viking.View.Helpers.numberField
        
        Viking.View.Helpers.numberField = function(m, attribute, options) {
            strictEqual(model, m);
            strictEqual('key', attribute);
            deepEqual({'name': 'ns[model][key]'}, options);
        }
        form.number('key', {});
        
        Viking.View.Helpers.numberField = old_func;
    });
    
    test("#number() allows for attribute to be overridden", function () {
        expect(3);
        
        var model = this.model;
        var form = new FormBuilder(this.model)
        var old_func = Viking.View.Helpers.numberField
        
        Viking.View.Helpers.numberField = function(m, attribute, options) {
            strictEqual(model, m);
            strictEqual('key', attribute);
            deepEqual({'for': 'me'}, options);
        }
        form.number('key', {'for': 'me'});
        
        Viking.View.Helpers.numberField = old_func;
    });

    // passwordField()
    // ==========
    test("#passwordField() passes to Viking.View.Helpers.passwordField", function () {
        expect(3);
        
        var model = this.model;
        var form = new FormBuilder(this.model)
        var old_func = Viking.View.Helpers.passwordField
        
        Viking.View.Helpers.passwordField = function(m, attribute, options) {
            strictEqual(model, m);
            strictEqual('key', attribute);
            deepEqual({}, options);
        }
        form.passwordField('key', {});
        
        Viking.View.Helpers.passwordField = old_func;
    });
    
    test("#passwordField() obeys namespace", function () {
        expect(3);
        
        var model = this.model;
        var form = new FormBuilder(this.model, {namespace: 'ns'})
        var old_func = Viking.View.Helpers.passwordField
        
        Viking.View.Helpers.passwordField = function(m, attribute, options) {
            strictEqual(model, m);
            strictEqual('key', attribute);
            deepEqual({'name': 'ns[model][key]'}, options);
        }
        form.passwordField('key', {});
        
        Viking.View.Helpers.passwordField = old_func;
    });
    
    test("#passwordField() allows name to be overridden", function () {
        expect(3);
        
        var model = this.model;
        var form = new FormBuilder(this.model, {namespace: 'ns'})
        var old_func = Viking.View.Helpers.passwordField
        
        Viking.View.Helpers.passwordField = function(m, attribute, options) {
            strictEqual(model, m);
            strictEqual('key', attribute);
            deepEqual({'name': 'overridden'}, options);
        }
        form.passwordField('key', {name: 'overridden'});
        
        Viking.View.Helpers.passwordField = old_func;
    });
    
    // radioButton()
    // =============
    test("#radioButton() passes to Viking.View.Helpers.radioButton", function () {
        expect(4);
        
        var model = this.model;
        var form = new FormBuilder(this.model)
        var old_func = Viking.View.Helpers.radioButton
        
        Viking.View.Helpers.radioButton = function(m, attribute, tagValue, options) {
            strictEqual(model, m);
            strictEqual('key', attribute);
            strictEqual(1, tagValue);
            deepEqual({}, options);
        }
        form.radioButton('key', 1, {});
        
        Viking.View.Helpers.radioButton = old_func;
    });
    
    test("#radioButton() obeys namespace", function () {
        expect(4);
        
        var model = this.model;
        var form = new FormBuilder(this.model, {namespace: 'ns'})
        var old_func = Viking.View.Helpers.radioButton
        
        Viking.View.Helpers.radioButton = function(m, attribute, tagValue, options) {
            strictEqual(model, m);
            strictEqual('key', attribute);
            strictEqual(1, tagValue);
            deepEqual({'name': 'ns[model][key]'}, options);
        }
        form.radioButton('key', 1, {});
        
        Viking.View.Helpers.radioButton = old_func;
    });
    
    test("#radioButton() allows name to be overridden", function () {
        expect(4);
        
        var model = this.model;
        var form = new FormBuilder(this.model, {namespace: 'ns'})
        var old_func = Viking.View.Helpers.radioButton
        
        Viking.View.Helpers.radioButton = function(m, attribute, tagValue, options) {
            strictEqual(model, m);
            strictEqual('key', attribute);
            strictEqual(1, tagValue);
            deepEqual({'name': 'overridden'}, options);
        }
        form.radioButton('key', 1, {name: 'overridden'});
        
        Viking.View.Helpers.radioButton = old_func;
    });
    
    // select()
    // ========
    test("#select() passes to Viking.View.Helpers.select", function () {
        expect(4);
        
        var model = this.model;
        var form = new FormBuilder(this.model)
        var old_func = Viking.View.Helpers.select
        
        Viking.View.Helpers.select = function(m, attribute, collection, options) {
            strictEqual(model, m);
            strictEqual('key', attribute);
            strictEqual(1, collection);
            deepEqual({}, options);
        }
        form.select('key', 1, {});
        
        Viking.View.Helpers.select = old_func;
    });
    
    test("#select() obeys namespace", function () {
        expect(4);
        
        var model = this.model;
        var form = new FormBuilder(this.model, {namespace: 'ns'})
        var old_func = Viking.View.Helpers.select
        
        Viking.View.Helpers.select = function(m, attribute, collection, options) {
            strictEqual(model, m);
            strictEqual('key', attribute);
            strictEqual(1, collection);
            deepEqual({'name': 'ns[model][key]'}, options);
        }
        form.select('key', 1, {});
        
        Viking.View.Helpers.select = old_func;
    });
    
    test("#select() allows name to be overridden", function () {
        expect(4);
        
        var model = this.model;
        var form = new FormBuilder(this.model, {namespace: 'ns'})
        var old_func = Viking.View.Helpers.select
        
        Viking.View.Helpers.select = function(m, attribute, collection, options) {
            strictEqual(model, m);
            strictEqual('key', attribute);
            strictEqual(1, collection);
            deepEqual({'name': 'overridden'}, options);
        }
        form.select('key', 1, {name: 'overridden'});
        
        Viking.View.Helpers.select = old_func;
    });
    
    // textArea()
    // ==========
    test("#textArea() passes to Viking.View.Helpers.textArea", function () {
        expect(3);
        
        var model = this.model;
        var form = new FormBuilder(this.model)
        var old_func = Viking.View.Helpers.textArea
        
        Viking.View.Helpers.textArea = function(m, attribute, options) {
            strictEqual(model, m);
            strictEqual('key', attribute);
            deepEqual({}, options);
        }
        form.textArea('key', {});
        
        Viking.View.Helpers.textArea = old_func;
    });
    
    test("#textArea() obeys namespace", function () {
        expect(3);
        
        var model = this.model;
        var form = new FormBuilder(this.model, {namespace: 'ns'})
        var old_func = Viking.View.Helpers.textArea
        
        Viking.View.Helpers.textArea = function(m, attribute, options) {
            strictEqual(model, m);
            strictEqual('key', attribute);
            deepEqual({'name': 'ns[model][key]'}, options);
        }
        form.textArea('key', {});
        
        Viking.View.Helpers.textArea = old_func;
    });
    
    test("#textArea() allows name to be overridden", function () {
        expect(3);
        
        var model = this.model;
        var form = new FormBuilder(this.model, {namespace: 'ns'})
        var old_func = Viking.View.Helpers.textArea
        
        Viking.View.Helpers.textArea = function(m, attribute, options) {
            strictEqual(model, m);
            strictEqual('key', attribute);
            deepEqual({'name': 'overridden'}, options);
        }
        form.textArea('key', {name: 'overridden'});
        
        Viking.View.Helpers.textArea = old_func;
    });
    
    // textField()
    // ==========
    test("#textField() passes to Viking.View.Helpers.textField", function () {
        expect(3);
        
        var model = this.model;
        var form = new FormBuilder(this.model)
        var old_func = Viking.View.Helpers.textField
        
        Viking.View.Helpers.textField = function(m, attribute, options) {
            strictEqual(model, m);
            strictEqual('key', attribute);
            deepEqual({}, options);
        }
        form.textField('key', {});
        
        Viking.View.Helpers.textField = old_func;
    });
    
    test("#textField() obeys namespace", function () {
        expect(3);
        
        var model = this.model;
        var form = new FormBuilder(this.model, {namespace: 'ns'})
        var old_func = Viking.View.Helpers.textField
        
        Viking.View.Helpers.textField = function(m, attribute, options) {
            strictEqual(model, m);
            strictEqual('key', attribute);
            deepEqual({name: 'ns[model][key]'}, options);
        }
        form.textField('key', {});
        
        Viking.View.Helpers.textField = old_func;
    });
    
    test("#textField() allows name to be overridden", function () {
        expect(3);
        
        var model = this.model;
        var form = new FormBuilder(this.model, {namespace: 'ns'})
        var old_func = Viking.View.Helpers.textField
        
        Viking.View.Helpers.textField = function(m, attribute, options) {
            strictEqual(model, m);
            strictEqual('key', attribute);
            deepEqual({'name': 'overridden'}, options);
        }
        form.textField('key', {name: 'overridden'});
        
        Viking.View.Helpers.textField = old_func;
    });
    
    // checkBoxGroup
    test("#checkBoxGroup() passes to Viking.View.Helpers.checkBox", function () {
        expect(4);
        
        var model = this.model;
        var form = new FormBuilder(this.model)
        var old_func = Viking.View.Helpers.checkBoxGroup
        
        Viking.View.Helpers.checkBoxGroup = function(m, attribute, options, content) {
            strictEqual(model, m);
            strictEqual('key', attribute);
            deepEqual({}, options);
            strictEqual(2, content);
        }
        form.checkBoxGroup('key', {}, 2);
        
        Viking.View.Helpers.checkBoxGroup = old_func;
    });
    
    test("#checkBoxGroup() uses namepsace on for attribute", function () {
        expect(4);
        
        var model = this.model;
        var form = new FormBuilder(this.model, {namespace: 'ns'})
        var old_func = Viking.View.Helpers.checkBoxGroup
        
        Viking.View.Helpers.checkBoxGroup = function(m, attribute, options, content) {
            strictEqual(model, m);
            strictEqual('key', attribute);
            deepEqual({'namespace': 'ns'}, options);
            strictEqual(2, content);
        }
        form.checkBoxGroup('key', {}, 2);
        
        Viking.View.Helpers.checkBoxGroup = old_func;
    });
    
    // formFor()
    // =========
    test("#fieldsFor() yields a FormBuilder with the namespace set", function (attribute, options, content) {
        var formBuilder = new FormBuilder(this.model);
        
        formBuilder.fieldsFor('key', function(f) {
            equal(f.options.namespace, 'model');
        });
    });
    
    test("#fieldsFor() works with a FormBuilder that already has a namespace", function (attribute, options, content) {
        var formBuilder = new FormBuilder(this.model, {namespace: 'ns'});
        
        formBuilder.fieldsFor('key', function(f) {
            equal(f.options.namespace, 'ns[model]');
        });
    });
    
}());