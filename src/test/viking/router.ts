import * as Backbone from 'backbone';
import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../viking';

module('Viking.Router', {
    beforeEach: () => {
        Viking.Router.prototype.cleanup = function () {
            this.stop()
            Backbone.history.handlers = [];
        }
    },

    afterEach: () => {
        delete Viking.Router.prototype.cleanup;
    }
}, () => {

    test('routes to a function in the router', async () => {
        await new Promise((resolve) => {
            let router = Viking.Router.extend({
                func: () => {
                    assert.ok(true);
                    resolve();
                },
                routes: { '': 'func' }
            });

            router = new router();
            assert.ok(Backbone.history.handlers[0].route.test(''));
            Backbone.history.handlers[0].callback('');
            router.cleanup();
        });
    });

    test('routes to a function', async () => {
        await new Promise((resolve) => {
            const func = () => {
                assert.ok(true);
                resolve();
            };
            let router = Viking.Router.extend({
                routes: {
                    '': func
                }
            });
            router = new router();

            assert.ok(Backbone.history.handlers[0].route.test(''));
            Backbone.history.handlers[0].callback('');
            router.cleanup();
        });
    });

    test('routes to a controller and action (normal obj)', async () => {
        await new Promise((resolve) => {
            Viking.context['Controller'] = Viking.Controller.extend({
                action: () => {
                    assert.ok(true);
                    resolve();
                }
            });

            let router = Viking.Router.extend({
                routes: {
                    '': { to: 'Controller#action', name: 'root' }
                }
            });

            router = new router();

            assert.ok(Backbone.history.handlers[0].route.test(''));
            Backbone.history.handlers[0].callback('');
            router.cleanup();
            delete Viking.context['Controller'];
        });
    });

    test('routes to a controller and action (defined controller)', async () => {
        await new Promise((resolve) => {
            const Controller = Viking.Controller.extend({
                action: () => {
                    assert.ok(true);
                    resolve();
                }
            });

            let router = Viking.Router.extend({
                routes: {
                    '': { to: { controller: Controller, action: 'action' }, name: 'root' }
                }
            });

            router = new router();

            assert.ok(Backbone.history.handlers[0].route.test(''));
            Backbone.history.handlers[0].callback('');
            router.cleanup();
        });
    });

    test('routes to a controller and undefined action', () => {
        const oldController = Viking.Controller;
        const Controller = {};

        let router = Viking.Router.extend({
            routes: {
                '': { to: [Controller, 'action', 'root'] }
            }
        });
        router = new router();

        assert.ok(Backbone.history.handlers[0].route.test(''));
        Backbone.history.handlers[0].callback('');
        router.cleanup();
    });

    test('routes to a undefined controller and undefined action', () => {
        let router = Viking.Router.extend({
            routes: {
                '': { to: 'Controller#action', name: 'root' }
            }
        });
        router = new router();

        assert.ok(Backbone.history.handlers[0].route.test(''));
        Backbone.history.handlers[0].callback('');
        router.cleanup();
    });

    test('routes to a uninitialized controller and action (Viking.Controller)', async () => {
        await new Promise((resolve) => {
            const Controller = Viking.Controller.extend({
                action() {
                    assert.ok(true);
                    resolve();
                }
            });

            const router = new (Viking.Router.extend({
                routes: {
                    '': { to: { controller: Controller, action: 'action' }, name: 'root' }
                }
            }))();

            assert.ok(Backbone.history.handlers[0].route.test(''));
            Backbone.history.handlers[0].callback('');
            router.cleanup();
        });
    });

    test('routes to a initialized controller and action (Viking.Controller)', async () => {
        await new Promise((resolve) => {
            const Controller = Viking.Controller.extend({
                action() {
                    assert.ok(true);
                    resolve();
                }
            });

            const router = new (Viking.Router.extend({
                routes: {
                    '': { to: { controller: Controller, action: 'action' }, name: 'root' }
                }
            }))();

            Viking.controller = new Viking.Controller();

            assert.ok(Backbone.history.handlers[0].route.test(''));
            Backbone.history.handlers[0].callback('');
            router.cleanup();
        });
    });

    test('routing to a Viking.Controller more than once in a row only initializes the controller once', async () => {
        await new Promise((resolve) => {
            let count = 0;

            const Controller = Viking.Controller.extend({
                initialize() {
                    assert.ok(count === 0);
                    count++;
                    resolve();
                }
            });

            const router = new (Viking.Router.extend({
                routes: {
                    '': [Controller, 'action', 'root']
                }
            }))();

            assert.ok(Backbone.history.handlers[0].route.test(''));
            Backbone.history.handlers[0].callback('');
            Backbone.history.handlers[0].callback('');
            Backbone.history.handlers[0].callback('');
            router.cleanup();
        });
    });

    test('routing to a Viking.Controller then to another route changes the controller', () => {
        const Controller = Viking.Controller.extend();
        const BController = Viking.Controller.extend({
            action: () => undefined
        });
        const Another = {};
        const router = new (Viking.Router.extend({
            routes: {
                '': [Controller, 'action', 'root'],
                'another': [Another, 'action', 'another'],
                'b': [BController, 'action', 'b'],
                'closure': () => undefined,
                'func': 'func',
                'other': { to: 'Other#action', name: 'other' }
            },

            func() { }
        }))();

        Backbone.history.handlers[0].callback('');
        assert.ok(Viking.controller instanceof Viking.Controller);

        Backbone.history.handlers[0].callback('');
        Backbone.history.handlers[2].callback('b');
        assert.ok(Viking.controller instanceof BController);

        Backbone.history.handlers[0].callback('');
        Backbone.history.handlers[5].callback('other');
        assert.equal(undefined, Viking.controller);

        Backbone.history.handlers[0].callback('');
        Backbone.history.handlers[1].callback('another');
        assert.equal(Another, Viking.controller);

        Backbone.history.handlers[0].callback('');
        Backbone.history.handlers[4].callback('func');
        assert.equal(undefined, Viking.controller);

        Backbone.history.handlers[0].callback('');
        Backbone.history.handlers[3].callback('closure');
        assert.equal(undefined, Viking.controller);

        router.cleanup();
    });

    test('routes to a Viking.Controller and undefined action', () => {
        const Controller = Viking.Controller.extend();
        const router = new (Viking.Router.extend({
            routes: {
                '': [Controller, 'action', 'root']
            }
        }))();

        assert.ok(Backbone.history.handlers[0].route.test(''));
        Backbone.history.handlers[0].callback('');
        router.cleanup();
    });

    test('routes with a regex', async () => {
        await new Promise((resolve) => {
            const router = new (Viking.Router.extend({
                routes: {
                    'r/^([a-z][a-z])\/([^\/]+)\/([^\/]+)$/': 'func'
                },

                func(state, something, another) {
                    assert.equal(state, 'ca');
                    assert.equal(something, 'something');
                    assert.equal(another, 'another');
                    resolve();
                }
            }))();

            assert.ok(Backbone.history.handlers[0].route.test('ca/something/another'));
            assert.ok(!Backbone.history.handlers[0].route.test('dca/something/another'));
            Backbone.history.handlers[0].callback.call(router, 'ca/something/another');
            router.cleanup();
        });
    });

    test('routes with a string', async () => {
        await new Promise((resolve) => {
            Viking.context['Controller'] = {
                action: () => {
                    assert.ok(true);
                    resolve();
                }
            };

            const router = new (Viking.Router.extend({
                routes: {
                    '': 'Controller#action'
                }
            }))();

            assert.ok(Backbone.history.handlers[0].route.test(''));
            assert.ok(!Backbone.history.handlers[0].route.test('dca/something/another'));
            Backbone.history.handlers[0].callback.call(router, '');
            router.cleanup();
        });

        delete Viking.context['Controller'];
    });

    test('router.start() starts Backbone.history', async () => {
        await new Promise((resolve) => {
            const router = new Viking.Router();
            const oldstart = Backbone.history.start;

            Backbone.history.start = () => {
                assert.ok(true);
                resolve();
                return true;
            };

            router.start();
            Backbone.history.start = oldstart;
        });
    });

    test('router.start() passes {pushState: true} as options to Backbone.history', async () => {
        await new Promise((resolve) => {
            const router = new Viking.Router();
            const oldstart = Backbone.history.start;
            Backbone.history.start = (options) => {
                assert.deepEqual({ pushState: true }, options);
                resolve();
                return true;
            };
            router.start();
            Backbone.history.start = oldstart;
        });
    });

    test('router.start(options) passes options to Backbone.history', async () => {
        await new Promise((resolve) => {
            const router = new Viking.Router();
            const oldstart = Backbone.history.start;
            Backbone.history.start = (options) => {
                assert.deepEqual({ pushState: true, silent: true }, options);
                resolve();
                return true;
            };
            router.start({ silent: true });
            Backbone.history.start = oldstart;
        });
    });

    test('router.stop() stops Backbone.history', async () => {

        await new Promise((resolve) => {
            const router = new Viking.Router();
            const oldstop = Backbone.history.stop;

            Backbone.history.stop = () => {
                assert.ok(true);
                resolve();
                return true;
            };

            router.start();
            router.stop();
            Backbone.history.stop = oldstop;
            router.cleanup();
        });
    });

    test('router.start() calls callbacks with the name of the route', async () => {
        await new Promise((resolve) => {

            const Controller = {
                action() {
                    assert.ok(true);
                }
            };

            const router = new (Viking.Router.extend({
                routes: {
                    [document.location.pathname.replace('/', '')]: [Controller, 'action', 'root']
                }
            }))();

            router.on('route:root', () => {
                assert.ok(true);
                resolve();
            });
            router.start();

            router.cleanup();
            router.off('route:root');
        });
    });

    test('router.navigate() calls Backbone.Router.prototype.navigate', async () => {
        await new Promise((resolve) => {
            const oldnavigate = Backbone.Router.prototype.navigate;
            const router = new Viking.Router();
            Backbone.Router.prototype.navigate = function (f, a) {
                assert.equal(f, '/path');
                assert.equal(a, 'arguments');
                resolve();
                return this;
            };
            router.navigate('/path', 'arguments');

            Backbone.Router.prototype.navigate = oldnavigate;
        });
    });

    test('router.navigate() strips the root_url from urls from the current domain', async () => {
        await new Promise((resolve) => {
            const oldnavigate = Backbone.Router.prototype.navigate;
            const router = new Viking.Router();
            Backbone.Router.prototype.navigate = function (f, a) {
                assert.equal(f, '/path');
                assert.equal(a, 'arguments');
                resolve();
                return this;
            };
            router.navigate(Viking.context.location.protocol + '//' + Viking.context.location.host + '/path', 'arguments');

            Backbone.Router.prototype.navigate = oldnavigate;
        });
    });

});
