(function () {
    module("Viking.Coercions.String");

    test("::load coerces boolean to string", function() {
        equal(Viking.Coercions.String.load(true), 'true');
        equal(Viking.Coercions.String.load(false), 'false');
    });

    test("::load coerces number to string", function() {
        equal(Viking.Coercions.String.load(10), '10');
        equal(Viking.Coercions.String.load(10.5), '10.5');
    });

    test("::load coerces null to string", function() {
        equal(Viking.Coercions.String.load(null), null);
    });

    test("::load coerces undefined to string", function() {
        equal(Viking.Coercions.String.load(undefined), undefined);
    });

    test("::dump coerces boolean to string", function() {
        equal(Viking.Coercions.String.dump(true), 'true');
        equal(Viking.Coercions.String.dump(false), 'false');
    });

    test("::dump coerces number to string", function() {
        equal(Viking.Coercions.String.dump(10), '10');
        equal(Viking.Coercions.String.dump(10.5), '10.5');
    });

    test("::dump coerces null to string", function() {
        equal(Viking.Coercions.String.dump(null), null);
    });

    test("::dump coerces undefined to string", function() {
        equal(Viking.Coercions.String.dump(undefined), undefined);
    });

}());