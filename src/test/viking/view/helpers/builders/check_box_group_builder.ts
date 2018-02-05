import * as Backbone from 'backbone';
import * as _ from 'underscore';
import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../../../../viking';

let model: any;

module('Viking.View - CheckBoxGroupBuilder', {
    beforeEach: function() {
        let Model = Viking.Model.extend("model");
        model = new Model();
    }
}, () => {
    // new CheckBoxGroupBuilder(model, attribute, options)
    // ===============================
    test("new FormBuilder(model, attribute)", function() {
        var form = new Viking.CheckBoxGroupBuilder(model, 'key');

        assert.equal(form.model, model);
        assert.equal(form.attribute, 'key');
    });

    test("new FormBuilder(model, attribute, options)", function() {
        var options = {key: 'value', foo: 3};
        var form = new Viking.CheckBoxGroupBuilder(model, 'key', options);

        assert.equal(form.model, model);
        assert.equal(form.attribute, 'key');
        assert.deepEqual(form.options, _.extend({namespace:'model'},options));
    });
    
    // checkBox(value, options)
    // ========================
    test("#checkBox(value)", function () {
        var model = model;
        var form = new Viking.CheckBoxGroupBuilder(model, 'roles')
        model.set('roles', ['agent'])
        
        assert.equal( form.checkBox('admin'), '<input id="model_roles_admin" name="model[roles][]" type="checkbox" value="admin">');
        assert.equal( form.checkBox('agent'), '<input checked id="model_roles_agent" name="model[roles][]" type="checkbox" value="agent">');
    });
    
    test("#checkBox(value, options)", function () {
        var model = model;
        var form = new Viking.CheckBoxGroupBuilder(model, 'roles')
        model.set('roles', ['agent'])
        
        assert.equal( form.checkBox('admin', {"class": 'myclass'}), '<input class="myclass" id="model_roles_admin" name="model[roles][]" type="checkbox" value="admin">');
        assert.equal( form.checkBox('agent', {"class": 'myclass'}), '<input checked class="myclass" id="model_roles_agent" name="model[roles][]" type="checkbox" value="agent">');
    });
    
    test("#checkBox() obeys namespace", function () {
        var model = model;
        var form = new Viking.CheckBoxGroupBuilder(model, 'roles', {namespace: 'ns'})
        model.set('roles', ['agent'])
        
        assert.equal( form.checkBox('admin'), '<input id="ns_model_roles_admin" name="ns[model][roles][]" type="checkbox" value="admin">');
        assert.equal( form.checkBox('agent'), '<input checked id="ns_model_roles_agent" name="ns[model][roles][]" type="checkbox" value="agent">');
    });
    
    // label(value, content, options, escape)
    // ======================================
    test("#label() passes to Viking.View.Helpers.label", function() {
        var model = model;
        var form = new Viking.CheckBoxGroupBuilder(model, 'roles')
        var old_func = Viking.View.Helpers.label
    
        Viking.View.Helpers.label = function(m, attribute, content, options, escape) {
            assert.strictEqual(model, m);
            assert.strictEqual('roles', attribute);
            assert.strictEqual(1, content);
            assert.deepEqual({'for': 'model_roles_key'}, options);
            assert.strictEqual(2, escape);
        }
        form.label('key', 1, {}, 2);
    
        Viking.View.Helpers.label = old_func;
    });
    
    test("#label() uses namepsace on for attribute", function() {
        var model = model;
        var form = new Viking.CheckBoxGroupBuilder(model, 'roles', {namespace: 'ns'})
        var old_func = Viking.View.Helpers.label
    
        Viking.View.Helpers.label = function(m, attribute, content, options, escape) {
            assert.strictEqual(model, m);
            assert.strictEqual('roles', attribute);
            assert.strictEqual(1, content);
            assert.deepEqual({'for': 'ns_model_roles_agent'}, options);
            assert.strictEqual(2, escape);
        }
        form.label('agent', 1, {}, 2);
    
        Viking.View.Helpers.label = old_func;
    });
    
    test("#label() allows for attribute to be overridden", function() {
        var model = model;
        var form = new Viking.CheckBoxGroupBuilder(model, 'roles')
        var old_func = Viking.View.Helpers.label
    
        Viking.View.Helpers.label = function(m, attribute, content, options, escape) {
            assert.strictEqual(model, m);
            assert.strictEqual('roles', attribute);
            assert.strictEqual(1, content);
            assert.deepEqual({'for': 'me'}, options);
            assert.strictEqual(2, escape);
        }
        form.label('agent', 1, {'for': 'me'}, 2);
    
        Viking.View.Helpers.label = old_func;
    });

    

});