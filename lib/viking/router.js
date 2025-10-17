import EventBus from './eventBus.js';
import Controller from './controller.js';
import {each} from './support.js';
import {constantize} from './support/string.js';
import {toParam} from './support/object.js';
import {parseSearchParams} from './support/url.js';

/**
 * @typedef {Object} RouteSet
 * @property {string|RouteDefinition|Function} route - Route definition or handler function
 */

/**
 * @typedef {Object} RouteDefinition
 * @property {string|Function} to - Controller#action string or handler function
 * @property {string} [as] - Optional name for the route
 */

/**
 * @typedef {Object} Route
 * @property {*} [propName] - Route properties
 */

/**
 * @typedef {Object} RouterHandler
 * @property {string|null} name - The name of the route
 * @property {RegExp} route - The regular expression that matches the route
 * @property {Object|Function} callback - The handler for the route
 * @property {*} [callback.controller] - The controller class or instance
 * @property {string} [callback.action] - The action to invoke on the controller
 */

/**

 */


/**
 * Router handles URL routing in Viking applications.
 * 
 * The Router maps URLs to controllers and actions, allowing for clean,
 * RESTful URLs. It manages browser history and provides navigation 
 * methods to move between application states without full page reloads.
 *
 * ### Router Events
 * 
 * | Event | Arguments | Description |
 * | ----- | --------- | ----------- |
 * | beforeNavigation | url | Triggered when navigation in the app is about to happen |
 * | afterNavigation | url | Triggered when navigation in the app has completed |
 * 
 * @extends EventBus
 * @param {Application} application - The application this router belongs to
 */
export default class Router extends EventBus {
    /**
     * Static routes configuration
     * @type {RouteSet}
     */
    static routes = {};

    /**
     * Array of route handlers
     * @type {RouterHandler[]}
     */
    handlers = [];
    
    /**
     * Regular expression for matching optional parameters
     * @type {RegExp}
     * @private
     */
    optionalParam = /\((.*?)\)/g;
    
