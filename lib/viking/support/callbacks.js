import {each} from 'viking/support';

export default (base) => class Callbacks extends base {
    
    callbacks = {};
    
    addCallback(when, what, callback) {
        if (!this.callbacks[what]) {
            let callback = {
                before: [],
                around: [],
                after: [],
                fn: this[what]
            };
            this.callbacks[what] = callback;
            this[what] = function(...args) {
                callback['before'].forEach( (cb) => cb.call(this) );
                
                callback['around'].reverse().reduce((a, v) => {
                    return () => { v.call(this, a); };
                }, () => callback['fn'].call(this, ...args))();

                callback['after'].forEach((cb) => cb.call(this) );
            }
        }
        
        this.callbacks[what][when].push(callback);
    }
    
    // constructor() {
    //     super();
    //
    //     each(constructor.callbacks, (k, v) => {
    //
    //     });
    // }
}
