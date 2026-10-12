import assert from 'assert';
import Model from 'viking/model';

describe('Viking.Model#defineProperty', () => {

    const FIELDS = {
        1: { released_on: { type: 'date' } },
        2: { released_on: { type: 'string' } }
    };

    class Product extends Model {
        static schema = { category_id: { type: 'integer' } };

        get schema() {
            return this._schema ?? super.schema;
        }

        declareProperties(attributes, options) {
            super.declareProperties(attributes, options);
            const fields = FIELDS[attributes.category_id] ?? {};
            this._schema = { ...super.schema, ...fields };
            Object.keys(fields).forEach(key => this.defineProperty(key));
        }
    }

    it('defines an accessor that reads and writes the attribute', () => {
        const product = new Product({ category_id: 1, released_on: '2020-01-15' });

        assert.ok(Object.getOwnPropertyDescriptor(product, 'released_on').get);
        assert.equal(product.released_on.getFullYear(), 2020);

        product.released_on = '2021-03-04';
        assert.equal(product.readAttribute('released_on').getFullYear(), 2021);
        assert.ok('released_on' in product.changes());
    });

    it('can type the same key differently per record', () => {
        const product = new Product({ category_id: 2, released_on: '2020-01-15' });

        assert.strictEqual(product.released_on, '2020-01-15');
    });

    it('is used for the schema keys', () => {
        const defined = [];
        class Ship extends Model {
            static schema = { name: { type: 'string' } };

            defineProperty(key) {
                defined.push(key);
                super.defineProperty(key);
            }
        }
        new Ship({ name: 'Ahoy' });

        assert.deepEqual(defined, ['name']);
    });

});
