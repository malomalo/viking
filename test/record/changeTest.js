import * as assert from 'assert';
import Record from '@malomalo/viking/record';

describe('Viking.Record', () => {
    class Actor extends Record {
        static schema = {
            id: {type: "integer"},
            name: {type: 'string'},
            age: {type: "integer"},
            union: {type: "boolean"},
            preferences: {type: "json", default: {}}
        }
    }

    it('#changes()', () => {
        let model = new Actor({name: 'Rod Kimbal', age: 30});
        assert.deepEqual(model.changes(), { name: [null, 'Rod Kimbal'], age: [null, 30], preferences: [null, {}] });

        model.persist();
        assert.deepEqual(model.changes(), {});

        model.setAttribute('name', 'Andy Sanberg');
        assert.deepEqual(model.changes(), { name: ['Rod Kimbal', 'Andy Sanberg'] });

        model.setAttributes({name: 'Rod Kimbal', age: 36});
        assert.deepEqual(model.changes(), { age: [30, 36] });

        model.name = 'Andy Sanberg';
        assert.deepEqual(model.changes(), {
            name: ['Rod Kimbal', 'Andy Sanberg'],
            age: [30, 36]
        });
        
        model.preferences = {
            green_room: true
        }
        assert.deepEqual(model.changes(), {
            name: ['Rod Kimbal', 'Andy Sanberg'],
            age: [30, 36],
            preferences: [
                {},
                {green_room: true}
            ]
        });
        
        model.persist();
        model.preferences = {green_room: true, red_room: false};
        assert.deepEqual(model.changes(), {
            preferences: [
                {green_room: true},
                {green_room: true, red_room: false}
            ]
        });
        
        model.persist();
        model.preferences = {green_room: true, red_room: true};
        assert.deepEqual(model.changes(), {
            preferences: [
                {green_room: true, red_room: false},
                {green_room: true, red_room: true}
            ]
        });
        
        model.preferences = [{foo: 'bar'}]
        model.persist()
        model.preferences = [{
            foo: 'echo'
        }]
        
        assert.deepEqual(model.changes(), {
            preferences: [
                [{foo: 'bar'}],
                [{foo: 'echo'}],
            ]
        });
    });
    
    it('#changedAttributes()', () => {
        let model = new Actor({name: 'Time', age: 30});
        model.persist();

        assert.equal(model.hasChanged(), false);

        model.setAttributes({name: 'Tom'});
        assert.equal(model.hasChanged(), true);

        model.setAttributes({name: 'Time'});
        assert.equal(model.hasChanged(), false);
        
        let actor = new Actor()
        actor.name = "Rod Kimbal";
        assert.deepEqual(actor.changedAttributes(), ['preferences', 'name']);
    });
    
    it('#hasChanged()', () => {
        let model = new Actor({name: 'Time', age: 30});
        model.persist();

        assert.equal(model.hasChanged(), false);

        model.setAttributes({name: 'Tom'});
        assert.equal(model.hasChanged(), true);

        model.setAttributes({name: 'Time'});
        assert.equal(model.hasChanged(), false);
        
        let actor = Actor.instantiate({id: 11, name: 'Jeff Johnson', union: false})
        assert.equal(model.hasChanged(), false);
    });
    
    it('#hasChanged(attributeName)', () => {
        let model = new Actor({name: 'Time', age: 30});
        model.persist();
        model.setAttributes({age: 28});

        assert.equal(model.hasChanged('name'), false);

        model.setAttributes({name: 'Tom'});
        assert.equal(model.hasChanged('name'), true);

        model.setAttributes({name: 'Time'});
        assert.equal(model.hasChanged('name'), false);
    });
    
})