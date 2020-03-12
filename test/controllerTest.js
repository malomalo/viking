import 'mocha';
import * as assert from 'assert';
import VController from 'viking/controller';

describe('Viking.Controller', () => {

    // it('beforeActions with string', () => {
    //     class Controller extends VController {
    //         static beforeActions = ['ba'];
    //         sequence = [];
    //
    //         ba() { this.sequence.push('ba'); }
    //
    //         index() { this.sequence.push('index'); }
    //     }
    //
    //     let c = new Controller();
    //     c.dispatch('index');
    //     assert.deepStrictEqual(c.sequence, ['ba', 'index']);
    // });
    //
    // it('beforeActions with function', () => {
    //     class Controller extends VController {
    //         static beforeActions = [ function () { this.sequence.push('ba'); } ];
    //         sequence = [];
    //
    //         index() { this.sequence.push('index'); }
    //     }
    //
    //     let c = new Controller();
    //     c.dispatch('index');
    //     assert.deepStrictEqual(c.sequence, ['ba', 'index']);
    // });

    it('aroundActions with string', () => {
        class Controller extends VController {
            static aroundActions = ['aa'];
            sequence = [];
            
            index() { this.sequence.push('index'); }

            aa(callback) {
                this.sequence.push('ba');
                callback();
                this.sequence.push('aa');
            }
        }
        
        let c = new Controller();
        c.dispatch('index');
        console.log("LC!! seq " + JSON.stringify(c.sequence))
        assert.deepStrictEqual(c.sequence, ['ba', 'index', 'aa']);
    });

    it('aroundActions with function', () => {
        class Controller extends VController {
            static aroundActions = [
                function (cb) { this.sequence.push('ba'); cb(); this.sequence.push('aa'); }
            ];
            sequence = [];
            
            index() {
                this.sequence.push('index');
            }
        }
        
        let c = new Controller();
        c.dispatch('index');
        assert.deepStrictEqual(c.sequence, ['ba', 'index', 'aa']);
    });

    it('aroundActions with only', () => {
        class Controller extends VController {
            static aroundActions = [
                {
                    method: function (cb) { this.sequence.push('action1'); cb(); },
                    only: 'show'
                }
            ];
            sequence = [];
            
            index() {
                this.sequence.push('index');
            }
            
            show() {
                this.sequence.push('show');
            }
        }
        
        let c = new Controller();
        c.dispatch('index');
        assert.deepStrictEqual(c.sequence, ['index']);
        
        c = new Controller();
        c.dispatch('show');
        assert.deepStrictEqual(c.sequence, ['action1', 'show']);
    });

    it('aroundActions with except', () => {
        class Controller extends VController {
            static aroundActions = [
                {
                    method: function (cb) { this.sequence.push('action1'); cb(); },
                    except: 'show'
                }
            ];
            sequence = [];
            
            index() {
                this.sequence.push('index');
            }

            show() {
                this.sequence.push('show');
            }
        }
        
        let c = new Controller();
        c.dispatch('index');
        console.log("LC!! seq5 " + JSON.stringify(c.sequence))
        assert.deepStrictEqual(c.sequence, ['action1', 'index']);

        c = new Controller();
        c.dispatch('show');
        console.log("LC!! seq6 " + JSON.stringify(c.sequence))
        assert.deepStrictEqual(c.sequence, ['show']);
    });

    // it('afterActions with string', () => {
    //     class Controller extends VController {
    //         static afterActions = ['aa'];
    //         sequence = [];
    //
    //         index() { this.sequence.push('index'); }
    //         aa() { this.sequence.push('aa'); }
    //     }
    //
    //     let c = new Controller();
    //     c.dispatch('index');
    //     assert.deepStrictEqual(c.sequence, ['index', 'aa']);
    // });
    //
    // it('afterActions with function', () => {
    //     class Controller extends VController {
    //         static afterActions = [
    //             function () { this.sequence.push('aa'); }
    //         ];
    //         sequence = [];
    //
    //         index() {
    //             this.sequence.push('index');
    //         }
    //     }
    //
    //     let c = new Controller();
    //     c.dispatch('index');
    //     assert.deepStrictEqual(c.sequence, ['index', 'aa']);
    // });

});
