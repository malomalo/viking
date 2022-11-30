import 'mocha';
import * as assert from 'assert';
import IntegerType from 'viking/record/types/integer';

describe('Viking.Record.Types', () => {
    describe('Integer', () => {

        it("::load coerces number to number", () => {
            const changes = {};
            IntegerType.load(10, 'foo', changes)
            assert.equal(changes.foo,     10);
            IntegerType.load(10.5, 'foo', changes)
            assert.equal(changes.foo,   10.5);
        });

        it("::load coerces string to number", () => {
            const changes = {};
            IntegerType.load('10', 'foo', changes)
            assert.equal(changes.foo,   10);
            IntegerType.load('10.5', 'foo', changes)
            assert.equal(changes.foo, 10.5);
        });

        it("::load coerces empty string to null", () => {
            const changes = {};
            IntegerType.load(' ', 'foo', changes)
            assert.equal(changes.foo,   	null);
            IntegerType.load('', 'foo', changes)
            assert.equal(changes.foo, 	null);
        });
        
        it("::load coerces null to null", () => {
            const changes = {};
            IntegerType.load(null, 'foo', changes)
            assert.equal(changes.foo, 	null);
        });
        
        it("::load coerces undefined to undefined", () => {
            const changes = {};
            IntegerType.load(undefined, 'foo', changes)
            assert.equal(changes.foo, undefined);
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