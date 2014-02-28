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
    
    test("select(true) selects the model", function () {
        var c = new Viking.Collection([{}, {}, {}]);
        var models = c.models;
        
        ok(!models[0].selected);
        models[0].select(true);
        ok(models[0].selected);
    });
    
    test("select(false) unselects the model", function () {
        var c = new Viking.Collection([{}, {}, {}]);
        var models = c.models;
        
        models[0].select();
        
        ok(models[0].selected);
        models[0].select(false);
        ok(!models[0].selected);
    });

    test("select({multiple: true}) doesn't unselect other models", function() {
        var c = new Viking.Collection([{}, {}, {}]);
        var models = c.models;
    
        models[0].select();
        models[1].select({multiple: true});
        models[2].select({multiple: true});
    
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
    
    test("select() triggers a 'selected' event on the collection", function() {
        expect(1);
    
        var c = new Viking.Collection([{}]);
        c.on('selected', function() { ok(true); });
        c.models[0].select();
        c.off('selected');
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
    
    test("select() triggers a 'selected' event on collection only if change", function() {
        expect(0);
    
        var c = new Viking.Collection([{}]);
        c.models[0].selected = true;
        c.on('selected', function() { ok(true); });
        c.models[0].select();
        c.off('selected');
    });

}());