    /**
     * Regular expression for matching named parameters
     * @type {RegExp}
     * @private
     */
    namedParam = /(\(\?)?:(\w+)/g;
    
    /**
     * Regular expression for matching splat parameters
     * @type {RegExp}
     * @private
     */
    splatParam = /\*\w+/g;
    
    /**
     * Regular expression for escaping special characters in routes
     * @type {RegExp}
     * @private
     */
    escapeRegExp = /[\-{}\[\]+?.,\\\^$|#\s]/g;

    constructor(application) {
        super();
        this.application = application;
        Object.keys(this.constructor.routes).reverse().forEach(key => {
            this.route(key, this.constructor.routes[key]);
        })
        
        this.popstateCallback = () => { this.loadUrl() };
        window.addEventListener('popstate', this.popstateCallback, false);

        this.initialize.apply(this, arguments);
    }

    /**
     * Initialize is an empty function by default. Override it with your own
     * initialization logic if needed.
     */
    initialize() {
    }
    
    /**
     * Start the router, loading the current URL
     */
    start() {
        this.loadUrl();
    }

    /**
     * Stop the router, removing event listeners
     */
    stop() {
        window.removeEventListener('popstate', this.popstateCallback, false);
    }

    /**
     * Navigate to a specific URL, updating browser history and firing navigation events
     * 
     * @param {string} url - The URL to navigate to
     * @param {Object} [params] - Query parameters to append to the URL
     */
    navigateTo(url, params) {
        if(params) {
            url += "?" + toParam(params)
        }
        history.pushState({}, '', url);
        this.dispatchEvent('beforeNavigation', url)
        this.loadUrl();
        this.dispatchEvent('afterNavigation', url)
    }

    /**
     * Get the current URL path
     * 
     * @return {string} The current URL path, decoded
     */
    getPath() {
        let path = '/' + window.location.pathname;
        path = decodeURI(path.replace(/%25/g, '%2525'));
        // path = path.slice(this.root.length - 1);
        return path.charAt(0) === '/' ? path.slice(1) : path;
    }

    /**
     * Get the current URL query string
     * 
     * @return {string} The query string portion of the URL
     */
    getSearch() {
        let match = window.location.href.replace(/#.*/, '').match(/\?.+/);
        return match ? match[0] : '';
    }

    /**
     * Find the handler for a given path
     * 
     * @param {string} path - The path to find a handler for
     * @return {RouterHandler|undefined} The handler for the path, or undefined if not found
     */
    handlerForPath(path) {
        return this.handlers.find((h) => h.route.test(path));
    }

    /**
     * Load the current URL and execute the matching handler
     * 
     * This method is called on popstate events and when navigating programmatically
     */
    loadUrl() {
        let path = this.getPath();
        let handler = this.handlerForPath(path);

        let params = parseSearchParams(window.location.search);

        if (handler) {
            let newController = null;
            let args = [];
            const matches = handler.route.exec(path);
            args = matches.slice(1).map(param => {
                return param ? decodeURIComponent(param) : undefined
            } ).filter(x => x)
            if (matches.groups) {
                Object.keys(matches.groups).forEach(key => {
                    params[key] = decodeURIComponent(matches.groups[key])
                });
            }
            args.push(params)
            
//             var current_controller = Viking.controller;
//             Viking.controller = undefined;

            if (typeof handler.callback === 'object') {
                if (handler.callback.controller) {
                    if (Controller.isPrototypeOf(handler.callback.controller)) {
                        var controller = new handler.callback.controller(this.application)
                        if (this.application) {
                            this.application.controller = controller;
                        }
                        controller.dispatch(handler.callback.action, ...args);
                    } else if (handler.callback.controller instanceof Function){
                        var controller = new handler.callback.controller(this.application)
                        controller[handler.callback.action](...args);
                    } else {
                        handler.callback.controller[handler.callback.action](...args);
                    }
                } else {
                    this[handler.callback.action](...args);
                }
            } else if (handler.callback) {
                handler.callback(...args);
            }

//             } else if (callback.controller) {
//                 Controller = callback.controller;

//                 if (Controller.__super__ === Viking.Controller.prototype) {
//                     if (!(current_controller instanceof Controller)) {
//                         Viking.controller = new Controller();
//                     } else {
//                         Viking.controller = current_controller;
//                     }
//                 } else {
//                     Viking.controller = Controller;
//                 }

//                 if (Viking.controller && Viking.controller[callback.action]) {
//                     Viking.controller[callback.action].apply(Viking.controller, args);
//                 }
//             }
// // console.log('route:' + name)
//             router.trigger.apply(router, ['route:' + name].concat(args));
//             router.trigger('route', name, args);
//             Backbone.history.trigger('route', router, name, args);
//         });
//         return this;
//     },

        }
    }

    /**
     * Define a route that maps a URL pattern to a controller action or callback function
     * 
     * @param {string|RegExp} route - The route pattern to match
     * @param {string|Object|Function} [name] - The name of the route, controller#action string, or handler function
     * @param {Function} [callback] - The callback function to execute when the route matches
     * @return {Viking.Router} Returns this for chaining
     */
    route(route, name, callback) {
        let controller, action;
        if (!(route instanceof RegExp)) {
            if (/^r\/.*\/$/.test(route)) {
                route = new RegExp(route.slice(2, -1));
            } else {
                route = this.routeToRegExp(route);
            }
        }

        if (typeof name === 'function') {
            callback = name;
            name = null;
        } else if (typeof name === 'string' && name.match(/^(\w+)#(\w+)$/)) {
            controller = /^(\w+)#(\w+)$/.exec(name); // as string[];
            action = controller[2];
            controller = constantize(controller[1]);
            callback = { controller, action };
        } else if (Array.isArray(name)) {
            controller = typeof name[0] === 'string' ? constantize(name[0]) : name[0];
            action = name[1];
            name = name[2] || null;
            callback = { controller, action };
        } else if (typeof name === 'object') {
            if (typeof name.to === 'string') {
                controller = /^(\w+)#(\w+)$/.exec(name.to); // as string[];
                action = controller[2];
                controller = constantize(controller[1]);
            } else if (Array.isArray(name.to)) {
                action = name.to[1];
                controller = name.to[0];
            } else {
                controller = name.to.controller;
                action = name.to.action;
            }
            name = name.name;

            callback = { controller, action };
        }

        if (!callback && name) {
            callback = { action: name };
        }

        this.handlers.unshift({ name, route, callback });
    }

    /**
     * Convert a route string pattern to a regular expression
     * 
     * The router uses the following syntax for defining routes:
     * - `:name` - Named parameter
     * - `*splat` - Splat parameter
     * - `(...)` - Optional part
     * 
     * @param {string} route - The route pattern to convert
     * @return {RegExp} A regular expression that matches the route pattern
     * @private
     */
    routeToRegExp(route) {
        route = route.replace(this.escapeRegExp, '\\$&')
                         .replace(this.optionalParam, '(?:$1)?')
                         .replace(this.namedParam, (match, optional, name) => {
                             return optional ? match : `(?<${name}>[^/?]+)`
                         })
                         .replace(/\//g, '\\/')
                         .replace(this.splatParam, '([^?]*?)');
        return new RegExp('^' + route + '\\/?(?:\\?([\\s\\S]*))?$');
    }
}






//     navigate(fragment, args) {
//         const rootUrl = window.location.protocol + '//' + window.location.host;
//         if (fragment.indexOf(rootUrl) === 0) { fragment = fragment.replace(rootUrl, ''); }

//         Backbone.Router.prototype.navigate.call(this, fragment, args);
//     }

// });
