import * as Backbone from 'backbone';
import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../../../viking';

module('Viking.Model.Type.JSON', {}, () => {

    test("::load coerces {} to Viking.Model", function() {
        assert.ok(Viking.Model.Type.JSON.load({}) instanceof Viking.Model);

        assert.deepEqual(Viking.Model.Type.JSON.load({}).attributes, {});
        assert.deepEqual(Viking.Model.Type.JSON.load({key: 'value'}).attributes, {key: 'value'});
    });

    test("::load coerces {} to Viking.Model with modelName set to key", function() {
        assert.equal(Viking.Model.Type.JSON.load({}, 'key').modelName, 'key');
    });
    
    test("::load coerces {} to Viking.Model with baseModel set to the JSON object", function() {
        var attribute = Viking.Model.Type.JSON.load({}, 'key');
        
        assert.strictEqual(attribute.baseModel, attribute);
    });

    test("::load thows error when can't coerce value", function() {
        assert.throws(function() { Viking.Model.Type.JSON.load(true); }, TypeError);

        try {
            Viking.Model.Type.JSON.load(true)
        } catch (e) {
            assert.equal(e.message, "boolean can't be coerced into JSON");
        }
    });
	
	test("::load doesn't use the type key for STI", function () {
        assert.deepEqual(Viking.Model.Type.JSON.load({type: 'my_value'}).attributes, {type: 'my_value'});
	});

    test("::dump calls toJSON() on model", function() {
        var model = new Viking.Model({
            foo: 'bar'
        });

        assert.deepEqual(Viking.Model.Type.JSON.dump(model), {
            foo: 'bar'
        });
    });

    test("::dump calls toJSON() with object", function() {
        var model = {foo: 'bar'};

        assert.deepEqual(Viking.Model.Type.JSON.dump(model), { foo: 'bar' });
    });
});