(function () {
    module("Viking.Model::urlRoot");

    test("::urlRoot returns an URL based on modelName", function() {
        var Model = Viking.Model.extend('model');
        equal(Model.urlRoot(), '/models');
    });
    
    // STI test
    test("::urlRoot returns an URL based on modelName of the baseModel", function() {
        var Ship = Viking.Model.extend('ship');
        var Carrier = Ship.extend();
        
        equal(Carrier.urlRoot(), '/ships');
    });

}());