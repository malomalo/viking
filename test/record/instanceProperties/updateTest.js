import 'mocha';
import * as assert from 'assert';
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
    
    class Submodel extends VikingRecord {
        static namespace = 'Model';
        static schema = {
            id:         {type: 'integer'},
            key:        {type: 'integer'},
        }
    }
    
    describe("updating a new record", () => {
        it("sends post request", function (done) {
            let a = new Model({ string: 'hello' });
            
            assert.ok(a.isNewRecord())
            a.update({string: 'world'}).then(() => {
                assert.equal(a.string, 'world')
                assert.ok(!a.isNewRecord())
            }).then(done, done);
        
            this.withRequest('POST', '/models', { body: {
                model: { string: 'world' }
            }}, (xhr) => {
                xhr.respond(201, {}, '{"integer": 1, "string": "world"}');
            });
        });
        
        it("sends only explicitly stated attributes", function (done) {
            let a = new Model({ string: 'hello', integer: 1 });
            
            assert.ok(a.isNewRecord())
            a.update({string: 'world'}).then(() => {
                assert.equal(a.string, 'world')
                assert.ok(!a.isNewRecord())
            }).then(done, done);
        
            this.withRequest('POST', '/models', { body: {
                model: { string: 'world' }
            }}, (xhr) => {
                xhr.respond(201, {}, '{"integer": 1, "string": "world"}');
            });
        });

        it('sets attributes returned from the server', function(done) {
            let a = new Model({ string: 'hello' });
            
            assert.ok(a.isNewRecord())
            a.update({string: 'world'}).then(() => {
                assert.ok(!a.isNewRecord())
                assert.equal(a.integer, 1);
                assert.equal(a.string, 'bye');
                assert.equal(a.boolean, false);
            }).then(done, done);
        
            this.withRequest('POST', '/models', { body: {
                model: { string: 'world' }
            }}, (xhr) => {
                xhr.respond(201, {}, '{"integer": 1, "string": "bye", "boolean": false}');
            });
        });
        
        it('sets existing value', function(done) {
            let a = new Model({ string: 'hello' });
            
            assert.ok(a.isNewRecord())
            a.update({string: 'hello'}).then(() => {
                assert.ok(!a.isNewRecord())
            }).then(done, done);
        
            this.withRequest('POST', '/models', { body: {
                model: { string: 'hello' }
            }}, (xhr) => {
                xhr.respond(201, {}, '{"string": "hello"}');
            });
        });
        
        it('updates record changes', function(done) {
            let a = new Model({ integer: 1, string: 'hello', boolean: true });
            
            assert.ok(a.isNewRecord())
            a.update({string: 'world'}).then(() => {
                assert.ok(!a.isNewRecord())
                assert.deepEqual(a.changes(), {
                    boolean: [false, true],
                    integer: [2, 1]
                })
            }).then(done, done);
        
            this.withRequest('POST', '/models', { body: {
                model: { string: 'world' }
            }}, (xhr) => {
                xhr.respond(201, {}, '{"integer": 2, "string": "world", "boolean": false}');
            });
        });
        
        it("sends post request with namespace", function (done) {
            let a = new Submodel({ });
            
            assert.ok(a.isNewRecord())
            a.update({key: 99}).then(() => {
                assert.ok(!a.isNewRecord())
                assert.equal(a.key, 99);
                assert.equal(a.id, 929);
            }).then(done, done);
        
            this.withRequest('POST', '/model/submodels', { body: {
                model_submodel: { key: 99 }
            }}, (xhr) => {
                xhr.respond(201, {}, '{"key": 99, "id": 929}');
            });
        });

    });
    
    describe("saving a persisted record", () => {
        it("sends request when changed to falsy values", function (done) {
            let model = Model.instantiate({ id: 99, integer: 1, string: 'world', boolean: true })
        
            model.update({integer: 0, boolean: false}).then(() => {
                assert.ok(!model.isNewRecord())
                assert.ok(!model.boolean)
                assert.equal(model.integer, 0)
                assert.deepEqual(model.changes(), {})
            }).then(done, done);
        
            this.withRequest('PUT', '/models/99', { body: {
                model: { integer: 0, boolean: false }
            }}, (xhr) => {
                xhr.respond(201, {}, '{"id": 99, "integer": 0, "string": "world", "boolean": false}');
            });
        });
        
        it('sets attributes returned from the server', function(done) {
            let model = Model.instantiate({ id: 99, integer: 1, string: 'hello', boolean: true })
            
            model.update({string: 'world'}).then(() => {
                assert.ok(!model.isNewRecord())
                assert.equal(model.integer, 3);
                assert.equal(model.string, 'bye');
                assert.equal(model.boolean, false);
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
            
            model.update({integer: 11}).then(() => {
                assert.ok(!model.isNewRecord())
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
        
        it('does nothing if no changes', function () {
            let model = Model.instantiate({ id: 99, integer: 1, string: 'world', boolean: true })
            
            model.update({string: 'world'})
            assert.notRequested.bind(this)('PUT', '/models/99') // TODO do with out 'bind'
        })
    });
});