import 'mocha';
import * as assert from 'assert';
import FloatType from 'viking/record/types/float';

describe('Viking.Record.Types', () => {
    describe('Float', () => {

        it("::load coerces number to number", () => {
            assert.equal(FloatType.load(10.5),  10.5);
        });

        it("::load coerces string to number", () => {
            assert.equal(FloatType.load('10.5'), 10.5);
        });

        it("::load coerces empty string to null", () => {
            assert.equal(FloatType.load(' '), null);
            assert.equal(FloatType.load(''), null);
        });
        
        it("::load coerces null to null", () => {
            assert.equal(FloatType.load(null), null);
        });
        
        it("::load coerces undefined to undefined", () => {
            assert.equal(FloatType.load(undefined), undefined);
        });

        it("::dump coerces number to number", () => {
            assert.equal(FloatType.dump(10.5),  10.5);
        });

        it("::dump coerces null to null", () => {
            assert.equal(FloatType.dump(null),  null);
            assert.equal(FloatType.dump(null),  null);
        });

    });
});