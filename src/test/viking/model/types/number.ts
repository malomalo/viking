import * as Backbone from 'backbone';
import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../../../viking';

module('Viking.Model.Type.Number', {}, () => {

    test("::load coerces number to number", function() {
        assert.equal(Viking.Model.Type.Number.load(10),     10);
        assert.equal(Viking.Model.Type.Number.load(10.5),   10.5);
    });

    test("::load coerces string to number", function() {
        assert.equal(Viking.Model.Type.Number.load('10'),   10);
        assert.equal(Viking.Model.Type.Number.load('10.5'), 10.5);
    });

    test("::load coerces empty string to null", function() {
        assert.equal(Viking.Model.Type.Number.load(' '),   	null);
        assert.equal(Viking.Model.Type.Number.load(''), 	null);
    });

    test("::dump coerces number to number", function() {
        assert.equal(Viking.Model.Type.Number.dump(10),     10);
        assert.equal(Viking.Model.Type.Number.dump(10.5),   10.5);
    });

    test("::dump coerces null to null", function() {
        assert.equal(Viking.Model.Type.Number.dump(null),   null);
        assert.equal(Viking.Model.Type.Number.dump(null), null);
    });
});