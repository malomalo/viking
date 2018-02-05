import * as Backbone from 'backbone';
import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../../viking';


let oldFetch: any;

module('Viking.Collection#order', {
    beforeEach: function () {
        oldFetch = Viking.Collection.prototype.fetch;
        Viking.Collection.prototype.fetch = function () { }
    },
    afterEach: function () {
        Viking.Collection.prototype.fetch = oldFetch;
    }
}, () => {

    test("order(string) sets ordering on collection", function() {
        var vc = new Viking.Collection();
    
        vc.order('size');
    
        assert.deepEqual(vc.ordering, [{size: 'asc'}]);
    });

    test("order([string]) sets ordering on collection", function() {
        var vc = new Viking.Collection();
    
        vc.order(['size']);
    
        assert.deepEqual(vc.ordering, [{size: 'asc'}]);
    });

    test("order([string, string]) sets ordering on collection", function() {
        var vc = new Viking.Collection();
    
        vc.order(['size', 'id']);
    
        assert.deepEqual(vc.ordering, [{size: 'asc'}, {id: 'asc'}]);
    });


    test("order({key: direction}) sets ordering on collection", function() {
        var vc = new Viking.Collection();
    
        vc.order({updated_at: 'asc'});
        assert.deepEqual(vc.ordering, [{updated_at: 'asc'}]);
    
        vc.order({updated_at: 'desc'});
        assert.deepEqual(vc.ordering, [{updated_at: 'desc'}]);
    });

    test("order([{key: direction}]) sets ordering on collection", function() {
        var vc = new Viking.Collection();
    
        vc.order([{updated_at: 'asc'}]);
        assert.deepEqual(vc.ordering, [{updated_at: 'asc'}]);
    
        vc.order([{updated_at: 'desc'}]);
        assert.deepEqual(vc.ordering, [{updated_at: 'desc'}]);
    });

    test("order([{key: direction}, {key: direction}]) sets ordering on collection", function() {
        var vc = new Viking.Collection();
    
        vc.order([{updated_at: 'asc'}, {size: 'desc'}]);
    
        assert.deepEqual(vc.ordering, [{updated_at: 'asc'}, {size: 'desc'}]);
    });

    test("order(null) unsets ordering on collection", function() {
        var vc = new Viking.Collection();
    
        vc.order(null);
    
        assert.deepEqual(vc.ordering, undefined);
    });

    test("order(...) calls orderChanged", function() {
        var vc = new Viking.Collection();
        var oldOrder = Viking.Collection.prototype.orderChanged;
        Viking.Collection.prototype.orderChanged = function () {
            assert.ok(true);
        }

        vc.order('size');

        Viking.Collection.prototype.orderChanged = oldOrder;
    });

    test("order(...) and not changing the order doesn't call orderChanged", function() {
        var vc = new Viking.Collection(null, {order: 'size'});
        var oldOrder = Viking.Collection.prototype.orderChanged;
        Viking.Collection.prototype.orderChanged = function () {
            assert.ok(false);
        }

        vc.order('size');

        Viking.Collection.prototype.orderChanged = oldOrder;
        assert.ok(true);
    });

    test("order(ORDER, {silent: true}) doesn't call orderChanged", function() {
        var vc = new Viking.Collection();
        var oldOrder = Viking.Collection.prototype.orderChanged;
        Viking.Collection.prototype.orderChanged = function () {
            assert.ok(false);
        }

        vc.order('size', {silent: true});

        Viking.Collection.prototype.orderChanged = oldOrder;
        assert.ok(true)
    });
});