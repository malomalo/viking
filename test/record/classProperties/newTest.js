import 'mocha';
import assert from 'assert';
import Model from 'viking/record';

describe('Viking.Record::new', () => {

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

