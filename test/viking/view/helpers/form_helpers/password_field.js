import Viking from '../../../../../src/viking';

(function () {
    module("Viking.View.Helpers#password_field", {
        setup: function() {
            this.Model = Viking.Model.extend("model");
            this.model = new this.Model();
        }
    });
    
    // passwordField(model, attribute, options)
    // ========================================
    test("passwordField(model, attribute)", function() {
        equal( Viking.View.Helpers.passwordField(this.model, 'password'), '<input id="model_password" name="model[password]" type="password">')
    });
    
    test("passwordField(model, attribute, options)", function() {
        equal( Viking.View.Helpers.passwordField(this.model, 'password', {'class': "form_input", value: 'secret'}),
               '<input class="form_input" id="model_password" name="model[password]" type="password" value="secret">')
    });
    
    test("passwordField(model, attribute) with error on attribute", function() {
        this.model.validationError = {'password': ['must be accepted']};
        
        equal( Viking.View.Helpers.passwordField(this.model, 'password'),
               '<input class="error" id="model_password" name="model[password]" type="password">');
    });
    
    test("passwordField(model, attribute, options) allows name to be overridden", function() {
        equal( Viking.View.Helpers.passwordField(this.model, 'password', {name: 'overridden'}),
               '<input id="overridden" name="overridden" type="password">');
    });
    
}());