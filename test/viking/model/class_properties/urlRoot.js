(function () {
    module("Viking.Model::urlRoot");

    test("::urlRoot returns an URL based on modelName", function() {
        var Model = Viking.Model.extend('model');
        equal(Model.urlRoot(), '/models');
    });

}());