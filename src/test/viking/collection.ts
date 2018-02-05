import * as Backbone from 'backbone';
import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../viking';

module('Viking.Collection', {}, () => {

    // Url -----------------------------------------------------------------------
    test("url based on model.modelName", function() {
        var m = Viking.Model.extend('model');
        var mc = Viking.Collection.extend({
            model: m
        });
    
        var c = new mc();
    
        assert.equal('/models', c.url());
    });

    test("url based on model.modelName", function() {
        var m = Viking.Model.extend('model');
        var mc = Viking.Collection.extend({
            model: m
        });
    
        var c = new mc();
    
        assert.equal('/models', c.url());
    });

    // paramRoot -----------------------------------------------------------------
    test("paramRoot based on model.modelName", function() {
        var m = Viking.Model.extend('model');
        var mc = Viking.Collection.extend({
            model: m
        });
    
        var c = new mc();
    
        assert.equal('models', c.paramRoot());
    });

    // select() ------------------------------------------------------------------
    test("select(model) sets 'selected' to true on the model", function() {
        var c = new Viking.Collection([{}, {}]);
        var model = c.models[0];
        c.select(model);
    
        assert.ok(model.selected);
    });

    test("select(model) sets 'selected' to false other models", function() {
        var c = new Viking.Collection([{}, {}, {}]);
        var models = c.models;
        models[0].selected = true;
        models[1].selected = true;
        models[2].selected = true;
    
        assert.ok(models[0].selected);
        assert.ok(models[1].selected);
        assert.ok(models[2].selected);
    
        c.select(models[1]);
    
        assert.ok(!models[0].selected);
        assert.ok(models[1].selected);
        assert.ok(!models[2].selected);
    });

    test("select(model, {multiple: true}) doesn't unselect other models", function() {
        var c = new Viking.Collection([{}, {}, {}]);
        var models = c.models;
    
        c.select(models[0]);
        c.select(models[1], {multiple: true});
        c.select(models[2], {multiple: true});
    
        assert.ok(models[0].selected);
        assert.ok(models[1].selected);
        assert.ok(models[2].selected);
    });

    test("select(model) triggers a 'selected' event on collection", async () => {
        await new Promise((resolve) => {    
            var c = new Viking.Collection([{}]);
            var model = c.models[0];
            c.on('selected', function() {
                assert.ok(model.selected);
                resolve();
            });
            c.select(model);
            c.off('selected');
        });
    });

    test("select(model) triggers a 'selected' event on collection only if change", function() {
        var c = new Viking.Collection([{}]);
        c.models[0].selected = true;
        c.on('selected', function() {
            assert.ok(false);
        });
        c.select(c.models[0]);
        c.off('selected');
    });

    test("model.unselect() triggers a 'unselected' event on collection", async () => {
        await new Promise((resolve) => {
    
            var c = new Viking.Collection([{}]);
            var model = c.models[0];
            model.selected = true;
            c.on('unselected', function() {
                assert.ok(!model.selected);
                resolve();
            });
            model.unselect();
            c.off('unselected');
        });
    });

    test("model.unselect() triggers a 'unselected' event on collection only if change", function () {
        var c = new Viking.Collection([{}]);
        c.on('unselected', function() {
            assert.ok(true);
        });
        c.models[0].select(c.models[0]);
        c.off('unselected');
    });

    test("selected() only returns selected models", function() {
        var c = new Viking.Collection([{}, {}, {}]);
        var models = c.models;
    
        c.select(models[0]);
        var selected = c.selected();
        assert.equal(1, selected.length);
        assert.equal(c.models[0].cid, selected[0].cid);
    
        c.select(models[1], {multiple: true});
        c.select(models[2], {multiple: true});
    
        selected = c.selected();    
        assert.equal(3, selected.length);
        assert.equal(c.models[0].cid, selected[0].cid);
        assert.equal(c.models[1].cid, selected[1].cid);
        assert.equal(c.models[2].cid, selected[2].cid);
    });

    // clearSelected() ------------------------------------------------------------
    test("clearSelected() set 'selected' to false on all models", function() {
        var c = new Viking.Collection([{}, {}, {}]);
        c.models[0].selected = true;
        c.models[1].selected = true;
        c.models[2].selected = true;
		
        assert.equal(3, c.selected().length);
        c.clearSelected();
        assert.equal(0, c.selected().length);
    });

    test("clearSelected(except) set 'selected' to false on all models", function() {
        var c = new Viking.Collection([{}, {}, {}]);
        c.models[0].selected = true;
        c.models[1].selected = true;
        c.models[2].selected = true;
		
        var model = c.models[1];
        assert.equal(3, c.selected().length);
        c.clearSelected(model);
        assert.equal(1, c.selected().length);
    });

    test("decrementPage options get passed to callbacks", async () => {
        await new Promise((resolve) => {
            var resolves = new Array;
            var c = new Viking.Cursor();
            c.on('change', function(model, options) {
                assert.deepEqual({remove: false}, options);
                resolves.push('t');
                if(resolves.length == 2) resolve();
            });
            c.on('change:page', function(model, value, options) {
                assert.deepEqual({remove: false}, options);
                resolves.push('t');
                if(resolves.length == 2) resolve();
            });
            c.decrementPage({remove: false});
            c.off('change');
            c.off('change:page');
        });
    });

    // set -----------------------------------------------------------------------
    test("predicate.set() options get passed to predicateChanged", async () => {
        await new Promise((resolve) => {
            var resolves = new Array;

            var f = new Viking.Predicate();
            var m = Viking.Model.extend('model');
            var c = Viking.Collection.extend({
                model: m,
                predicateChanged: function(model, options) {
                    assert.deepEqual({remove: false}, options);
                    resolves.push('t');
                    if(resolves.length == 3) resolve();
                }
            });
            var c = new c([], {predicate: f});

            f.on('change', function(model, options) {
                assert.deepEqual({remove: false}, options);
                resolves.push('t');
                if(resolves.length == 3) resolve();
            });
            f.on('change:query', function(model, value, options) {
                assert.deepEqual({remove: false}, options);
                resolves.push('t');
                if(resolves.length == 3) resolve();
            });
            f.set('query', 'Дорогой', {remove: false});
            f.off('change');
            f.off('change:query');
        });
    });
    
    test("clearSelected() triggers 'unselected' event on all models", async () => {
        await new Promise((resolve) => {

            var c = new Viking.Collection([{}, {}, {}]);
            c.models[0].selected = false;
            c.models[1].selected = true;
            c.models[2].selected = true;
            c.models[0].on('unselected', function() {
                assert.ok(true);
                resolve();
            });
            c.models[1].on('unselected', function() {
                assert.ok(true);
                resolve();
            });
            c.models[2].on('unselected', function() {
                assert.ok(true);
                resolve();
            });

            c.clearSelected();

            c.models[0].off('unselected');
            c.models[1].off('unselected');
            c.models[2].off('unselected');
        });
    });
});