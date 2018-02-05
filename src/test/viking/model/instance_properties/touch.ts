import * as Backbone from 'backbone';
import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../../../viking';

let xhr: any;
let clock: any;
let requests: any[] = [];

module('Viking.Model#touch', {
    beforeEach: function() {
        clock = sinon.useFakeTimers();

        requests = [];
        xhr = sinon.useFakeXMLHttpRequest();
        xhr.onCreate = (xhr: any) => requests.push(xhr);
    },
    afterEach: function() {
        clock.restore();
        xhr.restore();
    }
}, () => {
    test("sends a PUT request to /models/:id/touch", function() {
        var Model = Viking.Model.extend('model');
    
        var m = new Model({id: 2, foo: 'bar'});
        m.touch();
        assert.equal(requests[0].method, 'PATCH');
        assert.equal(requests[0].url, '/models/2');
        assert.deepEqual(JSON.parse(requests[0].requestBody), {
            model: {updated_at: (new Date()).toISOString()}
        });
    });
    
    test("sends an empty body", function() {
        var Model = Viking.Model.extend('model');
    
        var m = new Model({id: 2, foo: 'bar'});
        m.touch();
        assert.deepEqual(JSON.parse(requests[0].requestBody), {
            model: {updated_at: (new Date()).toISOString()}
        });
    });
    
    test("sends the name of the column to be touched if specified", function() {
        var Model = Viking.Model.extend('model');
    
        var m = new Model({id: 2, foo: 'bar'});
        m.touch('read_at');
        assert.deepEqual(JSON.parse(requests[0].requestBody), {
            model: {
                read_at: (new Date()).toISOString(),
                updated_at: (new Date()).toISOString()
            }
        });

    });
    
    test("updates the attributes from the response", function() {
        var Model = Viking.Model.extend('model', { schema: {
            updated_at: {type: 'date'},
            read_at: {type: 'date'}
        } });
    
        var m = new Model({id: 2, updated_at: null, read_at: null});
        
        assert.equal(m.get('updated_at'), null);
        m.touch();
        requests[0].respond(200, '[]', JSON.stringify({updated_at: "2013-04-10T21:24:28+00:00"}));
        assert.equal(m.get('updated_at').valueOf(), 1365629068000);
        
        assert.equal(m.get('read_at'), null);
        m.touch('read_at');
        requests[1].respond(200, '[]', JSON.stringify({read_at: "2013-04-10T21:24:28+00:00"}));
        assert.equal(m.get('read_at').valueOf(), 1365629068000);
    });    

});