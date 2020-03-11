import 'mocha';
import * as assert from 'assert';
import NumberType from 'viking/record/types/number';

describe('Viking.Record.Types', () => {
    describe('Number', () => {

        it("::load coerces number to number", () => {
            assert.equal(NumberType.load(10),     10);
            assert.equal(NumberType.load(10.5),   10.5);
        });

        it("::load coerces string to number", () => {
            assert.equal(NumberType.load('10'),   10);
            assert.equal(NumberType.load('10.5'), 10.5);
        });

        it("::load coerces empty string to null", () => {
            assert.equal(NumberType.load(' '),   	null);
            assert.equal(NumberType.load(''), 	null);
        });

        it("::dump coerces number to number", () => {
            assert.equal(NumberType.dump(10),     10);
            assert.equal(NumberType.dump(10.5),   10.5);
        });

        it("::dump coerces null to null", () => {
            assert.equal(NumberType.dump(null),   null);
            assert.equal(NumberType.dump(null), null);
        });

    });
});