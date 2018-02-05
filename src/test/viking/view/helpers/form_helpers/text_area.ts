import * as Backbone from 'backbone';
import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../../../../viking';

let model: any;
module('Viking.View.Helpers#text_area', {
    beforeEach: function() {
        let Model = Viking.Model.extend("model");
        model = new Model();
    }
}, () => {
    // textArea(model, attribute, options)
    // ===================================
    test("textArea(model, attribute)", function() {
        assert.equal( Viking.View.Helpers.textArea(model, 'notes'), '<textarea id="model_notes" name="model[notes]"></textarea>')
        
        model.set('notes', 'test')
        assert.equal( Viking.View.Helpers.textArea(model, 'notes'), '<textarea id="model_notes" name="model[notes]">test</textarea>')
    });
    
    test("textArea(model, attribute, options)", function() {
        assert.equal( Viking.View.Helpers.textArea(model, 'notes', {size: '20x40'}), '<textarea cols="20" id="model_notes" name="model[notes]" rows="40"></textarea>')
    });
    
    test("textArea(model, attribute) with error on attribute", function() {
        model.validationError = {'notes': ['must not be blank']};
        
        assert.equal( Viking.View.Helpers.textArea(model, 'notes'),
               '<textarea class="error" id="model_notes" name="model[notes]"></textarea>');
    });

    
});