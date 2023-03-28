import * as assert from 'assert';
import JSONType from '@malomalo/viking/record/types/json';

describe('Viking.Record.Types', () => {
    describe('JSON', () => {

        it("::load coerces {} to Viking.Record", () => {
            assert.deepEqual(JSONType.load({}), {});
            assert.deepEqual(JSONType.load({key: 'value'}), {key: 'value'});
        });

        // it("::load coerces {} to Viking.Model with modelName set to key", function() {
        //     assert.equal(JSONType.load({}, 'key').modelName.name, 'Key');
        // });
        
        // it("::load coerces {} to Viking.Model with baseModel set to the JSON object", function() {
        //     var attribute = JSONType.load({}, 'key');
        //     assert.strictEqual(attribute.baseModel, attribute);
        // });
    
        it("::load thows error when can't coerce value", function() {
            assert.throws(() => { JSONType.load(true); }, TypeError);
    
            try {
                JSONType.load(true)
            } catch (e) {
                assert.equal(e.message, "boolean can't be coerced into JSON");
            }
        });
        
        // it("::load doesn't use the type key for STI", function () {
        //     assert.deepEqual(JSONType.load({type: 'my_value'}).attributes, {type: 'my_value'});
        // });
    
        // it("::dump calls toJSON() on model", function() {
        //     var model = new Viking.Model({
        //         foo: 'bar'
        //     });
    
        //     assert.deepEqual(JSONType.dump(model), {
        //         foo: 'bar'
        //     });
        // });
    
        // it("::dump calls toJSON() with object", function() {
        //     var model = {foo: 'bar'};
    
        //     assert.deepEqual(JSONType.dump(model), { foo: 'bar' });
        // });
        
        // tesitt("::load nested objects", function () {
        //     const Datum = Viking.Model.extend({
        //         schema: {
        //             datum: {type: 'json'}
        //         }
        //     });
        //     const DatumCollection = Viking.Collection.extend({model: Datum});
        //     const Property = Viking.Model.extend({
        //         hasMany: [
        //             ['data', {model: Datum}]
        //         ]
        //     });
        //     Viking.context['Datum'] = Datum;
        //     Viking.context['DatumCollection'] = DatumCollection;
            
        //     var property = new Property({
        //         data: [{
        //             datum: {
        //                 a: {
        //                     b: 1
        //                 }
        //             }
        //         }]
        //     })
            
        //     assert.equal(1, property.get('data').first().get('datum').get('a').get('b'));
            
        //     property.set('data', [{
        //         datum: {
        //             a: {
        //                 b: 1
        //             }
        //         }
        //     }])
        //     assert.equal(1, property.get('data').first().get('datum').get('a').get('b'));
        // })

    });
});