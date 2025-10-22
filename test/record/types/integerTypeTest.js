import assert from 'assert';
import IntegerType from 'viking/record/types/integer';

describe('Viking.Record.Types', () => {
    describe('Integer', () => {

        it("::load coerces number to number", () => {
            assert.equal(IntegerType.load(10),     10);
            assert.equal(IntegerType.load(10.5),   10.5);
        });

        it("::load coerces string to number", () => {
            assert.equal(IntegerType.load('10'),   10);
            assert.equal(IntegerType.load('10.5'), 10.5);
        });

        it("::load coerces empty string to null", () => {
            assert.equal(IntegerType.load(' '), null);
            assert.equal(IntegerType.load(''),  null);
        });
        
        it("::load coerces null to null", () => {
            assert.equal(IntegerType.load(null),    null);
        });
        
        it("::load coerces undefined to undefined", () => {
            assert.equal(IntegerType.load(undefined), undefined);
        });

        it("::dump coerces number to number", () => {
            assert.equal(IntegerType.dump(10),     10);
            assert.equal(IntegerType.dump(10.5),   10.5);
        });

        it("::dump coerces null to null", () => {
            assert.equal(IntegerType.dump(null),   null);
        });

    });
});