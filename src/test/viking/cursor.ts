import * as Backbone from 'backbone';
import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../viking';

module('Viking.Cursor', {}, () => {

    // Defaults ------------------------------------------------------------------
    test("defaults are set", function() {
        var c = new Viking.Cursor();

        assert.deepEqual(c.attributes, {page: 1, per_page: 25});
    });

    // Reset ---------------------------------------------------------------------
    test("reset resets to default values", function() {
        var c = new Viking.Cursor({page: 21, per_page: 40});

        c.reset()
        assert.deepEqual(c.attributes, {page: 1, per_page: 40});
    });

    test("reset doesn't change per_page", function() {
        var c = new Viking.Cursor({per_page: 60});

        c.reset()
        assert.equal(60, c.get('per_page'));
    });

    test("reset triggers a reset event", async () => {
        await new Promise((resolve) => {

            var c = new Viking.Cursor({page: 2});
            c.on('reset', function() {
                assert.ok(true);
                resolve();
            });
            c.reset();
            c.off('reset');
        });
    });

    test("reset doesnt trigger a change event", function() {
        var c = new Viking.Cursor({page: 2});
        c.on('change', function() {
            assert.ok(false);
        });
        c.reset({silent: true});
        assert.ok(true);
        c.off('change');
    });

    test("reset doesnt triggers a reset event when options.silent", function() {
        var c = new Viking.Cursor({page: 2});
        c.on('reset', function() {
            assert.ok(false);
        });
        c.reset({silent: true});
        assert.ok(true);
        c.off('reset');
    });
    
    test("reset doesn't trigger a reset event if !requiresRefresh()", function() {
        var c = new Viking.Cursor();
        c.on('reset', function() {
            assert.ok(false);
        });
        c.reset();
        assert.ok(true);
        c.off('reset');
    });
    
    test("reset options get passed to callbacks", async () => {
        await new Promise((resolve) => {

            var c = new Viking.Cursor({page: 2});
            c.on('reset', function(model, options) {
                assert.deepEqual({remove: false}, options);
                resolve();
            });
            c.reset({remove: false});
            c.off('reset');
        });
    });

    // incrementPage -------------------------------------------------------------
    test("incrementPage increments page by 1", function() {
        var c = new Viking.Cursor();
        assert.equal(c.get('page'), 1);
        c.incrementPage();
        assert.equal(c.get('page'), 2);
    });

    test("incrementPage options get passed to callbacks", async () => {
        await new Promise((resolve) => {

            var c = new Viking.Cursor();
            c.on('change', function(model, options) {
                assert.deepEqual({remove: false}, options);
            });
            c.on('change:page', function(model, value, options) {
                assert.deepEqual({remove: false}, options);
                resolve();
            });
            c.incrementPage({remove: false});
            c.off('change');
            c.off('change:page');
        });
    });

    // decrementPage -------------------------------------------------------------
    test("decrementPage decrements page by 1", function() {
        var c = new Viking.Cursor({page: 2});
        assert.equal(c.get('page'), 2);
        c.decrementPage();
        assert.equal(c.get('page'), 1);
    });

    test("decrementPage options get passed to callbacks", async () => {
        await new Promise((resolve) => {

            var c = new Viking.Cursor();
            c.on('change', function(model, options) {
                assert.deepEqual({remove: false}, options);
            });
            c.on('change:page', function(model, value, options) {
                assert.deepEqual({remove: false}, options);
                resolve();
            });
            c.decrementPage({remove: false});
            c.off('change');
            c.off('change:page');
        });
    });

    // goToPage ------------------------------------------------------------------
    test("goToPage changes page to given pageNumber", function() {
        var c = new Viking.Cursor({page: 1});
        assert.equal(c.get('page'), 1);
        c.goToPage(12);
        assert.equal(c.get('page'), 12);
    });

    // requiresRefresh -----------------------------------------------------------
    test("requiresRefresh returns true if page changes", function() {
        var c = new Viking.Cursor({page: 1});
        c.set('page', 2);
        assert.ok(c.requiresRefresh());
    });

    test("requiresRefresh returns true if per_page changes", function() {
        var c = new Viking.Cursor({page: 1});
        c.set('per_page', 2);
        assert.ok(c.requiresRefresh());
    });

    test("requiresRefresh returns false if neither page, offset, or per_page have changed", function() {
        var c = new Viking.Cursor();
        c.set('total_pages', 2);
        assert.ok(!c.requiresRefresh());
    });

});