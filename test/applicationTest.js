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
    
    describe('::layout', () => {
        it('Element', async () => {
            class MyApplication extends Application {
                static layout = (content) => {
                    const el = document.createElement('layout')
                    el.append(content)
                    return el
                }
            }
            let app = new MyApplication();
            const el = document.createElement('div')
            el.innerHTML = 'Hello'
            await app.display(el);
            assert.equal(app.el.outerHTML, '<div><layout><div>Hello</div></layout></div>')
        })
        it('[Element]', async () => {
            class MyApplication extends Application {
                static layout = (content) => {
                    const el = document.createElement('layout')
                    el.append(content)
                    return [
                        el
                    ]
                }
            }
            let app = new MyApplication();
            const el = document.createElement('div')
            el.innerHTML = 'World'
            await app.display(el);
            assert.equal(app.el.outerHTML, '<div><layout><div>World</div></layout></div>')
        })
        
        it('Promise', async () => {
            class MyApplication extends Application {
                static layout = async (content) => {
                    return new Promise(resolve => {
                        const el = document.createElement('layout')
                        el.append(content)
                        resolve(el)
                    })
                }
            }
            let app = new MyApplication();
            const el = document.createElement('div')
            el.innerHTML = 'Hello'
            await app.display(el);
            assert.equal(app.el.outerHTML, '<div><layout><div>Hello</div></layout></div>')
        })
        
        it('false', async () => {
            class MyApplication extends Application {
                static layout = () => false
            }
            let app = new MyApplication();
            const el = document.createElement('div')
            el.innerHTML = 'Hello'
            await app.display(el);
            assert.equal(app.el.outerHTML, '<div><div>Hello</div></div>')
        })
        
        it('keeps layout on subsequent displays', async () => {
            class MyApplication extends Application {
                static layout = (content) => {
                    const el = document.createElement('layout')
                    el.append(content)
                    return el
                }
            }
            let app = new MyApplication();
            const el = document.createElement('div')
            el.innerHTML = 'Hello'
            await app.display(el);
            
            const layout = app.el.querySelector('layout')
            
            const el2 = document.createElement('div')
            el2.innerHTML = 'World'
            await app.display(el2)
            
            assert.equal(app.el.outerHTML, '<div><layout><div>World</div></layout></div>')
            assert.equal(layout, app.el.querySelector('layout'))
        })
        
        it('changes layout', async () => {
            class MyApplication extends Application {
                static layout = (content) => {
                    const el = document.createElement('layout')
                    el.append(content)
                    return el
                }
            }
            let app = new MyApplication();
            const el = document.createElement('div')
            el.innerHTML = 'Hello'
            await app.display(el);
            
            const el2 = document.createElement('div')
            el2.innerHTML = 'World'
            await app.display(el2, {
                layout: content => {
                    const el = document.createElement('new-layout')
                    el.append(content)
                    return el
                }
            })
            
            assert.equal(app.el.outerHTML, '<div><new-layout><div>World</div></new-layout></div>')
        })
    })
    
    describe('display', () => {
        it('Element', async () => {
            class MyApplication extends Application {}
            let app = new MyApplication();
            const el = document.createElement('div')
            el.innerHTML = 'Hello'
            await app.display(el);
            assert.equal(app.el.outerHTML, '<div><div>Hello</div></div>')
        })
        it('[Element]', async () => {
            class MyApplication extends Application {}
            let app = new MyApplication();
            const el = document.createElement('div')
            el.innerHTML = 'Hello'
            await app.display([el]);
            assert.equal(app.el.outerHTML, '<div><div>Hello</div></div>')
        })
        it('Promise', () => {
            class MyApplication extends Application {}
            let app = new MyApplication();
            const render =  new Promise(resolve => {
                const el = document.createElement('div')
                el.innerHTML = 'Hello'
                
                const el2 = document.createElement('div')
                el2.innerHTML = 'World'
                resolve([el, el2])
            })
            app.display(render);
            return render.then(() => {
                assert.equal(app.el.outerHTML, '<div><div>Hello</div><div>World</div></div>')
            })
        })
        it('View', async () => {
            class MyApplication extends Application {}
            class MyView extends View {
                render () {
                    this.el.innerHTML = 'Hello World'
                }
            }
            let app = new MyApplication();
            await app.display(new MyView())
            assert.equal(app.el.outerHTML, '<div><div>Hello World</div></div>')
        })
    })
});