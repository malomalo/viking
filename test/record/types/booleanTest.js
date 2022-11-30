import 'mocha';
import * as assert from 'assert';
import BooleanType from 'viking/record/types/boolean';

describe('Viking.Record.Types', () => {
    describe('Boolean', () => {

        it("::load coerces the string 'true' to true", function() {
            const changes = {}
            BooleanType.load("true", 'foo', changes)
            assert.equal(true, changes.foo)
        });

        it("::load coerces the string 'false' to false", function() {
            const changes = {}
            BooleanType.load("false", 'foo', changes)
            assert.equal(false, changes.foo)
        });

        it("::load coerces true to true", function() {
            const changes = {}
            BooleanType.load(true, 'foo', changes)
            assert.equal(true, changes.foo)
        });

        it("::load coerces false to false", function() {
            const changes = {}
            BooleanType.load(false, 'foo', changes)
            assert.equal(false, changes.foo)
        });

        it("::dump true", function() {
            assert.strictEqual(
                BooleanType.dump(true),
                true
            );
        });

        it("::dump false", function() {
            assert.strictEqual(
                BooleanType.dump(false),
                false
            );
        });

    });
});