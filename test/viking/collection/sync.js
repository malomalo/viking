import Viking from '../../../src/viking';

(function () {

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
        var vc = new Viking.Collection(null, {order: 'size'});
	
        vc.fetch({url: '/'});
        equal("/?"+encodeURI("order[][size]=asc"), this.requests[0].url);
    });

    test("doesn't add order params when not set", function() {
        var vc = new Viking.Collection();

        vc.fetch({url: '/'});
        equal(this.requests[0].url, '/');
    });


    test("adds in predicate params when set", function() {
        expect(1);

        var m = Viking.Model.extend('model');
        var f = new Viking.Predicate({types: [1,2]});
        var c = Viking.Collection.extend({model: m});
        var c = new c([], {predicate: f});

        c.fetch();

        equal(this.requests[0].url, '/models?where%5Btypes%5D%5B%5D=1&where%5Btypes%5D%5B%5D=2')
    });

    test("doesn't add predicate params when not set", function() {
        expect(1);

        var m = Viking.Model.extend('model');
        var c = Viking.Collection.extend({model: m});
        var c = new c();

        c.fetch();
        equal(this.requests[0].url, '/models')
    });

}());
