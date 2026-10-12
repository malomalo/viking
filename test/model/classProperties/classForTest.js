import assert from 'assert';
import Model from 'viking/model';

describe('Viking.Model::classFor', () => {

    class Ship extends Model { }
    class Battleship extends Ship {
        static { this.registerDescendant(); }
    }
    class Dreadnought extends Battleship {
        static { this.registerDescendant(); }
    }
    class Carrier extends Ship {
        static { this.registerDescendant(); }
    }
    class Unregistered extends Ship { }

    it("returns the descendant named by the inheritance attribute", () => {
        assert.strictEqual(Ship.classFor({ type: 'Battleship' }), Battleship);
        assert.strictEqual(Ship.classFor({ type: 'Dreadnought' }), Dreadnought);
        assert.strictEqual(Battleship.classFor({ type: 'Dreadnought' }), Dreadnought);
    });

    it("returns itself when the inheritance attribute is blank or names itself", () => {
        assert.strictEqual(Ship.classFor({}), Ship);
        assert.strictEqual(Ship.classFor({ type: null }), Ship);
        assert.strictEqual(Ship.classFor(undefined), Ship);
        assert.strictEqual(Battleship.classFor({ type: 'Battleship' }), Battleship);
    });

    it("returns itself when the name is not a registered descendant of it", () => {
        assert.strictEqual(Ship.classFor({ type: 'Submarine' }), Ship);
        assert.strictEqual(Ship.classFor({ type: 'Unregistered' }), Ship);
        assert.strictEqual(Battleship.classFor({ type: 'Carrier' }), Battleship);
        assert.strictEqual(Battleship.classFor({ type: 'Ship' }), Battleship);
    });

    it("uses the inheritanceAttribute", () => {
        class Plane extends Model {
            static inheritanceAttribute = 'kind';
        }
        class Jet extends Plane {
            static { this.registerDescendant(); }
        }

        class Fighter extends Jet {
            static { this.registerDescendant(); }
        }

        assert.strictEqual(Plane.classFor({ kind: 'Jet' }), Jet);
        assert.strictEqual(Plane.classFor({ type: 'Jet' }), Plane);
        assert.strictEqual(Jet.classFor({ kind: 'Fighter' }), Fighter);
    });

});
