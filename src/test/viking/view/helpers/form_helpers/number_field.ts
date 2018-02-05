import * as Backbone from 'backbone';
import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../../../../viking';

let model: any;
module('Viking.View.Helpers#numberField', {
    beforeEach: function() {
        let Model = Viking.Model.extend("model");
        model = new Model();
    }
}, () => {
    
    // numberField(model, attribute, options)
    // ===================================
    test("numberField(model, attribute)", function() {
        assert.equal(
            Viking.View.Helpers.numberField(model, 'age'),
            '<input id="model_age" name="model[age]" type="number">'
        );
        
        model.set('age', 27);
        assert.equal(
            Viking.View.Helpers.numberField(model, 'age'),
            '<input id="model_age" name="model[age]" type="number" value="27">'
        );
    });
    
    test("numberField(model, attribute, options)", function() {
        assert.equal(
            Viking.View.Helpers.numberField(model, 'age', {min: 0, max: 100, step: 25}),
            '<input id="model_age" max="100" min="0" name="model[age]" step="25" type="number">'
        );
    });
    
    test("numberField(model, attribute) with error on attribute", function() {
        model.validationError = {'age': ['must not be blank']};
        
        assert.equal(
            Viking.View.Helpers.numberField(model, 'age', {min: 0, max: 100, step: 25}),
            '<input class="error" id="model_age" max="100" min="0" name="model[age]" step="25" type="number">'
        );
    });

    
});