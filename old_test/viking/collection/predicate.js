(function () {
    module("Viking.Model predicate");

    test("new Viking.Model(options) calls setPredicate(options.predicate) if in options", function() {
        expect(1);
    
        var Collection = Viking.Collection.extend({
            setPredicate: function(predicate) { equal(predicate, 'data'); }
        });
    
        var c = new Collection([], { predicate: 'data' });
    });

    test("#setPredicate sets predicate", function() {
        var vc = new Viking.Collection();
        var predicate = new Viking.Predicate();
        vc.setPredicate(predicate, {silent: true});
    
        equal(vc.predicate, predicate);
    });

    test("#setPredicate accepts a instanceof Viking.Predicate", function() {
        var predicate = new Viking.Predicate();
        var vc = new Viking.Collection();
    
        vc.setPredicate(predicate, {silent: true});
        equal(predicate, vc.predicate);
    });

    test("#setPredicate accepts attributes to construct a Viking.Predicate", function() {
        var vc = new Viking.Collection();
    
        vc.setPredicate({}, {silent: true});
        ok(vc.predicate instanceof Viking.Predicate);
    });

    test("#setPredicate removes old predicate callbacks", function() {
        expect(0);
    
        var collection = Viking.Collection.extend({
            predicateChanged: function() { ok(true); }
        })
        var predicate = new Viking.Predicate();
        var vc = new collection([], { predicate: predicate });
        vc.setPredicate(new Viking.Predicate(), {silent: true});
    
        predicate.trigger('change');
    });

    test("#setPredicate to a falsey value removes the predicate", function() {
        var collection = Viking.Collection.extend({
            predicateChanged: function() { }
        })
        var vc = new collection([], { predicate: {} });
        vc.setPredicate(null);
        equal(undefined, vc.predicate);
    });

    test("changing the predicate triggers a fetch", function() {
        expect(1);
    
        var collection = Viking.Collection.extend({
            fetch: function(options) { ok(true); }
        })
        var predicate = new Viking.Predicate();
        var vc = new collection([], { predicate: predicate });
        predicate.trigger('change');
    });

    test("#setPredicate triggers #predicateChanged when setting to a new Predicate", function() {
        expect(1);
    
        var collection = Viking.Collection.extend({
            predicateChanged: function(options) { ok(true); }
        })
        var vc = new collection();
    
        vc.setPredicate(new Viking.Predicate());
    });

    test("#setPredicate doesn't trigger #predicateChanged when setting to a the same predicate object", function() {
        expect(0);
    
        var predicate = new Viking.Predicate();
        var collection = Viking.Collection.extend({
            predicateChanged: function(options) { ok(true); }
        })
        var vc = new collection([], {predicate: predicate});
    
        vc.setPredicate(predicate);
    });

    test("#setPredicate triggers predicateChanged() when removing the predicate", function() {
        expect(1);
    
        var collection = Viking.Collection.extend({
            predicateChanged: function(options) { ok(true); }
        })
        var vc = new collection([], {predicate: {}});
    
        vc.setPredicate(null);
    });


    test("#setPredicate doesn't trigger #predicateChanged when removing and not predicate set", function() {
        expect(0);
    
        var collection = Viking.Collection.extend({
            predicateChanged: function(options) { ok(true); }
        })
        var vc = new collection([]);
    
        vc.setPredicate(null);
    });

    test("#setPredicate to predicate with options.silent = true doesn't trigger #predicateChanged", function() {
        expect(0);
    
        var collection = Viking.Collection.extend({
            predicateChanged: function(options) { ok(true); }
        })
        var vc = new collection();
    
        vc.setPredicate({}, {silent: true});
    });


    test("#setPredicate to undefined with options.silent = true doesn't trigger #predicateChanged", function() {
        expect(0);
    
        var collection = Viking.Collection.extend({
            predicateChanged: function(options) { ok(true); }
        })
        var vc = new collection([], {predicate: {}});
    
        vc.setPredicate(null, {silent: true});
    });

}());