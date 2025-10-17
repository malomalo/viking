import EventBus from './eventBus.js';
import {each, result, uniqueId, scanPrototypesFor} from './support.js';

const construtorKeys = ['el', 'id', 'className', 'attributes', 'tagName', 'events', 'template'];
const optionKeys = ['record', 'model', 'models', 'el', 'id', 'attributes', 'className', 'tagName', 'events'];
// Cached regex to split keys for `delegate`.
const delegateEventSplitter = /^(\S+)\s*(.*)$/;

/**
 * The View class provides a structure for organizing DOM elements and their events.
 * 
 * Views in Viking are similar to traditional MVC views - they represent a logical 
 * part of the user interface. A View manages a DOM element (`this.el`) and any events
 * that occur within it. Views can be nested using the subView system.
 * 
 * Viking Views are designed to be declarative - you define your DOM events in an 
 * events hash, and the View handles binding those to the appropriate handlers. 
 * This makes it easy to organize code related to a specific part of the UI.
 *
 * @extends EventBus
 *
 * @param {Object} [options={}] - Options for the view
 * @param {Element|string} [options.el] - The element for the view
 * @param {string} [options.id] - The ID to set on the view's element
 * @param {string} [options.className] - The CSS class name for the view's element
 * @param {Object} [options.attributes] - HTML attributes to set on the view's element
 * @param {string} [options.tagName] - The HTML tag name for the view's element
 * @param {Object} [options.events] - Event handlers to bind to the view's element
 * @param {Object} [options.record] - The record associated with this view
 * 
 * @example
 * class UserView extends View {
 *   static events = {
 *     'click .edit-button': 'editUser',
 *     'submit form': 'saveUser'
 *   };
 *   
 *   initialize() {
 *     // Setup code runs when the view is created
 *     this.render();
 *   }
 *   
 *   render() {
 *     this.el.innerHTML = `
 *       <h2>${this.record.name}</h2>
 *       <button class="edit-button">Edit</button>
 *       <form style="display: none;">
 *         <input name="name" value="${this.record.name}">
 *         <button type="submit">Save</button>
 *       </form>
 *     `;
 *     return this;
 *   }
 *   
 *   editUser() {
 *     this.$('form').style.display = 'block';
 *   }
 *   
 *   saveUser(e) {
 *     e.preventDefault();
 *     this.record.name = this.$('input[name="name"]').value;
 *     this.render();
 *   }
 * }
 */
export default class View extends EventBus {

    /**
     * The DOM element for the view, can be a CSS selector, HTML element, or function returning either
     * @type {Element|string|Function}
     * @static
     */
    static el;
    
    /**
     * The ID attribute to set on the view's element
     * @type {string|Function}
     * @static
     */
    static id;
    
    /**
     * The CSS class name(s) to set on the view's element
     * @type {string|Function}
     * @static
     */
    static className;
    
    /**
     * HTML attributes to set on the view's element
     * @type {Object}
     * @static
     */
    static attributes = {};
    
    /**
     * The HTML tag name to use when creating the view's element
     * @type {string}
     * @static
     * @default 'div'
     */
    static tagName = 'div';
    
    /**
     * Event map defining DOM events and their handlers
     * Format: {'event selector': 'handlerMethod'}
     * @type {Object}
     * @static
     */
    static events;
    
    /**
     * Template for the view
     * @type {string|Function}
     * @static
     */
    static template;
    
    /**
     * Properties from the options object that will be assigned directly to the view instance
     * @type {string[]}
     * @static
     */
    static assignableProperties = [
      'record'
    ];
    
    /**
     * Default property values for the view
     * @type {Object}
     * @static
     */
    static defaults = {}
    
    /**
     * Properties that should be copied from the static class to the instance
     * @type {string[]}
     * @static
     */
    static staticAttributeAccessors = []
    
