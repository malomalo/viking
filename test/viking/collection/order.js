module("Viking.Collection#order");

test("order(string) sets ordering on collection", function() {
    var vc = new Viking.Collection();
    
    vc.order('size');
    
    deepEqual(vc.ordering, [{size: 'asc'}]);
});

test("order([string]) sets ordering on collection", function() {
    var vc = new Viking.Collection();
    
    vc.order(['size']);
    
    deepEqual(vc.ordering, [{size: 'asc'}]);
});

test("order([string, string]) sets ordering on collection", function() {
    var vc = new Viking.Collection();
    
    vc.order(['size', 'id']);
    
    deepEqual(vc.ordering, [{size: 'asc'}, {id: 'asc'}]);
});


test("order({key: direction}) sets ordering on collection", function() {
    var vc = new Viking.Collection();
    
    vc.order({updated_at: 'asc'});
    deepEqual(vc.ordering, [{updated_at: 'asc'}]);
    
    vc.order({updated_at: 'desc'});
    deepEqual(vc.ordering, [{updated_at: 'desc'}]);
});

test("order([{key: direction}]) sets ordering on collection", function() {
    var vc = new Viking.Collection();
    
    vc.order([{updated_at: 'asc'}]);
    deepEqual(vc.ordering, [{updated_at: 'asc'}]);
    
    vc.order([{updated_at: 'desc'}]);
    deepEqual(vc.ordering, [{updated_at: 'desc'}]);
});

test("order([{key: direction}, {key: direction}]) sets ordering on collection", function() {
    var vc = new Viking.Collection();
    
    vc.order([{updated_at: 'asc'}, {size: 'desc'}]);
    
    deepEqual(vc.ordering, [{updated_at: 'asc'}, {size: 'desc'}]);
});

test("order(null) unsets ordering on collection", function() {
    var vc = new Viking.Collection();
    
    vc.order(null);
    
    deepEqual(vc.ordering, undefined);
});

test("order(...) calls orderChanged", function () {
    expect(1);
    
    var vc = new Viking.Collection();
    var oldOrder = Viking.Collection.prototype.orderChanged;
    Viking.Collection.prototype.orderChanged = function () {
        ok(true);
    }
    
    vc.order('size');
    
    Viking.Collection.prototype.orderChanged = oldOrder;
});

test("order(...) and not changing the order doesn't call orderChanged", function () {
    expect(0);
    
    var vc = new Viking.Collection(null, {order: 'size'});
    var oldOrder = Viking.Collection.prototype.orderChanged;
    Viking.Collection.prototype.orderChanged = function () {
        ok(true);
    }
    
    vc.order('size');
    
    Viking.Collection.prototype.orderChanged = oldOrder;
});

test("order(ORDER, {silent: true}) doesn't call orderChanged", function () {
    expect(0);
    
    var vc = new Viking.Collection();
    var oldOrder = Viking.Collection.prototype.orderChanged;
    Viking.Collection.prototype.orderChanged = function () {
        ok(true);
    }
    
    vc.order('size', {silent: true});
    
    Viking.Collection.prototype.orderChanged = oldOrder;
});