import * as Backbone from 'backbone';
import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../viking';

module('Viking.Model', {}, () => {
    test("instance.modelName is set on instantiation", function() {
        var Model = Viking.Model.extend('model');
        var model = new Model();

        assert.propEqual(model.modelName, {
            name: 'Model',
            element: 'model',
            human: 'Model',
            paramKey: 'model',
            plural: 'models',
            routeKey: 'models',
            singular: 'model',
            collection: 'models',
            collectionName: 'ModelCollection',
            title: 'Model'
        });
    });
    
    test("::where() returns ModelCollection without a predicate", function() {
        let Ship = Viking.Model.extend('ship');
        let ShipCollection = Viking.Collection.extend();

        var scope = Ship.where();
        assert.ok(scope instanceof ShipCollection);
        assert.strictEqual(undefined, scope.predicate);
    });

    test("::where(predicate) returns ModelCollection with a predicate set", function() {
        let Ship = Viking.Model.extend('ship');
        let ShipCollection = Viking.Collection.extend({
            model: Ship
        });
        
        var scope = Ship.where({name: 'Zoey'});
        assert.ok(scope instanceof ShipCollection);
        assert.deepEqual({name: 'Zoey'}, scope.predicate.attributes);
    });
});