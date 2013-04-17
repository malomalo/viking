module("Viking.Model");

test("extend set modelName on Model", function() {
    var Model = Viking.Model.extend('model');
    
    equal(Model.modelName, 'model');
});

test("class.urlRoot returns an URL based on modelName", function() {
    var Model = Viking.Model.extend('model');
    equal(Model.urlRoot(), '/models');
});

test("instance.modelName is set on instantiation", function() {
    var Model = Viking.Model.extend('model');
    var model = new Model();
    
    equal(model.modelName, 'model');
});

test("instance.urlRoot returns an URL based on modelName", function() {
    var Model = Viking.Model.extend('model');
    var model = new Model();
    
    equal(model.urlRoot(), '/models');
});

test("instance.paramRoot returns underscored modelName", function() {
    var Model = Viking.Model.extend('model');
    var model = new Model();
    
    equal(model.paramRoot(), 'model');
});

// select() ------------------------------------------------------------------
test("select() sets 'selected' to true on the model", function() {
    var c = new Viking.Collection([{}, {}]);
    var model = c.models[0];
    model.select();
    
    ok(model.get('selected'));
});

test("select() sets 'selected' to false other models", function() {
    var c = new Viking.Collection([{'selected': true}, {'selected': true}, {'selected': true}]);
    var models = c.models;
    
    ok(models[0].get('selected'));
    ok(models[1].get('selected'));
    ok(models[2].get('selected'));
    
    models[1].select();
    
    ok(!models[0].get('selected'));
    ok(models[1].get('selected'));
    ok(!models[2].get('selected'));
});

test("select(true) doesn't unselect other modelts", function() {
    var c = new Viking.Collection([{}, {}, {}]);
    var models = c.models;
    
    models[0].select();
    models[1].select(true);
    models[2].select(true);
    
    ok(models[0].get('selected'));
    ok(models[1].get('selected'));
    ok(models[2].get('selected'));
});

test("selected() triggers a 'selected' event", function() {
    expect(1);
    
    var c = new Viking.Collection([{}]);
    var model = c.models[0];

    model.on('change:selected', function() { ok(model.get('selected')); });
    model.select();
    model.off('change:selected');
});

test("selected(model) triggers a 'selected' event only if change", function() {
    expect(0);
    
    var c = new Viking.Collection([{'selected': true}]);
    var m = c.models[0]
    m.on('selected', function() { ok(true); });
    m.select();
    m.off('selected');
});

test("selected() only returns selected models", function() {
    var c = new Viking.Collection([{}, {}, {}]);
    var models = c.models;
    
    c.select(models[0]);
    var selected = c.selected();
    equal(1, selected.length);
    equal(c.models[0].cid, selected[0].cid);
    
    c.select(models[1], true);
    c.select(models[2], true);
    
    selected = c.selected();    
    equal(3, selected.length);
    equal(c.models[0].cid, selected[0].cid);
    equal(c.models[1].cid, selected[1].cid);
    equal(c.models[2].cid, selected[2].cid);
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