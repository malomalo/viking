module("Viking.Model#sync", {
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

test("#sync namespaces the data to the paramRoot of the model when !optinos.data", function() {
    var Model = Viking.Model.extend('model');
    
    var m = new Model({foo: 'bar'});
    m.sync('create', m);
    equal(this.requests[0].method, 'POST');
    deepEqual(JSON.parse(this.requests[0].requestBody), {
        model: {foo: 'bar'}
    });
});

test("#sync doesn't set the data if options.data", function() {
    var Model = Viking.Model.extend('model');
    
    var m = new Model({foo: 'bar'});
    m.sync('patch', m, {data: {this: 'that'}});
    equal(this.requests[0].method, 'PATCH');
    deepEqual(this.requests[0].requestBody, {
        this: 'that'
    });
});

test("#sync namespaces options.attrs to the paramRoot of the model if options.attrs", function() {
    var Model = Viking.Model.extend('model');
    
    var m = new Model({foo: 'bar'});
    m.sync('patch', m, {attrs: {this: 'that'}});
    equal(this.requests[0].method, 'PATCH');
    deepEqual(JSON.parse(this.requests[0].requestBody), {
        model: {this: 'that'}
    });
});

