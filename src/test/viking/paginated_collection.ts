import * as Backbone from 'backbone';
import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../viking';

module('Viking.PaginatedCollection', {}, () => {
    // Cursor -----------------------------------------------------------------------
    test('new sets new cursor', () => {
        const pc = new Viking.PaginatedCollection();
        assert.ok(pc.cursor);
    });

    test('new sets cursor passed in options', () => {
        const cursor = new Viking.Cursor();
        const pc = new Viking.PaginatedCollection([], { cursor });

        assert.ok(cursor === pc.cursor);
    });

    test('cursorChanged called when cursor changes', async () => {
        await new Promise((resolve) => {

            const collection = Viking.PaginatedCollection.extend({
                cursorChanged: () => {
                    assert.ok(true);
                    resolve();
                }
            });
            const pc = new collection();

            pc.cursor.incrementPage();
        });
    });

    test('cursorChanged doesn\'t get called when not needed', () => {
        const collection = Viking.PaginatedCollection.extend({
            cursorChanged: () => assert.ok(false)
        });
        const pc = new collection();

        pc.cursor.set('total_pages', 4);
        assert.ok(true);
    });

    // Predicate -----------------------------------------------------------------
    test('predicateChanged method is called when predicate is changed', async () => {
        await new Promise((resolve) => {

            const collection = Viking.PaginatedCollection.extend({
                predicateChanged: (options) => {
                    assert.ok(true);
                    resolve();
                }
            });
            const predicate = new Viking.Predicate();
            const pc = new collection([], { predicate });

            predicate.trigger('change');
        });
    });

    test('predicateChanged resets the cursor and calls fetch()', async () => {
        await new Promise((resolve) => {

            const collection = Viking.PaginatedCollection.extend({
                cursorChanged: () => {
                    assert.ok(true);
                    resolve();
                }
            });
            const predicate = new Viking.Predicate();
            const cursor = new Viking.Cursor({ page: 10 });
            const pc = new collection([], { predicate, cursor });
            predicate.trigger('change');
        });
    });

    test('predicateChanged() calls cursorChanged()', async () => {
        await new Promise((resolve) => {
            const c = new (Viking.PaginatedCollection.extend({
                cursorChanged: () => {
                    assert.ok(true);
                    resolve();
                }
            }))();

            c.predicateChanged();
        });
    });

    // Parse ---------------------------------------------------------------------
    test('parse extracts cursor information', () => {
        const m = Viking.Model.extend('model');
        const c = new (Viking.PaginatedCollection.extend({ model: m }))();

        c.cursor.set({ page: 3, per_page: 40, offset: 0 }, { silent: true });
        c.parse([{ id: 2069, type: 'lease' }], {
            xhr: { getResponseHeader: (key) => { if (key === 'Total-Count') { return 3049; } } }
        });
        assert.equal(77, c.cursor.totalPages());
        assert.equal(3049, c.cursor.get('total_count'));
    });

    // sync() --------------------------------------------------------------------
    test('sync() adds in cursor params', async () => {
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
