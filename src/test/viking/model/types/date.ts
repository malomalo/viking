import * as Backbone from 'backbone';
import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../../../viking';

module('Viking.Model.Type.Date', {}, () => {

    test("::load thows error when can't coerce value", function() {
        assert.throws(function() { Viking.Model.Type.Date.load(true) }, TypeError);

        try {
            Viking.Model.Type.Date.load(true);
        } catch (e) {
            assert.equal(e.message, "boolean can't be coerced into Date");
        }
    });

    test("::load coerces iso8601 string to date", function() {
        assert.deepEqual(
            Viking.Model.Type.Date.load("2013-04-10T21:24:28+00:00"),
            new Date(1365629068000)
        );

        assert.equal(
            Viking.Model.Type.Date.load("2013-04-10T21:24:28+00:00").valueOf(),
            (new Date(1365629068000)).valueOf()
        );
    });

    test("::load coerces int(milliseconds since epoch) to date", function() {
        assert.deepEqual(
            Viking.Model.Type.Date.load(1365629126097),
            new Date(1365629126097)
        );

        assert.equal(
            Viking.Model.Type.Date.load(1365629126097).valueOf(),
            (new Date(1365629126097)).valueOf()
        );
    });

    test("::load coerces date to date", function() {
        assert.equal(
            Viking.Model.Type.Date.load(new Date(1365629126097)).valueOf(),
            (new Date(1365629126097)).valueOf()
        );
    });

    test("::dump coerces Date to ISOString", function() {
        assert.deepEqual(
            Viking.Model.Type.Date.dump(new Date(1365629068000)),
            "2013-04-10T21:24:28.000Z"
        );
    });
});