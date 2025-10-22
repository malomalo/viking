import assert from 'assert';
import * as Errors from 'viking/errors';
import VikingRecord from 'viking/record';

describe('Viking.Record#update', () => {
    
    class Model extends VikingRecord {
        static schema = {
            id:         {type: 'integer'},
            key:        {type: 'integer', array: true},
            date:       {type: 'date'},
            datetime:   {type: 'datetime'},
            float:      {type: 'float'},
            integer:    {type: 'integer'},
            string:     {type: 'string'},
            boolean:    {type: 'boolean'},
            unkown:     {type: 'anUnkownType'}
        };
    }
    
    describe("#updateAttributes()", () => {
        describe("on a new record", () => {
            it("throws an error", function () {
                let record = new Model();
            
                assert.ok(record.isNewRecord())
                assert.throws( () => record.updateAttributes({string: 'world'}), Errors.RecordError );
            });
        });
        
        describe("on a persisted record", () => {
            it("sends only the explicitly stated attributes", function (done) {
                let record = Model.instantiate({ id: 99, integer: 1, string: 'hello', boolean: true })

                record.updateAttributes({string: 'world'}).then(() => {
                    assert.equal(record.string, 'world')
                }).then(done, done);

                this.withRequest('PUT', '/models/99', { body: {
                    model: { string: 'world' }
                }}, (xhr) => {
                    xhr.respond(201, {}, '{ "id": 99, "integer": 1, "string": "world", "boolean": true }');
                });
            });

            it("sends only the explicitly stated attributes even if it is the same value", function (done) {
                let record = Model.instantiate({ id: 99, integer: 1, string: 'hello', boolean: true })

                record.updateAttributes({string: 'hello'}).then(() => {
                    assert.equal(record.string, 'hello')
                }).then(done, done);

                this.withRequest('PUT', '/models/99', { body: {
                    model: { string: 'hello' }
                }}, (xhr) => {
                    xhr.respond(201, {}, '{ "id": 99, "integer": 1, "string": "hello", "boolean": true }');
                });
            });

            it('sents attributes from the server response', function(done) {
                let record = Model.instantiate({ id: 99 })
            
                record.updateAttributes({string: 'world'}).then(() => {
                    assert.equal(record.integer, 3);
                    assert.equal(record.string, 'bye');
                    assert.equal(record.boolean, false);
                }).then(done, done);
        
                this.withRequest('PUT', '/models/99', { body: {
                    model: { string: 'world' }
                }}, (xhr) => {
                    xhr.respond(201, {}, '{"id": 99, "integer": 3, "string": "bye", "boolean": false}');
                });
            });

            it('preserves dirty attributes', function(done) {
                let model = Model.instantiate({ id: 99, integer: 1, string: 'hello', boolean: true })

                model.string = 'world'
                model.updateAttributes({integer: 11}).then(() => {
                    assert.equal(model.integer, 11);
                    assert.equal(model.boolean, false);
                    assert.equal(model.string, 'world');
                    assert.deepEqual(model.changes(), {
                        string: ['bye', 'world']
                    })
                }).then(done, done);

                this.withRequest('PUT', '/models/99', { body: {
                    model: { integer: 11}
                }}, (xhr) => {
                    xhr.respond(201, {}, '{"id": 99, "integer": 11, "string": "bye", "boolean": false}');
                });
            });

        });
        
        describe("events", () => {
            it('sync and change events fired', function (done) {
                let record = Model.instantiate({ id: 99 })
                let callbacks = [];
                
                record.addEventListener('*', (callbackName) => {
                    callbacks.push(callbackName);
                });
                
                record.updateAttributes({integer: 11}).then(() => {
                    assert.deepEqual(callbacks, ['beforeSync', 'changed:integer', "changed:string", "changed:boolean", 'changed', 'afterSync', 'afterSync:integer', "afterSync:string", "afterSync:boolean"])
                }).then(() => done(), done);
                
                this.withRequest('PUT', '/models/99', { body: {
                    model: { integer: 11}
                }}, (xhr) => {
                    xhr.respond(201, {}, '{"id": 99, "integer": 11, "string": "bye", "boolean": false}');
                });
            });
            
            it('no save events fired', function(done) {
                let record = Model.instantiate({ id: 99 })
                
                record.addEventListener('beforeSave', (record, changes) => {
                    assert.fail('no beforeSave callback expected');
                });
                record.addEventListener('afterSave', (record, changes) => {
                    assert.fail('no beforeSave callback expected');
                });
                
                record.updateAttributes({integer: 11}).then(() => done(), done);
                this.withRequest('PUT', '/models/99', { body: {
                    model: { integer: 11}
                }}, (xhr) => {
                    xhr.respond(201, {}, '{"id": 99, "integer": 11, "string": "bye", "boolean": false}');
                });
            });
            
        })
        
        describe("on a deleted record", () => {
            it("throws an error", function () {
                let record = Model.instantiate({ id: 99 })
                record._destroyed = true;
            
                assert.ok(record.destroyed())
                assert.throws( () => record.updateAttributes({string: 'world'}), Errors.RecordError );
            });

        });
    });
    
});