(function () {
    module("Viking.Model#touch", {
        setup: function() {
            this.clock = sinon.useFakeTimers();
            
            this.requests = [];
            this.xhr = sinon.useFakeXMLHttpRequest();
            this.xhr.onCreate = _.bind(function(xhr) {
                this.requests.push(xhr);
            }, this);
        },
        teardown: function() {
            this.clock.restore();
            this.xhr.restore();
        }
    });

    test("sends a PUT request to /models/:id/touch", function() {
        var Model = Viking.Model.extend('model');
    
        var m = new Model({id: 2, foo: 'bar'});
        m.touch();
        equal(this.requests[0].method, 'PATCH');
        equal(this.requests[0].url, '/models/2');
        deepEqual(JSON.parse(this.requests[0].requestBody), {
            model: {updated_at: (new Date()).toISOString(3)}
        });
    });
    
    test("sends an empty body", function() {
        var Model = Viking.Model.extend('model');
    
        var m = new Model({id: 2, foo: 'bar'});
        m.touch();
        deepEqual(JSON.parse(this.requests[0].requestBody), {
            model: {updated_at: (new Date()).toISOString(3)}
        });
    });
    
    test("sends the name of the column to be touched if specified", function() {
        var Model = Viking.Model.extend('model');
    
        var m = new Model({id: 2, foo: 'bar'});
        m.touch('read_at');
        deepEqual(JSON.parse(this.requests[0].requestBody), {
            model: {
                read_at: (new Date()).toISOString(3),
                updated_at: (new Date()).toISOString(3)
            }
        });

    });
    
    test("updates the attributes from the response", function() {
        var Model = Viking.Model.extend('model', { coercions: {updated_at: 'Date', read_at: 'Date'} });
    
        var m = new Model({id: 2, updated_at: null, read_at: null});
        
        equal(m.get('updated_at'), null);
        m.touch();
        this.requests[0].respond(200, '[]', JSON.stringify({updated_at: "2013-04-10T21:24:28+00:00"}));
        equal(m.get('updated_at').valueOf(), 1365629068000);
        
        equal(m.get('read_at'), null);
        m.touch('read_at');
        this.requests[1].respond(200, '[]', JSON.stringify({read_at: "2013-04-10T21:24:28+00:00"}));
        equal(m.get('read_at').valueOf(), 1365629068000);
    });    

}());