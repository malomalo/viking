// Viking EventBus
// ---------------
//
// A class that can be extended in order to provide it with a custom event
// channel.
//
//     const object = new EventBus();
//     object.addEventListener('expand', function(){ alert('expanded'); });
//     object.dispatchEvent('expand');

import {uniqueId, each, isEqual} from 'viking/support';

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

    listenerId = uniqueId('veb'); // string
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
            name.forEach((v) => this.addEventListener(v, callback, options));
            return this;
        }

        if (typeof name === 'object') {
            each(name, (key, value) => {
              this.addEventListener(key, value, (!options && callback) ? callback : options);
            });
            return this;
        }

        if (!this.eventListeners[name]) {
            this.eventListeners[name] = [];
        }

        this.eventListeners[name].push({
          name: name,
          callback: callback,
          listener: options ? options.listener : undefined,
          context: options ? options.context : undefined,
          once: options ? (options.once || false) : false
        });
        return this;
    }

    // Tell *this* object to listen to an event in another object; while keeping
    // track of what it's listening to for easier unbinding later.
    //
    // addEventListenerFor(obj: any, name: object, options?: {once?: boolean});
    // addEventListenerFor(obj: any, name: string | string[], callback: ((...args) => void) | null, options?: {once?: boolean});
    addEventListenerFor(obj, name, callback, options = {}) {
      if (obj instanceof NodeList) {
          obj.forEach((o) => this.addEventListenerFor(o, name, callback, options));
          return this;
      }
      
      if (Array.isArray(name)) {
          name.forEach((v, i) => this.addEventListenerFor(obj, v, callback, options));
          return this;
      }
      
      if (typeof name === 'object') {
          each(name, (key, value) => {
            this.addEventListenerFor(obj, key, value, (!options && callback) ? callback : options);
          });
          return this;
      }

      if (!obj.listenerId) { obj.listenerId = uniqueId('veb'); }
      
      var cb = callback;
      
      if (!options.context) { options.context = this; }
      if (!options.once) { options.once = false; }

      var listener;
      if (obj instanceof EventBus) {
        options.listener = this;
        
        listener = {
          name: name,
          callback: [callback, cb],
          listener: options.listener,
          context: options.context,
          once: options.once
        }
      } else {
        cb = cb.bind(options.context);
        listener = {
          name: name,
          callback: [callback, cb],
          options: options
        };
      }

      if (!this.bindedObjects[obj.listenerId]) {
          this.bindedObjects[obj.listenerId] = { obj: obj, listeners: [] };
      }
      this.bindedObjects[obj.listenerId].listeners.push(listener);

      obj.addEventListener(name, cb, options);

      return this;
    }

    // Remove one or many callbacks that match the arguments.
    //
    // removeEventListener(name: object, options?: IEventOptions);
    // removeEventListener(name: string | string[] | null, callback?: ((...args) => void) | null, options?: IEventOptions);
    // removeEventListener();
    removeEventListener(name, callback, options) {
        if (Array.isArray(name)) {
            name.forEach((v) => this.removeEventListener(v, callback, options));
            return this;
        }
        
        if (name && typeof name === 'object') {
            each(name, (key, value) => {
              this.removeEventListener(key, value, (!options && callback) ? callback : options);
            });

            return this;
        }

        let {once = false, listener = undefined, context = undefined} = options || {};

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
                      handler.listener.bindedObjects[this.listenerId].listeners = 
                      handler.listener.bindedObjects[this.listenerId].listeners.filter((h) => {
                        return h.name !== key ||
                              h.callback[1] !== handler.callback ||
                              !isEqual(h.options, handler.options)
                      })

                      if (handler.listener.bindedObjects[this.listenerId].listeners.length === 0) {
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
            each(this.eventListeners, (key, value) => {
                filter(value, key);
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
        if (obj instanceof NodeList) {
            obj.forEach((o) => this.removeEventListenerFor(o, name, callback, options));
            return this;
        }

        if (Array.isArray(name)) {
            name.forEach((v) => this.removeEventListenerFor(o, v, callback, options));
            return this;
        }

        if (typeof name === 'object') {
            each(name, (key, value) => {
              this.removeEventListenerFor(obj, key, value, (!options && callback) ? callback : options);
            });
            return this;
        }
      
        const ids = obj ? [obj.listenerId] : Object.keys(this.bindedObjects);

        ids.forEach((id) => {
            if (this.bindedObjects[id]) {
                var listeners = this.bindedObjects[id].listeners;
                obj = this.bindedObjects[id].obj;
                
                if (obj instanceof EventBus) {
                  listeners = listeners.filter((l) => {
                    if (name !== undefined && name !== l.name) { return true; }
                    if (callback !== undefined && callback !== l.callback[0]) { return true; }
                    if (options) {
                      if (options.context !== undefined && options.callback !== l.context) { return true; }
                      if (options.once !== undefined && options.once !== l.once) { return true; }
                    }

                    obj.removeEventListener(l.name, l.callback[1], {
                      context: l.context,
                      once: l.once,
                      listener: l.listener
                    });
                    return false;
                  })
                } else {
                  listeners = listeners.filter((l) => {
                    if (name !== undefined && name !== l.name) { return true; }
                    if (callback !== undefined && callback !== l.callback[0]) { return true; }
                    if (options !== undefined && isEqual(options, l.options)) { return true; }

                    obj.removeEventListener(l.name, l.callback[1], l.options);
                    return false;
                  });
                }

                if (listeners.length == 0) {
                  delete this.bindedObjects[id];
                } else {
                  // this.bindedObjects[id].listeners = listeners;
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
            name.forEach((v) => this.dispatchEvent(v, ...args));
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
                var obj = c.listener.bindedObjects[this.listenerId]

                obj.listeners = obj.listeners.filter((h) => {
                    return h.name !== c.name ||
                          h.callback[1] !== c.callback ||
                          !isEqual(h.options, c.options)
                });

                if (c.listener.bindedObjects[this.listenerId].listeners.length === 0) {
                    delete c.listener.bindedObjects[this.listenerId];
                }
            }
            c.callback.call(c.context || this, ...args);
        });

        allCallees.forEach((c) => {
            if (c.once && c.listener && c.listener.bindedObjects[this.listenerId]) {
                var obj = c.listener.bindedObjects[this.listenerId]

                obj.listeners = obj.listeners.filter((h) => {
                    return h.name !== c.name ||
                          h.callback[1] !== c.callback ||
                          !isEqual(h.options, c.options)
                });

                if (c.listener.bindedObjects[this.listenerId].listeners.length === 0) {
                    delete c.listener.bindedObjects[this.listenerId];
                }
            }
            c.callback.call(c.context || this, name, ...args);
        });

        return this;
    }

}