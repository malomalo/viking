import 'mocha';
import assert from 'assert';
import JSONType from 'viking/record/types/json';
import Record from 'viking/record';

describe('Viking.Record.Types', () => {
    describe('JSON', () => {
        class Actor extends Record {
            static schema = {
                preferences: {type: "json", default: {}}
            }
        }
        
        it("coerces {} to Viking.Record", () => {
            let model = new Actor({preferences: {}})
            assert.deepEqual(model.preferences, {});
            
            model = new Actor({preferences: {key: 'value'}})
            assert.deepEqual(model.preferences, {key: 'value'});
        });
        
        it("null", () => {
            let model = new Actor({preferences: null})
            assert.equal(model.preferences, null);
            
            model = new Actor({preferences: {green_room: null}})
            assert.deepEqual(model.preferences, {green_room: null});
        });
    
        it("thows error when can't coerce value", function() {
            assert.throws(() => { new Actor({preferences: true}) }, TypeError);
    
            try {
                new Actor({preferences: true})
            } catch (e) {
                assert.equal(e.message, "boolean can't be coerced into JSON");
            }
        });
        
        // it("::load coerces {} to Viking.Model with modelName set to key", function() {
        //     assert.equal(JSONType.load({}, 'key').modelName.name, 'Key');
        // });
        
        // it("::load coerces {} to Viking.Model with baseModel set to the JSON object", function() {
        //     var attribute = JSONType.load({}, 'key');
        //     assert.strictEqual(attribute.baseModel, attribute);
        // });
        
        describe("changes", () => {

            it("first level key", () => {
                let model = new Actor({preferences: {fruit: 'apple', water: 'still'}}).persist()

                model.preferences.fruit = 'orange'
                assert.deepEqual(model.changes(), {
                    preferences: [
                        {fruit: 'apple', water: 'still'},
                        {fruit: 'orange', water: 'still'}
                    ]
                });

                model.preferences.fruit = 'apple'
                assert.deepEqual(model.changes(), {});
            })
            
            it("low level key", () => {
                const model = new Actor({preferences: {fruit: {green_room: 'apple'}, water: 'still'}}).persist()

                model.preferences.fruit.green_room = 'orange'
                assert.deepEqual(model.changes(), {
                    preferences: [
                        {fruit: {green_room: 'apple'}, water: 'still'},
                        {fruit: {green_room: 'orange'}, water: 'still'}
                    ]
                });

                model.preferences.fruit.green_room = 'apple'
                assert.deepEqual(model.changes(), {});
            })
  
            it("array", () => {
                let model = new Actor({preferences: {fruit: 'apple', agents: ["Rod", "Jerry"]}}).persist()

                model.preferences.agents = ["Rod", "Jerry", "Kim"]
                assert.deepEqual(model.changes(), {
                    preferences: [
                        {fruit: 'apple', agents: ["Rod", "Jerry"]},
                        {fruit: 'apple', agents: ["Rod", "Jerry", "Kim"]}
                    ]
                });

                model.preferences.agents = ["Rod", "Jerry"]
                assert.deepEqual(model.changes(), {});

                model = new Actor({preferences: {
                    agents: [{
                        name: "Jerry",
                        region: "CA"
                    }, {
                        name: "Rod",
                        region: "TX"
                    }]
                }}).persist()

                const agent = model.preferences.agents.find(x => x.name == "Jerry")
                agent.region = "CA,WA"

                assert.deepEqual(model.changes(), {
                    preferences: [
                        {
                            agents: [{
                                name: "Jerry",
                                region: "CA"
                            }, {
                                name: "Rod",
                                region: "TX"
                            }]
                        },{
                            agents: [{
                                name: "Jerry",
                                region: "CA,WA"
                            }, {
                                name: "Rod",
                                region: "TX"
                            }]
                        }
                    ]
                });

                agent.region = "CA"
                assert.deepEqual(model.changes(), {});
            })
  //
  //           it("array.push")
  //
  //           it("array.remove")
        })
        
        describe('clone', () => {
            it('initiates new references', () => {
                let model = new Actor({preferences: {fruit: 'apple', water: 'still'}}).persist()
                let clone = model.clone()
                
                clone.preferences.fruit = 'orange'
                assert.equal(model.preferences.fruit, 'apple')
                
                model = new Actor({preferences: {fruit: {green_room: 'apple'}, water: 'still'}}).persist()
                clone = model.clone()
                clone.preferences.fruit.green_room = 'orange'
                assert.equal(model.preferences.fruit.green_room, 'apple')
            })
        })
        
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