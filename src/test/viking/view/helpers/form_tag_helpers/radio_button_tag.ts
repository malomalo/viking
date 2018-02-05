import * as Backbone from 'backbone';
import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../../../../viking';

module('Viking.View.Helpers#radio_button_tag', {}, () => {

    // // radioButtonTag(name, value, checked, options)
    // // =============================================
    test("radioButtonTag(name, value)", function() {
        assert.equal( Viking.View.Helpers.radioButtonTag('gender', 'male'), '<input id="gender" name="gender" type="radio" value="male">');
    });
    
    test("radioButtonTag(name, value, checked)", function() {
        assert.equal( Viking.View.Helpers.radioButtonTag('gender', 'male', true), '<input checked id="gender" name="gender" type="radio" value="male">');
    });
    
    test("radioButtonTag(name, value, checked, options)", function() {
        assert.equal( Viking.View.Helpers.radioButtonTag('gender', 'male', false, {disabled: true}), '<input disabled id="gender" name="gender" type="radio" value="male">');
        
        assert.equal( Viking.View.Helpers.radioButtonTag('gender', 'male', false, {'class': "myClass"}), '<input class="myClass" id="gender" name="gender" type="radio" value="male">');
    });

});