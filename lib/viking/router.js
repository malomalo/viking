import EventBus from './eventBus';
import Controller from './controller';
import {each} from './support';
import {constantize} from './support/string';
import {toParam} from './support/object';


// export interface IRouteSet {
//     [propName: string]: string | IRouterDefinition | ((...args: string[]) => void);
// }
//
// export interface IRouterDefinition {
//     to: string | ((...args: string[]) => void);
//     as?: string;
// }
//
// export interface IRoute {
//     [propName: string]: any;
// }
//
// export interface IRouterHandler {
//     name: string | null;
//     route: RegExp;
//     callback: {controller: any, action: string} | ((...args: string[]) => void);
// }

export default class Router extends EventBus {
    static routes = {}; //: IRouteSet

    handlers      = []; //: IRouterHandler[]
    optionalParam = /\((.*?)\)/g;
    namedParam    = /(\(\?)?:\w+/g;
    splatParam    = /\*\w+/g;
    escapeRegExp  = /[\-{}\[\]+?.,\\\^$|#\s]/g;

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

    initialize() {
    }
    
    start() {
        this.loadUrl();
    }

    stop() {
        window.removeEventListener('popstate', this.popstateCallback, false);
    }

    navigateTo(url, params) {
        if(params) {
            url += "?" + toParam(params)
        }
        history.pushState({}, '', url);
        this.loadUrl();
    }

    getPath() {
        let path = '/' + window.location.pathname;
        path = decodeURI(path.replace(/%25/g, '%2525'));
        // path = path.slice(this.root.length - 1);
        return path.charAt(0) === '/' ? path.slice(1) : path;
    }

    getSearch() {
        let match = window.location.href.replace(/#.*/, '').match(/\?.+/);
        return match ? match[0] : '';
    }

    handlerForPath(path) {
        return this.handlers.find((h) => h.route.test(path));
    }

    loadUrl() {
        let path = this.getPath();
        let handler = this.handlerForPath(path);

        let params = {};
        (new URLSearchParams(window.location.search)).forEach((value, key) => {
          params[key] = value
        })

        if (handler) {
            let newController = null;
            
            let args = handler.route.exec(path).slice(1).map((param, index) => {
                const key = (handler.namedParams || [])[index] || index
                if (param) {
                    params[key] = decodeURIComponent(param)
                }
                return params[key];
            }).filter(x => x);
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

    // route(route: string | RegExp, name: string, callback: () => void);
    // route(route: string | RegExp, callback: () => void);
    route(route, name, callback) {
        let controller, action, namedParams;
        if (!(route instanceof RegExp)) {
            if (/^r\/.*\/$/.test(route)) {
                route = new RegExp(route.slice(2, -1));
            } else {
                namedParams = route.match(/(?<=\/\:)\w+/g)
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

        this.handlers.unshift({ name, route, callback, namedParams });
    }

    // routeToRegExp(route: string)
    routeToRegExp(route) {
        route = route.replace(this.escapeRegExp, '\\$&')
                         .replace(this.optionalParam, '(?:$1)?')
                         .replace(this.namedParam, (match, optional) => optional ? match : '([^/?]+)')
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
