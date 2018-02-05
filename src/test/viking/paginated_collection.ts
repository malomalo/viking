import * as Backbone from 'backbone';
import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../viking';

module('Viking.PaginatedCollection', {}, () => {
    // Cursor -----------------------------------------------------------------------
    test("new sets new cursor", function() {
        var pc = new Viking.PaginatedCollection();
    
        assert.ok(pc.cursor);
    });

    test("new sets cursor passed in options", function() {
        var cursor = new Viking.Cursor();
        var pc = new Viking.PaginatedCollection([], {cursor: cursor});
    
        assert.ok(cursor === pc.cursor);
    });

    test("cursorChanged called when cursor changes", async () => {
        await new Promise((resolve) => {    
    
            var collection = Viking.PaginatedCollection.extend({
                cursorChanged: function() {
                    assert.ok(true);
                    resolve();
                }
            });
            var pc = new collection();
    
            pc.cursor.incrementPage();
        });
    });

    test("cursorChanged doesn't get called when not needed", function() {
        var collection = Viking.PaginatedCollection.extend({
            cursorChanged: function() {
                assert.ok(false);
            }
        });
        var pc = new collection();

        pc.cursor.set('total_pages', 4);
    });

    // Predicate -----------------------------------------------------------------
    test("predicateChanged method is called when predicate is changed", async () => {
        await new Promise((resolve) => {    
    
            var collection = Viking.PaginatedCollection.extend({
                predicateChanged: function(options) {
                    assert.ok(true);
                    resolve();
                }
            });
            var predicate = new Viking.Predicate();
            var pc = new collection([], { predicate: predicate });
    
            predicate.trigger('change');
        });
    });

    test("predicateChanged resets the cursor and calls fetch()", async () => {
        await new Promise((resolve) => {

            var collection = Viking.PaginatedCollection.extend({
                cursorChanged: function() {
                    assert.ok(true);
                    resolve();
                }
            });
            var predicate = new Viking.Predicate();
            var cursor = new Viking.Cursor({page: 10});
            var pc = new collection([], { predicate: predicate, cursor: cursor });
            predicate.trigger('change');
        });
    });

    test("predicateChanged() calls cursorChanged()", async () => {
        await new Promise((resolve) => {

            var c = Viking.PaginatedCollection.extend({
                cursorChanged: function() {
                    assert.ok(true);
                    resolve();
                }
            });
            var c = new c();
    
            c.predicateChanged();
        });
    });

    // Parse ---------------------------------------------------------------------
    test("parse extracts cursor information", function() {
        var m = Viking.Model.extend('model');
        var c = Viking.PaginatedCollection.extend({model: m});
        var c = new c();
    
        c.cursor.set({page: 3, per_page: 40, offset: 0}, {silent: true});
        c.parse([ {"id":2069,"type":"lease"} ], { 
            xhr: { getResponseHeader: function(key) { if(key == 'Total-Count') {return 3049;} }}
        });
        assert.equal(77, c.cursor.totalPages());
        assert.equal(3049, c.cursor.get('total_count'));
    });

    // sync() --------------------------------------------------------------------
    test("sync() adds in cursor params", async () => {
        assert.ok(false);
        // TODO
        // await new Promise((resolve) => {
        //     var m = Viking.Model.extend('model');
        //     var c = Viking.PaginatedCollection.extend({model: m});
        //     var c = new c([]);
        //
        //     var old = Viking.sync;
        //     Viking.sync = function(method, model, options) {
        //         assert.equal(40, options.data.limit);
        //         assert.equal(40, options.data.offset);
        //         resolve();
        //     }
        //     c.cursor.set({page: 2, per_page: 40});
        //     Viking.sync = old;
        // });
    });

});