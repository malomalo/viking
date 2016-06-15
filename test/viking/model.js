import Viking from '../../src/viking';

module("Viking.Model");

test("instance.modelName is set on instantiation", function() {
    let Model = Viking.Model.extend('model');
    let model = new Model();

    propEqual(_.omit(model.modelName, 'model'), {
        name: 'Model',
        element: 'model',
        human: 'Model',
        paramKey: 'model',
        plural: 'models',
        routeKey: 'models',
        singular: 'model',
        collection: 'models',
        collectionName: 'ModelCollection'
    });
});

test("::where() returns ModelCollection without a predicate", function() {
    let Ship = Viking.Model.extend('ship');
    window.ShipCollection = Viking.Collection.extend();

    let scope = Ship.where();
    ok(scope instanceof ShipCollection);
    strictEqual(undefined, scope.predicate);
});

test("::where(predicate) returns ModelCollection with a predicate set", function() {
    let Ship = Viking.Model.extend('ship');
    window.ShipCollection = Viking.Collection.extend();

    let scope = Ship.where({name: 'Zoey'});
    ok(scope instanceof ShipCollection);
    deepEqual({name: 'Zoey'}, scope.predicate.attributes);
});