    /**
     * Get the events hash for this view, merging with parent class events
     * @return {Object} The merged events hash
     * @static
     */
    static getEvents() {
        if (this.hasOwnProperty('_events')) {
            return this._events;
        }

        if (!this.hasOwnProperty('events')) {
            if (Object.getPrototypeOf(this).getEvents) {
                this._events = Object.getPrototypeOf(this).getEvents();
            } else {
                this._events = {};
            }
            return this._events;
        }

        if (Object.getPrototypeOf(this).getEvents) {
            this._events = Object.assign({}, Object.getPrototypeOf(this).getEvents(), this.events);
        } else {
            this._events = this.events;
        }

        return this._events;
    }
    
    /**
     * An array for storing subViews attached to this view
     * @type {View[]}
     * @private
     */
    subViews = [];
    
    /**
     * Internal storage for DOM event listeners
     * @type {Object[]}
     * @private
     */
    _domEvents = [];
    
    constructor(options = {}) {
        super();
        
        scanPrototypesFor(this.constructor, 'defaults').filter(x => x).reverse().forEach(defaults => {
            Object.keys(defaults).forEach(k => {
                this[k] = options[k] === undefined ? defaults[k] : options[k];
            })
        })
        
        construtorKeys.forEach((k) => {
            if(!this[k]) {
                this[k] = this.constructor[k];
            }
        })
        
        optionKeys.forEach((k) => {
            if (options[k]) {
                this[k] = options[k];
            }
        });
        
        this.constructor.staticAttributeAccessors.forEach((k) => {
            this[k] = this.constructor[k];
        })
        
        Object.keys(options).forEach(k => {
            if(scanPrototypesFor(this.constructor, 'assignableProperties').flat().includes(k)) {
                this[k] = options[k];
            }
        })

        this.setup.apply(this, arguments);
        
        // Ensure that the View has a DOM element to render into.
        // If `this.constructor.el` is a string, pass it through `$()`, take
        // the first matching element, and re-assign it to `this.el`.
        // Otherwise, create an element from the `id`, `className` and
        // `tagName` properties.
        if (this.el) {
            this.setElement(result(this, 'el'));
        } else {
            let attrs = {};
            
            // if attributes is not in assignableProperties it is assumed the user is using it
            if (!scanPrototypesFor(this.constructor, 'assignableProperties').flat().includes('attributes')) {
                Object.assign(attrs, result(this, 'attributes'));
            }
            if (this.id) { attrs.id = result(this, 'id'); }
            if (this.className) { attrs['class'] = result(this, 'className'); }
            this.setElement(document.createElement(result(this, 'tagName')));
            each(attrs, (key, value) => {
                // if (v) {
                    this.el.setAttribute(key, value);
                // }
            });
        }
        
        this.initialize.apply(this, arguments);
    }

    /**
     * Finds an element within the view's element using a CSS selector
     * 
     * @param {string} selector - CSS selector to search for
     * @return {Element|null} The first matching element or null if not found
     */
    $(selector) {
        return this.el.querySelector(selector);
    }

    /**
     * Called before the DOM element is created
     * Override this method to perform initialization before the view's element is set up
     */
    setup() { }
    
    /**
     * Called after the DOM element is created
     * Override this method to perform initialization after the view's element is set up
     */
    initialize() { }

    /**
     * Renders the view's content
     * 
     * This is the core function that your view should override to populate its element
     * with the appropriate HTML. The convention is for render to always return `this`
     * to enable method chaining.
     * 
     * @return {View} The view instance for chaining
     */
    render() {
        return this;
    }

    /**
     * Removes this view and all subviews from the DOM
     * 
     * This method removes the view's element from the DOM, cleans up any event listeners,
     * and recursively removes all subviews.
     * 
     * @return {View} The view instance for chaining
     */
    remove() {
        this.dispatchEvent('beforeRemove', this);
        this.subViews.forEach((view) => view.remove());

        // Emit a remove event for when a view is removed
        this.dispatchEvent('afterRemove', this);

        this._removeElement();
        this.removeEventListenerFor();
        return this;
    }


