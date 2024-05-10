import * as Errors from './errors';
import EventBus from './eventBus';
import {each, result, uniqueId} from './support';
import {ActionNotFound} from './errors';

/**
 * @typedef {Object} AroundActionCallbackOptions
 * @property {string|string[]} only - Only run the callback on these action(s).
 * @property {string[]} except - Don't run the callback on these action(s).
 */

/**
 * @typedef {[callback, options]} AroundActionCallbackWithOptions
 * @property {string|function} callback - Method on the controller to call or a Function to call.
 * @property {AroundActionCallbackOptions} options - Options when to run the callback
 */

/**
 * @typedef {string|function|AroundActionCallbackWithOptions} AroundActionCallback
 */


/**
 * Viking Controllers are core to determining what Javascript is run for an URL.
 * They are made up of one ore more actions that are executed on a page load.
 *
 * By default only the `ApplicationController` extends `Viking/Controller`. All
 * other controllers extend `AppcliationController`. This gives you one class to
 * configure things like ensuring a user has logged in.
 *
 * When a URL is being dispatched the action being run is available at
 * `this.action_name`.
 *
 * ```javascript
 * let myClass = new MyClass();
 *
 * ```javascript
 * class PropertiesController extends ApplicationController {
 *   index() {
 *     console.log(`You have readed the ${this.action_name} page`);
 *   }
 * }
 * ```
 *
 * ## Parameters
 * 
 * All request parameters, weather they come from the query string in the URL or
 * extracted from URL path via the {@link Router} are available through the params
 * Object For example an action that was performed at the URL path
 * `/posts/category=All&limit=5` will include `{category: 'All', limit: 5}` in
 * `params`.
 *
 * It's also possible to construct multi-dimensional parameter hashes by
 * specifying keys using brackets, such as:
 *
 * - `post[name]=david`
 * - `post[address]=spain`
 *
 * The params in this case would include: `{post: {name: 'david', address: 'spain'}}`
 *
 * ## Rendering / Displaying a View
 *
 * To display and render a view as the primary View in the application you can
 * display it with `this.display`.
 *
 * ```javascript
 * this.display(PropertyView, {record: property});
 * ```
 *
 * ## Redirecting
 *
 * Redirects are used to move from one action to another. For example redirecting
 * to the login page is the user is not logged int.
 *
 * ```javascript
 * this.redirectTo('/login');
 * ```
 *
 * ## Calling `display` or `redirectTo` multiple times
 * An action may only contain a single render or redirect. Attempting to try to
 * do either again in the same action will result in a `DoubleRenderError`:
 *
 * ```javascript
 * login() {
 *   this.redirectTo('/elsewhere');
 *   this.display(LoginView); // throws DoubleRenderError
 * }
 * ```
 *
 * If you need to redirect based on a condition either return after redirecting
 * so that `display` doesn't get called or use and if/else statment.
 */
export default class Controller extends EventBus {

    /**
     * `aroundActions` are functions or methods that are run around a controller
     * action.
     *
     * `aroundActions` are inherited. If you set a around action on
     * ApplicationController it will be run on every controller that inherits
     * from ApplicationController.
     *
     * If a string is given the function on the controller will be called. If
     * a function is given that function will be called. Both methods and
     * functions will revieve a callback to execute to continue processing the
     * action.
     *
     * <caption>An around filter requiring a user to be logged in</caption>
     * ```javascript
     * class ApplicationController extends VikingController {
     *   static aroundActions = ['requireAccount'];
     *
     *   requireAccount(callback) {
     *     let session = await Session.current();
     *     
     *     if (session) {
     *       callback();
     *     } else {
     *       this.redirectTo('/login');
     *     }
     *   }
     * }
     * ```
     *
     * If you want an aroundAction to only be called on certain actions you can
     * pass the `only` options:
     *
     * ```javascript
     * class ApplicationController extends VikingController {
     *   static aroundActions = [
     *     ['requireAccount', {only: ['protectedAction']}]
     *   ];
     * }
     * ```
     *
     * You may also pass the except option for every action except a certain
     * action:
     *
     * ```javascript
     * class ApplicationController extends VikingController {
     *   static aroundActions = [
     *     ['requireAccount', {except: ['publicPage']}]
     *   ];
     * }
     * ```
     *
     * @type {AroundActionCallback[]}
     */
    static aroundActions = [];
    
   /**
    * `skipAroundActions` allows extended controllers to skip defined
    * `aroundActions` that were defined in the ApplicationController:
    *
    * ```javascript
    * class LoginController extends ApplicationController {
    *   static skipAroundActions = [['requireAccount', {only: ['new']}]];
    *   // ...
    * }
    * ```
    *
    * ```javascript
    * class LoginController extends ApplicationController {
    *   static skipAroundActions = [['requireAccount', {except: ['show']}]];
    *   // ...
    * }
    * ```
    *
    * ```javascript
    * class PublicController extends ApplicationController {
    *   static skipAroundActions = ['requireAccount'];
    *   // ...
    * }
    * ```
    * @type {AroundActionCallback[]}
    */
    static skipAroundActions = [];

   /**
    * The name of the action currently being processed, otherwise null;
    * @type {string|null}
   */
   action_name = null;
   
