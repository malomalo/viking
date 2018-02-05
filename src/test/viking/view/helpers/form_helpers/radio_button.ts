import * as Backbone from 'backbone';
import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../../../../viking';

let model: any;
module('Viking.View.Helpers#radio_button', {
    beforeEach: function() {
        let Model = Viking.Model.extend("model");
        model = new Model();
    }
}, () => {
    // radioButton(model, attribute, tag_value, options)
    // =================================================
    test("radioButton(model, attribute, tag_value)", function() {
        model.set('category', 'rails');
        
        assert.equal( Viking.View.Helpers.radioButton(model, "category", "rails"), '<input checked id="model_category_rails" name="model[category]" type="radio" value="rails">')
        assert.equal( Viking.View.Helpers.radioButton(model, "category", "java"), '<input id="model_category_java" name="model[category]" type="radio" value="java">')
    });
    
    test("radioButton(model, attribute, tag_value, options)", function() {
        assert.equal( Viking.View.Helpers.radioButton(model, "category", "yes", {id: 'test'}), '<input id="test" name="model[category]" type="radio" value="yes">')
        assert.equal( Viking.View.Helpers.radioButton(model, "category", "no", {checked: true}), '<input checked id="model_category_no" name="model[category]" type="radio" value="no">')
    });
    
    test("radioButton(model, attribute) with error on attribute", function() {
        model.validationError = {'eula': ['must be accepted']};
        
        assert.equal( Viking.View.Helpers.radioButton(model, 'eula', 'true'),
               '<input class="error" id="model_eula_true" name="model[eula]" type="radio" value="true">');
    });
    
    test("radioButton(model, attribute) allows name to be overridden", function() {
        assert.equal( Viking.View.Helpers.radioButton(model, 'eula', 'true', {name: 'overridden'}),
               '<input id="overridden_true" name="overridden" type="radio" value="true">');
    });
    
});