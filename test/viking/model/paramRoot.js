module("Viking.Model#paramRoot");

test("instance.paramRoot returns underscored modelName", function() {
    var Model = Viking.Model.extend('model');
    var model = new Model();
    
    equal(model.paramRoot(), 'model');
});
