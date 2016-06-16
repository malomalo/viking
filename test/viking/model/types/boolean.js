import Viking from '../../../../src/viking';

(function() {
    module("Viking.Model.Type.Boolean");

    test("::load coerces the string 'true' to true", function() {
        strictEqual(
            Viking.Model.Type.Boolean.load("true"),
            true
        );
    });

    test("::load coerces the string 'false' to false", function() {
        strictEqual(
            Viking.Model.Type.Boolean.load("false"),
            false
        );
    });

    test("::load coerces true to true", function() {
        strictEqual(
            Viking.Model.Type.Boolean.load(true),
            true
        );
    });

    test("::load coerces false to false", function() {
        strictEqual(
            Viking.Model.Type.Boolean.load(false),
            false
        );
    });

    test("::dump true", function() {
        strictEqual(
            Viking.Model.Type.Boolean.dump(true),
            true
        );
    });

    test("::dump false", function() {
        strictEqual(
            Viking.Model.Type.Boolean.dump(false),
            false
        );
    });
}());