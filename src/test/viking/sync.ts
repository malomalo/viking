import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../viking';

let xhr: any;
let requests: any[] = [];

module('Viking.sync', {
    afterEach() {
        xhr.restore();
    },
    beforeEach() {
        requests = [];
        xhr = sinon.useFakeXMLHttpRequest();
        xhr.onCreate = (xhr: any) => requests.push(xhr);
    }
}, () => {

    test('sync uses .toParam() as opposed to letting jQuery use $.param()', () => {
        const model = new Viking.Model();

        Viking.sync('read', model, { url: '/', data: { order: [{ key: 'asc' }] } });
        assert.equal(requests[0].url, encodeURI('/?order[][key]=asc'));

    });

    test('ajax uses connection config info from model', () => {
        const Model = Viking.Model.extend('name', {
            connection: {
                headers: {
                    'API-Version': '0.1.0'
                },
                host: 'http://google.com',
                withCredentials: true
            }
        });

        const model = new Model();
        model.save();

        assert.equal(requests[0].url, encodeURI('http://google.com/names'));
        assert.equal(requests[0].withCredentials, true);
        assert.equal(requests[0].requestHeaders['API-Version'], '0.1.0');
    });

    test('ajax uses connection config info inherited from ancestors', () => {
        const Name = Viking.Model.extend('name', {
            connection: {
                headers: {
                    'API-Version': '0.1.0'
                },
                host: 'http://google.com',
                withCredentials: true
            }
        });

        const FirstName = Name.extend('first_name');

        const model = new FirstName();
        model.save();

        assert.equal(requests[0].url, encodeURI('http://google.com/names'));
        assert.equal(requests[0].withCredentials, true);
        assert.equal(requests[0].requestHeaders['API-Version'], '0.1.0');
    });

    test('ajax uses connection config info from Viking.Model', () => {
        const Model = Viking.Model.extend('name');

        Viking.Model.prototype.connection = {
            headers: {
                'API-Version': '0.1.0'
            },
            host: 'http://google.com',
            withCredentials: true
        };

        const model = new Model();
        model.save();

        assert.equal(requests[0].url, encodeURI('http://google.com/names'));
        assert.equal(requests[0].withCredentials, true);
        assert.equal(requests[0].requestHeaders['API-Version'], '0.1.0');

        delete Viking.Model.prototype.connection;
    });

    test('ajax uses connection config info inherited from abstract model', () => {
        const MyModel = Viking.Model.extend({
            abstract: true,

            connection: {
                headers: {
                    'API-Version': '0.1.0'
                },
                host: 'http://google.com',
                withCredentials: true
            }
        });

        const Model = MyModel.extend('name');

        const model = new Model();
        model.save();

        assert.equal(requests[0].url, encodeURI('http://google.com/names'));
        assert.equal(requests[0].withCredentials, true);
        assert.equal(requests[0].requestHeaders['API-Version'], '0.1.0');
    });

});
