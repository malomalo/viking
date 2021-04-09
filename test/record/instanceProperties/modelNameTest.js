import 'mocha';
import * as assert from 'assert';
import Model from 'viking/record';

describe('Viking.Record#modelName', () => {

    it('is set on instantiation', () => {
        class MyModel extends Model { }
        let model = new MyModel();

        assert.deepEqual(model.modelName, {
            klass: MyModel,
            name: 'MyModel',
            singular: 'my_model',
            plural: 'my_models',
            human: 'My model',
            title: 'My Model',
            collection: 'my_models',
            paramKey: 'my_model',
            routeKey: 'my_models',
            element: 'my_model'
        });
    });

    it('uses namespace if present', () => {
        class OtherModel extends Model {
            static namespace = 'My';
        }
        let model = new OtherModel();

        assert.deepEqual(model.modelName, {
            klass: OtherModel,
            name: 'My::OtherModel',
            singular: 'my_other_model',
            plural: 'my_other_models',
            human: 'Other model',
            title: 'Other Model',
            collection: 'my/other_models',
            paramKey: 'my_other_model',
            routeKey: 'my_other_models',
            element: 'other_model'
        });

    });


});

