import assert from 'assert';
import VikingRecord from 'viking/record';

describe('Viking.Record#inheritanceAttribute', () => {

    it("default to `type`", () => {
        class Ship extends VikingRecord {
            static schema = {
                type: {type: 'string'}
            }
        }
        let ship = new Ship();

        assert.equal('type', ship.inheritanceAttribute);

        class Battleship extends Ship { }
        let battleship = new Battleship();

        assert.equal('Battleship', battleship.readAttribute('type'));
    });

    it("override", () => {
        class Ship extends VikingRecord {
            static inheritanceAttribute = 'class_name';
        }
        let ship = new Ship();

        assert.equal('class_name', ship.inheritanceAttribute);
    });

});