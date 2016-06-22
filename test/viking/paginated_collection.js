import Viking from './../../src/viking';

(function () {
    module("Viking.PaginatedCollection", {
        setup: function() {
            this.requests = [];
            this.xhr = sinon.useFakeXMLHttpRequest();
            this.xhr.onCreate = _.bind(function(xhr) {
                this.requests.push(xhr);
            }, this);
        },
        teardown: function() {
            this.xhr.restore();
        }
    });

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
        c.parse([ {"id":2069,"type":"lease"} ], { 
            xhr: { getResponseHeader: function(key) { if(key == 'Total-Count') {return 3049;} }}
        });
        equal(77, c.cursor.totalPages());
        equal(3049, c.cursor.get('total_count'));
    });

    // sync() --------------------------------------------------------------------
    test("sync() adds in cursor params", function() {
        expect(1);
    
        var m = Viking.Model.extend('model');
        var c = Viking.PaginatedCollection.extend({model: m});
        var c = new c([]);

        c.cursor.set({page: 2, per_page: 40});
        equal(this.requests[0].url, '/models?limit=40&offset=40')
    });

}());