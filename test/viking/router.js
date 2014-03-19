(function () {
    module("Viking.Router", {
        setup: function () {
            Viking.Router.prototype.cleanup = function() {
                this.stop()
                Backbone.history.handlers = [];
            }
        },
        teardown: function () {
            delete Viking.Router.prototype.cleanup;
        }
    });

    test("routes to a function in the router", function() {
        expect(2);

        var router = Viking.Router.extend({
            routes: {
                '': 'func'
            },
            func: function() { ok(true); }
        });
        router = new router();

        ok(Backbone.history.handlers[0].route.test(''));
        Backbone.history.handlers[0].callback('');
        router.cleanup();
        delete Controller;
    });

    test("routes to a function", function() {
        expect(2);

        var func = function() { ok(true); };
        var router = Viking.Router.extend({
            routes: {
                '': func
            }
        });
        router = new router();

        ok(Backbone.history.handlers[0].route.test(''));
        Backbone.history.handlers[0].callback('');
        router.cleanup();
        delete Controller;
    });

    test("routes to a controller and action (normal obj)", function() {
        expect(2);

        Controller = { action: function() { ok(true); } }
        var router = Viking.Router.extend({
            routes: {
                '': {to: 'Controller#action', name: 'root'}
            }
        });
        router = new router();

        ok(Backbone.history.handlers[0].route.test(''));
        Backbone.history.handlers[0].callback('');
        router.cleanup();
        delete Controller;
    });

    test("routes to a controller and undefined action", function() {
        expect(1);

        Controller = { }
        var router = Viking.Router.extend({
            routes: {
                '': {to: 'Controller#action', name: 'root'}
            }
        });
        router = new router();

        ok(Backbone.history.handlers[0].route.test(''));
        Backbone.history.handlers[0].callback('');
        router.cleanup();
        delete Controller;
    });
	
    test("routes to a undefined controller and undefined action", function() {
        expect(1);

        var router = Viking.Router.extend({
            routes: {
                '': {to: 'Controller#action', name: 'root'}
            }
        });
        router = new router();

        ok(Backbone.history.handlers[0].route.test(''));
        Backbone.history.handlers[0].callback('');
        router.cleanup();
        delete Controller;
    });

    test("routes to a uninitialized controller and action (Viking.Controller)", function() {
        expect(2);

        Controller = Viking.Controller.extend({ action: function() { ok(true); } })
        var router = Viking.Router.extend({
            routes: {
                '': {to: 'Controller#action', name: 'root'}
            }
        });
        router = new router();

        ok(Backbone.history.handlers[0].route.test(''));
        Backbone.history.handlers[0].callback('');
        router.cleanup();
        delete Controller;
    });

    test("routes to a initialized controller and action (Viking.Controller)", function() {
        expect(2);

        Controller = Viking.Controller.extend({ action: function() { ok(true); } })
        var router = Viking.Router.extend({
            routes: {
                '': {to: 'Controller#action', name: 'root'}
            }
        });
        router = new router();
		Viking.controller = new Controller();
		
        ok(Backbone.history.handlers[0].route.test(''));
        Backbone.history.handlers[0].callback('');
        router.cleanup();
        delete Controller;
    });

    test("routing to a Viking.Controller more than once in a row only initializes the controller once", function() {
        expect(2);

        Controller = Viking.Controller.extend({ initialize: function() { ok(true); } })
        var router = Viking.Router.extend({
            routes: {
                '': {to: 'Controller#action', name: 'root'}
            }
        });
        router = new router();
		
        ok(Backbone.history.handlers[0].route.test(''));
        Backbone.history.handlers[0].callback('');
        Backbone.history.handlers[0].callback('');
        Backbone.history.handlers[0].callback('');
        router.cleanup();
        delete Controller;
    });

    test("routing to a Viking.Controller then to another route changes the controller", function() {
        expect(6);

        Controller = Viking.Controller.extend();
        BController = Viking.Controller.extend();
		Another = {};
        var router = Viking.Router.extend({
            routes: {
                '': {to: 'Controller#action', name: 'root'},
				'b': {to: 'BController#action', name: 'b'},
                'other': {to: 'Other#action', name: 'other'},
                'another': {to: 'Another#action', name: 'another'},
				'func': 'func',
				'closure': function() { }
            },
			
			func: function() { }
        });
        router = new router();
		
        Backbone.history.handlers[0].callback('');
		ok(Viking.controller instanceof Controller);

        Backbone.history.handlers[0].callback('');
        Backbone.history.handlers[1].callback('b');
		ok(Viking.controller instanceof BController);
				
        Backbone.history.handlers[0].callback('');
        Backbone.history.handlers[2].callback('other');
		equal(undefined, Viking.controller);
		
        Backbone.history.handlers[0].callback('');
        Backbone.history.handlers[3].callback('another');
		equal(Another, Viking.controller);
		
        Backbone.history.handlers[0].callback('');
        Backbone.history.handlers[4].callback('func');
		equal(undefined, Viking.controller);
		
        Backbone.history.handlers[0].callback('');
        Backbone.history.handlers[5].callback('closure');
		equal(undefined, Viking.controller);
		
        router.cleanup();
        delete Controller;
        delete BController;
        delete Another;
    });

    test("routes to a Viking.Controller and undefined action", function() {
        expect(1);

        Controller = Viking.Controller.extend();
        var router = Viking.Router.extend({
            routes: {
                '': {to: 'Controller#action', name: 'root'}
            }
        });
        router = new router();

        ok(Backbone.history.handlers[0].route.test(''));
        Backbone.history.handlers[0].callback('');
        router.cleanup();
        delete Controller;
    });

    test("routes with a regex", function() {
        expect(5);

        var router = Viking.Router.extend({
            routes: {
                'r/^([a-z][a-z])\/([^\/]+)\/([^\/]+)$/': 'func',
            },
            func: function(state,something,another) {
                equal(state, 'ca');
                equal(something, 'something');
                equal(another, 'another');
            }
        });
        router = new router();
        ok(Backbone.history.handlers[0].route.test('ca/something/another'));
        ok(!Backbone.history.handlers[0].route.test('dca/something/another'));
        Backbone.history.handlers[0].callback.call(router, 'ca/something/another');
        router.cleanup();
        delete Controller;
    })

    test('routes with a string', function () {
        expect(3);

        var router = Viking.Router.extend({
            routes: {
                '': 'Controller#action',
            }
        });
        router = new router();

        Controller = { action: function() { ok(true); } }
        ok(Backbone.history.handlers[0].route.test(''));
        ok(!Backbone.history.handlers[0].route.test('dca/something/another'));
        Backbone.history.handlers[0].callback.call(router, '');
        router.cleanup();
        delete Controller;
    });

    test("router.start() starts Backbone.history", function() {
        expect(1);

        var router = new Viking.Router();
        var oldstart = Backbone.history.start
        Backbone.history.start = function() { ok(true); }
        router.start();
        Backbone.history.start = oldstart;
    });

    test("router.start() passes {pushState: true} as options to Backbone.history", function() {
        expect(1);

        var router = new Viking.Router();
        var oldstart = Backbone.history.start
        Backbone.history.start = function(options) { deepEqual({pushState: true}, options); }
        router.start();
        Backbone.history.start = oldstart;
    });
    
    test("router.start(options) passes options to Backbone.history", function() {
        expect(1);

        var router = new Viking.Router();
        var oldstart = Backbone.history.start
        Backbone.history.start = function(options) { deepEqual({pushState: true, silent: true}, options); }
        router.start({silent: true});
        Backbone.history.start = oldstart;
    });

    test("router.stop() stops Backbone.history", function() {
        expect(1);

        var router = new Viking.Router();
        var oldstop = Backbone.history.stop
        Backbone.history.stop = function() { ok(true); }
        router.start();
        router.stop();
        Backbone.history.stop = oldstop;
        router.cleanup();
    });

    test('router.start() calls callbacks with the name of the route', function() {
        expect(2);

        Controller = { action: function() { ok(true); } }
        var r = {}
        r[window.location.pathname.replace('/','')] = {to: 'Controller#action', name: 'root'}
        var Router = Viking.Router.extend({ routes: r });

        var router = new Router();
        router.on('route:root', function() { ok(true); });
        router.start();

        router.cleanup();
        router.off('route:root');
        delete Controller;
    });

    test('router.navigate() calls Backbone.Router.prototype.navigate', function() {
        expect(2);

        var oldnavigate = Backbone.Router.prototype.navigate;

        var router = new Viking.Router();
        Backbone.Router.prototype.navigate = function(f, a) {
            equal(f, '/path');
            equal(a, 'arguments');
        };
        router.navigate('/path', 'arguments');

        Backbone.Router.prototype.navigate = oldnavigate;
    });

    test('router.navigate() strips the root_url from urls from the current domain', function() {
        expect(2);

        var oldnavigate = Backbone.Router.prototype.navigate;

        var router = new Viking.Router();
        Backbone.Router.prototype.navigate = function(f, a) {
            equal(f, '/path');
            equal(a, 'arguments');
        };
        router.navigate(window.location.protocol + '//' + window.location.host + '/path', 'arguments');

        Backbone.Router.prototype.navigate = oldnavigate;
    });
}());