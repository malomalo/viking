import 'mocha';
import * as assert from 'assert';
import DateType from 'viking/record/types/date';

describe('Viking.Record.Types', () => {
    describe('Date', () => {

        it("::load thows error when can't coerce value", function() {
            assert.throws(function() { DateType.load(true) }, TypeError);
            const changes = {}
            try {
                DateType.load(true, 'foo', changes);
            } catch (e) {
                assert.equal(e.message, "boolean can't be coerced into Date");
            }
        });

        it("::load coerces iso8601 string to date", function() {
            const changes = {}
            DateType.load("2013-04-10", 'foo', changes)
            assert.deepEqual(
                changes.foo,
                new Date(1365570000000)
            );
            
            DateType.load("2013-04-10", 'foo', changes)
            assert.equal(
                changes.foo.valueOf(),
                (new Date(1365570000000)).valueOf()
            );
        });

        it("::load coerces int(milliseconds since epoch) to date", function() {
            const changes = {}
            DateType.load(1365629126097, 'foo', changes)
            assert.deepEqual(
                changes.foo,
                new Date(1365629126097)
            );
            
            DateType.load(1365629126097, 'foo', changes)
            assert.equal(
                changes.foo.valueOf(),
                (new Date(1365629126097)).valueOf()
            );
        });

        it("::load coerces date to date", function() {
            const changes = {}
            DateType.load(new Date(1365629126097), 'foo', changes)
            assert.equal(
                changes.foo.valueOf(),
                (new Date(1365629126097)).valueOf()
            );
        });

        it("::dump coerces Date to ISOString", function() {
            assert.deepEqual(
                DateType.dump(new Date(1365629068000)),
                "2013-04-10"
            );
        });

    });
});