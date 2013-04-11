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

test("cursorChanged passes options to fetch", function() {
    expect(3);
    
    var collection = Viking.PaginatedCollection.extend({
        fetch: function(options) { deepEqual({test: 'this'}, options) }
    });
    var pc = new collection();
    
    pc.cursor.incrementPage({test: 'this'});
    pc.cursor.decrementPage({test: 'this'});
    pc.cursor.goToPage(2, {test: 'this'});
});

// Filter --------------------------------------------------------------------
test("filterChanged method is called when filter is changed", function() {
    expect(1);
    
    var collection = Viking.PaginatedCollection.extend({
        filterChanged: function(options) { ok(true); }
    });
    var filter = new Viking.Filter();
    var pc = new collection([], { filter: filter });
    
    filter.trigger('change');
});

test("filterChanged resets the cursor and calls cursorChanged()", function() {
    expect(1);

    var collection = Viking.PaginatedCollection.extend({
        cursorChanged: function() { ok(true); }
    });
    var filter = new Viking.Filter();
    var cursor = new Viking.Cursor({page: 10});
    var pc = new collection([], { filter: filter, cursor: cursor });
    filter.trigger('change');
});

test("filterChanged() calls cursorChanged() with options from ", function() {
    expect(1);

    var c = Viking.PaginatedCollection.extend({
        cursorChanged: function(model, options) {
            deepEqual({remove: false}, options);
        }
    });
    var c = new c();
    
    c.filterChanged(null, {remove: false});
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