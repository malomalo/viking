import * as Backbone from 'backbone';
import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../../../viking';

module('Viking.Model.Type.Boolean', {}, () => {

    test("::load coerces the string 'true' to true", function() {
        assert.strictEqual(
            Viking.Model.Type.Boolean.load("true"),
            true
        );
    });
    
    test("::load coerces the string 'false' to false", function() {
        assert.strictEqual(
            Viking.Model.Type.Boolean.load("false"),
            false
        );
    });
    
    test("::load coerces true to true", function() {
        assert.strictEqual(
            Viking.Model.Type.Boolean.load(true),
            true
        );
    });
    
    test("::load coerces false to false", function() {
        assert.strictEqual(
            Viking.Model.Type.Boolean.load(false),
            false
        );
    });
    
    test("::dump true", function() {
        assert.strictEqual(
            Viking.Model.Type.Boolean.dump(true),
            true
        );
    });
    
    test("::dump false", function() {
        assert.strictEqual(
            Viking.Model.Type.Boolean.dump(false),
            false
        );
    });
    
});