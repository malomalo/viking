(function () {
    module("Viking.Collection");

    // Url -----------------------------------------------------------------------
    test("url based on model.modelName", function() {
        var m = Viking.Model.extend('model');
        var mc = Viking.Collection.extend({
           model: m
        });
    
        var c = new mc();
    
        equal('/models', c.url());
    });

    test("url based on model.modelName", function() {
        var m = Viking.Model.extend('model');
        var mc = Viking.Collection.extend({
           model: m
        });
    
        var c = new mc();
    
        equal('/models', c.url());
    });

    // paramRoot -----------------------------------------------------------------
    test("paramRoot based on model.modelName", function() {
        var m = Viking.Model.extend('model');
        var mc = Viking.Collection.extend({
           model: m
        });
    
        var c = new mc();
    
        equal('models', c.paramRoot());
    });

    // select() ------------------------------------------------------------------
    test("select(model) sets 'selected' to true on the model", function() {
        var c = new Viking.Collection([{}, {}]);
        var model = c.models[0];
        c.select(model);
    
        ok(model.selected);
    });

    test("select(model) sets 'selected' to false other models", function() {
        var c = new Viking.Collection([{}, {}, {}]);
        var models = c.models;
        models[0].selected = true;
        models[1].selected = true;
        models[2].selected = true;
    
        ok(models[0].selected);
        ok(models[1].selected);
        ok(models[2].selected);
    
        c.select(models[1]);
    
        ok(!models[0].selected);
        ok(models[1].selected);
        ok(!models[2].selected);
    });

    test("select(model, true) doesn't unselect other modelts", function() {
        var c = new Viking.Collection([{}, {}, {}]);
        var models = c.models;
    
        c.select(models[0]);
        c.select(models[1], true);
        c.select(models[2], true);
    
        ok(models[0].selected);
        ok(models[1].selected);
        ok(models[2].selected);
    });

    test("select(model) triggers a 'selected' event on collection", function() {
        expect(1);
    
        var c = new Viking.Collection([{}]);
        var model = c.models[0];
        c.on('selected', function() { ok(model.selected); });
        c.select(model);
        c.off('selected');
    });

    test("selected(model) triggers a 'selected' event only if change", function() {
        expect(0);
    
        var c = new Viking.Collection([{}]);
		c.models[0].selected = true;
        c.on('selected', function() { ok(true); });
        c.select(c.models[0]);
        c.off('selected');
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

    // clearSelected() ------------------------------------------------------------
    test("clearSelected() set 'selected' to false on all models", function() {
        var c = new Viking.Collection([{}, {}, {}]);
		c.models[0].selected = true;
		c.models[1].selected = true;
		c.models[2].selected = true;
		
        equal(3, c.selected().length);
        c.clearSelected()
        equal(0, c.selected().length);
    });

    test("clearSelected(except) set 'selected' to false on all models", function() {
        var c = new Viking.Collection([{}, {}, {}]);
		c.models[0].selected = true;
		c.models[1].selected = true;
		c.models[2].selected = true;
		
        var model = c.models[1];
        equal(3, c.selected().length);
        c.clearSelected(model)
        equal(1, c.selected().length);
    });

    // sync() --------------------------------------------------------------------
    test("sync() adds in predicate params", function() {
        expect(1);
    
        var m = Viking.Model.extend('model');
        var f = new Viking.Predicate({types: [1,2]});
        var c = Viking.Collection.extend({model: m});
        var c = new c([], {predicate: f});
    
        var old = Backbone.sync;
        Backbone.sync = function(method, model, options) {
            deepEqual(options.data.where, {types: [1,2]});
        }
        c.fetch();
        Backbone.sync = old;
    });

    test("sync() doesn't add in predicate params if there is no predicate", function() {
        expect(1);
    
        var m = Viking.Model.extend('model');
        var c = Viking.Collection.extend({model: m});
        var c = new c();
    
        var old = Backbone.sync;
        Backbone.sync = function(method, model, options) {
            equal(options.data, undefined);
        }
        c.fetch();
        Backbone.sync = old;
    });

    test("decrementPage options get passed to callbacks", function() {
        expect(2);

        var c = new Viking.Cursor();
        c.on('change', function(model, options) { deepEqual({remove: false}, options); });
        c.on('change:page', function(model, value, options) { deepEqual({remove: false}, options); });
        c.decrementPage({remove: false});
        c.off('change');
        c.off('change:page');
    });

    // set -----------------------------------------------------------------------
    test("predicate.set() options get passed to predicateChanged", function() {
        expect(3);

        var f = new Viking.Predicate();
        var m = Viking.Model.extend('model');
        var c = Viking.Collection.extend({
            model: m,
            predicateChanged: function(model, options) {
                deepEqual({remove: false}, options);
            }
        });
        var c = new c([], {predicate: f});
    
        f.on('change', function(model, options) { deepEqual({remove: false}, options); });
        f.on('change:query', function(model, value, options) { deepEqual({remove: false}, options); });
        f.set('query', 'Дорогой', {remove: false});
        f.off('change');
        f.off('change:query');
    });

}());