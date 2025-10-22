import assert from 'assert';
import VikingRecord from 'viking/record';

describe('Viking.Record#toParam', () => {

    it("#toParam() returns null on a model without an id", () => {
        let model = new VikingRecord();
        assert.equal(null, model.toParam());
    });

    it("#toParam() returns id on a model with an id set", () => {
        let model = new VikingRecord({id: 42});
        assert.equal(42, model.toParam());
    });

});