import assert from 'assert';
import Model from 'viking/model';

describe('Viking.Model#[Symbol.toStringTag]', () => {
    class Ship extends Model { }

    it('reports the model class name', () => {
        assert.equal(Object.prototype.toString.call(new Ship()), '[object Ship]');
    });
});
