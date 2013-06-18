(function () {
    module("Viking.Cursor");

    // Defaults ------------------------------------------------------------------
    test("defaults are set", function() {
        var c = new Viking.Cursor();

        deepEqual(c.attributes, {page: 1, offset: 0, per_page: 25, total: undefined, total_pages: undefined});
    });

    // Reset ---------------------------------------------------------------------
    test("reset resets to default values", function() {
        var c = new Viking.Cursor({page: 21, offset: 23, per_page: 40, total: 1000, total_pages: 30});
    
        c.reset()
        deepEqual(c.attributes, {page: 1, offset: 0, per_page: 40, total: undefined, total_pages: undefined});
    });

    test("reset doesn't change per_page", function() {
        var c = new Viking.Cursor({per_page: 60});
    
        c.reset()
        equal(60, c.get('per_page'));
    });

    test("reset triggers a reset event", function() {
        expect(1);
    
        var c = new Viking.Cursor({page: 2});
        c.on('reset', function() { ok(true); });
        c.reset();
        c.off('reset')
    });

    test("reset doesnt trigger a change event", function() {
        expect(0);
    
        var c = new Viking.Cursor({page: 2});
        c.on('change', function() { ok(true); });
        c.reset({silent: true});
        c.off('change');
    });

    test("reset doesnt triggers a reset event when options.silent", function() {
        expect(0);
    
        var c = new Viking.Cursor();
        c.on('reset', function() { ok(true); });
        c.reset({silent: true});
        c.off('reset');
    });

    test("reset doesn't trigger a reset event if !requiresRefresh()", function() {
        expect(0);
    
        var c = new Viking.Cursor();
        c.on('reset', function() { ok(true); });
        c.reset();
        c.off('reset');
    });

    test("reset options get passed to callbacks", function() {
        expect(1);

        var c = new Viking.Cursor({page: 2});
        c.on('reset', function(model, options) { deepEqual({remove: false}, options); });
        c.reset({remove: false});
        c.off('reset');
    });

    // incrementPage -------------------------------------------------------------
    test("incrementPage increments page by 1", function() {
        var c = new Viking.Cursor();
        equal(c.get('page'), 1);
        c.incrementPage();
        equal(c.get('page'), 2);
    });

    test("incrementPage options get passed to callbacks", function() {
        expect(2);

        var c = new Viking.Cursor();
        c.on('change', function(model, options) { deepEqual({remove: false}, options); });
        c.on('change:page', function(model, value, options) { deepEqual({remove: false}, options); });
        c.incrementPage({remove: false});
        c.off('change');
        c.off('change:page');
    });

    // decrementPage -------------------------------------------------------------
    test("decrementPage decrements page by 1", function() {
        var c = new Viking.Cursor({page: 2});
        equal(c.get('page'), 2);
        c.decrementPage();
        equal(c.get('page'), 1);
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

    // goToPage ------------------------------------------------------------------
    test("goToPage changes page to given pageNumber", function() {
        var c = new Viking.Cursor({page: 1});
        equal(c.get('page'), 1);
        c.goToPage(12);
        equal(c.get('page'), 12);
    });

    // requiresRefresh -----------------------------------------------------------
    test("requiresRefresh returns true if page changes", function() {
        var c = new Viking.Cursor({page: 1});
        c.set('page', 2);
        ok(c.requiresRefresh());
    });

    test("requiresRefresh returns true if offset changes", function() {
        var c = new Viking.Cursor({page: 1});
        c.set('offset', 2);
        ok(c.requiresRefresh());
    });

    test("requiresRefresh returns true if per_page changes", function() {
        var c = new Viking.Cursor({page: 1});
        c.set('per_page', 2);
        ok(c.requiresRefresh());
    });

    test("requiresRefresh returns false if neither page, offset, or per_page have changed", function() {
        var c = new Viking.Cursor();
        c.set('total_pages', 2);
        ok(!c.requiresRefresh());
    });

}());