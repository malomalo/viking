import * as Backbone from 'backbone';
import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../../viking';

module('Viking.Model predicate', {}, () => {

    test("new Viking.Model(options) calls setPredicate(options.predicate) if in options", async () => {
        await new Promise((resolve) => {
    
            var Collection = Viking.Collection.extend({
                setPredicate: function(predicate) {
                    assert.equal(predicate, 'data');
                    resolve();
                }
            });
    
            var c = new Collection([], { predicate: 'data' });
        });
    });

    test("#setPredicate sets predicate", function() {
        var vc = new Viking.Collection();
        var predicate = new Viking.Predicate();
        vc.setPredicate(predicate, {silent: true});
    
        assert.equal(vc.predicate, predicate);
    });

    test("#setPredicate accepts a instanceof Viking.Predicate", function() {
        var predicate = new Viking.Predicate();
        var vc = new Viking.Collection();
    
        vc.setPredicate(predicate, {silent: true});
        assert.equal(predicate, vc.predicate);
    });

    test("#setPredicate accepts attributes to construct a Viking.Predicate", function() {
        var vc = new Viking.Collection();
    
        vc.setPredicate({}, {silent: true});
        assert.ok(vc.predicate instanceof Viking.Predicate);
    });

    test("#setPredicate removes old predicate callbacks", function() {
        var collection = Viking.Collection.extend({
            predicateChanged: function() { 
                assert.ok(false);
            }
        })
        var predicate = new Viking.Predicate();
        var vc = new collection([], { predicate: predicate });
        vc.setPredicate(new Viking.Predicate(), {silent: true});

        predicate.trigger('change');
        assert.ok(true);
    });

    test("#setPredicate to a falsey value removes the predicate", function() {
        var collection = Viking.Collection.extend({
            predicateChanged: function() { }
        })
        var vc = new collection([], { predicate: {} });
        vc.setPredicate(null);
        assert.equal(undefined, vc.predicate);
    });

    test("changing the predicate triggers a fetch", async () => {
        await new Promise((resolve) => {
    
            var collection = Viking.Collection.extend({
                fetch: function(options) { 
                    assert.ok(true); 
                    resolve();
                }
            })
            var predicate = new Viking.Predicate();
            var vc = new collection([], { predicate: predicate });
            predicate.trigger('change');
        });
    });

    test("#setPredicate triggers #predicateChanged when setting to a new Predicate", async () => {
        await new Promise((resolve) => {
    
            var collection = Viking.Collection.extend({
                predicateChanged: function(options) {
                    assert.ok(true);
                    resolve();
                }
            })
            var vc = new collection();
    
            vc.setPredicate(new Viking.Predicate());
        });
    });

    test("#setPredicate doesn't trigger #predicateChanged when setting to a the same predicate object", function() {
        var predicate = new Viking.Predicate();
        var collection = Viking.Collection.extend({
            predicateChanged: function(options) {
                assert.ok(false);
            }
        })
        var vc = new collection([], {predicate: predicate});

        vc.setPredicate(predicate);
        assert.ok(true);
    });

    test("#setPredicate triggers predicateChanged() when removing the predicate", async () => {
        await new Promise((resolve) => {
    
            var collection = Viking.Collection.extend({
                predicateChanged: function(options) {
                    assert.ok(true); 
                    resolve();
                }
            })
            var vc = new collection([], {predicate: {}});
    
            vc.setPredicate(null);
        });
    });


    test("#setPredicate doesn't trigger #predicateChanged when removing and not predicate set", function() {
        var collection = Viking.Collection.extend({
            predicateChanged: function(options) {
                assert.ok(false);
            }
        })
        var vc = new collection([]);

        vc.setPredicate(null);
        assert.ok(true);
    });

    test("#setPredicate to predicate with options.silent = true doesn't trigger #predicateChanged", function() {
        var collection = Viking.Collection.extend({
            predicateChanged: function(options) {
                assert.ok(false);
            }
        })
        var vc = new collection();

        vc.setPredicate({}, {silent: true});
        assert.ok(true);
    });


    test("#setPredicate to undefined with options.silent = true doesn't trigger #predicateChanged", function() {
        var collection = Viking.Collection.extend({
            predicateChanged: function(options) {
                assert.ok(true);
            }
        })
        var vc = new collection([], {predicate: {}});

        vc.setPredicate(null, {silent: true});
        assert.ok(true);
    });

});