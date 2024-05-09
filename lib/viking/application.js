import View from './view';
import { result, resolve } from './support';
import { replace, append } from './support/dom';

/**
 * this is MyClass description.
 * @example
 * let myClass = new MyClass();
 */
export default class Application extends View {
  
  static title = document.title;
  static events = { 'click a[href]': 'pushState' };
  
  /**
  * Define a layout function to wrap the view content, is only called on first display
  * @static {Function}
  * @param {Elements} views elements
  * @returns {Elements|Boolean} Elements to append, return false to not render layout
  */ 
  static layout;
  
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
  * Render a view.
  * @param {Object} Array of elements, element, or object with el property
  * @param {Object} Options
  * @option layout {Function} see Application.layout
  * @option title {Function|String} see Application.title
  */ 
  async display(content, options={}) {
      const elements = content.el !== undefined ? content.el : content
      const layoutRender = options.layout || this.constructor.layout
      
      if (layoutRender && layoutRender !== this.layoutRenderWas) {
          this.el.innerHTML = ''
          this.layout = await layoutRender(elements)
          if (this.layout !== false) {
              append(this.el, this.layout)
          } else {
              append(this.el, elements)
          }
      } else {
          if (this.contentWas) {
              replace(this.contentWas.el !== undefined ? this.contentWas.el : this.contentWas, elements)
              resolve(this.contentWas, 'remove')
          } else {
              append(this.el, elements)
          }
      }

      resolve(content, 'render')
      
      const title = resolve([content, options, this], 'title');
      if (title !== undefined) {
          document.title = title;
      }
      
      this.contentWas = content
      this.layoutRenderWas = layoutRender
      return content;
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
