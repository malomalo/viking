import * as assert from 'assert';
import {Application, View, Router, Controller} from '@malomalo/viking';

describe('Viking/Application', () => {
    
    describe('pushState', () => {
        it('caputres clicks on links', function () {
            let navigations = [];
        
            class MyRouter extends Router {
                static routes = {
                    '/path': () => { }
                };
                navigateTo(url, params) {
                    navigations.push(url);
                }
            }

            class MyApplication extends Application {
                static router = MyRouter;
            }

            let app = new MyApplication();
            let link = document.createElement('a');
            link.href = '/path';
            app.el.append(link);
            this.click(link);

            assert.deepEqual(navigations, ['/path']);
        });
        
        it('caputres clicks on fqdn links', function () {
            let navigations = [];
        
            class MyRouter extends Router {
                static routes = {
                    '/path': () => { }
                };
                navigateTo(url, params) {
                    navigations.push(url);
                }
            }

            class MyApplication extends Application {
                static router = MyRouter;
            }

            let app = new MyApplication();
            let link = document.createElement('a');
            link.href = 'http://example.com/path';
            app.el.append(link);
            this.click(link);

            assert.deepEqual(navigations, ['/path']);
        });
        
        it('ignores clicks on links clicked with a modifier key', function () {
            let navigations = [];
        
            class MyRouter extends Router {
                static routes = {
                    '/path': () => { }
                };
                navigateTo(url, params) {
                    navigations.push(url);
                }
            }

            class MyApplication extends Application {
                static router = MyRouter;
            }

            let app = new MyApplication();
            let link = document.createElement('a');
            link.href = '/path';
            app.el.append(link);
            this.click(link, {metaKey: true});
            this.click(link, {ctrlKey: true});
            this.click(link, {altKey: true});
            this.click(link, {shiftKey: true});

            assert.deepEqual(navigations, []);
        });
        
        it("ignores clicks on links that don't match the router", function () {
            let navigations = [];
        
            class MyRouter extends Router {
                static routes = {
                    '/path': () => { }
                };
                navigateTo(url, params) {
                    navigations.push(url);
                }
            }

            class MyApplication extends Application {
                static router = MyRouter;
            }

            let app = new MyApplication();
            let link = document.createElement('a');
            link.href = '/pather';
            app.el.append(link);
            this.click(link);

            assert.deepEqual(navigations, []);
        });
        
        it('ignores clicks on to other domains', function () {
            let navigations = [];
        
            class MyRouter extends Router {
                static routes = {
                    '/path': () => { }
                };
                navigateTo(url, params) {
                    navigations.push(url);
                }
            }

            class MyApplication extends Application {
                static router = MyRouter;
            }

            let app = new MyApplication();
            let link = document.createElement('a');
            link.href = 'http://otherdomain.com/path';
            app.el.append(link);
            this.click(link);

            assert.deepEqual(navigations, []);
        });
        
        it('ignores clicks on to other protcols', function () {
            let navigations = [];
        
            class MyRouter extends Router {
                static routes = {
                    '/path': () => { }
                };
                navigateTo(url, params) {
                    navigations.push(url);
                }
            }

            class MyApplication extends Application {
                static router = MyRouter;
            }

            let app = new MyApplication();
            let link = document.createElement('a');
            link.href = 'https://example.com/path';
            app.el.append(link);
            this.click(link);

            assert.deepEqual(navigations, []);
        });
    });
    
});