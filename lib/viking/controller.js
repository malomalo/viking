import EventBus from 'viking/eventBus';
import Callbacks from 'viking/support/callbacks';
import {capitalize} from 'viking/support/string';
import {functionsOfClass} from 'viking/support/helpers';
import {each, result, uniqueId} from 'viking/support';
import {ActionNotFound} from 'viking/errors';

export default class Controller extends EventBus {

    static beforeActions = [];
    static skipBeforeActions = [];
    static aroundActions = [];
    static skipAroundActions = [];
    static afterAction = [];
    static skipAfterActions = [];
   
    constructor() {
        super();
        
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
        this.beforeActions.forEach((k) => {
            typeof k === 'string' ? this[k]() : k.call(this);
        });

        this.aroundActions.reverse().reduce((a, v) => {
            return () => {
                typeof v === 'string' ? this[v](a) : v.call(this, a);
            };
        }, () => this.process(name) )();

        this.afterActions.forEach((k) => {
            typeof k === 'string' ? this[k]() : k.call(this);
        });
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
        
    }
    
    render() {
        // this.application.display
    }
}