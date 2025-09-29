import {uniqueId, each, isEqual} from './support';

/**
 * A class that can be extended in order to provide it with a custom event
 * channel.
 *
 * @example
 * const object = new EventBus();
 * object.addEventListener('expand', function(){ alert('expanded'); });
 * object.dispatchEvent('expand');
*/

export default class EventBus {
    /**
     * Unique identifier for this event bus instance
     * @type {string}
     */
    listenerId = uniqueId('veb');
    
    /**
     * Object containing all event listeners
     * @type {Object.<string, Array>}
     */
    eventListeners = {};
    
    /**
     * Object containing references to objects this instance is listening to
     * @type {Object.<string, Object>}
     */
    bindedObjects = {};

    /**
     * Bind an event to a `callback` function. Passing `"*"` will bind
     * the callback to all events fired.
     *
     * If the options.once is true, the event will only be triggered a single time. 
     * After the first time the callback is invoked, its listener will be removed. 
     * If multiple events are passed in as an array, the handler will fire
     * once for each event, not once for a combination of all events.
     *
     * @param {string|string[]|object} name - Event name(s) or object of event/callback pairs
     * @param {Function|object} callback - Callback function or options object if name is an object
     * @param {object} [options] - Event options
     * @param {boolean} [options.once=false] - Whether the event should only trigger once
     * @param {object} [options.context] - The context to bind the event to
     * @param {object} [options.listener] - The listener object
     * @returns {EventBus} Returns this for chaining
     */
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

    /**
     * Tell *this* object to listen to an event in another object, while keeping
     * track of what it's listening to for easier unbinding later.
     *
     * @param {object|NodeList} obj - The object to listen to events on
     * @param {string|string[]|object} name - Event name(s) or object of event/callback pairs
     * @param {Function|object} callback - Callback function or options object if name is an object
     * @param {object} [options={}] - Event options
     * @param {boolean} [options.once=false] - Whether the event should only trigger once
     * @param {object} [options.context] - The context to bind the event to
     * @returns {EventBus} Returns this for chaining
     */
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

    /**
     * Remove one or many callbacks that match the arguments. If called with no arguments,
     * removes all callbacks for all events.
     *
     * @param {string|string[]|object|null} [name] - Event name(s) or object of event/callback pairs
     * @param {Function|object|null} [callback] - Callback function or options object if name is an object
     * @param {object} [options] - Event options
     * @param {boolean} [options.once] - Match only events set to trigger once
     * @param {object} [options.context] - Match only events bound to this context
     * @param {object} [options.listener] - Match only events bound by this listener
     * @returns {EventBus} Returns this for chaining
     */
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

    /**
     * Tell this object to stop listening to either specific events or
     * to every object it's currently listening to.
     *
     * @param {object|NodeList} [obj] - The object to stop listening to; if omitted, stops listening to all objects
     * @param {string|string[]|object} [name] - Event name(s) or object of event/callback pairs
     * @param {Function} [callback] - Callback function to remove
     * @param {object} [options] - Event options
     * @param {boolean} [options.once] - Match only events set to trigger once
     * @param {object} [options.context] - Match only events bound to this context
     * @returns {EventBus} Returns this for chaining
     */
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

    /**
     * Trigger one or many events, firing all bound callbacks. Callbacks are
     * passed the same arguments as `dispatchEvent` is, apart from the event name
     * (unless you're listening on `"*"`, which will cause your callback to
     * receive the true name of the event as the first argument).
     *
     * @param {string|string[]} name - Event name or array of event names
     * @param {...*} args - Arguments to pass to the event handlers
     * @returns {EventBus} Returns this for chaining
     */
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