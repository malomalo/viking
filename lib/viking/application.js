import View from './view';
import {result} from './support';
import {replace} from './support/dom';
import { append, remove, insertBefore } from 'dolla';

/**
 * this is MyClass description.
 * @example
 * let myClass = new MyClass();
 */
export default class Application extends View {
  
  static title = document.title;
  static events = { 'click a[href]': 'pushState' };
  
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

  async display (view, options={}) {
  
      if (this.view) {
          this.view.remove()
      }
      
      let contents;
      if (view instanceof View) {
          this.view = view;
          this.view.render();
          contents = this.view.el;
      } else {
          delete this.view;
          contents = view
      }
      
      let title;
      if (this.view) {
          title = result(this.view, 'title')
      }
      title = title || options.title || this.title;
      
      if (title !== undefined) {
        document.title = title;
      }
      
      let layout
      if (options.layout && options.layout !== true) {
          layout = result(options, 'layout')
      } else if (this.constructor.layout && options.layout !== false) {
          layout = this.constructor.layout
      }
      
      console.log("********", layout);
      if (layout === undefined) {
          append(this.el, contents);
      } else if (layout != this.layout) {
          this.el.innerHTML = '';
          await append(this.el, layout({
              contents: this.contents
          }));
      }  else {
          insertBefore(this.contents, contents)
          remove(this.contents);
      }
      this.contents = contents;

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
