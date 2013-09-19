(function () {
    module("Viking.Model#select");

    test("select() sets 'selected' to true on model when not in a collection", function() {
        var model = new Viking.Model({});
        model.select();
    
        ok(model.selected);
    });
    
    test("select() sets 'selected' to true on the model when in a collection", function() {
        var c = new Viking.Collection([{}, {}]);
        var model = c.models[0];
        model.select();
    
        ok(model.selected);
    });

    test("select() sets 'selected' to false other models", function() {
        var c = new Viking.Collection([{}, {}, {}]);
        var models = c.models;
        models[0].selected = true;
        models[1].selected = true;
        models[2].selected = true;
    
        ok(models[0].selected);
        ok(models[1].selected);
        ok(models[2].selected);
    
        models[1].select();
    
        ok(!models[0].selected);
        ok(models[1].selected);
        ok(!models[2].selected);
    });

    test("select(true) doesn't unselect other modelts", function() {
        var c = new Viking.Collection([{}, {}, {}]);
        var models = c.models;
    
        models[0].select();
        models[1].select(true);
        models[2].select(true);
    
        ok(models[0].selected);
        ok(models[1].selected);
        ok(models[2].selected);
    });

    test("select() triggers a 'selected' event", function() {
        expect(1);
    
        var c = new Viking.Collection([{}]);
        var model = c.models[0];

        model.on('selected', function() { ok(model.selected); });
        model.select();
        model.off('selected');
    });

    test("select() triggers a 'selected' event only if change", function() {
        expect(0);
    
        var c = new Viking.Collection([{}]);
        var m = c.models[0];
		m.selected = true;
        m.on('selected', function() { ok(true); });
        m.select();
        m.off('selected');
    });
	
    test("unselect() triggers a 'unselected' event", function() {
        expect(1);
    
        var c = new Viking.Collection([{}]);
        var model = c.models[0];
		model.selected = true;
        model.on('unselected', function() { ok(!model.selected); });
        model.unselect();
        model.off('unselected');
    });

    test("unselect() triggers a 'selected' event only if change", function() {
        expect(0);
    
        var c = new Viking.Collection([{}]);
        var m = c.models[0];
        m.on('unselected', function() { ok(true); });
        m.unselect();
        m.off('unselected');
    });

}());