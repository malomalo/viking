import EventBus from 'viking/eventBus';
import Callbacks from 'viking/support/callbacks';
import {capitalize} from 'viking/support/string';
import {functionsOfClass} from 'viking/support/helpers';
import {each, result, uniqueId} from 'viking/support';
import {ActionNotFound} from 'viking/errors';

export default class Controller extends EventBus {

    static aroundActions = [];
    static skipAroundActions = [];
    static afterAction = [];
    static skipAfterActions = [];
   
    constructor(application) {
        super();
        this.application = application;
        
        this.beforeActions  = [];
        this.aroundActions  = [];
        this.afterActions    = [];
        for (let p = this.constructor ; p !== Controller ; p = Object.getPrototypeOf(p)) {
            ['beforeActions', 'aroundActions', 'afterActions'].forEach((k) => {
                if (p[k] && p.hasOwnProperty(k)) {
                    p[k].forEach((c) => {
                        if (!this[k].includes(c)) { this[k].push(c); }
                    });
                }

                let k2 = 'skip' + capitalize(k);
                if (p[k2] && p.hasOwnProperty(k2)) {
                    filter[k] = filter[k].filter((c) => { !p[k2].includes(c); });
                }
            });
        }
    }
    
    dispatch(name, req, res) {
        console.log('Processing ' + this.constructor.name + '#' + name);
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
                        this[v[0]](a);
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
                console.log("ANF");
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