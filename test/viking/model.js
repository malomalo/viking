(function () {
    module("Viking.Model");

    test("instance.modelName is set on instantiation", function() {
        var Model = Viking.Model.extend('model');
        var model = new Model();

        propEqual(model.modelName, {
            name: 'Model',
            element: 'model',
            human: 'Model',
            paramKey: 'model',
            plural: 'models',
            routeKey: 'models',
            singular: 'model',
            collection: 'models'
        });
    });
    
    test("::where() returns ModelCollection without a predicate", function() {
        Ship = Viking.Model.extend('ship');
        ShipCollection = Viking.Collection.extend();
        
        var scope = Ship.where();
        ok(scope instanceof ShipCollection);
        strictEqual(undefined, scope.predicate);
        
        delete Ship;
        delete ShipCollection;
    });

    test("::where(predicate) returns ModelCollection with a predicate set", function() {
        Ship = Viking.Model.extend('ship');
        ShipCollection = Viking.Collection.extend();
        
        var scope = Ship.where({name: 'Zoey'});
        ok(scope instanceof ShipCollection);
        deepEqual({name: 'Zoey'}, scope.predicate.attributes);
        
        delete Ship;
        delete ShipCollection;
    });
    
}());