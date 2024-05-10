import 'mocha';
import * as assert from 'assert';
import Application from 'viking/application';
import View from 'viking/view';
import Router from 'viking/router';
import Controller from 'viking/controller';

describe('Viking/Application', function () {
    
    
    describe('::title', function () {
        it('application title', async function () {
            class MyApplication extends Application {
                static title = 'my new title';
            }

            let app = new MyApplication();

            await app.display(() => createElement('div'));
            
            assert.equal(document.title, 'my new title')
        });
        
        it('display title', async function () {
            class MyApplication extends Application {
                static title = 'my new title';
            }

            let app = new MyApplication();

            await app.display(() => createElement('div'), {}, {
                title: 'better title'
            });
            
            assert.equal(document.title, 'better title')
        });
    })
    
    describe('#layout', function () {
        it('Element', async function () {
            class MyApplication extends Application {
                layout = (locals) => {
                    return createElement('layout', [
                        locals.message,
                        locals.content()
                    ])
                }
            }
            let app = new MyApplication();
            await app.display((locals) => createElement('div', 'Hello'), {message: 'Hello'});
            assert.equal(app.el.outerHTML, '<div><layout>Hello<div>Hello</div></layout></div>')
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
            let timesRun = 0
            class MyApplication extends Application {
                layout = (locals) => {
                    timesRun++
                    return createElement('layout', locals.content())
                }
            }
            let app = new MyApplication();
            await app.display(() => createElement('div', 'Hello'));
            assert.equal(timesRun, 1)

            await app.display(() => createElement('div', 'World'));
            assert.equal(timesRun, 1)
        })

        it('changes layout', async function () {
            class MyApplication extends Application {
                layout = (locals) => {
                    return createElement('layout', locals.content())
                }
            }
            let app = new MyApplication();
            await app.display(() => createElement('div', 'Hello'));

            await app.display(() => createElement('div', 'World'), {}, {
                layout: (locals) => {
                    return createElement('new-layout', locals.content())
                }
            });

            assert.equal(app.el.outerHTML, '<div><new-layout><div>World</div></new-layout></div>')
        })
    })
    
    describe('#display', function () {
        it('Element', async function () {
            class MyApplication extends Application {}
            let app = new MyApplication();
            await app.display((locals) => createElement('div', locals.message), {message: 'Hello'});
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
    
    describe('#helpers', function () {
        it('object', async function () {
            class MyApplication extends Application {
                helpers = {
                    someGlobalProp: 'Hello'
                }
            }
            let app = new MyApplication();
            await app.display((locals) => createElement('div', locals.someGlobalProp));
            assert.equal(app.el.outerHTML, '<div><div>Hello</div></div>')
        })
        it('function', async function () {
            class MyApplication extends Application {
                appProp = 'Hello'
                helpers = () => {
                    return {
                        app: this
                    }
                }
            }
            let app = new MyApplication();
            await app.display((locals) => createElement('div', locals.app.appProp));
            assert.equal(app.el.outerHTML, '<div><div>Hello</div></div>')
        })
    })
});