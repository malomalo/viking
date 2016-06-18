import Viking from '../../../../../src/viking';

(function () {
    module("Viking.View.Helpers#checkBoxGroup", {
        setup: function() {
            this.Model = Viking.Model.extend("model");
            this.model = new this.Model();
            this.model.set('roles', ['admin']);
        }
    });

    // checkBoxGroup(model, attribute, options, content())
    // ===================================================
    test("checkBoxGroup(model, attribute, content())", function() {
        equal(
            Viking.View.Helpers.checkBoxGroup(this.model, 'roles', function(b) {
                return b.checkBox('agent') + b.checkBox('admin');
            }),
            '<input id="model_roles_agent" name="model[roles][]" type="checkbox" value="agent"><input checked id="model_roles_admin" name="model[roles][]" type="checkbox" value="admin">'
        );
    });
    
    test("checkBoxGroup(model, attribute, options, content())", function() {
        equal(
            Viking.View.Helpers.checkBoxGroup(this.model, 'roles', {namespace: 'ns'}, function(b) {
                return b.checkBox('agent') + b.checkBox('admin');
            }),
            '<input id="ns_model_roles_agent" name="ns[model][roles][]" type="checkbox" value="agent"><input checked id="ns_model_roles_admin" name="ns[model][roles][]" type="checkbox" value="admin">'
        );
    });

}());