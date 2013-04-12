Viking.Router = Backbone.Router.extend({
    
    route: function(route, callback) {
        if (!_.isRegExp(route)) { route = this._routeToRegExp(route); }
        Backbone.history.route(route, _.bind(function(fragment) {
            var args = this._extractParameters(route, fragment);
            if (window[callback.controller] && window[callback.controller][callback.action]) {
                window[callback.controller][callback.action].apply(this, args);
            }
            this.trigger.apply(this, ['route:' + callback.name].concat(args));
            this.trigger('route', callback.name, args);
            Backbone.history.trigger('route', this, route, args);
        }, this));
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