module("Viking.Controller");

test("instance() initializes the model", function() {
    expect(1);
    
    var c = Viking.Controller.extend({
        initialize: function() {
            ok(true);
        }
    });
    c.instance();
});

test("instance() initializes sets _instance", function() {
    var c = Viking.Controller.extend();
    ok(!c._instance);
    c.instance();
    ok(c._instance);
});

test("instance() returns the instance", function() {
    var c = Viking.Controller.extend();
    c.instance();
    equal(c._instance, c.instance());
})

test("instance(onInstantiated) doesn't call onInstantiated if instantiating the object", function() {
    expect(0);
    
    var c = Viking.Controller.extend();
    c.instance(function() { ok(true); });
});

test("instance(onInstantiated) calls onInstantiated if object already instanciated", function() {
    expect(1);
    
    var c = Viking.Controller.extend();
    c.instance();
    c.instance(function() { ok(true); });
});

test("instance(_, onInstantiation) calls onInstantiation if instantiating the object", function() {
    expect(1);
    
    var c = Viking.Controller.extend();
    c.instance(null, function() { ok(true); });
});


test("instance(_, onInstantiation) calls onInstantiation if object already instanciated", function() {
    expect(0);
    
    var c = Viking.Controller.extend();
    c.instance();
    c.instance(null, function() { ok(true); });
});