  /**
   * All request parameters, weather they come from the query string in the URL
   * or extracted from URL path via the {@link Router}.
   * @type {Object}
  */
   params = {};
   
    /** @ignore */
    static getAroundActions() {
        if (this.hasOwnProperty('_aroundActions')) {
            return this._aroundActions;
        }

        if (!this.hasOwnProperty('aroundActions')) {
            if (Object.getPrototypeOf(this).getAroundActions) {
                /** @ignore */
                this._aroundActions = Object.getPrototypeOf(this).getAroundActions();
            } else {
                this._aroundActions = [];
            }
            return this._aroundActions;
        }
        
        this._aroundActions = [];

        if (Object.getPrototypeOf(this).getAroundActions) {
            each(Object.getPrototypeOf(this).getAroundActions(), (v) => {
                this._aroundActions.push(v);
            });
        }

        each(this.aroundActions, (v) => {
            if (Array.isArray(v)) {
                this._aroundActions = this._aroundActions.filter( (nv) => {
                    return (nv[0] !== v[0]);
                });
                this._aroundActions.push(v);
            } else {
                this._aroundActions = this._aroundActions.filter( (nv) => {
                    return (nv[0] !== v);
                });
                this._aroundActions.push([v, {}]);
            }
        });

        return this._aroundActions;
    }

    /** @ignore */
    static getSkipAroundActions() {
        if (this.hasOwnProperty('_skipAroundActions')) {
            return this._skipAroundActions;
        }

        if (!this.hasOwnProperty('skipAroundActions')) {
            if (Object.getPrototypeOf(this).getSkipAroundActions) {
                /** @ignore */
                this._skipAroundActions = Object.getPrototypeOf(this).getSkipAroundActions();
            } else {
                this._skipAroundActions = [];
            }
            
            return this._skipAroundActions;
        }

        this._skipAroundActions = [];

        if (Object.getPrototypeOf(this).getSkipAroundActions) {
            each(Object.getPrototypeOf(this).getSkipAroundActions(), (v) => {
                this._skipAroundActions.push(v);
            });
        }

        each(this.skipAroundActions, (v) => {
            if (Array.isArray(v)) {
                this._skipAroundActions = this._skipAroundActions.filter( (nv) => {
                    return (nv[0] !== v[0]);
                });
                this._skipAroundActions.push(v);
            } else {
                this._skipAroundActions = this._skipAroundActions.filter( (nv) => {
                    return (nv[0] !== v);
                });
                this._skipAroundActions.push([v, {}]);
            }
        });

        return this._skipAroundActions;
    }

    /**
     * @param {Application} application - An instance of an Application.
     *                                    `application` delegated
     */
    constructor(application) {
        super();
        /** @type {Application} */
        this.application = application;
    }
    
    dispatch(name) {
        // console.log('Processing ' + this.constructor.name + '#' + name);
        this.params = arguments[arguments.length - 1]
        this.action_name = name;
        this.constructor.getAroundActions().reverse().reduce((a, v) => {
            return () => {
                if (
                    (!v[1].only || v[1].only === name || v[1].only.includes(name))
                    &&
                    (!v[1].except || !(v[1].except === name || v[1].except.includes(name)))
                ) {
                    let skip = this.constructor.getSkipAroundActions().find((s) => {
                        return s[0] == v[0] &&
                        (!s[1].only || s[1].only.includes(name)) &&
                        (!s[1].except || !s[1].except.includes(name))
                    });
                    if (skip) {
                        a();
                    } else {
                        if(typeof v[0] === 'function') {
                            v[0].call(this, a, ...arguments);
                        } else {
                            this[v[0]](a, ...arguments);
                        }
                    }
                } else {
                    a();
                }
            };
        }, () => {
            this.process(...arguments);
            this.action_name = null;
        })();
    }
    
    /** @ignore */
    process(action, ...args) {
        /** @ignore */
        this._responded = false;
        try {
            if (!this[action]) {
                throw new ActionNotFound(`The action '${action}' could not be found for ${this.constructor.name}`)
            } else {
                this[action](...args)
            }
        } catch (e) {
            if (e instanceof ActionNotFound) {
                console.log(e.message);
            } else {
                throw e;
            }
        }
    }

   /**
    * A helper function to tell the Application to navigate to the given URL
    * or Path.
    *
    * @param {string} path - The URL or path to navigate to.
    * @throws {DoubleRenderError} - A DoubleRenderError will be thrown if
    *                               {@link display} or {@link redirectTo} are
    *                               called multiple times in an action.
    */
    redirectTo(path) {
        if (this._responded) {
            throw new Errors.DoubleRenderError();
        }
        this._responded = true;
        this.application.navigateTo(path);
    }
    
    /**
     * A helper function to tell the Application to display the given template
     * See Applicaiton.display for more
     * @example
     * this.display(userShow, {user: user})
     * @return {Element(s)} - Result of Application.display
     * @throws {DoubleRenderError} - A DoubleRenderError will be thrown if
     *                               {@link display} or {@link redirectTo} are
     *                               called multiple times in an action.
     */
    display(template, locals={}, ...args) {
        if (this._responded) {
            throw new Errors.DoubleRenderError();
        }
        this._responded = true;
        return this.application.display(template, Object.assign({}, locals, result(this, 'helpers')), ...args);
    }
}