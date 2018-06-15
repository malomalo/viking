import * as assert from 'assert';
import 'mocha';
import {Model as VikingModel} from '../../../src/viking/model';

describe('Viking.Model#toParam', () => {

    it("#toParam() returns null on a model without an id", () => {
        let model = new VikingModel();
        assert.equal(null, model.toParam());
    });

    it("#toParam() returns id on a model with an id set", () => {
        let model = new VikingModel({id: 42});
        assert.equal(42, model.toParam());
    });

});