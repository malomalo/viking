(function () {
    module("Viking.Model::urlRoot");

    test("::urlRoot returns an URL based on modelName", function() {
        var Model = Viking.Model.extend('model');
        equal(Model.urlRoot(), '/models');
    });
    
    test("::urlRoot returns an URL based on #urlRoot set on the model", function () {
        var Model = Viking.Model.extend('model', {
            urlRoot: '/buoys'
        });
        equal(Model.urlRoot(), '/buoys');
    });

    // STI test
    test("::urlRoot returns an URL based on modelName of the baseModel", function() {
        var Ship = Viking.Model.extend('ship');
        var Carrier = Ship.extend();
        
        equal(Carrier.urlRoot(), '/ships');
    });

    test("::urlRoot returns an URL based on #urlRoot set on the baseModel", function () {
        var Ship = Viking.Model.extend('ship', {
            urlRoot: '/myships'
        });
        var Carrier = Ship.extend();

        equal(Carrier.urlRoot(), '/myships');
    });


    test("::urlRoot returns an URL based on #urlRoot set on the sti model", function () {
        var Ship = Viking.Model.extend('ship');
        var Carrier = Ship.extend({
            urlRoot: '/carriers'
        });

        equal(Carrier.urlRoot(), '/carriers');
    });

}());