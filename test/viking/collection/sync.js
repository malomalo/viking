module("Viking.Collection#sync", {
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

test("doesn't pass order paramater when not set", function() {
    var vc = new Viking.Collection();
	
    vc.fetch({url: '/'});
	equal("/", this.requests[0].url);
});

test("passes order as a paramater when set", function() {
    var vc = new Viking.Collection();
	vc.order('size');
	
    vc.fetch({url: '/'});
	equal("/?"+encodeURI("order[0][size]=asc"), this.requests[0].url);
});