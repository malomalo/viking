import {defaults as _defaults, forEach as _each, remove as _remove, uniqueId as _uniqueId, result as _result} from 'lodash';
import EventBus from './event_bus';

// import { Helpers } from './view/helpers';

// Viking.View
// -----------
//

// Backbone Views are almost more convention than they are actual code. A View
// is simply a JavaScript object that represents a logical chunk of UI in the
// DOM. This might be a single item, an entire list, a sidebar or panel, or
// even the surrounding frame which wraps your whole app. Defining a chunk of
// UI as a **View** allows you to define your DOM events declaratively, without
// having to worry about render order ... and makes it easy for the view to
// react to specific changes in the state of your models.
//
// Viking.View is a framework for handling view template lookup and rendering.
// It provides view helpers that assist when building HTML forms and more.

const optionKeys = ['model', 'collection', 'el', 'id', 'attributes', 'className', 'tagName', 'events'];
// Cached regex to split keys for `delegate`.
const delegateEventSplitter = /^(\S+)\s*(.*)$/;

// Find the right `Element#matches` for IE>=9 and modern browsers.
const matchesSelector = Element.prototype.matches ||
                        Element.prototype.webkitMatchesSelector ||
                        Element.prototype.msMatchesSelector;

export interface IViewOptions {
    el?: Element | string;

    [propName: string]: any;
}

export interface IEventMap {
    [propName: string]: string
                        | EventListener
                        | [string, boolean | AddEventListenerOptions]
                        | [EventListener, boolean | AddEventListenerOptions];
}

export interface IEventListener {
    el: Element;
    eventName: string;
    handler: any;
    listener?: any;
    selector?: string;
    options: boolean | AddEventListenerOptions;
}

export class View extends EventBus {

    static el: Element | (() => Element | string) | string | undefined;
    static tagName: string | any = 'div';
    static id: string | (() => string) | undefined;
    static className: string | (() => string) | undefined;
    static attributes: any = {};

    static events: IEventMap;

    static template: string | undefined;

    vid: string;
    el: Element;
    id: string  | undefined;
    className: string | (() => string) | undefined;
    tagName: string = '';
    template: string | undefined;
    subViews: View[];
    _domEvents: IEventListener[];
    events: IEventMap;

    constructor(options: IViewOptions = {}) {
        super();
        this.vid = _uniqueId('v');

        // Add an array for storing subView attached to this view so we can remove then
        this.subViews = [];

        this._domEvents = [];

        _each(optionKeys, (k) => {
            if (options[k]) {
                this[k] = options[k];
            } else {
                this[k] = (this.constructor as any)[k];
            }
        });

        if (options.events) {
            this.events = Object.assign({}, options.events);
        } else {
            this.events = {};
        }

        for (let p = this.constructor ; p !== View ; p = Object.getPrototypeOf(p)) {
            _defaults(this.events, (p as any).events);
        }

        // Ensure that the View has a DOM element to render into.
        // If `this.constructor.el` is a string, pass it through `$()`, take
        // the first matching element, and re-assign it to `this.el`.
        // Otherwise, create an element from the `id`, `className` and
        // `tagName` properties.
        if ((this as any).el) {
            this.el = this.setElement(_result(this, 'el'));
        } else {
            const attrs: {id?: string, class?: string} = Object.assign({}, _result(this, 'attributes'));
            if (this.id) { attrs.id = _result(this, 'id'); }
            if (this.className) { attrs['class'] = _result(this, 'className'); }
            this.el = this.setElement(document.createElement(_result<string>(this, 'tagName')));
            _each(attrs, (v, k) => {
                if (v) {
                    this.el.setAttribute(k, v);
                }
            });
        }

        this.initialize.apply(this, arguments);
    }

    $(selector: string) {
        return this.el.querySelectorAll(selector);
    }

    initialize() {

    }

    // **render** is the core function that your view should override, in order
    // to populate its element (`this.el`), with the appropriate HTML. The
    // convention is for **render** to always return `this`.
    render() {
        return this;
    }

    // Remove this view and all subviews by taking the element out of the DOM,
    // and removing any applicable Viking.EventBus listeners.
    remove() {
        _each(this.subViews, (view) => {
            view.remove();
        });

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
    setElement(element: Element | NodeList | string) {
        this.undelegateEvents();

        if (typeof element === 'string') {
            const match = document.querySelector(element);
            if (match) {
                this.el = match;
            } else {
                throw new Error('Could not find element for selector "' + element + '"');
            }
        } else if (element instanceof NodeList) {
            this.el = element[0] as Element;
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
    delegateEvents(events?: IEventMap) {
        if (!events) { events = _result(this, 'events'); }
        if (!events) { return this; }

        this.undelegateEvents();
        _each(events, (value, key) => {
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
    delegate(eventName: string, selector: string, listener: EventListener, options?: boolean | AddEventListenerOptions);
    delegate(eventName: string, listener: EventListener, options?: boolean | AddEventListenerOptions);
    delegate(eventName, selector, listener?, options?) {
        if (options === undefined) {
            if (listener) {
                options = false;
            } else {
                listener = selector;
                selector = undefined;
            }
        }

        if (eventName === 'focus' || eventName === 'blur') {
            _each(this.el.querySelectorAll(selector), (element: Element) => {
                element.addEventListener(eventName, listener, options);
                this._domEvents.push({
                    el: element,
                    eventName: eventName,
                    handler: listener,
                    options: options
                });
            });

            return listener;
        }

        const handler = selector ? (e) => {
            let node = e.target || e.srcElement;
            for (; node && node !== this.el; node = node.parentNode) {
                if (matchesSelector.call(node, selector)) {
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
                const item = this._domEvents[i];
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
    undelegate(eventName?: string, selector?: string, listener?: EventListener, options?: boolean | AddEventListenerOptions);
    undelegate(eventName?: string, listener?: EventListener, options?: boolean | AddEventListenerOptions);
    undelegate(eventName?, selector?, listener?, options?) {
        if (typeof selector === 'function') {
            options = listener;
            listener = selector;
            selector = undefined;
        }

        if (this.el) {
            _remove(this._domEvents, (handler, i) => {
                if ( eventName && eventName !== handler.eventName ||
                     selector && selector !== handler.selector ||
                     listener && listener !== handler.listener ||
                     options && options !== handler.options) {
                    return false;
                } else {
                    handler.el.removeEventListener.call(handler.el, handler.eventName, handler.handler, handler.options);
                    return true;
                }
            });
        }

        return this;
    }

    // renderTemplate(locals) {
    //     return Helpers.render(this.template, locals);
    // }

}




//     // A helper method that constructs a view and adds it to the subView array
//     subView(SubView, options) {
//         const view = new SubView(options);
//         this.subViews.push(view);
//         this.listenTo(view, 'remove', this.removeSubView);
//         return view;
//     },

//     // Removes the subview from the array and stop listening to it, and calls
//     // #remove on the subview.
//     removeSubView(view) {
//         this.subViews = _.without(this.subViews, view);
//         this.stopListening(view);
//         view.remove();
//     },


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