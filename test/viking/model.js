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

    test("model.select() triggers a 'selected' event on model", function() {
        expect(1);
    
        var c = new Viking.Collection([{}]);
        c.on('selected', function() { ok(true); });
        c.models[0].select();
        c.off('selected');
    });

    test("model.select() triggers a 'selected' event on model only if change", function() {
        expect(0);
    
        var c = new Viking.Collection([{}]);
		c.models[0].selected = true;
        c.on('selected', function() { ok(true); });
        c.models[0].select();
        c.off('selected');
    });

    test("model.unselect() triggers a 'unselected' event on model", function() {
        expect(1);
    
        var c = new Viking.Collection([{}]);
		c.models[0].selected = true;
        c.on('unselected', function() { ok(true); });
        c.models[0].unselect();
        c.off('unselected');
    });

    test("model.unselect() triggers a 'unselected' event on model only if change", function() {
        expect(0);
    
        var c = new Viking.Collection([{}]);
		c.models[0].selected = false;
        c.on('unselected', function() { ok(true); });
        c.models[0].unselect();
        c.off('unselected');
    });


}());