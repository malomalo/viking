import * as assert from 'assert';
import 'mocha';
import {Model} from '../../../src/viking/model';

describe('Viking.Model#modelName', () => {

    it('is set on instantiation', () => {
        class MyModel extends Model { }
        let model = new MyModel();

        assert.deepEqual(model.modelName, {
            klass: MyModel,
            name: 'MyModel',
            // collectionName: 'MyModelCollection',
            singular: 'my_model',
            plural: 'my_models',
            human: 'My model',
            title: 'My Model',
            // collection: 'my_models',
            paramKey: 'my_model',
            routeKey: 'my_models',
            element: 'my_model'
        });
    });

});

