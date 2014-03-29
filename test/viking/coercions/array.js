(function () {
    module("Viking.Coercions.Array");

    test("::load coerces [] to []", function() {
        ok(_.isArray(Viking.Coercions.Array.load([])));

        deepEqual(Viking.Coercions.Array.load([]), []);
        deepEqual(Viking.Coercions.Array.load([1, 2]), [1, 2]);
    });

    test("::load throws error when can't coerce value", function() {
        expect(2);

        throws(function() { Viking.Coercions.Array.load(true); }, TypeError);

        try {
            Viking.Coercions.Array.load(true)
        } catch (e) {
            equal(e.message, "boolean can't be coerced into Array");
        }
    });

    test("::dump coerces [] to []", function() {
        var array = [1, 2];

        deepEqual(Viking.Coercions.Array.dump(array), [1, 2]);
    });

}());