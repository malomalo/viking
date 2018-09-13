import 'mocha';
import * as assert from 'assert';
import StringType from 'viking/record/types/string';

describe('Viking.Model.Types', () => {
    describe('String', () => {

        it("::load coerces boolean to string", function() {
            assert.equal(StringType.load(true), 'true');
            assert.equal(StringType.load(false), 'false');
        });

        it("::load coerces number to string", function() {
            assert.equal(StringType.load(10), '10');
            assert.equal(StringType.load(10.5), '10.5');
        });

        it("::load coerces null to string", function() {
            assert.equal(StringType.load(null), null);
        });

        it("::load coerces undefined to string", function() {
            assert.equal(StringType.load(undefined), undefined);
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