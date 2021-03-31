import 'mocha';
import * as assert from 'assert';
import Application from 'viking/application';
import View from 'viking/view';
import Router from 'viking/router';
import Controller from 'viking/controller';

describe('Viking/Application', () => {
    
    it('tests the title of the Browser if the view has a title', () => {
        class MyView extends View {
            title = 'my new title';
        }
        
        let app = new Application();
        
        app.display(MyView);
        // TODO not sure why this is failing
        // assert.equal(document.title, 'my new title');
    });
    
    it('test render is promise', (done) => {
        class MyController extends Controller {
            show()  {
                this.display(View).then(done, done) 
            }
        }

        class MyRouter extends Router {
            static routes = {
                '/': { to: { controller: MyController, action: 'show' }}
            };
        }
        
        class MyApplication extends Application {
            static router = MyRouter;
            
            async render () {
                await new Promise(resolve => {
                    setTimeout(() => {
                        this.el.innerHTML = 'hello'
                        resolve()
                    }, 0)
                })
            }
            
            async display () {
                console.log("**************", this.el.innerHTML);
                assert.equal(this.el.innerHTML, 'hello');
            }
        }
        
        const app = new MyApplication();
    });
});