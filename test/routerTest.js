import 'mocha';
import * as assert from 'assert';
import VikingRouter from 'viking/router';
import VikingController from 'viking/controller';

describe('Viking.Router', () => {

    
    beforeEach(() => {
        history.pushState({}, '', '/');
    });

    afterEach(function () {
        if(this.router) { this.router.stop(); };
    });
    
    it('routes to a function in the router', function () {
        let counter = 0;

        class Router extends VikingRouter {
            static routes = { '/': 'func' };

            func() { counter++; }
        }

        this.router = new Router();
        this.router.start();
        assert.equal(counter, 1);
    });

    it('routes to a function', function () {
        let counter = 0;

        class Router extends VikingRouter {
            static routes = {
                '/': () => { counter++; }
            };
        }

        this.router = new Router();
        this.router.start();
        assert.equal(counter, 1);
    });

    it('routes to a controller and action (normal obj)', function () {
        let counter = 0;
        
        let Controller = {
            action: () => { counter++; }
        }
        
        class Router extends VikingRouter {
            static routes = {
                '/': {
                    to: { controller: Controller, action: 'action' },
                    name: 'root'
                }
            };
        }

        this.router = new Router();
        this.router.start();
        assert.equal(counter, 1);
    });

    it('routes to a controller and action (normal class)', function () {
        let counter = 0;
        
        class Controller {
            action() { counter++; }
        }

        class Router extends VikingRouter {
            static routes = {
                '/': {
                    to: { controller: Controller, action: 'action' },
                    name: 'root'
                }
            };
        }

        this.router = new Router();
        this.router.start();
        assert.equal(counter, 1);
    });

    it('routes to a controller and action (defined controller)', function () {
        let counter = 0;
        
        class Controller extends VikingController {
            action() { counter++; }
        }

        class Router extends VikingRouter {
            static routes = {
                '/': {
                    to: { controller: Controller, action: 'action' },
                    name: 'root'
                }
            };
        }

        this.router = new Router();
        this.router.start();
        assert.equal(counter, 1);
    });

    it('routes to a [controller, action] (defined controller)', function () {
        let counter = 0;
        
        class Controller extends VikingController {
            action() { counter++; }
        }

        class Router extends VikingRouter {
            static routes = {
                '/': {
                    to: [Controller, 'action'],
                    name: 'root'
                }
            };
        }

        this.router = new Router();
        this.router.start();
        assert.equal(counter, 1);
    });
    
    it('routes to a controller and action are correctly ordered', function () {
        let counter = 0;
        
        class Controller extends VikingController {
            static()  {counter++}
        }

        class Router extends VikingRouter {
            static routes = {
                '/test/static': {
                    to: { controller: Controller, action: 'static' }
                },
                '/test/:id': {
                    to: { controller: Controller, action: 'show' }
                }
            };
        }

        this.router = new Router();
        this.router.start();
        this.router.navigateTo('/test/static');
        assert.equal(counter, 1);
    });


    // test('routes to a initialized controller and action (Viking.Controller)', async () => {
    //     await new Promise((resolve) => {
    //         const Controller = Viking.Controller.extend({
    //             action() {
    //                 assert.ok(true);
    //                 resolve();
    //             }
    //         });

    //         const router = new (Viking.Router.extend({
    //             routes: {
    //                 '': { to: { controller: Controller, action: 'action' }, name: 'root' }
    //             }
    //         }))();

    //         Viking.controller = new Viking.Controller();

    //         assert.ok(Backbone.history.handlers[0].route.test(''));
    //         Backbone.history.handlers[0].callback('');
    //         router.cleanup();
    //     });
    // });

    // test('routing to a Viking.Controller more than once in a row only initializes the controller once', async () => {
    //     await new Promise((resolve) => {
    //         let count = 0;

    //         const Controller = Viking.Controller.extend({
    //             initialize() {
    //                 assert.ok(count === 0);
    //                 count++;
    //                 resolve();
    //             }
    //         });

    //         const router = new (Viking.Router.extend({
    //             routes: {
    //                 '': [Controller, 'action', 'root']
    //             }
    //         }))();

    //         assert.ok(Backbone.history.handlers[0].route.test(''));
    //         Backbone.history.handlers[0].callback('');
    //         Backbone.history.handlers[0].callback('');
    //         Backbone.history.handlers[0].callback('');
    //         router.cleanup();
    //     });
    // });

    // test('routing to a Viking.Controller then to another route changes the controller', () => {
    //     const Controller = Viking.Controller.extend();
    //     const BController = Viking.Controller.extend({
    //         action: () => undefined
    //     });
    //     const Another = {};
    //     const router = new (Viking.Router.extend({
    //         routes: {
    //             '': [Controller, 'action', 'root'],
    //             'another': [Another, 'action', 'another'],
    //             'b': [BController, 'action', 'b'],
    //             'closure': () => undefined,
    //             'func': 'func',
    //             'other': { to: 'Other#action', name: 'other' }
    //         },

    //         func() { }
    //     }))();

    //     Backbone.history.handlers[0].callback('');
    //     assert.ok(Viking.controller instanceof Viking.Controller);

    //     Backbone.history.handlers[0].callback('');
    //     Backbone.history.handlers[2].callback('b');
    //     assert.ok(Viking.controller instanceof BController);

    //     Backbone.history.handlers[0].callback('');
    //     Backbone.history.handlers[5].callback('other');
    //     assert.equal(undefined, Viking.controller);

    //     Backbone.history.handlers[0].callback('');
    //     Backbone.history.handlers[1].callback('another');
    //     assert.equal(Another, Viking.controller);

    //     Backbone.history.handlers[0].callback('');
    //     Backbone.history.handlers[4].callback('func');
    //     assert.equal(undefined, Viking.controller);

    //     Backbone.history.handlers[0].callback('');
    //     Backbone.history.handlers[3].callback('closure');
    //     assert.equal(undefined, Viking.controller);

    //     router.cleanup();
    // });

    // test('routes to a Viking.Controller and undefined action', () => {
    //     const Controller = Viking.Controller.extend();
    //     const router = new (Viking.Router.extend({
    //         routes: {
    //             '': [Controller, 'action', 'root']
    //         }
    //     }))();

    //     assert.ok(Backbone.history.handlers[0].route.test(''));
    //     Backbone.history.handlers[0].callback('');
    //     router.cleanup();
    // });
    it('routes with a string', function (done) {
        let counter = 0;

        class Router extends VikingRouter {
            static routes = {
                '/country/state/city': () => {
                    counter++;
                    if (counter == 2) { done(); }
                }
            };
        }

        this.router = new Router();
        this.router.start();

        this.router.navigateTo('/country/state/city');
        this.router.navigateTo('/country/state/city/');
    });

    it('routes with a regex', function (done) {
        let counter = 0;

        class Router extends VikingRouter {
            static routes = {
                'r/^\/([a-z][a-z])\/([^\\/]+)\/([^\\/]+)$/': (state, something, another) => {
                    assert.equal(state, 'ca');
                    assert.equal(something, 'something');
                    assert.equal(another, 'another');
                    done();
                }
            };
        }

        this.router = new Router();
        this.router.start();

        this.router.navigateTo('/ca/something/another');
    });
	
    it('routes with a string that becomes a regex', function (done) {
        let counter = 0;

        class Router extends VikingRouter {
            static routes = {
                '/:country/:state/:city': (state, something, another) => {
                    assert.equal(state, 'ca');
                    assert.equal(something, 'something');
                    assert.equal(another, 'another');
                    counter++;
                    if (counter == 2) { done(); }
                }
            };
        }

        this.router = new Router();
        this.router.start();

        this.router.navigateTo('/ca/something/another');
        this.router.navigateTo('/ca/something/another/');
    });
    
    it('asdf', function () {
        let counter = 0;
        class Router extends VikingRouter {
            static routes = {
                '/projects/:id': (project_id) => {
                    assert.equal(project_id, counter == 3 ? '069fdb4a44b84013bca0f0f59ae9a718' : 'fdsafdsa');
                    counter++;
                }
            };
        }

        this.router = new Router();
        this.router.start();

        this.router.navigateTo('/projects')
        this.router.navigateTo('/projects/')
        this.router.navigateTo('/projects/fdsafdsa')
        this.router.navigateTo('/projects/fdsafdsa/')
        this.router.navigateTo('/projects/fdsafdsa/download')
        this.router.navigateTo('/projects/fdsafdsa?phase_id=fdsafdsa')  
        this.router.navigateTo('/projects/069fdb4a44b84013bca0f0f59ae9a718?phase_id=7776ca11567e4b8093217bd110d20b79')
        this.router.navigateTo('/projects/fdsafdsa/?phase_id=fdsafdsa/')
        this.router.navigateTo('/projects/fdsafdsa?phase_id=fdsafdsa/')
        
        assert.equal(6, counter);
    });
    
    it ('navigateTo passes params as query', function () {
        class Router extends VikingRouter {
            static routes = {
                '/projects': (params) => {
                    assert.equal(params.counter, 2);
                },
                '/projects_with_nested_params': (params) => {
                    assert.equal(params.nest.counter, 2);
                }
            };
        }

        this.router = new Router();
        this.router.start();

        this.router.navigateTo('/projects', {counter: 2})
        this.router.navigateTo('/projects_with_nested_params', {nest: {counter: 2}})
    })

    // test('routes with a string', async () => {
    //     await new Promise((resolve) => {
    //         Viking.context['Controller'] = {
    //             action: () => {
    //                 assert.ok(true);
    //                 resolve();
    //             }
    //         };

    //         const router = new (Viking.Router.extend({
    //             routes: {
    //                 '': 'Controller#action'
    //             }
    //         }))();

    //         assert.ok(Backbone.history.handlers[0].route.test(''));
    //         assert.ok(!Backbone.history.handlers[0].route.test('dca/something/another'));
    //         Backbone.history.handlers[0].callback.call(router, '');
    //         router.cleanup();
    //     });

    //     delete Viking.context['Controller'];
    // });

    // test('router.start() starts Backbone.history', async () => {
    //     await new Promise((resolve) => {
    //         const router = new Viking.Router();
    //         const oldstart = Backbone.history.start;

    //         Backbone.history.start = () => {
    //             assert.ok(true);
    //             resolve();
    //             return true;
    //         };

    //         router.start();
    //         Backbone.history.start = oldstart;
    //     });
    // });

    // test('router.start() passes {pushState: true} as options to Backbone.history', async () => {
    //     await new Promise((resolve) => {
    //         const router = new Viking.Router();
    //         const oldstart = Backbone.history.start;
    //         Backbone.history.start = (options) => {
    //             assert.deepEqual({ pushState: true }, options);
    //             resolve();
    //             return true;
    //         };
    //         router.start();
    //         Backbone.history.start = oldstart;
    //     });
    // });

    // test('router.start(options) passes options to Backbone.history', async () => {
    //     await new Promise((resolve) => {
    //         const router = new Viking.Router();
    //         const oldstart = Backbone.history.start;
    //         Backbone.history.start = (options) => {
    //             assert.deepEqual({ pushState: true, silent: true }, options);
    //             resolve();
    //             return true;
    //         };
    //         router.start({ silent: true });
    //         Backbone.history.start = oldstart;
    //     });
    // });

    // test('router.stop() stops Backbone.history', async () => {

    //     await new Promise((resolve) => {
    //         const router = new Viking.Router();
    //         const oldstop = Backbone.history.stop;

    //         Backbone.history.stop = () => {
    //             assert.ok(true);
    //             resolve();
    //             return true;
    //         };

    //         router.start();
    //         router.stop();
    //         Backbone.history.stop = oldstop;
    //         router.cleanup();
    //     });
    // });

    // test('router.start() calls callbacks with the name of the route', async () => {
    //     await new Promise((resolve) => {

    //         const Controller = {
    //             action() {
    //                 assert.ok(true);
    //             }
    //         };

    //         const router = new (Viking.Router.extend({
    //             routes: {
    //                 [document.location.pathname.replace('/', '')]: [Controller, 'action', 'root']
    //             }
    //         }))();

    //         router.on('route:root', () => {
    //             assert.ok(true);
    //             resolve();
    //         });
    //         router.start();

    //         router.cleanup();
    //         router.off('route:root');
    //     });
    // });

    // test('router.navigate() calls Backbone.Router.prototype.navigate', async () => {
    //     await new Promise((resolve) => {
    //         const oldnavigate = Backbone.Router.prototype.navigate;
    //         const router = new Viking.Router();
    //         Backbone.Router.prototype.navigate = function (f, a) {
    //             assert.equal(f, '/path');
    //             assert.equal(a, 'arguments');
    //             resolve();
    //             return this;
    //         };
    //         router.navigate('/path', 'arguments');

    //         Backbone.Router.prototype.navigate = oldnavigate;
    //     });
    // });

    // test('router.navigate() strips the root_url from urls from the current domain', async () => {
    //     await new Promise((resolve) => {
    //         const oldnavigate = Backbone.Router.prototype.navigate;
    //         const router = new Viking.Router();
    //         Backbone.Router.prototype.navigate = function (f, a) {
    //             assert.equal(f, '/path');
    //             assert.equal(a, 'arguments');
    //             resolve();
    //             return this;
    //         };
    //         router.navigate(window.location.protocol + '//' + window.location.host + '/path', 'arguments');

    //         Backbone.Router.prototype.navigate = oldnavigate;
    //     });
    // });

});