    /**
     * Removes the view's element from the DOM
     * @private
     */
    _removeElement() {
        this.undelegateEvents();
        if (this.el.parentNode) {
            this.el.parentNode.removeChild(this.el);
        }
    }

    /**
     * Change the view's element and re-delegate events
     * 
     * This method changes the view's element (`this.el` property) and
     * re-delegates the view's events on the new element.
     * 
     * @param {Element|NodeList|string} element - The new element, can be a CSS selector,
     *   Element node, or NodeList (the first item will be used)
     * @return {Element} The new element
     */
    setElement(element) {
        this.undelegateEvents();

        if (typeof element === 'string') {
            const match = document.querySelector(element);
            if (match) {
                this.el = match;
            } else {
                throw new Error('Could not find element for selector "' + element + '"');
            }
        } else if (element instanceof NodeList) {
            this.el = element[0];
        } else {
            this.el = element;
        }

        this.delegateEvents();
        return this.el;
    }

    /**
     * Set up event delegation for the view
     * 
     * This method binds event handlers defined in the events hash to the view's element.
     * The events hash format is: `{'event selector': handler}`
     * 
     * Callbacks will be bound to the view with `this` set properly.
     * Omitting the selector binds the event to the view's element itself.
     * 
     * @param {Object} [events] - Event map to use instead of the view's events property
     * @return {View} The view instance for chaining
     * @example
     * {
     *   'mousedown .title': 'edit',
     *   'click .button': 'save',
     *   'click .open': function(e) { ... },
     *   'click .title': ['edit', false],
     *   'click .title': ['edit', {passive: true}]
     * }
     */
    delegateEvents(events) {
        if (!events) { events = result(this, 'events'); }
        if (!events) { return this; }

        this.undelegateEvents();
        each(events, (key, value) => {
            let method, selector, callback, options;

            if (Array.isArray(value)) {
                callback = value[0];
                options = value[1];
            } else {
                callback = value;
                options = false;
            }

            if (typeof callback !== 'function') {
                callback = this[callback];
            }

            if (callback) {
                const match = key.match(delegateEventSplitter);
                if (!match) {
                    throw new Error('Inncorrect Syntax for Event Map');
                }
                this.delegate(match[1], match[2], callback.bind(this));
            }
        });

        return this;
    }

    // Add a event listener to the view's element to listen for events
    // that match the `selector` if present.
    //
    // If listening for non-delegatable events (`focus` or `blur`) with
    // a selector the listener will be added to the current elements in
    // the DOM.
    //
    // delegate(eventName: string, selector: string, listener: EventListener, options?: boolean | AddEventListenerOptions);
    // delegate(eventName: string, listener: EventListener, options?: boolean | AddEventListenerOptions);
    delegate(eventName, selector, listener, options) {
        if (options === undefined) {
            if (listener) {
                options = false;
            } else {
                listener = selector;
                selector = undefined;
            }
        }

        if (eventName === 'focus' || eventName === 'blur') {
          if (selector && selector != '') {
            this.el.querySelectorAll(selector).forEach((element) => {
                element.addEventListener(eventName, listener, options);
                this._domEvents.push({
                    el: element,
                    eventName: eventName,
                    handler: listener,
                    options: options
                });
            });
          } else {
            this.el.addEventListener(eventName, listener, options);
            this._domEvents.push({
                el: this.el,
                eventName: eventName,
                handler: listener,
                options: options
            });
          }

            return listener;
        }

        let handler = selector ? (e) => {
            let node = e.target || e.srcElement;
            for (; node && node !== this.el; node = node.parentElement) {
                if (node.matches && node.matches(selector)) {
                    e.delegateTarget = node;
                    listener(e);
                }
            }
        } : listener;

        this.el.addEventListener(eventName, handler, options);
        this._domEvents.push({
            el: this.el,
            eventName: eventName,
            handler: handler,
            listener: listener,
            selector: selector,
            options: options
        });

        return handler;
    }

