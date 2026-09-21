import assert from 'assert';
import Model from 'viking/model';

describe('Viking.Model#inheritanceAttribute', () => {

    it("default to `type`", () => {
        class Ship extends Model {
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
        class Ship extends Model {
            static inheritanceAttribute = 'class_name';
        }
        let ship = new Ship();

        assert.equal('class_name', ship.inheritanceAttribute);
    });

});