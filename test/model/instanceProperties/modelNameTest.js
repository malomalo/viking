import assert from 'assert';
import Model from 'viking/model';

describe('Viking.Model#modelName', () => {

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
            element: 'my_model'
        });
    });

});

