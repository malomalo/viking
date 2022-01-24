import 'mocha';
import * as assert from 'assert';
import VController from 'viking/controller';
import VikingRouter from 'viking/router';

describe('Viking.Controller', () => {
    
    describe('params', () => {
    
        afterEach(function () {
            if(this.router) { this.router.stop(); };
        });
        
        it('params from query string are present in params', function () {
            class Controller extends VController {
                index() {
                    assert.equal(this.params.counter, '2');
                    assert.equal(this.params.other, 'parameter');
                }
            }
            class Router extends VikingRouter {
                static routes = {
                    '/projects': {
                        to: [Controller, 'index']
                    }
                };
            }

            this.router = new Router();
            this.router.start()
            this.router.navigateTo('/projects', {
                counter: 2,
                other: 'parameter'
            })
        });
        
        it('params from route are present in params', function () {
            class Controller extends VController {
                show () {
                    assert.equal(this.params.foo_id, '999-9999-9999');
                    assert.equal(this.params.bar, 'hello');
                }
            }
            class Router extends VikingRouter {
                static routes = {
                    '/projects/:foo_id': {
                        to: [Controller, 'show']
                    }
                };
            }
          
            this.router = new Router();
            this.router.start()
            this.router.navigateTo('/projects/999-9999-9999', {
                bar: 'hello'
            })
        });

    });
});