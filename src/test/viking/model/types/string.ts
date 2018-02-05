import * as Backbone from 'backbone';
import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../../../viking';

module('Viking.Model.Type.String', {}, () => {

    test("::load coerces boolean to string", function() {
        assert.equal(Viking.Model.Type.String.load(true), 'true');
        assert.equal(Viking.Model.Type.String.load(false), 'false');
    });

    test("::load coerces number to string", function() {
        assert.equal(Viking.Model.Type.String.load(10), '10');
        assert.equal(Viking.Model.Type.String.load(10.5), '10.5');
    });

    test("::load coerces null to string", function() {
        assert.equal(Viking.Model.Type.String.load(null), null);
    });

    test("::load coerces undefined to string", function() {
        assert.equal(Viking.Model.Type.String.load(undefined), undefined);
    });

    test("::dump coerces boolean to string", function() {
        assert.equal(Viking.Model.Type.String.dump(true), 'true');
        assert.equal(Viking.Model.Type.String.dump(false), 'false');
    });

    test("::dump coerces number to string", function() {
        assert.equal(Viking.Model.Type.String.dump(10), '10');
        assert.equal(Viking.Model.Type.String.dump(10.5), '10.5');
    });

    test("::dump coerces null to string", function() {
        assert.equal(Viking.Model.Type.String.dump(null), null);
    });

    test("::dump coerces undefined to string", function() {
        assert.equal(Viking.Model.Type.String.dump(undefined), undefined);
    });

});