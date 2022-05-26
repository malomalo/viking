import 'mocha';
import * as assert from 'assert';
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
    
    describe("reloading a persisted record", () => {
        it("sends get request and sets the attributes returned from the server", function (done) {
            let a = Model.instantiate({ id: 5, integer: 1, string: 'hello', boolean: true });
            
            a.reload().then(() => {
                assert.equal(a.integer, 2);
                assert.equal(a.string, 'bye');
                assert.equal(a.boolean, false);
                assert.equal(a.float, 2.45);
            }).then(done, done);
        
            this.withRequest('GET', '/models/5', {}, (xhr) => {
                xhr.respond(201, {}, '{"integer": 2, "string": "bye", "boolean": false, "float": 2.45}');
            });
        });
    });

});