import Viking from '../../../../../src/viking';

(function () {
    module("Viking.View.Helpers#text_field", {
        setup: function() {
            this.Model = Viking.Model.extend("model");
            this.model = new this.Model();
        }
    });
    
    // textField(model, attribute, options)
    // ====================================
    test("textField(model, attribute)", function() {
        equal (Viking.View.Helpers.textField(this.model, 'name'), '<input id="model_name" name="model[name]" type="text">');
        
        this.model.set('name', 'My Name');
        equal (Viking.View.Helpers.textField(this.model, 'name'), '<input id="model_name" name="model[name]" type="text" value="My Name">');
    });
    
    test("textField(model, attribute, options)", function() {
        equal (Viking.View.Helpers.textField(this.model, 'name', {'class': "create_input", size: 20}), '<input class="create_input" id="model_name" name="model[name]" size="20" type="text">');
    });

    test("textField(model, attribute) with error on attribute", function() {
        this.model.validationError = {'notes': ['must not be blank']};
        
        equal( Viking.View.Helpers.textField(this.model, 'notes'),
               '<input class="error" id="model_notes" name="model[notes]" type="text">');
    });
    
    test("textField(model, attribute, {name: 'custom'})", function () {
        equal (Viking.View.Helpers.textField(this.model, 'name', {"name": 'custom'}), '<input id="custom" name="custom" type="text">');
    });
    
}());