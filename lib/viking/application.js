import View from './view';
import { result, resolve } from './support';
import { replace, append } from './support/dom';

/**
 * @class
 * @name Viking.Application
 * @memberof Viking
 * @extends View
 * @param {Object} options
 */
export default class Application extends View {
  
  static title = document.title;
  static events = { 'click a[href]': 'pushState' };
  
  /**
  * Define a layout function to wrap the view content, is only called on first display
  * @memberof Viking.Application
  * @instance
  * @type {function(locals: Object) => Element[]}
  * @param {Object} locals - Properties of the view with a property called "content" assigned as the displayed template
  * @returns {Elements|Boolean} Elements to append, return false to not render layout
  */ 
  layout;
  
  /**
  * Define properties to be included when calling layout or display a template
  * @memberof Viking.Application
  * @instance
  * @type {Object|Function}
  */ 
  helpers;
  
  /**
  * this is constructor description.
  * @param {number} arg1 this is arg1 description.
  * @param {string[]} arg2 this is arg2 description.
  */ 
  constructor(options = {}) {
    super(options);
    
    const result = this.render();
    if (result instanceof Promise) {
        result.then(() => this.router?.start());
    } else {
        this.router?.start();
    }
  }
  
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
  * @memberof Viking.Application
  * @instance
  * @param {function} template - Function returning element(s), receives merger of locals and helpers as arugment
  * @param {Object} locals - Properties passed to template
  * @param {DisplayOptions} options - Options for display
  * @return {Element[]|Element} - return of template
  * @example
  * this.display(userShow, {user: user}, {layout: false})
  */ 
  async display(template, locals={}, options={}) {
      locals = Object.assign({}, result(this, 'helpers'), locals)
      const layoutTemplate = options.layout || this.layout
      const templateWrapper = (...args) => {
          this.content = template(locals, ...args)
          return this.content
      }

      if (layoutTemplate && layoutTemplate !== this.layoutTemplate) {
          this.layoutTemplate = layoutTemplate
          
          this.el.innerHTML = ''
          const layoutContent = await layoutTemplate(Object.assign({content: templateWrapper}, locals))
          if (layoutContent !== false) {
              append(this.el, layoutContent)
          } else {
              append(this.el, await templateWrapper())
          }
      } else {
          if (this.content) {
              replace(this.content, await templateWrapper())
          } else {
              append(this.el, await templateWrapper())
          }
      }
      
      const title = options.title || this.constructor.title;
      if (title !== undefined) {
          document.title = title;
      }
      return this.content
  }

  navigateTo(path) {
      this.router.navigateTo(path);
  }
  
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
