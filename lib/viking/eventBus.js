// Viking EventBus
// ---------------
//
// A class that can be extended in order to provide it with a custom event
// channel.
//
//     const object = new EventBus();
//     object.addEventListener('expand', function(){ alert('expanded'); });
//     object.dispatchEvent('expand');

import {uniqueId} from 'viking/support';

// export interface IEventListener {
//   callback: (...args) => void;
//   context: any;
//   once: boolean;
//   listener: any;
// }
//
// export interface IEventOptions {
//   once?: boolean;
//   context?: any;
//   listener?: any;
// }

export default class EventBus {

    listenerId = uniqueId('b'); // string
    eventListeners = {}; // { [propName: string]: IEventListener[]; };
    bindedObjects = {}; // { [propName: string]: { obj: any, count: number }};

  // constructor() {
  //   this.listenerId = _uniqueId('b');
  //   this.eventListeners = {};
  //   this.bindedObjects = {};
  // }

    // Bind an event to a `callback` function. Passing `"all"` will bind
    // the callback to all events fired.
    //
    // Bind an event to only be triggered a single time. After the first time
    // the callback is invoked, its listener will be removed. If multiple events
    // are passed in using the space-separated syntax, the handler will fire
    // once for each event, not once for a combination of all events.
    //
    // addEventListener(name: object, options?: IEventOptions);
    // addEventListener(name: string | string[], callback: (...args) => void, options?: IEventOptions);
    addEventListener(name, callback, options) {
        if (Array.isArray(name)) {
            name.forEach((v, i) => {
                this.addEventListener(v, callback, options);
            });

            return this;
        } else if (typeof name === 'object') {
            Object.keys(name).forEach((key, i) => {
                this.addEventListener(key, name[key], (!options && callback) ? callback : options);
            });

            return this;
        }

        let {once = false, context = undefined, listener = undefined} = options || {};

        if (!this.eventListeners[name]) {
            this.eventListeners[name] = [];
        }

        this.eventListeners[name].push({
            callback: callback,
            context: context,
            listener: listener,
            once: once
        });

        return this;
    }

    // Tell *this* object to listen to an event in another object; while keeping
    // track of what it's listening to for easier unbinding later.
    //
    // addEventListenerFor(obj: any, name: object, options?: {once?: boolean});
    // addEventListenerFor(obj: any, name: string | string[], callback: ((...args) => void) | null, options?: {once?: boolean});
    addEventListenerFor(obj, name, callback, options) {
        if (Array.isArray(name)) {
            name.forEach((v, i) => {
                this.addEventListenerFor(obj, v, callback, options);
            });

            return this;
        } else if (typeof name === 'object') {
            Object.keys(name).forEach((key, i) => {
                this.addEventListenerFor(obj, key, name[key], (!options && callback) ? callback : options);
            });

            return this;
        }

        options = { context: this, listener: this, once: options ? options.once : false };

        if (!obj.listenerId) { obj.listenerId = uniqueId('b'); }
        if (!this.bindedObjects[obj.listenerId]) {
            this.bindedObjects[obj.listenerId] = { obj: obj, count: 1 };
        } else {
            this.bindedObjects[obj.listenerId].count += 1;
        }

        if (obj instanceof EventBus) {
            obj.addEventListener(name, callback, options);
        } else if (obj.on) {
            obj.on(name, callback, options);
        }

        return this;
    }

