module("Viking.Model#toParam");

test("returns null on a model without an id", function() {
    var model = new Viking.Model();
    
    equal(null, model.toParam());
});

test("returns id on a model with an id set", function() {
    var model = new Viking.Model({id: 42});
    
    equal(42, model.toParam());
});