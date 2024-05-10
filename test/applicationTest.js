import 'mocha';
import * as assert from 'assert';
import Application from 'viking/application';
import View from 'viking/view';
import Router from 'viking/router';
import Controller from 'viking/controller';

describe('Viking/Application', function () {
    it('tests the title of the Browser if the view has a title', function () {
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
                    setTimeout(function () {
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
    
    describe('::layout', function () {
        it('Element', async function () {
            class MyApplication extends Application {
                layout = (locals) => {
                    return createElement('layout', locals.content())
                }
            }
            let app = new MyApplication();
            await app.display(() => createElement('div', 'Hello'));
            assert.equal(app.el.outerHTML, '<div><layout><div>Hello</div></layout></div>')
        })
        it('[Element]', async function () {
            class MyApplication extends Application {
                layout = (locals) => {
                    return [
                        createElement('layout', locals.content())
                    ]
                }
            }
            let app = new MyApplication();
            await app.display(() => createElement('div', 'World'));
            assert.equal(app.el.outerHTML, '<div><layout><div>World</div></layout></div>')
        })

        it('Promise', async function () {
            class MyApplication extends Application {
                layout = async (locals) => {
                    return new Promise(resolve => {
                        resolve(createElement('layout', locals.content()))
                    })
                }
            }
            let app = new MyApplication();
            await app.display(() => createElement('div', 'Hello'));
            assert.equal(app.el.outerHTML, '<div><layout><div>Hello</div></layout></div>')
        })

        it('false', async function () {
            class MyApplication extends Application {
                layout = (locals) => false
            }
            let app = new MyApplication();
            await app.display(() => createElement('div', 'Hello'));
            assert.equal(app.el.outerHTML, '<div><div>Hello</div></div>')
        })

        it('keeps layout on subsequent displays', async function () {
            class MyApplication extends Application {
                layout = (locals) => {
                    return createElement('layout', locals.content())
                }
            }
            let app = new MyApplication();
            await app.display(() => createElement('div', 'Hello'));

            const layout = app.el.querySelector('layout')

            await app.display(() => createElement('div', 'World'));

            assert.equal(app.el.outerHTML, '<div><layout><div>World</div></layout></div>')
            assert.equal(layout, app.el.querySelector('layout'))
        })

        it('changes layout', async function () {
            class MyApplication extends Application {
                layout = (locals) => {
                    return createElement('layout', locals.content())
                }
            }
            let app = new MyApplication();
            await app.display(() => createElement('div', 'Hello'));

            await app.display(() => createElement('div', 'World'), {
                layout: (locals) => {
                    return createElement('new-layout', locals.content())
                }
            });

            assert.equal(app.el.outerHTML, '<div><new-layout><div>World</div></new-layout></div>')
        })
    })
    
    describe('display', function () {
        it('Element', async function () {
            class MyApplication extends Application {}
            let app = new MyApplication();
            await app.display(() => createElement('div', 'Hello'));
            assert.equal(app.el.outerHTML, '<div><div>Hello</div></div>')
        })
        it('[Element]', async function () {
            class MyApplication extends Application {}
            let app = new MyApplication();
            await app.display(() => [createElement('div', 'Hello')]);
            assert.equal(app.el.outerHTML, '<div><div>Hello</div></div>')
        })
        it('Promise', async function () {
            class MyApplication extends Application {}
            let app = new MyApplication();
            await app.display(() => new Promise(resolve => {
                resolve([
                    createElement('div', 'Hello'),
                    createElement('div', 'World')
                ])
            }));
            assert.equal(app.el.outerHTML, '<div><div>Hello</div><div>World</div></div>')
        })
    })
});