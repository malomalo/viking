Viking.Router = Backbone.Router.extend({

    route: function (route, name, callback) {
        var router, controller, action;

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
			var Controller;
            var args = router._extractParameters(route, fragment);
			var current_controller = Viking.controller;
			Viking.controller = undefined;

			if (!callback) { return; }
			
			if (_.isFunction(callback)) {
				callback.apply(router, args);
			} else if (window[callback.controller]) {
				Controller = window[callback.controller];
				
				if (Controller.__super__ === Viking.Controller.prototype) {
					if ( !(current_controller instanceof Controller) ) {
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
			
            router.trigger.apply(router, ['route:' + name].concat(args));
            router.trigger('route', name, args);
            Backbone.history.trigger('route', router, name, args);
        });
        return this;
    },

    start: function () {
        return Backbone.history.start({pushState: true});
    },

    stop: function () {
        Backbone.history.stop();
    },

    navigate: function (fragment, args) {
        var root_url = window.location.protocol + '//' + window.location.host;
        if (fragment.indexOf(root_url) === 0) { fragment = fragment.replace(root_url, ''); }

        Backbone.Router.prototype.navigate.call(this, fragment, args);
    }

});