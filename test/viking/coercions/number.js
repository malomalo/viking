(function () {
    module("Viking.Coercions.Number");

    test("::load coerces number to number", function() {
        equal(Viking.Coercions.Number.load(10),     10);
        equal(Viking.Coercions.Number.load(10.5),   10.5);
    });

    test("::load coerces string to number", function() {
        equal(Viking.Coercions.Number.load('10'),   10);
        equal(Viking.Coercions.Number.load('10.5'), 10.5);
    });

    test("::load coerces empty string to null", function() {
        equal(Viking.Coercions.Number.load(' '),   	null);
        equal(Viking.Coercions.Number.load(''), 	null);
    });

    test("::dump coerces number to number", function() {
        equal(Viking.Coercions.Number.dump(10),     10);
        equal(Viking.Coercions.Number.dump(10.5),   10.5);
    });

    test("::dump coerces null to null", function() {
        equal(Viking.Coercions.Number.dump(null),   null);
        equal(Viking.Coercions.Number.dump(null), null);
    });
}());