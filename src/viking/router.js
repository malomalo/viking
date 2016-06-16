import Controller from './controller';

// export let currentController;

export const Router = Backbone.Router.extend({

    currentController: undefined,

    route: function (route, name, callback) {
        let router, controller, action;

        if (!_.isRegExp(route)) {
            if (/^r\/.*\/$/.test(route)) {
                route = new RegExp(route.slice(2, -1));
            } else {
                route = this._routeToRegExp(route);
            }
        }

        if (_.isFunction(name)) {
            callback = name;
            name = '';
        } else if (_.isString(name) && name.match(/^(\w+)#(\w+)$/)) {
            controller = /^(\w+)#(\w+)$/.exec(name);
            action = controller[2];
            controller = controller[1];
            callback = {controller: controller, action: action};
        } else if (_.isObject(name)) {
            // TODO: maybe this should be Controller::action since it's not
            // an instance method
            controller = /^(\w+)#(\w+)$/.exec(name.to);
            action = controller[2];
            controller = controller[1];
            name = name.name;

            callback = {controller: controller, action: action};
        }

        if (!callback) { callback = this[name]; }

        router = this;
        Backbone.history.route(route, function (fragment) {
            let controllerClass;
            let args = router._extractParameters(route, fragment);
            let previousController = router.currentController;
            router.currentController = undefined;

            if (!callback) { return; }

            if (_.isFunction(callback)) {
                callback.apply(router, args);
            } else if (window[callback.controller]) {
                controllerClass = window[callback.controller];

                if (controllerClass.__super__ === Controller.prototype) {
                    if ( !(previousController instanceof controllerClass) ) {
                        router.currentController = new controllerClass();
                    } else {
                        router.currentController = previousController;
                    }
                } else {
                    router.currentController = controllerClass;
                }
    
                if (router.currentController && router.currentController[callback.action]) {
                    router.currentController[callback.action].apply(router.currentController, args);
                }
            }

            router.trigger.apply(router, ['route:' + name].concat(args));
            router.trigger('route', name, args);
            Backbone.history.trigger('route', router, name, args);
        });
        return this;
    },

    // Calls Backbone.history.start, with the default options {pushState: true}
    start: function (options) {
        options = _.extend({pushState: true}, options);
        
        return Backbone.history.start(options);
    },

    stop: function () {
        Backbone.history.stop();
    },

    navigate: function (fragment, args) {
        let root_url = window.location.protocol + '//' + window.location.host;
        if (fragment.indexOf(root_url) === 0) { fragment = fragment.replace(root_url, ''); }

        Backbone.Router.prototype.navigate.call(this, fragment, args);
    }

});

export default Router;
