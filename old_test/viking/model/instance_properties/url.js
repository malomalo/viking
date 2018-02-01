(function () {
    module("Viking.Model#url");

    test("#url /pluralModelName/id by default", function() {
        var Model = Viking.Model.extend('model');
        var model = new Model({id: 42});
        equal(model.url(), '/models/42');

        Model = Viking.Model.extend('namespaced/model');
        model = new Model({ id: 42 });
        equal(model.url(), '/namespaced_models/42');
    });
    
    test("#url /pluralModelName/slug by overriding #toParam()", function() {
        var Model = Viking.Model.extend('model');
        var model = new Model({id: 42});
        model.toParam = function () {
            return 'slug'
        }
    
        equal(model.url(), '/models/slug');
    });
    
    // STI test
    test("#url returns an URL based on modelName of the baseModel", function() {
        var Ship = Viking.Model.extend('ship');
        var Carrier = Ship.extend();
        var carrier = new Carrier({id: 42});
        
        equal(carrier.url(), '/ships/42');
    });

}());