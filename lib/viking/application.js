import View from './view';
import { result } from './support';
import { append, removeBetween, insertBefore } from './support/dom';

/**
* The Application class serves as the main entry point for a Viking.js application.
* It handles routing, layout management, and content display.
* @extends View
* @param {Object} options
*/
export default class Application extends View {
  
    /**
    * The default title for the application
    * @static
    * @type {string}
    * @default document.title
    */
    static title = document.title;
    
    /**
    * Default event bindings for the application
    * @static
    * @type {Object}
    */
    static events = { 'click a[href]': 'pushState' };
  
    /**
    * Define a layout function to wrap the view content, is called everytime layout *changes*
    * @this {Application} instance of calling Application
    * @type {Function}
    * @param {Object} locals - Properties of the view with a property called "content" assigned as the displayed template
    * @returns {Elements|Boolean} Elements to append, return false to not render layout
    */ 
    layout;
  
    /**
    * Define properties to be included when calling layout or display a template
    * @instance
    * @type {Object|Function|undefined}
    */ 
    helpers;
  
    constructor(options = {}) {
        super(options);
        this.placeholders = [
            document.createTextNode(""),
            document.createTextNode("")
        ]
        append(this.el, this.placeholders)
    }
    
    /**
    * Starts the application and its router if one exists
    * @return {Application} Returns the application instance for chaining
    */
    start () {
        this.router?.start();
        return this
    }
  
    /**
    * Sets up the application by initializing the router and running initializers
    * Called automatically during construction
    */
    setup() {
        if (this.constructor.router) {
            this.router = new this.constructor.router(this);
        }
    
        if (this.constructor.initializers) {
            this.constructor.initializers.forEach((i) => i(this));
        }
    }
  
    /**
    * @typedef {Object} DisplayOptions
    * @property {function} layout - Override Application.layout
    * @property {string} title - Override Application.title
    */
  
    /**
    * Display content
    * @param {function} template - Function returning element(s), receives merger of locals and helpers as arugment
    * @param {Object} locals - Properties passed to template
    * @param {DisplayOptions} options - Options for display
    * @return {null}
    * @example
    * this.display(userShow, {user: user}, {layout: false})
    */ 
    async display(template, locals={}, options={}) {
        locals = Object.assign({}, result(this, 'helpers'), locals)
        const templateWrapper = (...args) => template(...(args.concat(locals)))

        const title = options.title || this.constructor.title;
        if (title !== undefined) {
            document.title = title;
        }
        
        window.scrollTo(0,0)
        const layoutTemplate = options.layout == undefined ? this.layout : options.layout
        if (layoutTemplate && (layoutTemplate !== this.layoutTemplate || options.forceLayoutRender == true)) {
            this.layoutTemplate = layoutTemplate
            this.el.innerHTML = ''
            let layoutContent = await layoutTemplate.call(this, Object.assign({
                content: (...args) => {
                    const content = templateWrapper(...args)
                    if (content instanceof Promise) {
                        return content.then(content => [
                            this.placeholders[0], content, this.placeholders[1]
                        ])
                    }
                    return [
                        this.placeholders[0], content, this.placeholders[1]
                    ]
                }
            }, locals))
            if (layoutContent === false) {
                append(this.el, this.placeholders)
            } else {
                if (!Array.isArray(layoutContent)) { layoutContent = [layoutContent]}
                append(this.el, ...layoutContent)
                return
            }
        }
        
        removeBetween(this.placeholders[0], this.placeholders[1])
        insertBefore(this.placeholders[1], await templateWrapper())
    }

    /**
    * Navigates to the specified path using the application's router
    * @param {string} path - The path to navigate to
    */
    navigateTo(path) {
        this.router.navigateTo(path);
    }
  
    /**
    * Event handler for link clicks that uses pushState for navigation when possible
    * Allows the application to handle internal navigation without page reloads
    * @param {Event} e - The click event
    */
    pushState (e) {
        if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) {
            return;
        }

        const destination = e.delegateTarget;
        if (destination.origin !== location.origin) {
            return;
        }

        if (this.router.handlerForPath(destination.pathname)) {
            e.preventDefault();
            this.navigateTo(destination.pathname);
        }
    }
}
