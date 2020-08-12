import EventBus from './eventBus';
import {each, result, uniqueId} from './support';
import {ActionNotFound} from './errors';

export default class Controller extends EventBus {

    static aroundActions = [];
    static skipAroundActions = [];

    static getAroundActions() {
        if (this.hasOwnProperty('_aroundActions')) {
            return this._aroundActions;
        }

        if (!this.hasOwnProperty('aroundActions')) {
            if (Object.getPrototypeOf(this).getAroundActions) {
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

    static getSkipAroundActions() {
        if (this.hasOwnProperty('_skipAroundActions')) {
            return this._skipAroundActions;
        }

        if (!this.hasOwnProperty('skipAroundActions')) {
            if (Object.getPrototypeOf(this).getSkipAroundActions) {
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

    constructor(application) {
        super();
        this.application = application;
    }
    
    dispatch(name, req, res) {
        // console.log('Processing ' + this.constructor.name + '#' + name);
        this.params = {};
        (new URLSearchParams(window.location.search)).forEach((value, key) => {
          this.params[key] = value
        })
        this.action_name = name
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
        }, () => this.process(...arguments) )();
    }
    
    process(action, ...args) {
        try {
            if (!this[action]) {
                throw new ActionNotFound(`The action '${action}' could not be found for #{self.class.name}`)
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

    redirectTo(path) {
        this.application.router.navigateTo(path);
    }
    
    display(view, ...args) {
        return this.application.display(view, ...args);
    }
}