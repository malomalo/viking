import assert from 'assert';
import VikingRecord from 'viking/record';
import { hasMany, belongsTo } from 'viking/record/associations';

describe('Viking.Record::associations', () => {
    describe('#setAttributes eventParameters', () => {
        class Parent extends VikingRecord { }
        class Child extends VikingRecord { }
        class Model extends VikingRecord {
            static associations = [belongsTo(Parent), hasMany(Child)];
        }

        it('forwards eventParameters to a loaded singular association target', () => {
            let parent = Parent.instantiate({id: 1, name: 'Alpha'});
            let model = Model.instantiate({id: 24, parent_id: 1});
            model.parent = parent;

            let eventParameters;
            parent.addEventListener('changed', (record, changes, d) => { eventParameters = d; });
            model.setAttributes({parent: {name: 'Bravo'}}, {silentNotification: true});

            assert.equal(parent.readAttribute('name'), 'Bravo');
            assert.deepEqual(eventParameters, {silentNotification: true});
        });

        it('forwards eventParameters to existing records in a collection association', () => {
            let child = Child.instantiate({id: 1, name: 'Alpha'});
            let model = Model.instantiate({id: 24, children: [child]});

            let eventParameters;
            child.addEventListener('changed:name', (record, oldValue, newValue, d) => { eventParameters = d; });
            model.setAttributes({children: [{id: 1, name: 'Bravo'}]}, {silentNotification: true});

            assert.equal(child.readAttribute('name'), 'Bravo');
            assert.deepEqual(eventParameters, {silentNotification: true});
        });

        it('does not forward coerced to nested associations', () => {
            let child = Child.instantiate({id: 1, name: 'Alpha'});
            let model = Model.instantiate({id: 24, children: [child]});

            let eventParameters;
            child.addEventListener('changed', (record, changes, d) => { eventParameters = d; });
            model.setAttributes({children: [{id: 1, name: 'Bravo'}]}, {coerced: true, source: 'form'});

            assert.deepEqual(eventParameters, {source: 'form'});
        });
    });
});
