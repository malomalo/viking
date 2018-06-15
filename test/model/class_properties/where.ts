import * as assert from 'assert';
import 'mocha';
import {Model as VikingModel} from '../../../src/viking/model';

describe('Viking.Model#where', () => {
    class Model extends VikingModel { }

    it('where(predicate) returns a query with the predicate', async () => {
        // let query = Model.where({id: 2});
        // await Model.find(1, 2);

        // assert.equal(1,2);
    });
});

