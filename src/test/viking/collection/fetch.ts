import * as Backbone from 'backbone';
import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../../viking';


let xhr: any;
let requests: any[] = [];

module('Viking.Model#fetch', {
    beforeEach: function() {
        requests = [];
        xhr = sinon.useFakeXMLHttpRequest();
        xhr.onCreate = (xhr: any) => requests.push(xhr);
    },
    afterEach: function() {
        xhr.restore();
    }
}, () => {
    test("calls Backbone.Collection#fetch", async () => {
        await new Promise((resolve) => {
    
            var vc = new Viking.Collection();
            var oldFetch = Backbone.Collection.prototype.fetch;
            Backbone.Collection.prototype.fetch = function() {
                assert.ok(true);
                resolve();
                return xhr;
            };
    
            vc.fetch();
    
            Backbone.Collection.prototype.fetch = oldFetch;
        });
    });

    test("set this.xhr", function() {
        var vc = new Viking.Collection();
        assert.equal(undefined, vc.xhr);
        vc.fetch({url: '/'});
        assert.notEqual(undefined, vc.xhr);
    });

    test("deletes this.xhr after xhr is complete", function() {
        var vc = new Viking.Collection();
        assert.equal(undefined, vc.xhr);
        vc.fetch({url: '/'});
        assert.notEqual(undefined, vc.xhr);
        requests[0].respond(200, '[]', 'OK');
        assert.equal(undefined, vc.xhr);
    });

    test("aborts previous xhr if in process and #fetch is called again", function() {
        var vc = new Viking.Collection();
        assert.equal(undefined, vc.xhr);
        vc.fetch({url: '/'});
        assert.equal('pending', vc.xhr.state());
        var oldxhr = vc.xhr;
        vc.fetch({url: '/'});
        assert.equal('abort', oldxhr.statusText);
        assert.equal('pending', vc.xhr.state());
        requests[1].respond(200, '[]', 'OK');
        assert.equal(undefined, vc.xhr);
    });
});