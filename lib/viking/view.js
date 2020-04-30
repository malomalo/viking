import EventBus from 'viking/eventBus';
import {each, result, uniqueId} from 'viking/support';

// import { Helpers } from './view/helpers';



const construtorKeys = ['el', 'id', 'className', 'attributes', 'tagName', 'events', 'template'];
const optionKeys = ['model', 'models', 'el', 'id', 'attributes', 'className', 'tagName', 'events'];
// Cached regex to split keys for `delegate`.
const delegateEventSplitter = /^(\S+)\s*(.*)$/;


// export interface IViewOptions {
//     el?: Element | string;
//
//     [propName: string]: any;
// }
//
// export interface IEventMap {
//     [propName: string]: string
//                         | EventListener
//                         | [string, boolean | AddEventListenerOptions]
//                         | [EventListener, boolean | AddEventListenerOptions];
// }
//
// export interface IEventListener {
//     el: Element;
//     eventName: string;
//     handler: any;
//     listener?: any;
//     selector?: string;
//     options: boolean | AddEventListenerOptions;
// }

// 
// -----------
//

/**
 * Viking Views are almost more convention than they are actual code. A View
 * is simply a JavaScript object that represents a logical chunk of UI in the
 * DOM. This might be a single item, an entire list, a sidebar or panel, or
 * even the surrounding frame which wraps your whole app. Defining a chunk of
 * UI as a **View** allows you to define your DOM events declaratively, without
 * having to worry about render order ... and makes it easy for the view to
 * react to specific changes in the state of your models.
 *
 * Viking.View is a framework for handling view template lookup and rendering.
 * It provides view helpers that assist when building HTML forms and more.

 * @example
 * let myClass = new MyClass();
 */
export default class View extends EventBus {

    static el; // : Element | (() => Element | string) | string | undefined;
    static id; //: string | (() => string) | undefined;
    static className; //: string | (() => string) | undefined;
    static attributes = {}; //: any
    static tagName = 'div'; //: string;
    static events; //: IEventMap;
    static template; //: string | undefined;
    
    static assignableProperties = [
      'record'
    ];
    
    static extended(child) {
        if (child.events) {
            each(this.events, (k, v) => {
                if (child.events[k] === undefined) { child.events[k] = v; }
            });
        }
    }
    
    // An array for storing subView attached to this view
    subViews = []; //: View[];
    _domEvents = []; //: IEventListener[];

    // constructor(options: IViewOptions = {})
    constructor(options = {}) {
        super();
        
        construtorKeys.forEach((k) => {
            this[k] = this.constructor[k];
        })
        
        optionKeys.forEach((k) => {
            if (options[k]) {
                this[k] = options[k];
            }
        });

        this.constructor.assignableProperties.forEach((k) => {
            if (options[k]) {
                this[k] = options[k];
            }
        });

        this.setup.apply(this, arguments);
        
        // Ensure that the View has a DOM element to render into.
        // If `this.constructor.el` is a string, pass it through `$()`, take
        // the first matching element, and re-assign it to `this.el`.
        // Otherwise, create an element from the `id`, `className` and
        // `tagName` properties.
        if (this.el) {
            this.setElement(result(this, 'el'));
        } else {
            const attrs = Object.assign({}, result(this, 'attributes')); //: {id?: string, class?: string}
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

    // $(selector: string) {
    $(selector) {
        return this.el.querySelectorAll(selector);
    }

    // Called before DOM is setup
    setup() { }
    
    initialize() { }

    // **render** is the core function that your view should override, in order
    // to populate its element (`this.el`), with the appropriate HTML. The
    // convention is for **render** to always return `this`.
    render() {
        return this;
    }

    // Remove this view and all subviews by taking the element out of the DOM,
    // and removing any applicable Viking.EventBus listeners.
    remove() {
        this.subViews.forEach((view) => view.remove());

        // Emit a remove event for when a view is removed
        this.dispatchEvent('remove', this);

        this._removeElement();
        this.removeEventListenerFor();
        return this;
    }


    _removeElement() {
        this.undelegateEvents();
        if (this.el.parentNode) {
            this.el.parentNode.removeChild(this.el);
        }
    }

    // Change the view's element (`this.el` property) and re-delegate the
    // view's events on the new `element`. `element` can be a CSS selector,
    // an Element node, or a NodeList. If passed a NodeList of CSS selector,
    // the first node/match will be used.
    //
    // setElement(element: Element | NodeList | string) {
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

    // Set callbacks, where `this.events` is a hash of
    //
    // *{"event selector": "callback"}*
    //
    //     {
    //       'mousedown .title':  'edit',
    //       'click .button':     'save',
    //       'click .open':       function(e) { ... }
    //       'click .title':      ['edit', false],
    //       'click .title':      ['edit', {passive: true}]
    //     }
    //
    // pairs. Callbacks will be bound to the view, with `this` set properly.
    // Uses event delegation for efficiency.
    // Omitting the selector binds the event to `this.el`.
    //
    // delegateEvents(events?: IEventMap) {
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
            for (; node && node !== this.el; node = node.parentNode) {
                if (node.matches(selector)) {
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

    // Clears all callbacks previously bound to the view by `delegateEvents`.
    // You usually don't need to use this, but may wish to if you have multiple
    // views attached to the same DOM element.
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

    // A helper method that constructs a view and adds it to the subView array
    subView(SubView, ...args) {
        const view = new SubView(...args);
        this.subViews.push(view);
        this.addEventListenerFor(view, 'remove', this.subViewRemoved);
        return view;
    }

    // Removes the subview from the array and stop listening to it, and calls
    // #remove on the subview.
    removeSubView(view) {
        // this.subViews = this.subViews.filter((v) => v !== view);
        // this.removeEventListenerFor(view);
        view.remove();
    }
    
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