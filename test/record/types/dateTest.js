import 'mocha';
import * as assert from 'assert';
import DateType from 'viking/record/types/date';

describe('Viking.Record.Types', () => {
    describe('Date', () => {

        it("::load thows error when can't coerce value", function() {
            assert.throws(function() { DateType.load(true) }, TypeError);

            try {
                DateType.load(true);
            } catch (e) {
                assert.equal(e.message, "boolean can't be coerced into Date");
            }
        });

        it("::load coerces iso8601 string to date", function() {
            assert.deepEqual(
                DateType.load("2013-04-10T21:24:28+00:00"),
                new Date(1365629068000)
            );

            assert.equal(
                DateType.load("2013-04-10T21:24:28+00:00").valueOf(),
                (new Date(1365629068000)).valueOf()
            );
        });

        it("::load coerces int(milliseconds since epoch) to date", function() {
            assert.deepEqual(
                DateType.load(1365629126097),
                new Date(1365629126097)
            );

            assert.equal(
                DateType.load(1365629126097).valueOf(),
                (new Date(1365629126097)).valueOf()
            );
        });

        it("::load coerces date to date", function() {
            assert.equal(
                DateType.load(new Date(1365629126097)).valueOf(),
                (new Date(1365629126097)).valueOf()
            );
        });

        it("::dump coerces Date to ISOString", function() {
            assert.deepEqual(
                DateType.dump(new Date(1365629068000)),
                "2013-04-10T21:24:28.000Z"
            );
        });

    });
});