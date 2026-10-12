import assert from 'assert';
import Model from 'viking/model';

describe('Viking.Model::registerDescendant', () => {

    it("registers the class with each ancestor up to the base class", () => {
        class Ship extends Model { }
        class Battleship extends Ship {
            static { this.registerDescendant(); }
        }
        class Dreadnought extends Battleship {
            static { this.registerDescendant(); }
        }

        assert.deepEqual(Ship.descendants, [Battleship, Dreadnought]);
        assert.deepEqual(Battleship.descendants, [Dreadnought]);
        assert.deepEqual(Dreadnought.descendants, []);
    });

    it("keeps each hierarchy's descendants separate", () => {
        class Ship extends Model { }
        class Battleship extends Ship {
            static { this.registerDescendant(); }
        }
        class Plane extends Model { }

        assert.deepEqual(Ship.descendants, [Battleship]);
        assert.deepEqual(Plane.descendants, []);
        assert.deepEqual(Model.descendants, []);
    });

    it("registers a class once", () => {
        class Ship extends Model { }
        class Battleship extends Ship {
            static { this.registerDescendant(); }
        }
        Battleship.registerDescendant();
        new Battleship();
        Battleship.baseClass();

        assert.deepEqual(Ship.descendants, [Battleship]);
    });

    it("does nothing for a base class", () => {
        class Ship extends Model {
            static { this.registerDescendant(); }
        }

        assert.deepEqual(Model.descendants, []);
    });

    it("lets the base class default its inheritance attribute", () => {
        class Ship extends Model {
            static schema = { type: { type: 'string' } };
        }
        assert.strictEqual(new Ship().type, null);

        class Battleship extends Ship {
            static { this.registerDescendant(); }
        }
        assert.strictEqual(new Ship().type, 'Ship');
        assert.strictEqual(new Battleship().type, 'Battleship');
    });

});
