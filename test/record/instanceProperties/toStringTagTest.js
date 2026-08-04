import assert from 'assert';
import VikingRecord from 'viking/record';

describe('Viking.Record#[Symbol.toStringTag]', () => {
    class Ship extends VikingRecord { }

    it('reports the model class name', () => {
        assert.equal(Object.prototype.toString.call(new Ship()), '[object Ship]');
    });
});
