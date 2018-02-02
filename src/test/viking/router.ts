import * as Backbone from 'backbone';
import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../viking';

module('Viking.Router', {
    beforeEach: () => {
        Viking.Router.prototype.cleanup = function() {
            this.stop()
            Backbone.history.handlers = [];
        }
    },
    
    afterEach: () => {
        delete Viking.Router.prototype.cleanup;
    }
}, () => {
    test("routes to a function in the router", async () => {
        await new Promise((resolve) => {
            var router = Viking.Router.extend({
                routes: {
                    '': 'func'
                },
                func: () => {
                    assert.ok(true);
                    resolve();
                }
            });

            router = new router();
            assert.ok(Backbone.history.handlers[0].route.test(''));
            Backbone.history.handlers[0].callback('');
            router.cleanup();
        });
    });

    test("routes to a function", async () => {
        await new Promise((resolve) => {
            var func = function() {
                assert.ok(true);
                resolve();
            };
            var router = Viking.Router.extend({
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

    // test("routes to a controller and action (normal obj)", async () => {
    //     await new Promise((resolve) => {
    //         var Controller = Viking.Controller.extend({
    //             action: function() {
    //                 assert.ok(true);
    //                 resolve();
    //             }
    //         })
    //         var router = Viking.Router.extend({
    //             routes: {
    //                 '': {to: 'Controller#action', name: 'root'}
    //             }
    //         });
    //         router = new router();
    //
    //         assert.ok(Backbone.history.handlers[0].route.test(''));
    //         Backbone.history.handlers[0].callback('');
    //         router.cleanup();
    //     });
    // });
    //
    // test("routes to a controller and undefined action", function() {
    //     Viking.Controller = { }
    //     var router = Viking.Router.extend({
    //         routes: {
    //             '': {to: 'Controller#action', name: 'root'}
    //         }
    //     });
    //     router = new router();
    //
    //     assert.ok(Backbone.history.handlers[0].route.test(''));
    //     Backbone.history.handlers[0].callback('');
    //     router.cleanup();
    // });

    test("routes to a undefined controller and undefined action", function() {
        var router = Viking.Router.extend({
            routes: {
                '': {to: 'Controller#action', name: 'root'}
            }
        });
        router = new router();

        assert.ok(Backbone.history.handlers[0].route.test(''));
        Backbone.history.handlers[0].callback('');
        router.cleanup();
    });

    // test("routes to a uninitialized controller and action (Viking.Controller)", async () => {
    //     await new Promise((resolve) => {
    //         Viking.Controller = Viking.Controller.extend({ action: function() {
    //             assert.ok(true);
    //             resolve();
    //         } })
    //         var router = Viking.Router.extend({
    //             routes: {
    //                 '': {to: 'Controller#action', name: 'root'}
    //             }
    //         });
    //         router = new router();
    //
    //         assert.ok(Backbone.history.handlers[0].route.test(''));
    //         Backbone.history.handlers[0].callback('');
    //         router.cleanup();
    //     });
    // });
    //
    // test("routes to a initialized controller and action (Viking.Controller)", async () => {
    //     await new Promise((resolve) => {
    //
    //         Viking.Controller = Viking.Controller.extend({ action: function() {
    //             assert.ok(true);
    //             resolve();
    //         } })
    //         var router = Viking.Router.extend({
    //             routes: {
    //                 '': {to: 'Controller#action', name: 'root'}
    //             }
    //         });
    //         router = new router();
    //         Viking.controller = new Viking.Controller();
    //
    //         assert.ok(Backbone.history.handlers[0].route.test(''));
    //         Backbone.history.handlers[0].callback('');
    //         router.cleanup();
    //     });
    // });
    //
    // test("routing to a Viking.Controller more than once in a row only initializes the controller once", async () => {
    //     await new Promise((resolve) => {
    //
    //         Viking.Controller = Viking.Controller.extend({ initialize: function() {
    //             assert.ok(true);
    //             resolve();
    //         } })
    //         var router = Viking.Router.extend({
    //             routes: {
    //                 '': {to: 'Controller#action', name: 'root'}
    //             }
    //         });
    //         router = new router();
    //
    //         assert.ok(Backbone.history.handlers[0].route.test(''));
    //         Backbone.history.handlers[0].callback('');
    //         Backbone.history.handlers[0].callback('');
    //         Backbone.history.handlers[0].callback('');
    //         router.cleanup();
    //     });
    // });
    //
    // test("routing to a Viking.Controller then to another route changes the controller", function() {
    //     Viking.Controller = Viking.Controller.extend();
    //     var BController = Viking.Controller.extend();
    //     var Another = {};
    //     var router = Viking.Router.extend({
    //         routes: {
    //             '': {to: 'Controller#action', name: 'root'},
    //             'b': {to: 'BController#action', name: 'b'},
    //             'other': {to: 'Other#action', name: 'other'},
    //             'another': {to: 'Another#action', name: 'another'},
    //             'func': 'func',
    //             'closure': function() { }
    //         },
    //
    //         func: function() { }
    //     });
    //     router = new router();
    //
    //     Backbone.history.handlers[0].callback('');
    //     assert.ok(Viking.controller instanceof Viking.Controller);
    //
    //     Backbone.history.handlers[0].callback('');
    //     Backbone.history.handlers[1].callback('b');
    //     assert.ok(Viking.controller instanceof BController);
    //
    //     Backbone.history.handlers[0].callback('');
    //     Backbone.history.handlers[2].callback('other');
    //     assert.equal(undefined, Viking.controller);
    //
    //     Backbone.history.handlers[0].callback('');
    //     Backbone.history.handlers[3].callback('another');
    //     assert.equal(Another, Viking.controller);
    //
    //     Backbone.history.handlers[0].callback('');
    //     Backbone.history.handlers[4].callback('func');
    //     assert.equal(undefined, Viking.controller);
    //
    //     Backbone.history.handlers[0].callback('');
    //     Backbone.history.handlers[5].callback('closure');
    //     assert.equal(undefined, Viking.controller);
    //
    //     router.cleanup();
    // });
    //
    // test("routes to a Viking.Controller and undefined action", function() {
    //     Viking.Controller = Viking.Controller.extend();
    //     var router = Viking.Router.extend({
    //         routes: {
    //             '': {to: 'Controller#action', name: 'root'}
    //         }
    //     });
    //     router = new router();
    //
    //     assert.ok(Backbone.history.handlers[0].route.test(''));
    //     Backbone.history.handlers[0].callback('');
    //     router.cleanup();
    // });
    //
    // test("routes with a regex", async () => {
    //     await new Promise((resolve) => {
    //         var router = Viking.Router.extend({
    //             routes: {
    //                 'r/^([a-z][a-z])\/([^\/]+)\/([^\/]+)$/': 'func',
    //             },
    //             func: function(state,something,another) {
    //                 assert.equal(state, 'ca');
    //                 assert.equal(something, 'something');
    //                 assert.equal(another, 'another');
    //                 resolve();
    //             }
    //         });
    //         router = new router();
    //         assert.ok(Backbone.history.handlers[0].route.test('ca/something/another'));
    //         assert.ok(!Backbone.history.handlers[0].route.test('dca/something/another'));
    //         Backbone.history.handlers[0].callback.call(router, 'ca/something/another');
    //         router.cleanup();
    //     });
    // })
    //
    // test('routes with a string', async () => {
    //     await new Promise((resolve) => {
    //
    //         var router = Viking.Router.extend({
    //             routes: {
    //                 '': 'Controller#action',
    //             }
    //         });
    //         router = new router();
    //
    //         Viking.Controller = { action: function() {
    //             assert.ok(true);
    //             resolve();
    //         } }
    //         assert.ok(Backbone.history.handlers[0].route.test(''));
    //         assert.ok(!Backbone.history.handlers[0].route.test('dca/something/another'));
    //         Backbone.history.handlers[0].callback.call(router, '');
    //         router.cleanup();
    //     });
    // });
    //
    // test("router.start() starts Backbone.history", async () => {
    //     await new Promise((resolve) => {
    //         var router = new Viking.Router();
    //         var oldstart = Backbone.history.start
    //         Backbone.history.start = () => {
    //             assert.ok(true);
    //             resolve();
    //             return true;
    //         }
    //         router.start();
    //         Backbone.history.start = oldstart;
    //     });
    // });
    //
    // test("router.start() passes {pushState: true} as options to Backbone.history", async () => {
    //     await new Promise((resolve) => {
    //         var router = new Viking.Router();
    //         var oldstart = Backbone.history.start
    //         Backbone.history.start = function(options) {
    //             assert.deepEqual({pushState: true}, options);
    //             resolve();
    //             return true;
    //         }
    //         router.start();
    //         Backbone.history.start = oldstart;
    //     });
    // });
    //
    // test("router.start(options) passes options to Backbone.history", async () => {
    //     await new Promise((resolve) => {
    //         var router = new Viking.Router();
    //         var oldstart = Backbone.history.start
    //         Backbone.history.start = function(options) {
    //             assert.deepEqual({pushState: true, silent: true}, options);
    //             resolve();
    //             return true;
    //         }
    //         router.start({silent: true});
    //         Backbone.history.start = oldstart;
    //     });
    // });
    //
    // test("router.stop() stops Backbone.history", async () => {
    //
    //     await new Promise((resolve) => {
    //         var router = new Viking.Router();
    //         var oldstop = Backbone.history.stop
    //         Backbone.history.stop = function() {
    //             assert.ok(true);
    //             resolve();
    //             return true;
    //         }
    //         router.start();
    //         router.stop();
    //         Backbone.history.stop = oldstop;
    //         router.cleanup();
    //     });
    // });
    //
    // test('router.start() calls callbacks with the name of the route', async () => {
    //     await new Promise((resolve) => {
    //
    //         Viking.Controller = { action: function() {
    //             assert.ok(true);
    //         } }
    //         var r = {}
    //         r[window.location.pathname.replace('/','')] = {to: 'Controller#action', name: 'root'}
    //         var Router = Viking.Router.extend({ routes: r });
    //
    //         var router = new Router();
    //         router.on('route:root', function() {
    //             assert.ok(true);
    //             resolve();
    //         });
    //         router.start();
    //
    //         router.cleanup();
    //         router.off('route:root');
    //     });
    // });
    //
    // test('router.navigate() calls Backbone.Router.prototype.navigate', async () => {
    //     await new Promise((resolve) => {
    //
    //         var oldnavigate = Backbone.Router.prototype.navigate;
    //
    //         var router = new Viking.Router();
    //         Backbone.Router.prototype.navigate = function(f, a) {
    //             assert.equal(f, '/path');
    //             assert.equal(a, 'arguments');
    //             resolve();
    //             return this;
    //         };
    //         router.navigate('/path', 'arguments');
    //
    //         Backbone.Router.prototype.navigate = oldnavigate;
    //     });
    // });
    //
    // test('router.navigate() strips the root_url from urls from the current domain', async () => {
    //     await new Promise((resolve) => {
    //
    //         var oldnavigate = Backbone.Router.prototype.navigate;
    //
    //         var router = new Viking.Router();
    //         Backbone.Router.prototype.navigate = function(f, a) {
    //             assert.equal(f, '/path');
    //             assert.equal(a, 'arguments');
    //             resolve();
    //             return this;
    //         };
    //         router.navigate(window.location.protocol + '//' + window.location.host + '/path', 'arguments');
    //
    //         Backbone.Router.prototype.navigate = oldnavigate;
    //     });
    // });
});