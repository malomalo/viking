module("Viking.Filter");

test("parameterize", function() {
    var f = new Viking.Filter({query: 'query'});
    
    deepEqual(f.parameters(), {query: 'query'});
});

test("parameterize doesn't include falsey values", function() {
    var f = new Viking.Filter({query: null});
    
    deepEqual(f.parameters(), {});
});

test("parameterize doesn't include empty strings", function() {
    var f = new Viking.Filter({query: ''});
    
    deepEqual(f.parameters(), {});
});

test("parameterize doesn't include empty arrays", function() {
    var f = new Viking.Filter({types: []});
    
    deepEqual(f.parameters(), {});
});