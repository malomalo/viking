import * as assert from 'assert';
import 'mocha';
import * as _ from 'lodash';
import {Model as VikingModel} from '../../../src/viking/model';

describe('Viking.Model::baseModel', () => {

    it("return self when extending Viking.Model", () => {
        class Ship extends VikingModel { }

        assert.strictEqual(Ship, Ship.baseModel());
    });

    it("returns self when extending an abstract Viking.Model", () => {
        class RussianShip extends VikingModel {
            static abstract = true;
        }
        class Ship extends RussianShip { }

        assert.strictEqual(Ship, Ship.baseModel());
    });

    it("returns the parent Model when extending after extending that Model", () => {
        class Ship extends VikingModel { }
        class Carrier extends Ship { }

        assert.strictEqual(Ship, Carrier.baseModel());
    });

});

