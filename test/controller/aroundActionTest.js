import 'mocha';
import * as assert from 'assert';
import VController from 'viking/controller';

describe('Viking.Controller', () => {
  describe('aroundActions', () => {

    describe('with string', () => {
      it('w/o options', () => {
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

      describe('w/ except option', () => {
        it('as a string', () => {
            class Controller extends VController {
                static aroundActions = [ ['aa', {except: 'new' }] ];
                sequence = [];
                index() { this.sequence.push('index'); }
                new() { this.sequence.push('new'); }
                aa(callback) {
                    this.sequence.push('ba');
                    callback();
                    this.sequence.push('aa');
                }
            }

            let c = new Controller();
            c.dispatch('index');
            assert.deepStrictEqual(c.sequence, ['ba', 'index', 'aa']);
            c.dispatch('new');
            assert.deepStrictEqual(c.sequence, ['ba', 'index', 'aa', 'new']);
        });

        it('as a array of strings', () => {
            class Controller extends VController {
                static aroundActions = [ ['aa', {except: ['new'] }] ];
                sequence = [];
                index() { this.sequence.push('index'); }
                new() { this.sequence.push('new'); }
                aa(callback) {
                    this.sequence.push('ba');
                    callback();
                    this.sequence.push('aa');
                }
            }

            let c = new Controller();
            c.dispatch('index');
            assert.deepStrictEqual(c.sequence, ['ba', 'index', 'aa']);
            c.dispatch('new');
            assert.deepStrictEqual(c.sequence, ['ba', 'index', 'aa', 'new']);
        });
      });

      describe('w/ only option', () => {
        it('as a string', () => {
            class Controller extends VController {
                static aroundActions = [ ['aa', {only: 'index' }] ];
                sequence = [];
                index() { this.sequence.push('index'); }
                new() { this.sequence.push('new'); }
                aa(callback) {
                    this.sequence.push('ba');
                    callback();
                    this.sequence.push('aa');
                }
            }

            let c = new Controller();
            c.dispatch('index');
            assert.deepStrictEqual(c.sequence, ['ba', 'index', 'aa']);
            c.dispatch('new');
            assert.deepStrictEqual(c.sequence, ['ba', 'index', 'aa', 'new']);
        });

        it('as a array of strings', () => {
            class Controller extends VController {
                static aroundActions = [ ['aa', {only: ['index'] }] ];
                sequence = [];
                index() { this.sequence.push('index'); }
                new() { this.sequence.push('new'); }
                aa(callback) {
                    this.sequence.push('ba');
                    callback();
                    this.sequence.push('aa');
                }
            }

            let c = new Controller();
            c.dispatch('index');
            assert.deepStrictEqual(c.sequence, ['ba', 'index', 'aa']);
            c.dispatch('new');
            assert.deepStrictEqual(c.sequence, ['ba', 'index', 'aa', 'new']);
        });
      });
    });

    it('with function', () => {
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
});