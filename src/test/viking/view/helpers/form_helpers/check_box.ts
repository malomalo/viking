import * as Backbone from 'backbone';
import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../../../../viking';

let model: any;
module('Viking.View.Helpers#check_box', {
    beforeEach: function() {
        let Model = Viking.Model.extend("model");
        model = new Model();
    }
}, () => {
    // checkBox(model, attribute, options, checkedValue, uncheckedValue)
    // =================================================================
    test("checkBox(model, attribute)", function() {
        model.set('key', true);
        assert.equal( Viking.View.Helpers.checkBox(model, 'key'),
               '<input name="model[key]" type="hidden" value="false"><input checked id="model_key" name="model[key]" type="checkbox" value="true">');
        
        model.set('key', false);
        assert.equal( Viking.View.Helpers.checkBox(model, 'key'),
               '<input name="model[key]" type="hidden" value="false"><input id="model_key" name="model[key]" type="checkbox" value="true">');
    });
    
    test("checkBox(model, attribute, {}, yesValue, noValue)", function() {
        model.set('key', 'yes');
        assert.equal( Viking.View.Helpers.checkBox(model, 'key', {}, 'yes', 'no'),
               '<input name="model[key]" type="hidden" value="no"><input checked id="model_key" name="model[key]" type="checkbox" value="yes">');
        
        model.set('key', 'no');
        assert.equal( Viking.View.Helpers.checkBox(model, 'key', {}, 'yes', 'no'),
               '<input name="model[key]" type="hidden" value="no"><input id="model_key" name="model[key]" type="checkbox" value="yes">');
    });
    
    test("checkBox(model, attribute, options)", function() {
        model.set('key', 'yes');
        assert.equal( Viking.View.Helpers.checkBox(model, 'key', { 'class': 'eula_check' }, 'yes', 'no'),
               '<input name="model[key]" type="hidden" value="no"><input checked class="eula_check" id="model_key" name="model[key]" type="checkbox" value="yes">');
        
        model.set('key', 'no');
        assert.equal( Viking.View.Helpers.checkBox(model, 'key', { 'class': 'eula_check' }, 'yes', 'no'),
               '<input name="model[key]" type="hidden" value="no"><input class="eula_check" id="model_key" name="model[key]" type="checkbox" value="yes">');
    });
    
    test("checkBox(model, attribute) with error on attribute", function() {
        model.validationError = {'eula': ['must be accepted']};
        
        assert.equal( Viking.View.Helpers.checkBox(model, 'eula'),
               '<input name="model[eula]" type="hidden" value="false"><input class="error" id="model_eula" name="model[eula]" type="checkbox" value="true">');
               
       assert.equal( Viking.View.Helpers.checkBox(model, 'eula', {'class': 'eula'}, 'yes', 'no'),
              '<input name="model[eula]" type="hidden" value="no"><input class="eula error" id="model_eula" name="model[eula]" type="checkbox" value="yes">');
    });
    
    test("checkBox(model, attribute, options) allows you to override the name attribute on the html tag", function() {
        model.set('key', 'yes');
        assert.equal( Viking.View.Helpers.checkBox(model, 'key', { name: 'eula_yes' }, 'yes', 'no'),
               '<input name="eula_yes" type="hidden" value="no"><input checked id="eula_yes" name="eula_yes" type="checkbox" value="yes">');
    });
    
    test("checkBox(model, attribute, options, yes_value, no_value, escape) passes along escape", function() {
        model.set('key', 'yes');
        assert.equal( Viking.View.Helpers.checkBox(model, 'key', { "data-icon": "&#xf123;" }, 'yes', 'no', false),
               '<input name="model[key]" type="hidden" value="no"><input checked data-icon="&#xf123;" id="model_key" name="model[key]" type="checkbox" value="yes">');
    });
    
});