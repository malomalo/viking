import assert from 'assert';
import Model from 'viking/model';
import Record from 'viking/record';

describe('Viking.Model', () => {

    class Actor extends Model {
        static schema = {
            id: {type: "integer"},
            name: {type: 'string'},
            age: {type: "integer"},
            union: {type: "boolean"},
            preferences: {type: "json", default: {}}
        }
    }

    describe('attribute accessors', () => {
        it('defines getters/setters from the schema and coerces values', () => {
            let model = new Actor({name: 'Rod Kimbal', age: '30'});

            assert.strictEqual(model.name, 'Rod Kimbal');
            assert.strictEqual(model.age, 30); // coerced to integer

            model.name = 'Andy Sanberg';
            assert.strictEqual(model.readAttribute('name'), 'Andy Sanberg');
        });

        it('#readAttribute / #hasAttribute', () => {
            let model = new Actor();
            // schema keys are pre-populated (to null when they have no default)
            assert.strictEqual(model.hasAttribute('name'), true);
            assert.strictEqual(model.readAttribute('name'), null);
            // attributes outside the schema are absent until set
            assert.strictEqual(model.hasAttribute('nickname'), false);

            model.setAttributes({name: 'Rod'});
            assert.strictEqual(model.readAttribute('name'), 'Rod');
        });
    });

    describe('defaults', () => {
        it('applies schema defaults for missing attributes', () => {
            let model = new Actor({name: 'Rod'});
            assert.deepEqual(model.preferences, {});
        });

        it('sets missing non-default attributes to null', () => {
            let model = new Actor({name: 'Rod'});
            assert.strictEqual(model.readAttribute('age'), null);
        });
    });

    describe('dirty tracking', () => {
        it('#changes / #changedAttributes / #hasChanged', () => {
            let model = new Actor({name: 'Rod Kimbal', age: 30});

            assert.deepEqual(model.changes(), {
                name: [null, 'Rod Kimbal'],
                age: [null, 30],
                preferences: [null, {}]
            });
            assert.deepEqual(model.changedAttributes().sort(), ['age', 'name', 'preferences']);
            assert.strictEqual(model.hasChanged(), true);
            assert.strictEqual(model.hasChanged('name'), true);
            assert.strictEqual(model.hasChanged('unknown'), false);

            model.setAttributes({name: 'Rod Kimbal'}); // unchanged value
            assert.strictEqual(model.hasChanged('name'), true); // still the original change
        });

        it('setting an attribute back to its baseline clears the change', () => {
            let model = new Actor({name: 'Rod'});
            model.flushChanges(); // clean baseline
            model.setAttribute('name', 'Andy');
            assert.deepEqual(model.changes(), {name: ['Rod', 'Andy']});
            model.setAttribute('name', 'Rod');
            assert.deepEqual(model.changes(), {});
        });

        it('#flushChanges clears tracked changes and returns this', () => {
            let model = new Actor({name: 'Rod', age: 30});
            assert.strictEqual(model.hasChanged(), true);
            assert.strictEqual(model.flushChanges(), model);
            assert.deepEqual(model.changes(), {});
            assert.strictEqual(model.hasChanged(), false);
        });

        it('#revertChanges restores attributes to their baseline and returns this', () => {
            let model = new Actor({name: 'Rod'});
            model.flushChanges(); // clean baseline

            model.setAttributes({name: 'Andy', age: 30});
            assert.strictEqual(model.revertChanges(), model);
            assert.strictEqual(model.name, 'Rod');
            assert.strictEqual(model.age, null);
            assert.deepEqual(model.changes(), {});
            assert.strictEqual(model.hasChanged(), false);
        });
    });

    describe('events', () => {
        it('fires changed and changed:{attribute}', () => {
            let model = new Actor({name: 'Rod'});
            model.flushChanges();

            let changed = [];
            let changedName = [];
            model.addEventListener('changed', (record, changes) => changed.push(changes));
            model.addEventListener('changed:name', (record, o, n) => changedName.push([o, n]));

            model.setAttribute('name', 'Andy');

            assert.deepEqual(changed, [{name: ['Rod', 'Andy']}]);
            assert.deepEqual(changedName, [['Rod', 'Andy']]);
        });
    });

    describe('#clone', () => {
        it('copies attributes and change state', () => {
            let model = new Actor({name: 'Rod', age: 30});
            let clone = model.clone();

            assert.notStrictEqual(clone, model);
            assert.strictEqual(clone.name, 'Rod');
            assert.strictEqual(clone.age, 30);
            assert.deepEqual(clone.changes(), model.changes());
        });
    });

    describe('#toJSON', () => {
        it('returns a copy of the attributes', () => {
            let model = new Actor({name: 'Rod', age: 30});
            assert.deepEqual(model.toJSON(), model.attributes);
            assert.notStrictEqual(model.toJSON(), model.attributes);
            assert.deepEqual(JSON.parse(JSON.stringify(model)), {
                id: null, name: 'Rod', age: 30, union: null, preferences: {}
            });
        });
    });

    describe('naming', () => {
        it('#modelName is set on instantiation', () => {
            let model = new Actor();
            assert.strictEqual(model.modelName.name, 'Actor');
            assert.strictEqual(model.modelName.singular, 'actor');
        });

        it('#baseClass resolves the STI base', () => {
            assert.strictEqual(Actor.baseClass(), Actor);
        });

        it('#inheritanceAttribute defaults to "type"', () => {
            let model = new Actor();
            assert.strictEqual(model.inheritanceAttribute, 'type');
        });
    });

    describe('construction hooks', () => {
        it('declareProperties runs before attributes are applied', () => {
            let attributesAtDeclare;
            class Foo extends Model {
                static schema = { name: {type: 'string'} };
                declareProperties() { attributesAtDeclare = {...this.attributes}; }
            }
            new Foo({name: 'Rod'});
            assert.deepEqual(attributesAtDeclare, {});
        });

        it('initialize runs after attributes are applied', () => {
            let nameAtInitialize;
            class Foo extends Model {
                static schema = { name: {type: 'string'} };
                initialize() { nameAtInitialize = this.name; }
            }
            new Foo({name: 'Rod'});
            assert.equal(nameAtInitialize, 'Rod');
        });

        it('initialize overrides need not call super', () => {
            class Foo extends Model {
                static schema = { name: {type: 'string'} };
                initialize() { this.ready = true; }
            }
            const foo = new Foo({name: 'Rod'});
            assert.equal(foo.ready, true);
            assert.equal(foo.name, 'Rod');
        });
    });

    describe('collections', () => {
        it('is an empty set by default', () => {
            let model = new Actor();
            assert.strictEqual(model.collections.size, 0);
        });

        it('notifies added collection-like objects of changes', () => {
            let changed = [];
            let changedName = [];
            const collection = {
                dispatchEvent(event, record, ...args) {
                    if (event === 'record:changed') changed.push(args[0]);
                    if (event === 'record:changed:name') changedName.push(args);
                }
            };

            let model = new Actor({name: 'Rod'});
            model.flushChanges();
            model.collections.add(collection);

            model.setAttribute('name', 'Andy');

            assert.deepEqual(changed, [{name: ['Rod', 'Andy']}]);
            assert.deepEqual(changedName, [['Rod', 'Andy']]);
        });
    });

    describe('is not a Record', () => {
        it('has no persistence or association API', () => {
            let model = new Actor();
            assert.strictEqual(model instanceof Record, false);
            assert.strictEqual(typeof model.save, 'undefined');
            assert.strictEqual(typeof model.association, 'undefined');
            assert.strictEqual(typeof Actor.where, 'undefined');
            assert.strictEqual(typeof Actor.find, 'undefined');
        });

        it('Record is a Model', () => {
            assert.strictEqual(Record.prototype instanceof Model, true);
        });
    });

});
