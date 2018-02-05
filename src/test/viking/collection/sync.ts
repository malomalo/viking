import * as Backbone from 'backbone';
import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../..//viking';

let xhr: any;
let requests: any[] = [];

module('Viking.Collection#sync', {
    beforeEach: function() {
        requests = [];
        xhr = sinon.useFakeXMLHttpRequest();
        xhr.onCreate = (xhr: any) => requests.push(xhr);
    },
    afterEach: function() {
        xhr.restore();
    }
}, () => {

    test("adds in order params when set", function() {
        var vc = new Viking.Collection(null, {order: 'size'});
	
        vc.fetch({url: '/'});
    	assert.equal("/?"+encodeURI("order[][size]=asc"), requests[0].url);
    });

    test("doesn't add order params when not set", function() {
        var vc = new Viking.Collection();
	
        vc.fetch({url: '/'});
    	assert.equal("/", requests[0].url);
    });


    test("adds in predicate params when set", async () => {
        await new Promise((resolve) => {

            var m = Viking.Model.extend('model');
            var f = new Viking.Predicate({types: [1,2]});
            var c = Viking.Collection.extend({model: m});
            var c = new c([], {predicate: f});

            var old = Viking.sync;
            Viking.sync = function(method, model, options) {
                assert.deepEqual(options.data, {where: {types: [1,2]}});
                resolve();
            }
            c.fetch();
            Viking.sync = old;
        });
    });

    test("doesn't add predicate params when not set", async () => {
        assert.ok(false);
        // TODO
        // await new Promise((resolve) => {
        //
        //     var m = Viking.Model.extend('model');
        //     var c = Viking.Collection.extend({model: m});
        //     var c = new c();
        //
        //     var old = Viking.sync;
        //     Viking.sync = function(method, model, options) {
        //         assert.equal(options.data, undefined);
        //         resolve();
        //     }
        //     c.fetch();
        //     Viking.sync = old;
        // });
    });
    
    test("#sync uses Viking.sync", async () => {
        await new Promise((resolve) => {
    
            var c = new Viking.Collection();
    
            var old = Viking.sync;
            Viking.sync = function(method, model, options) {
                assert.ok(true);
                resolve();
            }
            c.sync();
            Viking.sync = old;
        });
    });
    
});