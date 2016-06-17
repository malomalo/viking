import Viking from '../../src/viking';

(function () {
    module("Viking.sync", {
        setup: function() {
            this.requests = [];
            this.xhr = sinon.useFakeXMLHttpRequest();
            this.xhr.onCreate = _.bind(function(xhr) {
                this.requests.push(xhr);
            }, this);
        },
        teardown: function() {
            this.xhr.restore();
        }
    });

    test("sync uses .toParam() as opposed to letting jQuery use $.param()", function() {
        var model = new Viking.Model();
    
        Viking.sync('read', model, {url: '/', data: {order: [{key: 'asc'}]}} );
        equal(this.requests[0].url, encodeURI("/?order[][key]=asc"));
    });
    
    test("ajax uses connection config info from model", function() {
        let Model = Viking.Model.extend('name', {
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

        equal(this.requests[0].url, encodeURI("http://google.com/names"));
        equal(this.requests[0].withCredentials, true);
        equal(this.requests[0].requestHeaders['API-Version'], "0.1.0");
    });

    test("ajax uses connection config info inherited from ancestors", function() {
        let Name = Viking.Model.extend('name', {
            connection: {
                host: 'http://google.com',
                withCredentials: true,
                headers: {
                    'API-Version': '0.1.0'
                }
            }
        });

        let FirstName = Name.extend('first_name');

        var model = new FirstName();
        model.save();

        equal(this.requests[0].url, encodeURI("http://google.com/names"));
        equal(this.requests[0].withCredentials, true);
        equal(this.requests[0].requestHeaders['API-Version'], "0.1.0");
    });

    test("ajax uses connection config info from Viking.Model", function() {
        let Model = Viking.Model.extend('name');

        Viking.Model.prototype.connection = {
            host: 'http://google.com',
            withCredentials: true,
            headers: {
                'API-Version': '0.1.0'
            }
        };

        var model = new Model();
        model.save();

        equal(this.requests[0].url, encodeURI("http://google.com/names"));
        equal(this.requests[0].withCredentials, true);
        equal(this.requests[0].requestHeaders['API-Version'], "0.1.0");

        delete Viking.Model.prototype.connection
    });

    test("ajax uses connection config info inherited from abstract model", function() {
        let MyModel = Viking.Model.extend('myModel', {
            abstract: true,

            connection: {
                host: 'http://google.com',
                withCredentials: true,
                headers: {
                    'API-Version': '0.1.0'
                }
            }
        });

        let Model = MyModel.extend('name');

        var model = new Model();
        model.save();

        equal(this.requests[0].url, encodeURI("http://google.com/names"));
        equal(this.requests[0].withCredentials, true);
        equal(this.requests[0].requestHeaders['API-Version'], "0.1.0");
    });

}());