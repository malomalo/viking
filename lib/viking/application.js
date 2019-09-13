import View from 'viking/view';
import Router from 'config/routes';
import initializers from 'config/initializers/*';
import {result} from 'viking/support';

export default class Application extends View {
  
  static title = 'Viking Application';
  
  constructor(options = {}) {
    super(options);
    this.render(); 
    this.router.start();
  }
  
  setup() {
    this.router = new Router(this);
    initializers.forEach((i) => i(this));
  }

  display(view, options) {
    let app = this;
    
    if (this.view) {
      this.view.remove();
    }
    
    this.view = new view(options);
    this.view.load(() => {
      this.$('main').html(this.view.render().el);
      let title = result(app.view, 'title', this.title);
      if (title !== undefined) {
        document.title = title;
      }
    });
  }
  
}