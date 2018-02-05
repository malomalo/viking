import * as Backbone from 'backbone';
import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../../../../viking';

let model: any;
module('Viking.View.Helpers#checkBoxGroup', {
    beforeEach: function() {
        let Model = Viking.Model.extend("model");
        model = new Model();
        model.set('roles', ['admin']);
    }
}, () => {
    // checkBoxGroup(model, attribute, options, content())
    // ===================================================
    test("checkBoxGroup(model, attribute, content())", function() {
        assert.equal(
            Viking.View.Helpers.checkBoxGroup(model, 'roles', function(b) {
                return b.checkBox('agent') + b.checkBox('admin');
            }),
            '<input id="model_roles_agent" name="model[roles][]" type="checkbox" value="agent"><input checked id="model_roles_admin" name="model[roles][]" type="checkbox" value="admin">'
        );
    });
    
    test("checkBoxGroup(model, attribute, options, content())", function() {
        assert.equal(
            Viking.View.Helpers.checkBoxGroup(model, 'roles', {namespace: 'ns'}, function(b) {
                return b.checkBox('agent') + b.checkBox('admin');
            }),
            '<input id="ns_model_roles_agent" name="ns[model][roles][]" type="checkbox" value="agent"><input checked id="ns_model_roles_admin" name="ns[model][roles][]" type="checkbox" value="admin">'
        );
    });

});