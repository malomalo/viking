import 'mocha';
import * as assert from 'assert';
import DateTimeType from 'viking/record/types/datetime';

describe('Viking.Record.Types', () => {
    describe('DateTime', () => {

        it("::load thows error when can't coerce value", function() {
            assert.throws(function() { DateTimeType.load(true) }, TypeError);

            try {
                DateTimeType.load(true, 'foo', {});
            } catch (e) {
                assert.equal(e.message, "boolean can't be coerced into Date");
            }
        });

        it("::load coerces iso8601 string to date", function() {
            const changes = {}
            
            DateTimeType.load("2013-04-10T21:24:28+00:00", 'foo', changes)
            assert.deepEqual(
                changes.foo,
                new Date(1365629068000)
            );

            DateTimeType.load("2013-04-10T21:24:28+00:00", 'foo', changes)
            assert.equal(
                changes.foo.valueOf(),
                (new Date(1365629068000)).valueOf()
            );
        });

        it("::load coerces int(milliseconds since epoch) to date", function() {
            const changes = {}
            DateTimeType.load(1365629126097, 'foo', changes)
            assert.deepEqual(
                changes.foo,
                new Date(1365629126097)
            );

            DateTimeType.load(1365629126097, 'foo', changes)
            assert.equal(
                changes.foo.valueOf(),
                (new Date(1365629126097)).valueOf()
            );
        });

        it("::load coerces date to date", function() {
            const changes = {}
            DateTimeType.load(new Date(1365629126097), 'foo', changes)
            assert.equal(
                changes.foo.valueOf(),
                (new Date(1365629126097)).valueOf()
            );
        });

        it("::dump coerces Date to ISOString", function() {
            assert.deepEqual(
                DateTimeType.dump(new Date(1365629068000)),
                "2013-04-10T21:24:28.000Z"
            );
        });

    });
});