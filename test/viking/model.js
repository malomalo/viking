(function () {
    module("Viking.Model");

    test("extend set modelName on Model", function() {
        var Model = Viking.Model.extend('model');
    
        equal(Model.modelName, 'model');
    });

    test("instance.modelName is set on instantiation", function() {
        var Model = Viking.Model.extend('model');
        var model = new Model();
    
        equal(model.modelName, 'model');
    });

}());