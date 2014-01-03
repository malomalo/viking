(function () {
    module("Viking.Coercions.Boolean");

    test("::load coerces the string 'true' to true", function() {
        strictEqual(
            Viking.Coercions.Boolean.load("true"),
            true
        );
    });
    
    test("::load coerces the string 'false' to false", function() {
        strictEqual(
            Viking.Coercions.Boolean.load("false"),
            false
        );
    });
    
    test("::load coerces true to true", function() {
        strictEqual(
            Viking.Coercions.Boolean.load(true),
            true
        );
    });
    
    test("::load coerces false to false", function() {
        strictEqual(
            Viking.Coercions.Boolean.load(false),
            false
        );
    });
    
    test("::dump true", function() {
        strictEqual(
            Viking.Coercions.Boolean.dump(true),
            true
        );
    });
    
    test("::dump false", function() {
        strictEqual(
            Viking.Coercions.Boolean.dump(false),
            false
        );
    });
    
}());