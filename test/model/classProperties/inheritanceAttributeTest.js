import assert from 'assert';
import Model from 'viking/model';

describe('Viking.Model::inheritanceAttribute', () => {

    it("defaults to `type`", () => {
        class Ship extends Model { }

        assert.equal('type', Ship.inheritanceAttribute);
    });

    it("explictly set the inheritanceAttribute", () => {
        class Ship extends Model {
            static inheritanceAttribute = 'class_name';
        }

        assert.equal('class_name', Ship.inheritanceAttribute);
    });

    it("set inheritanceAttribute to false to disable STI", () => {
        class Ship extends Model {
            static inheritanceAttribute = false;
        }
        class Battleship extends Ship { }

        let battleship = new Battleship();
        assert.strictEqual(false, Ship.inheritanceAttribute);
        assert.strictEqual(Battleship, battleship.baseClass);
    });

});

