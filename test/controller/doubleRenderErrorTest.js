import 'mocha';
import * as assert from 'assert';
import * as Errors from 'viking/errors';
import VView from 'viking/view';
import VController from 'viking/controller';

describe('Viking.Controller', () => {
  describe('DoubleRenderError', () => {

      it('throws an Error if you double render', () => {
          var application = { display: () => {} };
        
          class Controller extends VController {
              index() {
                  this.display(VView);
                  this.display(VView);
              }
          }

          let c = new Controller(application);
          assert.throws( () => c.dispatch('index'), Errors.DoubleRenderError );
      });

      it('throws an Error if you redirect twice', () => {
          var application = { navigateTo: () => {} };
        
          class Controller extends VController {
              index() {
                  this.redirectTo('/');
                  this.redirectTo('/');
              }
          }

          let c = new Controller(application);
          assert.throws( () => c.dispatch('index'), Errors.DoubleRenderError );
      });

      it('throws an Error if you redirect after rendering or visa versa', () => {
          var application = { display: () => {}, navigateTo: () => {} };
        
          class Controller extends VController {
              a() {
                  this.display(VView);
                  this.redirectTo('/');
              }
              b() {
                  this.redirectTo('/');
                  this.display(VView);
              }
          }

          let a = new Controller(application);
          assert.throws( () => a.dispatch('a'), Errors.DoubleRenderError );

          let b = new Controller(application);
          assert.throws( () => b.dispatch('b'), Errors.DoubleRenderError );
      });

  });
});