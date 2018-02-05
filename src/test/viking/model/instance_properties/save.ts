import * as Backbone from 'backbone';
import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../../../viking';

let xhr: any;
let requests: any[] = [];

module('Viking.Model#save', {
    beforeEach: function() {
        requests = [];
        xhr = sinon.useFakeXMLHttpRequest();
        xhr.onCreate = (xhr: any) => requests.push(xhr);
    },
    afterEach: function() {
        xhr.restore();
    }
}, () => {
    test("#save calls setErrors when a 400 is returned", async () => {
        await new Promise((resolve) => {
        
            var Model = Viking.Model.extend('model');
    
            var m = new Model();
            m.setErrors = function(errors, options) {
                assert.deepEqual(errors, {
                    "address": { "city": ["cant be blank"] },
                    "agents": [ { "email": ["cant be blank",  "is invalid" ] } ],
                    "size": ["cant be blank", "is not a number" ]
                });
                resolve();
            }

            m.save();
            requests[0].respond(400, '[]', JSON.stringify({
                "errors": {
                    "address": { "city": ["cant be blank"] },
                    "agents": [ { "email": ["cant be blank",  "is invalid" ] } ],
                    "size": ["cant be blank", "is not a number" ]
                }
            }));
        });
    });
    
    test("#save calls the invalid callback when a 400 is returned", async () => {
        await new Promise((resolve) => {
        
            var Model = Viking.Model.extend('model');
    
            var m = new Model({foo: 'bar'});
            m.save(null, {
                invalid: function(model, errors, options) {
                    assert.deepEqual(errors, {
                        "address": { "city": ["cant be blank"] },
                        "agents": [ { "email": ["cant be blank",  "is invalid" ] } ],
                        "size": ["cant be blank", "is not a number" ]
                    });
                    resolve();
                }
            });
        
            requests[0].respond(400, '[]', JSON.stringify({
                "errors": {
                    "address": { "city": ["cant be blank"] },
                    "agents": [ { "email": ["cant be blank",  "is invalid" ] } ],
                    "size": ["cant be blank", "is not a number" ]
                }
            }));
        });
    });

});