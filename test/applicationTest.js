import 'mocha';
import * as assert from 'assert';
import Application from 'viking/application';
import View from 'viking/view';
import Router from 'viking/router';
import Controller from 'viking/controller';

describe('Viking/Application', () => {
    
    describe('layout' () => {
        class MyApplication extends Application {
            static layout = locals => {
                return `<template>${locals.contents}</template>`
            }
        }

        it('function', () => {
            const app = new MyApplication;
            app.display(new Promise(resolve => {
                resolve('hello world')
            }));
            assert.equal(app.innerHTML, '<template>hello world</template>');
            const templateEl = app.el.querySelector('template')

            app.display(new Promise(resolve => {
                resolve('hello galaxy')
            }));
            assert.equal(app.innerHTML, '<template>hello galaxy</template>');
            assert.equal(templateEl, app.el.querySelector('template'))
        })

        it('promise', () => {
            class FooApplication extends MyApplication {
                static layout = async (locals) => {
                    return `<template>${await locals.contents}</template>`
                }
            }

            const app = new FooApplication;
            app.display(new Promise(resolve => {
                resolve('hello world')
            }));
            assert.equal(app.innerHTML, '<template>hello world</template>');
        })

        it('options', () => {
            const app = new MyApplication;
            app.display('hello world', {
                layout: (locals) => {
                    return `<custom-layout>${locals.contents}</custom-layout>`
                }
            });
            assert.equal(app.innerHTML, '<custom-layout>hello world</custom-layout>');

            app.display('hello world', {
                layout: false
            });
            assert.equal(app.innerHTML, 'hello world');
        })
    })
    
    describe('display', () => {
        class MyApplication extends Application {}
        
        it('View', async () => {
            class MyView extends View {
                constructor (options) {
                    super(options)
                    this.message = options.message
                }
                
                render () {
                    this.el.innerHTML = this.message
                }
                
                remove () {
                    this.application.foo = true
                }
            }
            
            const app = new MyApplication;
            await app.display(new MyView({message: 'hello world'}));
            console.log("********", app.el.innerHTML);
            assert.equal(app.el.innerHTML, '<div>hello world</div>');
            await app.display('new content');
            assert.equal(app.el.innerHTML, 'new content');
            assert.ok(app.foo);
        })
        
        it('function', () => {
            const app = new MyApplication;
            app.display(() => {
                return '<view>hello world</view>'
            })
            assert.equal(app.innerHTML, '<view>hello world</view>');
        })

        it('promise', async () => {
            const app = new MyApplication;
            await app.display(new Promise(resolve => {
                resolve('<view>hello world</view>')
            }))
            assert.equal(app.innerHTML, '<view>hello world</view>');
        })
    })
    
    describe('title', () => {
        class MyApplication extends Application {
            static title = 'FooApp'
        }

        it('application', () => {
            const app = new MyApplication;
            app.display('hello world');
            assert.equal(document.title, 'FooApp');
        })

        it('options', () => {
            const app = new MyApplication;
            app.display('hello world', {title: 'FooApp Options Title'});
            assert.equal(document.title, 'FooApp Options Title');
        })

        it('View', () => {
            class MyView extends View {
                title = 'FooApp View Title';
            }

            let app = new Application();

            app.display(MyView);
            assert.equal(document.title, 'FooApp View Title');
        });
    })
    
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
});