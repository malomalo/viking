import EventBus from 'viking/eventBus';
import Callbacks from 'viking/support/callbacks';
import {capitalize} from 'viking/support/string';
import {functionsOfClass} from 'viking/support/helpers';
import {each, result, uniqueId} from 'viking/support';
import {ActionNotFound} from 'viking/errors';

export default class Controller extends EventBus {

    static aroundActions = [];
    static skipAroundActions = [];

    static extended(child) {
        if (child.aroundActions) {
            let newAroundActions = [];

            each(this.aroundActions, (v) => {
                newAroundActions.push(v);
            });
            
            each(child.aroundActions, (v) => {
                if (Array.isArray(v)) {
                    newAroundActions = newAroundActions.filter( (nv) => {
                        return (nv[0] !== v[0]);
                    });
                    newAroundActions.push(v);
                } else {
                    newAroundActions = newAroundActions.filter( (nv) => {
                        return (nv[0] !== v);
                    });
                    newAroundActions.push([v, {}]);
                }
            });
            
            child.aroundActions = newAroundActions;
        }
        
        if (child.skipAroundActions) {
            let newSkipAroundActions = [];

            each(this.skipAroundActions, (v) => {
                newSkipAroundActions.push(v);
            });
            
            each(child.skipAroundActions, (v) => {
                if (Array.isArray(v)) {
                    newSkipAroundActions = newSkipAroundActions.filter( (nv) => {
                        return (nv[0] !== v[0]);
                    });
                    newSkipAroundActions.push(v);
                } else {
                    newSkipAroundActions = newSkipAroundActions.filter( (nv) => {
                        return (nv[0] !== v);
                    });
                    newSkipAroundActions.push([v, {}]);
                }
            });
            
            child.skipAroundActions = newSkipAroundActions;
        }
    }

    constructor(application) {
        super();
        this.application = application;
    }
    
    dispatch(name, req, res) {
        // console.log('Processing ' + this.constructor.name + '#' + name);
        this.constructor.aroundActions.reverse().reduce((a, v) => {
            return () => {
                if (
                    (!v[1].only || v[1].includes(name)) // No Only || In Only
                    &&
                    (!v[1].except || !v[1].except.includes(name)) // No Except || Not in Except
                ) {
                    let skip = this.constructor.skipAroundActions.find((s) => {
                        return s[0] == v[0] &&
                        (!s[1].only || s[1].only.includes(name)) &&
                        (!s[1].except || !s[1].except.includes(name))
                    });
                    if (skip) {
                        a();
                    } else {
                        if(typeof v[0] === 'function') {
                            v[0].call(this, a);
                        } else {
                            this[v[0]](a);
                        }
                    }
                } else {
                    a();
                }
            };
        }, () => this.process(name) )();
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
        this.application.display(view, ...args);
    }
}