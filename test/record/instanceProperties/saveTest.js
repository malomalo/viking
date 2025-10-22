import assert from 'assert';
import VikingRecord from 'viking/record';

describe('Viking.Record#save', () => {
    
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
    
    describe("saving a new record", () => {
        it("sends post request", function (done) {
            let a = new Model({ integer: 1, string: 'hello', boolean: true });
            
            assert.ok(a.isNewRecord())
            a.save().then(() => {
                assert.ok(!a.isNewRecord())
            }).then(done, done);
        
            this.withRequest('POST', '/models', { body: {
                model: { integer: 1, string: 'hello', boolean: true }
            }}, (xhr) => {
                xhr.respond(201, {}, '{"integer": 1, "string": "hello", "boolean": true}');
            });
        });

        it('sets attributes returned from the server', function(done) {
            let a = new Model({ integer: 1, string: 'hello', boolean: true });
            
            assert.ok(a.isNewRecord())
            a.save().then(() => {
                assert.ok(!a.isNewRecord())
                assert.equal(a.integer, 2);
                assert.equal(a.string, 'bye');
                assert.equal(a.boolean, false);
            }).then(done, done);
        
            this.withRequest('POST', '/models', { body: {
                model: { integer: 1, string: 'hello', boolean: true }
            }}, (xhr) => {
                xhr.respond(201, {}, '{"integer": 2, "string": "bye", "boolean": false}');
            });
        });
        
        it("sends post request with namespace", function (done) {
            let a = new Submodel({ key: 99 });
            
            assert.ok(a.isNewRecord())
            a.save().then(() => {
                assert.ok(!a.isNewRecord())
            }).then(done, done);
        
            this.withRequest('POST', '/model/submodels', { body: {
                model_submodel: { key: 99 }
            }}, (xhr) => {
                xhr.respond(201, {}, '{"key": 99}');
            });
        });

    });
    
    describe("saving a persisted record", () => {
        it("sends request when changed to falsy values", function (done) {
            let model = Model.instantiate({ id: 99, integer: 1, string: 'hello', boolean: true })
        
            model.setAttributes({integer: 0, boolean: false, string: ''})
        
            model.save().then(() => {
                assert.ok(!model.isNewRecord())
            }).then(done, done);
        
            this.withRequest('PUT', '/models/99', { body: {
                model: { integer: 0, boolean: false, string: '' }
            }}, (xhr) => {
                xhr.respond(201, {}, '{"id": 99, "integer": 0, "string": "hello", "boolean": false}');
            });
        });
        
        it('sets attributes returned from the server', function(done) {
            let model = Model.instantiate({ id: 99, integer: 1, string: 'hello', boolean: true })
            
            model.setAttributes({integer: 0, boolean: false, string: ''})
            
            model.save().then(() => {
                assert.ok(!model.isNewRecord())
                assert.equal(model.id, 96);
                assert.equal(model.integer, 3);
                assert.equal(model.string, 'bye');
                assert.equal(model.boolean, true);
            }).then(done, done);
        
            this.withRequest('PUT', '/models/99', { body: {
                model: { integer: 0, boolean: false, string: '' }
            }}, (xhr) => {
                xhr.respond(201, {}, '{"id": 96, "integer": 3, "string": "bye", "boolean": true}');
            });
        });
    });

});