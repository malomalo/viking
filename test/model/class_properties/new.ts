import * as assert from 'assert';
import 'mocha';
import {Model} from '../../../src/viking/model';

describe('Viking.Model::new', () => {

    it('Object.prototype properties are overridden by attributes', () => {
        let model = new Model({hasOwnProperty: true});
        assert.equal(model.readAttribute('hasOwnProperty'), true);
    });

    // it('initialize with attributes and options', () => {
    //   assert.expect(1);
    //   var Model = Backbone.Model.extend({
    //     initialize: function(attributes, options) {
    //       this.one = options.one;
    //     }
    //   });
    //   var model = new Model({}, {one: 1});
    //   assert.equal(model.one, 1);
    // });

});

