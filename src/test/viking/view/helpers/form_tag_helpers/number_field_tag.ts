import * as Backbone from 'backbone';
import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../../../../viking';

module('Viking.View.Helpers#number_field_tag', {}, () => {

    // numberFieldTag(name, value = nil, options = {})
    // ===============================================
    test("numberFieldTag(name)", function() {
        assert.equal(
            Viking.View.Helpers.numberFieldTag('count'),
            '<input id="count" name="count" type="number">'
        );
    });
    
    test("numberFieldTag(name, value)", function() {
        assert.equal(
            Viking.View.Helpers.numberFieldTag('count', 10),
            '<input id="count" name="count" type="number" value="10">'
        );
    });
    
    test("numberFieldTag(name, value, {min: X, max: Y})", function() {
        assert.equal(
            Viking.View.Helpers.numberFieldTag('count', 4, {min: 1, max: 9}),
            '<input id="count" max="9" min="1" name="count" type="number" value="4">'
        );
    });
    
    test("numberFieldTag(name, options)", function() {
        assert.equal(
            Viking.View.Helpers.numberFieldTag('count', {step: 25}),
            '<input id="count" name="count" step="25" type="number">'
        );
    });
    
});