import 'mocha';
import * as assert from 'assert';
import StringType from 'viking/record/types/string';

describe('Viking.Record.Types', () => {
    describe('String', () => {

        it("::load coerces boolean to string", function() {
            const changes = {}
            StringType.load(true, 'foo', changes)
            assert.equal(changes.foo, 'true');
            StringType.load(false, 'foo', changes)
            assert.equal(changes.foo, 'false');
        });

        it("::load coerces number to string", function() {
            const changes = {}
            StringType.load(10, 'foo', changes)
            assert.equal(changes.foo, '10');
            StringType.load(10.5, 'foo', changes)
            assert.equal(changes.foo, '10.5');
        });

        it("::load coerces null to string", function() {
            const changes = {}
            StringType.load(null, 'foo', changes)
            assert.equal(changes.foo, null);
        });

        it("::load coerces undefined to string", function() {
            const changes = {}
            StringType.load(undefined, 'foo', changes)
            assert.equal(changes.foo, undefined);
        });

        // it("::dump coerces boolean to string", function() {
        //     assert.equal(StringType.dump(true), 'true');
        //     assert.equal(StringType.dump(false), 'false');
        // });

        // it("::dump coerces number to string", function() {
        //     assert.equal(StringType.dump(10), '10');
        //     assert.equal(StringType.dump(10.5), '10.5');
        // });

        it("::dump coerces null to string", function() {
            assert.equal(StringType.dump(null), null);
        });

        it("::dump coerces undefined to string", function() {
            assert.equal(StringType.dump(undefined), undefined);
        });

    });
});