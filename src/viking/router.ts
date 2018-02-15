import * as _ from 'underscore';
import * as Backbone from 'backbone';

import { Viking } from '../viking';
import { context } from './context';

export const Router = Backbone.Router.extend({

    route(route, name, callback) {
        var router, controller, action;

        if (!_.isRegExp(route)) {
            if (/^r\/.*\/$/.test(route)) {
                route = new RegExp(route.slice(2, -1));
            } else {
                route = this._routeToRegExp(route);
            }
        }
// console.log(route, name, callback);
        if (_.isFunction(name)) {
            callback = name;
            name = '';
        } else if (_.isString(name) && name.match(/^(\w+)#(\w+)$/)) {
            controller = /^(\w+)#(\w+)$/.exec(name);
            action = controller[2];
            controller = context[controller[1]];
            callback = { controller, action };
        } else if (Array.isArray(name)) {
            controller = typeof name[0] === 'string' ? context[name[0]] : name[0];
            action = name[1];
            name = name[2] || '';
            callback = { controller, action };
        } else if (_.isObject(name)) {

            if (typeof name.to === 'string') {
                // TODO: maybe this should be Controller::action since it's not
                // an instance method
                controller = /^(\w+)#(\w+)$/.exec(name.to);
                action = controller[2];
                controller = context[controller[1]];
            } else {
                controller = name.to.controller;
                action = name.to.action;
            }
            name = name.name;

            callback = { controller, action };
        }

        if (!callback) { callback = this[name]; }
// console.log(name, callback);
        router = this;
        Backbone.history.route(route, function (fragment) {
            var Controller;
            var args = router._extractParameters(route, fragment);
            var current_controller = Viking.controller;
            Viking.controller = undefined;

            if (!callback) { return; }

            if (_.isFunction(callback)) {
                callback.apply(router, args);
            } else if (callback.controller) {
                Controller = callback.controller;

                if (Controller.__super__ === Viking.Controller.prototype) {
                    if (!(current_controller instanceof Controller)) {
                        Viking.controller = new Controller();
                    } else {
                        Viking.controller = current_controller;
                    }
                } else {
                    Viking.controller = Controller;
                }

                if (Viking.controller && Viking.controller[callback.action]) {
                    Viking.controller[callback.action].apply(Viking.controller, args);
                }
            }
// console.log('route:' + name)
            router.trigger.apply(router, ['route:' + name].concat(args));
            router.trigger('route', name, args);
            Backbone.history.trigger('route', router, name, args);
        });
        return this;
    },

    // Calls Backbone.history.start, with the default options {pushState: true}
    start(options) {
        options = _.extend({ pushState: true }, options);

        return Backbone.history.start(options);
    },

    stop() {
        Backbone.history.stop();
    },

    navigate(fragment, args) {
        const rootUrl = window.location.protocol + '//' + window.location.host;
        if (fragment.indexOf(rootUrl) === 0) { fragment = fragment.replace(rootUrl, ''); }

        Backbone.Router.prototype.navigate.call(this, fragment, args);
    }

});