    /**
     * Remove all event listeners from the view's element
     * 
     * This method clears all callbacks previously bound to the view by delegateEvents.
     * It's automatically called when changing elements or removing the view.
     * 
     * @return {View} The view instance for chaining
     */
    undelegateEvents() {
        if (this.el) {
            for (let i = 0, len = this._domEvents.length; i < len; i++) {
                let item = this._domEvents[i];
                item.el.removeEventListener(item.eventName, item.handler, item.options);
            }

            this._domEvents.length = 0;
        }

        return this;
    }

    // A finer-grained `undelegateEvents` for removing a single delegated event.
    // `selector` and `listener` are both optional.
    //
    // Remove a single delegated event. Either `eventName` or `selector` must
    // be included, `selector` and `listener` are optional.
    //
    // undelegate(eventName?: string, selector?: string, listener?: EventListener, options?: boolean | AddEventListenerOptions);
    // undelegate(eventName?: string, listener?: EventListener, options?: boolean | AddEventListenerOptions);
    undelegate(eventName, selector, listener, options) {
        if (typeof selector === 'function') {
            options = listener;
            listener = selector;
            selector = undefined;
        }

        if (this.el) {
            this._domEvents = this._domEvents.filter((handler) => {
                if ( eventName && eventName !== handler.eventName ||
                     selector && selector !== handler.selector ||
                     listener && listener !== handler.listener ||
                     options && options !== handler.options) {
                    return true;
                } else {
                    handler.el.removeEventListener.call(handler.el, handler.eventName, handler.handler, handler.options);
                    return false;
                }
            });
        }

        return this;
    }

    // renderTemplate(locals) {
    //     return Helpers.render(this.template, locals);
    // }

    /**
     * Creates a subview and adds it to this view's subviews array
     * 
     * @param {Class} SubView - The view class to instantiate
     * @param {...*} args - Arguments to pass to the subview constructor
     * @return {View} The created subview instance
     */
    subView(SubView, ...args) {
        const view = new SubView(...args);
        this.subViews.push(view);
        this.addEventListenerFor(view, 'afterRemove', this.subViewRemoved);
        return view;
    }

    /**
     * Removes a subview from this view
     * 
     * This method removes the subview by calling its remove method, which will
     * ultimately trigger the afterRemove event, causing it to be removed from
     * the subViews array.
     * 
     * @param {View} view - The subview to remove
     */
    removeSubView(view) {
        // this.subViews = this.subViews.filter((v) => v !== view);
        // this.removeEventListenerFor(view);
        view.remove();
    }
    
    /**
     * Handler for a subview's afterRemove event
     * 
     * @param {View} view - The removed subview
     * @private
     */
    subViewRemoved(view) {
        this.subViews = this.subViews.filter((v) => v !== view);
        this.removeEventListenerFor(view);
    }

}

//     // Listens to attribute(s) of the model of the view, on change
//     // renders the new value to el. Optionally, pass render function to render 
//     // something different, model is passed as an arg
//     // TODO: document me
//     bindEl(attributes: string[], selector, render?) {
//         const view = this;

//         if (!render) {
//             render = (model) => model.get(attributes);
//         }

//         if (!_.isArray(attributes)) {
//             attributes = [attributes];
//         }

//         // TODO: might want to Debounce because of some inputs being very rapid
//         // but maybe that should be left up to the user changes (ie textareas like description)
//         attributes.forEach((attribute) => {
//             view.listenTo(view.model, 'change:' + attribute, (model) => {
//                 view.$(selector).html(render(model));
//             });
//         });

//     }

//     // TODO: Default render can just render template
// }, {

//         // `Viking.View.templates` is used for storing templates. 
//         // `Viking.View.Helpers.render` looks up templates in this
//         // variable
//         templates: {},

//         // Override the original extend function to support merging events
//         extend(protoProps, staticProps) {
//             if (protoProps && protoProps.events) {
//                 _.defaults(protoProps.events, this.prototype.events);
//             }

//             return Backbone.View.extend.call(this, protoProps, staticProps);
//         }
//     }
// );

// export { Helpers };
