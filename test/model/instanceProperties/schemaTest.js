import assert from 'assert';
import Model from 'viking/model';

describe('Viking.Model#schema', () => {

    it('defaults to the class schema', () => {
        class Post extends Model {
            static schema = { title: { type: 'string' } };
        }

        assert.strictEqual(new Post().schema, Post.schema);
        assert.strictEqual(new Model().schema, undefined);
    });

    it('is used for accessors, defaults and coercion', () => {
        class Post extends Model {
            static schema = { title: { type: 'string' } };
            get schema() {
                return {
                    views: { type: 'integer', default: 1 },
                    published_at: { type: 'datetime' }
                };
            }
        }

        let post = new Post({ published_at: '2020-01-15T00:00:00.000Z' });

        assert.ok(Object.hasOwn(post, 'views'));
        assert.ok(!Object.hasOwn(post, 'title'));
        assert.strictEqual(post.views, 1);
        assert.ok(post.published_at instanceof Date);

        post.views = '12';
        assert.strictEqual(post.views, 12);
    });

    it('can vary per record', () => {
        class Setting extends Model {
            get schema() {
                return { value: { type: this.kind } };
            }
            get kind() { return Setting.nextKind; }
        }

        Setting.nextKind = 'integer';
        assert.strictEqual(new Setting({ value: '9' }).value, 9);

        Setting.nextKind = 'string';
        assert.strictEqual(new Setting({ value: 9 }).value, '9');
    });

    it('is used for the inheritance attribute', () => {
        class Vehicle extends Model {
            get schema() { return { type: { type: 'string' } }; }
        }
        class Car extends Vehicle { }

        assert.strictEqual(new Car().type, 'Car');
    });

});
