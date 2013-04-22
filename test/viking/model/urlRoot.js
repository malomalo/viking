module("Viking.Model::urlRoot");

test("::urlRoot returns an URL based on modelName", function() {
    var Model = Viking.Model.extend('model');
    equal(Model.urlRoot(), '/models');
});

module("Viking.Model#urlRoot");

test("#urlRoot is an alias to ::urlRoot", function() {
    var Model = Viking.Model.extend('model', {}, {
        urlRoot: function() {
            return 42;
        }
    });
    
    equal((new Model()).urlRoot(), 42);
});
