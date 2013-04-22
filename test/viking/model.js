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

test("find(id, options)", function() {
    expect(3);
    
    var Model = Viking.Model.extend('model');
    var oldSync = Backbone.sync
    Backbone.sync = function(method, model, options) {
        equal('GET', method);
        equal(model.get('id'), 10);
        deepEqual(options, {key: 'value'});
    }
    Model.find(10, {key: 'value'});
    Backbone.sync = oldSync;
});