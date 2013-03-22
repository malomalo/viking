module("Viking.Router");

Viking.Router.prototype.cleanup = function() {
    this.stop()
    Backbone.history.handlers = [];
}

test("extend set modelName on Model", function() {
    expect(2);
    
    Controller = { action: function() { ok(true); } }
    var router = Viking.Router.extend({
        routes: {
            '': {controller: 'Controller', action: 'action', name: 'root'}
        }
    });
    router = new router();
    
    ok(Backbone.history.handlers[0].route.test(''));
    Backbone.history.handlers[0].callback('');
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
    r[window.location.pathname.replace('/','')] = {controller: 'Controller', action: 'action', name: 'root'}
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
})