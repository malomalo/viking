import 'mocha';
import * as assert from 'assert';
import VikingModel from 'viking/model';

describe('Viking.Model#baseModel', () => {

    it("return self when extending Viking.Model", () => {
        class Ship extends VikingModel { }
        let ship = new Ship();

        assert.strictEqual(Ship, ship.baseModel);
    });

    it("returns self when extending an abstract Viking.Model", () => {
        class RussianShip extends VikingModel {
            static abstract = true;
        }
        class Ship extends RussianShip { }
        let ship = new Ship();

        assert.strictEqual(Ship, ship.baseModel);
    });

    it("returns the parent Model when extending after extending that Model", () => {
        class Ship extends VikingModel { }
        class Carrier extends Ship { }
        let carrier = new Carrier();

        assert.strictEqual(Ship, carrier.baseModel);
    });

});

