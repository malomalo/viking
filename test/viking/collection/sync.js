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

test("adds in order params when set", function() {
    var vc = new Viking.Collection();
	vc.order('size');
	
    vc.fetch({url: '/'});
	equal("/?"+encodeURI("order[0][size]=asc"), this.requests[0].url);
});

test("doesn't add order params when not set", function() {
    var vc = new Viking.Collection();
	
    vc.fetch({url: '/'});
	equal("/", this.requests[0].url);
});


test("adds in predicate params when set", function() {
    expect(1);

    var m = Viking.Model.extend('model');
    var f = new Viking.Predicate({types: [1,2]});
    var c = Viking.Collection.extend({model: m});
    var c = new c([], {predicate: f});

    var old = Backbone.sync;
    Backbone.sync = function(method, model, options) {
        deepEqual(options.data.where, {types: [1,2]});
    }
    c.fetch();
    Backbone.sync = old;
});

test("doesn't add predicate params when not set", function() {
    expect(1);

    var m = Viking.Model.extend('model');
    var c = Viking.Collection.extend({model: m});
    var c = new c();

    var old = Backbone.sync;
    Backbone.sync = function(method, model, options) {
        equal(options.data, undefined);
    }
    c.fetch();
    Backbone.sync = old;
});
