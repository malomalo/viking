import 'mocha';
import * as assert from 'assert';
import VController from 'viking/controller';

describe('Viking.Controller', () => {

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
        assert.deepStrictEqual(c.sequence, ['ba', 'index', 'aa']);
    });

    it('aroundActions with string and options', () => {
        class Controller extends VController {

            static aroundActions = [
              ['aa', {only: 'new' }]
            ];
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
        assert.deepStrictEqual(c.sequence, ['ba', 'index', 'aa']);
    });

    it('aroundActions with function', () => {
        class Controller extends VController {
            static aroundActions = [
                function (cb) {
                  this.sequence.push('ba');
                  cb();
                  this.sequence.push('aa');
                }
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

});
