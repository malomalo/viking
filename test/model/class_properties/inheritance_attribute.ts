import * as assert from 'assert';
import 'mocha';
import * as _ from 'lodash';
import {Model as VikingModel} from '../../../src/viking/model';

describe('Viking.Model::inheritanceAttribute', () => {

    it("defaults to `type`", () => {
        class Ship extends VikingModel { }

        assert.equal('type', Ship.inheritanceAttribute);
    });

    it("explictly set the inheritanceAttribute", () => {
        class Ship extends VikingModel {
            static inheritanceAttribute = 'class_name';
        }

        assert.equal('class_name', Ship.inheritanceAttribute);
    });

    it("set inheritanceAttribute to false to disable STI", () => {
        class Ship extends VikingModel {
            static inheritanceAttribute = false;
        }
        class Battleship extends Ship { }

        let battleship = new Battleship();
        assert.strictEqual(false, Ship.inheritanceAttribute);
        assert.strictEqual(Battleship, battleship.baseModel);
    });

});