    // Remove one or many callbacks that match the arguments.
    //
    // removeEventListener(name: object, options?: IEventOptions);
    // removeEventListener(name: string | string[] | null, callback?: ((...args) => void) | null, options?: IEventOptions);
    // removeEventListener();
    removeEventListener(name, callback, options) {
        if (Array.isArray(name)) {
            name.forEach((v, i) => {
                this.removeEventListener(v, callback, options);
            });
        } else if (name && typeof name === 'object') {
            Object.keys(name).forEach((key, i) => {
                this.removeEventListener(key, name[key], (!options && callback) ? callback : options);
            });

            return this;
        }

        let {once = false, context = undefined, listener = undefined} = options || {};

        let filter = (handlers, key) => {
            if (!handlers) { return; }

            this.eventListeners[key] = handlers.filter( (handler) => {
                if (
                    (callback && callback !== handler.callback) ||
                    (context && context !== handler.context) ||
                    (once && once !== handler.once) ||
                    (listener && listener !== handler.listener)
                ) {
                    return true;
                } else {
                    if (handler.listener && handler.listener.bindedObjects[this.listenerId]) {
                        handler.listener.bindedObjects[this.listenerId].count -= 1;
                        if (handler.listener.bindedObjects[this.listenerId].count === 0) {
                            delete handler.listener.bindedObjects[this.listenerId];
                        }
                    }

                    return false;
                }
            });

            if (this.eventListeners[key].length === 0) {
                delete this.eventListeners[key];
            }
        };

        if (name) {
            filter(this.eventListeners[name], name);
        } else {
            Object.keys(this.eventListeners).forEach((key, i) => {
                filter(this.eventListeners[key], key);
            });
        }

        return this;
    }

    // Tell this object to stop listening to either specific events ... or
    // to every object it's currently listening to.
    //
    // removeEventListenerFor(obj: any, name: object, options?: IEventOptions);
    // removeEventListenerFor(obj?: any, name?: string, callback?: (...args) => void, options?: IEventOptions);
    removeEventListenerFor(obj, name, callback, options) {
        if (name && typeof name === 'object') {
            Object.keys(name).forEach((key, i) => {
                this.removeEventListenerFor(obj, key, name[key], (!options && callback) ? callback : options);
            });

            return this;
        }

        const ids = obj ? [obj.listenerId] : Object.keys(this.bindedObjects);
        if (!options) { options = {}; }
        options.context = this;
        options.listener = this;

        ids.forEach((id, index) => {
            if (this.bindedObjects[id]) {
                obj = this.bindedObjects[id].obj;
                if (obj instanceof EventBus) {
                    obj.removeEventListener(name, callback, options);
                } else if (obj.off) {
                    this.bindedObjects[obj.listenerId].count -= 1;
                    if (this.bindedObjects[obj.listenerId].count === 0) {
                        delete this.bindedObjects[obj.listenerId];
                    }
                    obj.off(name, callback, options);
                }
            }
        });

        return this;
    }

    // Trigger one or many events, firing all bound callbacks. Callbacks are
    // passed the same arguments as `trigger` is, apart from the event name
    // (unless you're listening on `"all"`, which will cause your callback to
    // receive the true name of the event as the first argument).
    //
    // dispatchEvent(name: string | string[], ...args) {
    dispatchEvent(name, ...args) {
        if (Array.isArray(name)) {
            name.forEach((v, i) => this.dispatchEvent(v, ...args));
            return this;
        }

        const callees = []; //: IEventListener[]
        const allCallees = []; //: IEventListener[]

        if (this.eventListeners[name]) {
            this.eventListeners[name] = this.eventListeners[name].filter( (callback, index) => {
                if (callback) {
                    callees.push(callback);
                    return !callback.once;
                }
            });
        }
        
        if (this.eventListeners['*']) {
            this.eventListeners['*'] = this.eventListeners['*'].filter( (callback, index) => {
                allCallees.push(callback);
                return !callback.once;
            });
        }

        
        callees.forEach((c) => {
            if (c.once && c.listener && c.listener.bindedObjects[this.listenerId]) {
                c.listener.bindedObjects[this.listenerId].count -= 1;
                if (c.listener.bindedObjects[this.listenerId].count === 0) {
                    delete c.listener.bindedObjects[this.listenerId];
                }
            }
            c.callback.call(c.context || this, ...args);
        });

        allCallees.forEach((c) => {
            if (c.once && c.listener && c.listener.bindedObjects[this.listenerId]) {
                c.listener.bindedObjects[this.listenerId].count -= 1;
                if (c.listener.bindedObjects[this.listenerId].count === 0) {
                    delete c.listener.bindedObjects[this.listenerId];
                }
            }
            c.callback.call(c.context || this, name, ...args);
        });

        return this;
    }

}