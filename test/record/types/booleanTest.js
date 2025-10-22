import assert from 'assert';
import BooleanType from 'viking/record/types/boolean';

describe('Viking.Record.Types', () => {
    describe('Boolean', () => {

        it("::load coerces the string 'true' to true", function() {
            assert.equal(true, BooleanType.load("true"))
        });

        it("::load coerces the string 'false' to false", function() {
            assert.equal(false, BooleanType.load("false"))
        });

        it("::load coerces true to true", function() {
            assert.equal(true, BooleanType.load(true))
        });

        it("::load coerces false to false", function() {
            assert.equal(false, BooleanType.load(false))
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