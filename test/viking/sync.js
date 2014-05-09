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
    
}());