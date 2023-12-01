import 'mocha';
import * as assert from 'assert';
import DateTimeType from 'viking/record/types/datetime';

describe('Viking.Record.Types', () => {
    describe('DateTime', () => {

        it("::load thows error when can't coerce value", function() {
            assert.throws(function() { DateTimeType.load(true) }, TypeError);

            try {
                DateTimeType.load(true);
            } catch (e) {
                assert.equal(e.message, "boolean can't be coerced into Date");
            }
        });

        it("::load coerces iso8601 string to date", function() {
            assert.deepEqual(
                DateTimeType.load("2013-04-10T21:24+00:00"),
                new Date(1365629040000)
            );
            
            assert.deepEqual(
                DateTimeType.load("2013-04-10T21:24:28+00:00"),
                new Date(1365629068000)
            );

            assert.equal(
                DateTimeType.load("2013-04-10T21:24:28+00:00").valueOf(),
                (new Date(1365629068000)).valueOf()
            );
        });

        it("::load coerces int(milliseconds since epoch) to date", function() {
            assert.deepEqual(
                DateTimeType.load(1365629126097),
                new Date(1365629126097)
            );

            assert.equal(
                DateTimeType.load(1365629126097).valueOf(),
                (new Date(1365629126097)).valueOf()
            );
        });

        it("::load coerces date to date", function() {
            assert.equal(
                DateTimeType.load(new Date(1365629126097)).valueOf(),
                (new Date(1365629126097)).valueOf()
            );
        });

        it("::dump coerces Date to ISOString", function() {
            assert.deepEqual(
                DateTimeType.dump(new Date(1365629068000)),
                "2013-04-10T16:24:28.000+0500"
            );
            assert.deepEqual(
                DateTimeType.dump(new Date("2013-04-10T21:24:28")),
                "2013-04-10T21:24:28.000+0500"
            );
        });

    });
});