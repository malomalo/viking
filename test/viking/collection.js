import Viking from '../../src/viking';

(function() {
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

    test("select(model, {multiple: true}) doesn't unselect other models", function() {
        var c = new Viking.Collection([{}, {}, {}]);
        var models = c.models;
    
        c.select(models[0]);
        c.select(models[1], {multiple: true});
        c.select(models[2], {multiple: true});
    
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

    test("select(model) triggers a 'selected' event on collection only if change", function() {
        expect(0);
    
        var c = new Viking.Collection([{}]);
        c.models[0].selected = true;
        c.on('selected', function() { ok(true); });
        c.select(c.models[0]);
        c.off('selected');
    });

    test("model.unselect() triggers a 'unselected' event on collection", function() {
        expect(1);
    
        var c = new Viking.Collection([{}]);
        var model = c.models[0];
        model.selected = true;
        c.on('unselected', function() { ok(!model.selected); });
        model.unselect();
        c.off('unselected');
    });

    test("model.unselect() triggers a 'unselected' event on collection only if change", function() {
        expect(0);
    
        var c = new Viking.Collection([{}]);
        c.on('unselected', function() { ok(true); });
        c.models[0].select(c.models[0]);
        c.off('unselected');
    });

    test("selected() only returns selected models", function() {
        var c = new Viking.Collection([{}, {}, {}]);
        var models = c.models;
    
        c.select(models[0]);
        var selected = c.selected();
        equal(1, selected.length);
        equal(c.models[0].cid, selected[0].cid);
    
        c.select(models[1], {multiple: true});
        c.select(models[2], {multiple: true});
    
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
	
    test("clearSelected() triggers 'unselected' event on all models", function() {
        expect(2);
		
        var c = new Viking.Collection([{}, {}, {}]);
        c.models[0].selected = false;
        c.models[1].selected = true;
        c.models[2].selected = true;
        c.models[0].on('unselected', function() { ok(true); });
        c.models[1].on('unselected', function() { ok(true); });
        c.models[2].on('unselected', function() { ok(true); });

        c.clearSelected();
		
        c.models[0].off('unselected');
        c.models[1].off('unselected');
        c.models[2].off('unselected');
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

import './collection/fetch';
import './collection/new';
import './collection/order';
import './collection/predicate';
import './collection/sync';
