import 'mocha';
import assert from 'assert';
import VikingRecord from 'viking/record';

describe('Viking.Record::inheritanceAttribute', () => {

    it("defaults to `type`", () => {
        class Ship extends VikingRecord { }

        assert.equal('type', Ship.inheritanceAttribute);
    });

    it("explictly set the inheritanceAttribute", () => {
        class Ship extends VikingRecord {
            static inheritanceAttribute = 'class_name';
        }

        assert.equal('class_name', Ship.inheritanceAttribute);
    });

    it("set inheritanceAttribute to false to disable STI", () => {
        class Ship extends VikingRecord {
            static inheritanceAttribute = false;
        }
        class Battleship extends Ship { }

        let battleship = new Battleship();
        assert.strictEqual(false, Ship.inheritanceAttribute);
        assert.strictEqual(Battleship, battleship.baseClass);
    });

});

