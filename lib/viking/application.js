import View from 'viking/view';
import Router from 'config/routes';
import initializers from 'config/initializers/*';
import {result} from 'viking/support';
import {replace} from 'viking/support/dom';

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
    this.view = new view(Object.assign({}, options, {tagName: 'main'}));
    await this.view.render();

    if (oldView) {
      replace(oldView.el, this.view.el)
      oldView.remove();
    } else {
      replace(this.$('main')[0], this.view.el);
    }
    
    
    this.view.load(() => {
      
      this.$('main').html(this.view.render().el);
      let title = result(app.view, 'title', this.title);
      if (title !== undefined) {
        document.title = title;
      }
    });
    
    return this.view;
  }
  
}