import * as Backbone from 'backbone';
import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../../../../viking';

let model: any;
module('Viking.View.Helpers#hidden_field', {
    beforeEach: function() {
        let Model = Viking.Model.extend("model");
        model = new Model();
    }
}, () => {
    
    // hiddenField(model, attribute, options)
    // ======================================
    test("hiddenField(model, attribute)", function() {
        assert.equal( Viking.View.Helpers.hiddenField(model, 'key'),
               '<input name="model[key]" type="hidden" value="">');
        
        model.set('key', 'token');
        assert.equal( Viking.View.Helpers.hiddenField(model, 'key'),
               '<input name="model[key]" type="hidden" value="token">');
    });
    
    test("hiddenField(model, attribute, options)", function() {
        assert.equal( Viking.View.Helpers.hiddenField(model, 'key', {'class': 'test'}),
               '<input class="test" name="model[key]" type="hidden" value="">');
    });
    
    test("hiddenField(model, attribute, options) allows name to be overridden", function() {
        assert.equal( Viking.View.Helpers.hiddenField(model, 'key', {name: 'overridden'}),
               '<input name="overridden" type="hidden" value="">');
    });
    
});