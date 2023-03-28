import * as assert from 'assert';
import VikingRecord from '@malomalo/viking/record';

describe('Viking.Record#baseClass', () => {

    it("return self when extending Viking.Record", () => {
        class Ship extends VikingRecord { }
        let ship = new Ship();

        assert.strictEqual(Ship, ship.baseClass);
    });

    it("returns self when extending an abstract Viking.Record", () => {
        class RussianShip extends VikingRecord {
            static abstract = true;
        }
        class Ship extends RussianShip { }
        let ship = new Ship();

        assert.strictEqual(Ship, ship.baseClass);
    });

    it("returns the parent Model when extending after extending that Model", () => {
        class Ship extends VikingRecord { }
        class Carrier extends Ship { }
        let carrier = new Carrier();

        assert.strictEqual(Ship, carrier.baseClass);
    });

});

