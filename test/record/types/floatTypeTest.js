import 'mocha';
import * as assert from 'assert';
import FloatType from 'viking/record/types/float';

describe('Viking.Record.Types', () => {
    describe('Float', () => {

        it("::load coerces number to number", () => {
            const changes = {}
            FloatType.load(10.5, 'foo', changes)
            assert.equal(changes.foo,  10.5);
        });

        it("::load coerces string to number", () => {
            const changes = {}
            FloatType.load('10.5', 'foo', changes)
            assert.equal(changes.foo, 10.5);
        });

        it("::load coerces empty string to null", () => {
            const changes = {}
            FloatType.load(' ', 'foo', changes)
            assert.equal(changes.foo, null);
            FloatType.load('', 'foo', changes)
            assert.equal(changes.foo, null);
        });
        
        it("::load coerces null to null", () => {
            const changes = {}
            FloatType.load(null, 'foo', changes)
            assert.equal(changes.foo, null);
        });
        
        it("::load coerces undefined to undefined", () => {
            const changes = {}
            FloatType.load(undefined, 'foo', changes)
            assert.equal(changes.foo, undefined);
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