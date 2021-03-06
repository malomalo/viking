import 'mocha';
import * as assert from 'assert';
import Model from 'viking/record';

describe('Viking.Record', () => {
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
        
        it('is a function', function () {
            class Pow extends Model {
                static base = 3;
                static schema = {
                    square: {
                        type: 'integer',
                        default: () => this.base * this.base
                    }
                }
            }
            
            const three = new Pow();
            assert.equal(9, three.square);
        });

        it('include defaults in save', function () {
            class Defaulted extends Model {
                static schema = { one: {default: 1} };
            }
            
            const record = new Defaulted()
            record.save()
            
            assert.ok(this.findRequest('POST', '/defaulteds', {
                body: {
                    defaulted: {
                        one: 1
                    }
                }
            }));
        });

    });
});
