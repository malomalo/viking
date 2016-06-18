import Viking from '../../../../src/viking';

(function() {
    module("Viking.Model.Type.JSON");

    test("::load coerces {} to {}", function() {
        ok(Viking.Model.Type.JSON.load({}) instanceof Object);
        deepEqual(Viking.Model.Type.JSON.load({}), {});
        deepEqual(Viking.Model.Type.JSON.load({key: 'value'}), {key: 'value'});
    });

    test("::load coerces {} to Viking.Model with modelName set to key", function() {
        let Ship = Viking.Model.extend('ship');
        equal(Viking.Model.Type.JSON.load({}, 'ship').modelName.name, 'Ship');
        // equal(Viking.Model.Type.JSON.load([{}], 'ship')[0].modelName.name, 'Ship');
    });

    test("::load thows error when can't coerce value", function() {
        expect(2);

        throws(function() { Viking.Model.Type.JSON.load(true); }, TypeError);

        try {
            Viking.Model.Type.JSON.load(true)
        } catch (e) {
            equal(e.message, "boolean can't be coerced into JSON");
        }
    });

    test("::load doesn't use the type key for STI", function () {
        let Ship = Viking.Model.extend('ship', {
            inheritanceAttribute: false
        });
        deepEqual(Viking.Model.Type.JSON.load({type: 'my_value'}, 'ship').attributes, {type: 'my_value'});
    });

    test("::dump calls toJSON() on model", function() {
        var model = new Viking.Model({
            foo: 'bar'
        });

        deepEqual(Viking.Model.Type.JSON.dump(model), {
            foo: 'bar'
        });
    });

    test("::dump calls toJSON() with object", function() {
        let model = {foo: 'bar'};
        deepEqual(Viking.Model.Type.JSON.dump(model), { foo: 'bar' });
    });

}());
