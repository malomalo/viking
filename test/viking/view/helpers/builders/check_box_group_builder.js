(function () {
    module("Viking.View - CheckBoxGroupBuilder", {
        setup: function() {
            this.Model = Viking.Model.extend("model");
            this.model = new this.Model();
        }
    });
    
    // new CheckBoxGroupBuilder(model, attribute, options)
    // ===============================
    test("new FormBuilder(model, attribute)", function() {
        var form = new CheckBoxGroupBuilder(this.model, 'key');

        equal(form.model, this.model);
        equal(form.attribute, 'key');
    });

    test("new FormBuilder(model, attribute, options)", function() {
        var options = {key: 'value', foo: 3};
        var form = new CheckBoxGroupBuilder(this.model, 'key', options);

        equal(form.model, this.model);
        equal(form.attribute, 'key');
        equal(form.options, options);
    });
    
    // checkBox(value, options)
    // ========================
    test("#checkBox(value)", function () {
        var model = this.model;
        var form = new CheckBoxGroupBuilder(this.model, 'roles')
        this.model.set('roles', ['agent'])
        
        equal( form.checkBox('admin'), '<input id="model_roles_admin" name="model[roles][]" type="checkbox" value="admin">');
        equal( form.checkBox('agent'), '<input checked id="model_roles_agent" name="model[roles][]" type="checkbox" value="agent">');
    });
    
    test("#checkBox(value, options)", function () {
        var model = this.model;
        var form = new CheckBoxGroupBuilder(this.model, 'roles')
        this.model.set('roles', ['agent'])
        
        equal( form.checkBox('admin', {"class": 'myclass'}), '<input class="myclass" id="model_roles_admin" name="model[roles][]" type="checkbox" value="admin">');
        equal( form.checkBox('agent', {"class": 'myclass'}), '<input checked class="myclass" id="model_roles_agent" name="model[roles][]" type="checkbox" value="agent">');
    });
    
    test("#checkBox() obeys namespace", function () {
        var model = this.model;
        var form = new CheckBoxGroupBuilder(this.model, 'roles', {namespace: 'ns'})
        this.model.set('roles', ['agent'])
        
        equal( form.checkBox('admin'), '<input id="ns_model_roles_admin" name="ns[model][roles][]" type="checkbox" value="admin">');
        equal( form.checkBox('agent'), '<input checked id="ns_model_roles_agent" name="ns[model][roles][]" type="checkbox" value="agent">');
    });
    
    // label(value, content, options, escape)
    // ======================================
    test("#label() passes to Viking.View.Helpers.label", function () {
        expect(5);
        
        var model = this.model;
        var form = new CheckBoxGroupBuilder(this.model, 'roles')
        var old_func = Viking.View.Helpers.label
        
        Viking.View.Helpers.label = function(m, attribute, content, options, escape) {
            strictEqual(model, m);
            strictEqual('roles', attribute);
            strictEqual(1, content);
            deepEqual({'for': 'model_roles_key'}, options);
            strictEqual(2, escape);
        }
        form.label('key', 1, {}, 2);
        
        Viking.View.Helpers.label = old_func;
    });
    
    test("#label() uses namepsace on for attribute", function () {
        expect(5);
        
        var model = this.model;
        var form = new CheckBoxGroupBuilder(this.model, 'roles', {namespace: 'ns'})
        var old_func = Viking.View.Helpers.label
        
        Viking.View.Helpers.label = function(m, attribute, content, options, escape) {
            strictEqual(model, m);
            strictEqual('roles', attribute);
            strictEqual(1, content);
            deepEqual({'for': 'ns_model_roles_agent'}, options);
            strictEqual(2, escape);
        }
        form.label('agent', 1, {}, 2);
        
        Viking.View.Helpers.label = old_func;
    });
    
    test("#label() allows for attribute to be overridden", function () {
        expect(5);
        
        var model = this.model;
        var form = new CheckBoxGroupBuilder(this.model, 'roles')
        var old_func = Viking.View.Helpers.label
        
        Viking.View.Helpers.label = function(m, attribute, content, options, escape) {
            strictEqual(model, m);
            strictEqual('roles', attribute);
            strictEqual(1, content);
            deepEqual({'for': 'me'}, options);
            strictEqual(2, escape);
        }
        form.label('agent', 1, {'for': 'me'}, 2);
        
        Viking.View.Helpers.label = old_func;
    });

    

}());