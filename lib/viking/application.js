import View from 'viking/view';
import Router from 'config/routes';
import initializers from 'config/initializers/*';
import {result} from 'viking/support';
import {replace, createElement} from 'viking/support/dom';

/**
 * this is MyClass description.
 * @example
 * let myClass = new MyClass();
 */
export default class Application extends View {
  
  static title = 'Viking Application';
  
  /**
  * this is constructor description.
  * @param {number} arg1 this is arg1 description.
  * @param {string[]} arg2 this is arg2 description.
  */ 
  constructor(options = {}) {
    super(options);
    this.render(); 
    this.router.start();
  }
  
  setup() {
    this.router = new Router(this);
    initializers.forEach((i) => i(this));
  }

  async display(view, options) {
    const oldView = this.view;
    
    this.view = new view(Object.assign({}, {tagName: 'main'}, options)); // TODO remove 'main' when it breaks something
    
    await this.view.render();

    if (oldView) {
      replace(oldView.el, this.view.el)
      oldView.remove();
    } else {
      this.el.appendChild(this.view.el)
    }
    
    let title = result(this.view, 'title', this.title);
    if (title !== undefined) {
      document.title = title;
    }
    
    return this.view;
  }
  
}