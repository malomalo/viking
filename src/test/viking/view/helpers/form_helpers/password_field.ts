import * as Backbone from 'backbone';
import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../../../../viking';

let model: any;
module('Viking.View.Helpers#password_field', {
    beforeEach: function() {
        let Model = Viking.Model.extend("model");
        model = new Model();
    }
}, () => {
    
    // passwordField(model, attribute, options)
    // ========================================
    test("passwordField(model, attribute)", function() {
        assert.equal( Viking.View.Helpers.passwordField(model, 'password'), '<input id="model_password" name="model[password]" type="password">')
    });
    
    test("passwordField(model, attribute, options)", function() {
        assert.equal( Viking.View.Helpers.passwordField(model, 'password', {'class': "form_input", value: 'secret'}),
               '<input class="form_input" id="model_password" name="model[password]" type="password" value="secret">')
    });
    
    test("passwordField(model, attribute) with error on attribute", function() {
        model.validationError = {'password': ['must be accepted']};
        
        assert.equal( Viking.View.Helpers.passwordField(model, 'password'),
               '<input class="error" id="model_password" name="model[password]" type="password">');
    });
    
    test("passwordField(model, attribute, options) allows name to be overridden", function() {
        assert.equal( Viking.View.Helpers.passwordField(model, 'password', {name: 'overridden'}),
               '<input id="overridden" name="overridden" type="password">');
    });
    
});