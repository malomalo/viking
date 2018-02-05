import * as Backbone from 'backbone';
import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../../../viking';

let xhr: any;
let requests: any[] = [];

module('Viking.Model::find', {
    beforeEach: function() {
        requests = [];
        xhr = sinon.useFakeXMLHttpRequest();
        xhr.onCreate = (xhr: any) => requests.push(xhr);
    },
    afterEach: function() {
        xhr.restore();
    }
}, () => {

    test("::find returns an new model", function() {
        var Model = Viking.Model.extend('model');
				
        var m = Model.find(12);
        assert.ok(m instanceof Model);
    });
		
    test("::find sends get request to correct url", function() {
        var Model = Viking.Model.extend('model');
				
        Model.find(12);
        assert.equal(requests[0].method, 'GET');
        assert.equal(requests[0].url, '/models/12');
    });
		
    test("::find triggers success callback", async () => {
        await new Promise((resolve) => {
				
            var Model = Viking.Model.extend('model');
            Model.find(12, {
                success: function(m) {
                    assert.equal(m.get('name'), "Viking");
                    resolve();
                }
            });
            requests[0].respond(200, '[]', '{"id": 12, "name": "Viking"}');
        });
    });
		
    test("::find triggers error callback", async () => {
        await new Promise((resolve) => {
				
            var Model = Viking.Model.extend('model');
            Model.find(12, {
                error: function(m) {
                    assert.ok(true);
                    resolve();
                }
            });
            requests[0].respond(500, '[]', 'Server Error!');
        });
    });
});