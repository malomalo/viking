(function () {
    module("Viking.Model.Type.Number");

    test("::load coerces number to number", function() {
        equal(Viking.Model.Type.Number.load(10),     10);
        equal(Viking.Model.Type.Number.load(10.5),   10.5);
    });

    test("::load coerces string to number", function() {
        equal(Viking.Model.Type.Number.load('10'),   10);
        equal(Viking.Model.Type.Number.load('10.5'), 10.5);
    });

    test("::load coerces empty string to null", function() {
        equal(Viking.Model.Type.Number.load(' '),   	null);
        equal(Viking.Model.Type.Number.load(''), 	null);
    });

    test("::dump coerces number to number", function() {
        equal(Viking.Model.Type.Number.dump(10),     10);
        equal(Viking.Model.Type.Number.dump(10.5),   10.5);
    });

    test("::dump coerces null to null", function() {
        equal(Viking.Model.Type.Number.dump(null),   null);
        equal(Viking.Model.Type.Number.dump(null), null);
    });
}());