import * as Backbone from 'backbone';
import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../..//viking';

let xhr: any;
let requests: any[] = [];

module('Viking.Collection#sync', {
    afterEach() {
        xhr.restore();
    },
    beforeEach() {
        requests = [];
        xhr = sinon.useFakeXMLHttpRequest();
        xhr.onCreate = (xhr: any) => requests.push(xhr);
    }
}, () => {

    test('adds in order params when set', () => {
        const vc = new Viking.Collection(null, { order: 'size' });
        vc.fetch({ url: '/' });
        assert.equal('/?' + encodeURI('order[][size]=asc'), requests[0].url);
    });

    test('doesn\'t add order params when not set', () => {
        const vc = new Viking.Collection();

        vc.fetch({ url: '/' });
        assert.equal('/', requests[0].url);
    });

    test('adds in predicate params when set', async () => {
        await new Promise((resolve) => {
            const m = Viking.Model.extend('model');
            const f = new Viking.Predicate({ types: [1, 2] });
            const c = new (Viking.Collection.extend({ model: m }))([], { predicate: f });

            const old = Viking.sync;
            Viking.sync = (method, model, options) => {
                assert.deepEqual(options.data, { where: { types: [1, 2] } });
                resolve();
            };
            c.fetch();
            Viking.sync = old;
        });
    });
    // test('adds in predicate params when set', async () => {
    //     const m = Viking.Model.extend('model');
    //     const f = new Viking.Predicate({ types: [1, 2] });
    //     const c = new (Viking.Collection.extend({ model: m }))([], { predicate: f });

    //     c.fetch();
    //     assert.equal(requests[0].url, '/models?where%255Btypes%255D%5B%5D=1&where%255Btypes%255D%5B%5D=2');
    // });

    test('doesn\'t add predicate params when not set', async () => {
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

    test('#sync uses Viking.sync', async () => {
        await new Promise((resolve) => {
            const c = new Viking.Collection();
            const old = Viking.sync;
            Viking.sync = (method, model, options) => {
                assert.ok(true);
                resolve();
            };
            c.sync();
            Viking.sync = old;
        });
    });

});
