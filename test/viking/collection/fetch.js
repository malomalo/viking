import Viking from '../../../src/viking';

module("Viking.Model#fetch", {
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

test("calls Backbone.Collection#fetch", function() {
    expect(1);
    
    var vc = new Viking.Collection();
    var oldFetch = Backbone.Collection.prototype.fetch;
    Backbone.Collection.prototype.fetch = function() {
        ok(true);
    };
    
    vc.fetch();
    
    Backbone.Collection.prototype.fetch = oldFetch;
});

test("set this.xhr", function() {
    var vc = new Viking.Collection();
    equal(undefined, vc.xhr);
    vc.fetch({url: '/'});
    notEqual(undefined, vc.xhr);
});

test("deletes this.xhr after xhr is complete", function() {
    var vc = new Viking.Collection();
    equal(undefined, vc.xhr);
    vc.fetch({url: '/'});
    notEqual(undefined, vc.xhr);
    this.requests[0].respond(200, '[]', 'OK');
    equal(undefined, vc.xhr);
});

test("aborts previous xhr if in process and #fetch is called again", function() {
    var vc = new Viking.Collection();
    equal(undefined, vc.xhr);
    vc.fetch({url: '/'});
    equal('pending', vc.xhr.state());
    var oldxhr = vc.xhr;
    vc.fetch({url: '/'});
    equal('abort', oldxhr.statusText);
    equal('pending', vc.xhr.state());
    this.requests[1].respond(200, '[]', 'OK');
    equal(undefined, vc.xhr);
});