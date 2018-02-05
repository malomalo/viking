import * as Backbone from 'backbone';
import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../../../../viking';

let model: any;
module('Viking.View.Helpers#text_field', {
    beforeEach: function() {
        let Model = Viking.Model.extend("model");
        model = new Model();
    }
}, () => {
    // textField(model, attribute, options)
    // ====================================
    test("textField(model, attribute)", function() {
        assert.equal(Viking.View.Helpers.textField(model, 'name'), '<input id="model_name" name="model[name]" type="text">');
        
        model.set('name', 'My Name');
        assert.equal(Viking.View.Helpers.textField(model, 'name'), '<input id="model_name" name="model[name]" type="text" value="My Name">');
    });
    
    test("textField(model, attribute, options)", function() {
        assert.equal(Viking.View.Helpers.textField(model, 'name', {'class': "create_input", size: 20}), '<input class="create_input" id="model_name" name="model[name]" size="20" type="text">');
    });

    test("textField(model, attribute) with error on attribute", function() {
        model.validationError = {'notes': ['must not be blank']};
        
        assert.equal( Viking.View.Helpers.textField(model, 'notes'),
               '<input class="error" id="model_notes" name="model[notes]" type="text">');
    });
    
    test("textField(model, attribute, {name: 'custom'})", function () {
        assert.equal(Viking.View.Helpers.textField(model, 'name', {"name": 'custom'}), '<input id="custom" name="custom" type="text">');
    });
    
});