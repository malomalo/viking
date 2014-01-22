module("Viking.Collection#order");

test("(string) sets ordering on collection", function() {
    var vc = new Viking.Collection();

	vc.order('size');
    
	deepEqual(vc.ordering, [{size: 'asc'}]);
});

test("([string]) sets ordering on collection", function() {
    var vc = new Viking.Collection();

	vc.order(['size']);
    
	deepEqual(vc.ordering, [{size: 'asc'}]);
});

test("(string, string) sets ordering on collection", function() {
    var vc = new Viking.Collection();

	vc.order('size', 'id');
    
	deepEqual([{size: 'asc'}, {id: 'asc'}], vc.ordering);
});

test("([string, string]) sets ordering on collection", function() {
    var vc = new Viking.Collection();

	vc.order(['size', 'id']);
    
	deepEqual(vc.ordering, [{size: 'asc'}, {id: 'asc'}]);
});


test("(object) sets ordering on collection", function() {
    var vc = new Viking.Collection();

	vc.order({updated_at: 'asc'});
    deepEqual(vc.ordering, [{updated_at: 'asc'}]);
	
	vc.order({updated_at: 'desc'});
    deepEqual(vc.ordering, [{updated_at: 'desc'}]);
});

test("([object]) sets ordering on collection", function() {
    var vc = new Viking.Collection();

	vc.order([{updated_at: 'asc'}]);
    deepEqual(vc.ordering, [{updated_at: 'asc'}]);
	
	vc.order([{updated_at: 'desc'}]);
    deepEqual(vc.ordering, [{updated_at: 'desc'}]);
});

test("(object, object) sets ordering on collection", function() {
    var vc = new Viking.Collection();

	vc.order({updated_at: 'asc'}, {size: 'desc'});
    
	deepEqual(vc.ordering, [{updated_at: 'asc'}, {size: 'desc'}]);
});

test("([object, object]) sets ordering on collection", function() {
    var vc = new Viking.Collection();

	vc.order([{updated_at: 'asc'}, {size: 'desc'}]);
    
	deepEqual(vc.ordering, [{updated_at: 'asc'}, {size: 'desc'}]);
});

test("(null) unsets ordering on collection", function() {
    var vc = new Viking.Collection();

	vc.order(null);
    
	deepEqual(vc.ordering, null);
});
