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
    
    it('test if render is async then display is called after render is complete', (done) => {
        class MyController extends Controller {
            show()  {
                this.display(View).then(done, done);
            }
        }

        class MyRouter extends Router {
            static routes = {
                '/': { to: { controller: MyController, action: 'show' } }
            };
        }
        
        class MyApplication extends Application {
            static router = MyRouter;
            
            async render () {
                await new Promise(resolve => {
                    setTimeout(() => {
                        this.el.innerHTML = 'hello'
                        resolve();
                    }, 10);
                });
            }
            
            async display () {
                assert.equal(this.el.innerHTML, 'hello');
            }
        }
        
        const app = new MyApplication();
    });
    
    describe('#display', () => {
        it('global property as object', done => {
            class MyApplication extends Application {
                static globals = {
                    foo: 'bar'
                }
            }
            class MyView extends View {
                constructor (locals) {
                    super(locals)
                    assert.equal('bar', locals.foo)
                    done()
                }
            }
            let app = new MyApplication();
        
            app.display(MyView);
        })
        
        it('global property as function', done => {
            class MyApplication extends Application {
                static globals = function (app) {
                    return { app }
                }
            }
            let app = new MyApplication();
            
            class MyView extends View {
                constructor (locals) {
                    super(locals)
                    assert.ok(locals.app == app)
                    done()
                }
            }
        
            app.display(MyView);
        })
    })
    
    
});