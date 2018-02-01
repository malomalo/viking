const { module, test, assert } = QUnit;

import { Viking } from '../../src/viking';

module('Viking.sync', {
    before() {
        this.requests = [];
        this.xhr = sinon.useFakeXMLHttpRequest();
        this.xhr.onCreate = _.bind(function (xhr) {
            this.requests.push(xhr);
        }, this);
    },
    after() {
        this.xhr.restore();
    }
}, () => {

    test('sync uses .toParam() as opposed to letting jQuery use $.param()', function () {
        var model = new Viking.Model();

        Viking.sync('read', model, { url: '/', data: { order: [{ key: 'asc' }] } });
        assert.equal(this.requests[0].url, encodeURI("/?order[][key]=asc"));
    });

    test("ajax uses connection config info from model", function () {
        Model = Viking.Model.extend('name', {
            connection: {
                host: 'http://google.com',
                withCredentials: true,
                headers: {
                    'API-Version': '0.1.0'
                }
            }
        });

        var model = new Model();
        model.save();

        assert.equal(this.requests[0].url, encodeURI("http://google.com/names"));
        assert.equal(this.requests[0].withCredentials, true);
        assert.equal(this.requests[0].requestHeaders['API-Version'], "0.1.0");

        delete Model;
    });

    test("ajax uses connection config info inherited from ancestors", function () {
        Name = Viking.Model.extend('name', {
            connection: {
                host: 'http://google.com',
                withCredentials: true,
                headers: {
                    'API-Version': '0.1.0'
                }
            }
        });

        FirstName = Name.extend('first_name');

        var model = new FirstName();
        model.save();

        assert.equal(this.requests[0].url, encodeURI("http://google.com/names"));
        assert.equal(this.requests[0].withCredentials, true);
        assert.equal(this.requests[0].requestHeaders['API-Version'], "0.1.0");

        delete Model;
    });

    test("ajax uses connection config info from Viking.Model", function () {
        Model = Viking.Model.extend('name');

        Viking.Model.prototype.connection = {
            host: 'http://google.com',
            withCredentials: true,
            headers: {
                'API-Version': '0.1.0'
            }
        };

        var model = new Model();
        model.save();

        assert.equal(this.requests[0].url, encodeURI("http://google.com/names"));
        assert.equal(this.requests[0].withCredentials, true);
        assert.equal(this.requests[0].requestHeaders['API-Version'], "0.1.0");

        delete Model;
        delete Viking.Model.prototype.connection
    });

    test("ajax uses connection config info inherited from abstract model", function () {
        MyModel = Viking.Model.extend({
            abstract: true,

            connection: {
                host: 'http://google.com',
                withCredentials: true,
                headers: {
                    'API-Version': '0.1.0'
                }
            }
        });

        Model = MyModel.extend('name');

        var model = new Model();
        model.save();

        assert.equal(this.requests[0].url, encodeURI("http://google.com/names"));
        assert.equal(this.requests[0].withCredentials, true);
        assert.equal(this.requests[0].requestHeaders['API-Version'], "0.1.0");

        delete Model;
    });

});

