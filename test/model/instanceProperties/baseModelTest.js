import assert from 'assert';
import Model from 'viking/model';

describe('Viking.Model#baseClass', () => {

    it("return self when extending Viking.Model", () => {
        class Ship extends Model { }
        let ship = new Ship();

        assert.strictEqual(Ship, ship.baseClass);
    });

    it("returns self when extending an abstract Viking.Model", () => {
        class RussianShip extends Model {
            static abstract = true;
        }
        class Ship extends RussianShip { }
        let ship = new Ship();

        assert.strictEqual(Ship, ship.baseClass);
    });

    it("returns the parent Model when extending after extending that Model", () => {
        class Ship extends Model { }
        class Carrier extends Ship { }
        let carrier = new Carrier();

        assert.strictEqual(Ship, carrier.baseClass);
    });

});

