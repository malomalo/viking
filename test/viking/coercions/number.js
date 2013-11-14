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

    test("::dump coerces number to number", function() {
        equal(Viking.Coercions.Number.dump(10),     10);
        equal(Viking.Coercions.Number.dump(10.5),   10.5);
    });

    test("::dump coerces string to number", function() {
        equal(Viking.Coercions.Number.dump('10'),   10);
        equal(Viking.Coercions.Number.dump('10.5'), 10.5);
    });
}());