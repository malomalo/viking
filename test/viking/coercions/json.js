(function () {
    module("Viking.Coercions.JSON");

    test("::load coerces {} to Viking.Model", function() {
        ok(Viking.Coercions.JSON.load({}) instanceof Viking.Model);

        deepEqual(Viking.Coercions.JSON.load({}).attributes, {});
        deepEqual(Viking.Coercions.JSON.load({key: 'value'}).attributes, {key: 'value'});
    });

    test("::load coerces {} to Viking.Model with modelName set to key", function() {
        equal(Viking.Coercions.JSON.load({}, 'key').modelName, 'key');
    });
    
    test("::load coerces {} to Viking.Model with baseModel set to the JSON object", function() {
        attribute = Viking.Coercions.JSON.load({}, 'key');
        
        strictEqual(attribute.baseModel, attribute);
    });

    test("::load thows error when can't coerce value", function() {
        expect(2);

        throws(function() { Viking.Coercions.JSON.load(true); }, TypeError);

        try {
            Viking.Coercions.JSON.load(true)
        } catch (e) {
            equal(e.message, "boolean can't be coerced into JSON");
        }
    });
	
	test("::load doesn't use the type key for STI", function () {
        deepEqual(Viking.Coercions.JSON.load({type: 'my_value'}).attributes, {type: 'my_value'});
	});

    test("::dump calls toJSON() on model", function() {
        var model = new Viking.Model({
            foo: 'bar'
        });

        deepEqual(Viking.Coercions.JSON.dump(model), {
            foo: 'bar'
        });
    });

    test("::dump calls toJSON() with object", function() {
        var model = {foo: 'bar'};

        deepEqual(Viking.Coercions.JSON.dump(model), { foo: 'bar' });
    });
}());