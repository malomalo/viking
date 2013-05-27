Viking.Router = Backbone.Router.extend({
    
    route: function(route, name, callback) {
        var router, controller, action;
        
        if (!_.isRegExp(route)) {
            if(/^r\/.*\/$/.test(route)) {
                route = new RegExp(route.slice(2, -1));
            } else {
                route = this._routeToRegExp(route);
            }
        }
        if (_.isFunction(name)) {
            callback = name;
            name = '';
        }

        if (_.isObject(name)) {
            // TODO: maybe this should be Controller::action since it's not
            // an instance method
            controller = /^(\w+)#(\w+)$/.exec(name.to);
            action = controller[2];
            controller = controller[1];
            name = name.name;
            
            if (window[controller] && window[controller][action]) {
                callback = window[controller][action];
            }
        }
        if (!callback) { callback = this[name]; }
                
        router = this;
        Backbone.history.route(route, function(fragment) {
            var args = router._extractParameters(route, fragment);
            callback && callback.apply(router, args);
            router.trigger.apply(router, ['route:' + name].concat(args));
            router.trigger('route', name, args);
            Backbone.history.trigger('route', router, name, args);
        });
        return this;
    },
        
    start: function() {
        return Backbone.history.start({pushState: true});
    },
    stop: function() {
        Backbone.history.stop();
    },
    
    navigate: function(fragment, args) {
        var root_url = window.location.protocol + '//' + window.location.host;
        if(fragment.indexOf(root_url) === 0) { fragment = fragment.replace(root_url, ''); }
        
        Backbone.Router.prototype.navigate.call(this, fragment, args);
    }
    
});