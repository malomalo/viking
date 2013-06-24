(function () {
    module("Viking.Model#select");

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

    test("select() triggers a 'selected' event", function() {
        expect(1);
    
        var c = new Viking.Collection([{}]);
        var model = c.models[0];

        model.on('change:selected', function() { ok(model.get('selected')); });
        model.select();
        model.off('change:selected');
    });

    test("select() triggers a 'selected' event only if change", function() {
        expect(0);
    
        var c = new Viking.Collection([{'selected': true}]);
        var m = c.models[0]
        m.on('selected', function() { ok(true); });
        m.select();
        m.off('selected');
    });

}());