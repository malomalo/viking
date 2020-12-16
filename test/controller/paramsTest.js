import 'mocha';
import * as assert from 'assert';
import * as Errors from 'viking/errors';
import VView from 'viking/view';
import VController from 'viking/controller';

describe('Viking.Controller', () => {
  describe('params', () => {

      it('params from query string are present in params', () => {
        history.pushState({}, '', 'http://example.com?query=param&other=parameter');
        
          class Controller extends VController {
              index() {
                  assert.equal(this.params.query, 'param');
                  assert.equal(this.params.other, 'parameter');
              }
          }

          let c = new Controller();
          c.dispatch('index')
      });

  });
});