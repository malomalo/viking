import 'mocha';
import * as assert from 'assert';
import Model from 'viking/model';

describe('Viking.Model', () => {
    describe('defaults', () => {

        it('come from schema', () => {
            class DefaultedModel extends Model {
                static schema = {
                    one: { default: 1 },
                    two: { default: 2 }
                };
            }

            let model = new DefaultedModel({two: undefined});
            assert.equal(model.readAttribute('one'), 1);
            assert.equal(model.readAttribute('two'), undefined);

            model = new DefaultedModel({two: 3});
            assert.equal(model.readAttribute('one'), 1);
            assert.equal(model.readAttribute('two'), 3);

            class DefaultedModel2 extends Model {
                static schema = {
                    hasOwnProperty: { default: true }
                };
            }

            model = new DefaultedModel2();
            assert.equal(model.readAttribute('hasOwnProperty'), true);
            model = new DefaultedModel2({hasOwnProperty: undefined});
            assert.equal(model.readAttribute('hasOwnProperty'), undefined);
            model = new DefaultedModel2({hasOwnProperty: false});
            assert.equal(model.readAttribute('hasOwnProperty'), false);
        });

        it('always extend attributes (#459)', () => {
            class Defaulted extends Model {
                static schema = { one: {default: 1} };
            }

            let providedattrs = new Defaulted({});
            assert.equal(providedattrs.attributes.one, 1);

            let emptyattrs = new Defaulted();
            assert.equal(emptyattrs.attributes.one, 1);
        });

    });
});