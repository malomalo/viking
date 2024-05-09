import View from './view';
import {result} from './support';
import {replace} from './support/dom';

/**
 * this is MyClass description.
 * @example
 * let myClass = new MyClass();
 */
export default class Application extends View {
  
  static title = document.title;
  static events = { 'click a[href]': 'pushState' };
  
  /**
  * Define attributes to be passed to all views on display
  * @static {Object,Function}
  */ 
  static globals = {};
  
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

  async display(view, options) {
    const oldView = this.view;

    this.view = new view(Object.assign({}, result(this.constructor, 'globals', this), options));

    await this.view.render();

    if (oldView) {
      replace(oldView.el, this.view.el)
      oldView.remove();
    } else {
        this.appendView(this.view)
    }
    
    let title = (result(this.view, 'title') || this.title);
    if (title !== undefined) {
      document.title = title;
    }
    
    return this.view;
  }
  
  appendView (view) {
      this.el.appendChild(view.el)
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
