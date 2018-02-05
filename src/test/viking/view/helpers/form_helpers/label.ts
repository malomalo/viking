import * as Backbone from 'backbone';
import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../../../../viking';

let model: any;
module('Viking.View.Helpers#label', {
    beforeEach: function() {
        let Model = Viking.Model.extend("model");
        model = new Model();
    }
}, () => {
    
    // label(model, attribute, content, options)
    // =========================================
    test("label(model, attribute)", function() {
        assert.equal( Viking.View.Helpers.label(model, 'key'), '<label for="model_key">Key</label>');
    });
    
    test("label(model, attribute, options)", function() {
        assert.equal( Viking.View.Helpers.label(model, 'key', {'class': 'options'}), '<label class="options" for="model_key">Key</label>');
    });
    
    test("label(model, attribute, content)", function() {
        assert.equal( Viking.View.Helpers.label(model, 'key', 'Content'), '<label for="model_key">Content</label>');
        
        assert.equal( Viking.View.Helpers.label(model, 'key', function() {return "Content";}), '<label for="model_key">Content</label>');
    });
    
    test("label(model, attribute, content, options)", function() {
        assert.equal( Viking.View.Helpers.label(model, 'title', 'A short title', {'class': 'title_label'}),
               '<label class="title_label" for="model_title">A short title</label>');
    });
    
    test("label(model, attribute, options, content)", function() {
        assert.equal( Viking.View.Helpers.label(model, 'title', {'class': 'title_label'}, function() { return 'A short title'; }),
               '<label class="title_label" for="model_title">A short title</label>');
    });
    
    test("label(model, attribute) with error on attribute", function() {
        model.validationError = {'eula': ['must be accepted']};
        
        assert.equal( Viking.View.Helpers.label(model, 'eula'),
               '<label class="error" for="model_eula">Eula</label>');
    });
    
    test("label(model, attribute, {for: 'override'}) uses 'override' for the `for` attribute", function() {
        assert.equal( Viking.View.Helpers.label(model, 'key', {'for': 'override'}), '<label for="override">Key</label>');
    });
    
    test("label(model, attribute, content, options, escape)", function() {
        assert.equal( Viking.View.Helpers.label(model, 'key', '<key>', {'class': 'options'}, false), '<label class="options" for="model_key"><key></label>');
    });
    
});