import 'mocha';
import assert from 'assert';
import VikingRecord from 'viking/record';

describe('Viking.Record::baseClass', () => {

    it("return self when extending Viking.Record", () => {
        class Ship extends VikingRecord { }

        assert.strictEqual(Ship, Ship.baseClass());
    });

    it("returns self when extending an abstract Viking.Record", () => {
        class RussianShip extends VikingRecord {
            static abstract = true;
        }
        class Ship extends RussianShip { }

        assert.strictEqual(Ship, Ship.baseClass());
    });

    it("returns the parent Model when extending after extending that Model", () => {
        class Ship extends VikingRecord { }
        class Carrier extends Ship { }

        assert.strictEqual(Ship, Carrier.baseClass());
    });

});

