import * as Backbone from 'backbone';
import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../../../viking';

let xhr: any;
let requests: any[] = [];

module('Viking.Model#sync', {
    beforeEach: function () {
        requests = [];
        xhr = sinon.useFakeXMLHttpRequest();
        xhr.onCreate = (xhr: any) => requests.push(xhr);
    },
    afterEach: function () {
        xhr.restore();
    }
}, () => {
    test("#sync namespaces the data to the paramRoot of the model when !options.data", function () {
        var Model = Viking.Model.extend('model');

        var m = new Model({ foo: 'bar' });
        m.sync('create', m);
        assert.equal(requests[0].method, 'POST');
        assert.deepEqual(JSON.parse(requests[0].requestBody), {
            model: { foo: 'bar' }
        });
    });

    test("#sync doesn't set the data if options.data", function () {
        var Model = Viking.Model.extend('model');

        var m = new Model({ foo: 'bar' });
        m.sync('patch', m, { data: { 'this': 'that' } });
        assert.equal(requests[0].method, 'PATCH');
        assert.deepEqual(requests[0].requestBody, {
            'this': 'that'
        });
    });

    test("#sync namespaces options.attrs to the paramRoot of the model if options.attrs", function () {
        var Model = Viking.Model.extend('model');

        var m = new Model({ foo: 'bar' });
        m.sync('patch', m, { attrs: { 'this': 'that' } });
        assert.equal(requests[0].method, 'PATCH');
        assert.deepEqual(JSON.parse(requests[0].requestBody), {
            model: { 'this': 'that' }
        });
    });

});
