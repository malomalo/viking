import 'mocha';
import * as assert from 'assert';
import VikingRecord from 'viking/record';

describe('Viking.Record#save', () => {
    class Model extends VikingRecord {
        static schema = {
            key:        {type: 'integer', array: true},
            date:       {type: 'date'},
            datetime:       {type: 'datetime'},
            float:      {type: 'float'},
            integer:    {type: 'integer'},
            string:     {type: 'string'},
            boolean:    {type: 'boolean'},
            unkown:     {type: 'anUnkownType'}
        };
    }
    it("sends post request", function (done) {
        let a = new Model({
            integer: 1,
            string: 'hello',
            boolean: true
        });
        
        assert.ok(a.isNewRecord())
        a.save().then(() => {
            assert.ok(!a.isNewRecord())
        }).then(done, done);
        
        this.withRequest('POST', '/models', { body: {
            model: {
                integer: 1,
                string: 'hello',
                boolean: true
            }
        }}, (xhr) => {
            xhr.respond(201, {}, '{"integer": 0, "string": "hello", "boolean": false}');
        });
    });
    
    it("sends request when changed to falsy values", function (done) {
        let model = Model.instantiate({
            id: 99,
            integer: 1,
            string: 'hello',
            boolean: true
        })
        
        model.setAttributes({integer: 0, boolean: false, string: ''})
        
        model.save().then(() => {
            assert.ok(!model.isNewRecord())
        }).then(done, done);
        
        this.withRequest('PUT', '/models/99', { body: {
            model: {
                integer: 0,
                boolean: false,
                string: ''
            }
        }}, (xhr) => {
            xhr.respond(201, {}, '{"id": 99, "integer": 0, "string": "hello", "boolean": false}');
        });
    });

});