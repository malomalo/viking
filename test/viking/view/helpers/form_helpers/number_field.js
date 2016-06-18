import Viking from '../../../../../src/viking';

(function () {
    module("Viking.View.Helpers#numberField", {
        setup: function() {
            this.Model = Viking.Model.extend("model");
            this.model = new this.Model();
        }
    });
    
    // numberField(model, attribute, options)
    // ===================================
    test("numberField(model, attribute)", function() {
        equal(
            Viking.View.Helpers.numberField(this.model, 'age'),
            '<input id="model_age" name="model[age]" type="number">'
        );
        
        this.model.set('age', 27);
        equal(
            Viking.View.Helpers.numberField(this.model, 'age'),
            '<input id="model_age" name="model[age]" type="number" value="27">'
        );
    });
    
    test("numberField(model, attribute, options)", function() {
        equal(
            Viking.View.Helpers.numberField(this.model, 'age', {min: 0, max: 100, step: 25}),
            '<input id="model_age" max="100" min="0" name="model[age]" step="25" type="number">'
        );
    });
    
    test("numberField(model, attribute) with error on attribute", function() {
        this.model.validationError = {'age': ['must not be blank']};
        
        equal(
            Viking.View.Helpers.numberField(this.model, 'age', {min: 0, max: 100, step: 25}),
            '<input class="error" id="model_age" max="100" min="0" name="model[age]" step="25" type="number">'
        );
    });

    
}());