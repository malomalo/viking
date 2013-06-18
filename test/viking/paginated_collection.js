(function () {
    module("Viking.PaginatedCollection");

    // Cursor -----------------------------------------------------------------------
    test("new sets new cursor", function() {
        var pc = new Viking.PaginatedCollection();
    
        ok(pc.cursor);
    });

    test("new sets cursor passed in options", function() {
        var cursor = new Viking.Cursor();
        var pc = new Viking.PaginatedCollection([], {cursor: cursor});
    
        ok(cursor === pc.cursor);
    });

    test("cursorChanged called when cursor changes", function() {
        expect(1);
    
        var collection = Viking.PaginatedCollection.extend({
            cursorChanged: function() { ok(true); }
        });
        var pc = new collection();
    
        pc.cursor.incrementPage();
    });

    test("cursorChanged doesn't get called when not needed", function() {
        expect(0);
    
        var collection = Viking.PaginatedCollection.extend({
            cursorChanged: function() { ok(true); }
        });
        var pc = new collection();
    
        pc.cursor.set('total_pages', 4);
    });

    // Predicate -----------------------------------------------------------------
    test("predicateChanged method is called when predicate is changed", function() {
        expect(1);
    
        var collection = Viking.PaginatedCollection.extend({
            predicateChanged: function(options) { ok(true); }
        });
        var predicate = new Viking.Predicate();
        var pc = new collection([], { predicate: predicate });
    
        predicate.trigger('change');
    });

    test("predicateChanged resets the cursor and calls fetch()", function() {
        expect(1);

        var collection = Viking.PaginatedCollection.extend({
            cursorChanged: function() { ok(true); }
        });
        var predicate = new Viking.Predicate();
        var cursor = new Viking.Cursor({page: 10});
        var pc = new collection([], { predicate: predicate, cursor: cursor });
        predicate.trigger('change');
    });

    test("predicateChanged() calls cursorChanged()", function() {
        expect(1);

        var c = Viking.PaginatedCollection.extend({
            cursorChanged: function() { ok(true); }
        });
        var c = new c();
    
        c.predicateChanged();
    });

    // Parse ---------------------------------------------------------------------
    test("parse extracts cursor information", function() {
        var m = Viking.Model.extend('model');
        var c = Viking.PaginatedCollection.extend({model: m});
        var c = new c();
    
        c.cursor.set({page: 3, per_page: 40, offset: 0}, {silent: true});
        c.parse({"page":3, "per_page":40, "total_pages":77, "offset":0, "count": 40, "total":3049, "listings":[ {"id":2069,"type":"lease"} ] });
        equal(77, c.cursor.get('total_pages'));
        equal(3049, c.cursor.get('total'));
        equal(40, c.cursor.get('count'));
    });

    test("parse doesn't set offset if not present", function() {
        var m = Viking.Model.extend('model');
        var c = Viking.PaginatedCollection.extend({model: m});
        var c = new c();
    
        c.cursor.set({page: 3, per_page: 40, offset: 10}, {silent: true});
        c.parse({"page":3, "per_page":40, "total_pages":77, "count": 40, "total":3049, "listings":[ {"id":2069,"type":"lease"} ] });
        equal(10, c.cursor.get('offset'));
    });

    // sync() --------------------------------------------------------------------
    test("sync() adds in cursor params", function() {
        expect(3);
    
        var m = Viking.Model.extend('model');
        var c = Viking.PaginatedCollection.extend({model: m});
        var c = new c([]);
    
        var old = Backbone.sync;
        Backbone.sync = function(method, model, options) {
            equal(1, options.data.page);
            equal(40, options.data.per_page);
            equal(3, options.data.offset);
        }
        c.cursor.set({page: 1, per_page: 40, offset: 3});
        Backbone.sync = old;
    });

}());