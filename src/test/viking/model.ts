import * as Backbone from 'backbone';
import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../viking';

module('Viking.Model', {}, () => {
    test('instance.modelName is set on instantiation', () => {
        const Model = Viking.Model.extend('model');
        const model = new Model();

        assert.propEqual(model.modelName, {
            collection: 'models',
            collectionName: 'ModelCollection',
            element: 'model',
            human: 'Model',
            name: 'Model',
            paramKey: 'model',
            plural: 'models',
            routeKey: 'models',
            singular: 'model',
            title: 'Model'
        });
    });

    test('::where() returns ModelCollection without a predicate', () => {
        const Ship = Viking.Model.extend('ship');
        const ShipCollection = Viking.Collection.extend();

        Viking.context['Ship'] = Ship;
        Viking.context['ShipCollection'] = ShipCollection;

        const scope = Ship.where();
        assert.ok(scope instanceof ShipCollection);
        assert.strictEqual(undefined, scope.predicate);

        delete Viking.context['Ship'];
        delete Viking.context['ShipCollection'];
    });

    test('::where(predicate) returns ModelCollection with a predicate set', () => {
        const Ship = Viking.Model.extend('ship');
        const ShipCollection = Viking.Collection.extend({
            model: Ship
        });

        Viking.context['Ship'] = Ship;
        Viking.context['ShipCollection'] = ShipCollection;

        const scope = Ship.where({ name: 'Zoey' });
        assert.ok(scope instanceof ShipCollection);
        assert.deepEqual({ name: 'Zoey' }, scope.predicate.attributes);

        delete Viking.context['Ship'];
        delete Viking.context['ShipCollection'];
    });
});
