import 'mocha';
import * as assert from 'assert';
import Record from 'viking/record';

describe('Viking.Record', () => {
    class Actor extends Record {
        static schema = {
            id: {type: "integer"},
            name: {type: 'string'},
            age: {type: "integer"}
        }
    }

    it('#changes()', () => {
        let model = new Actor({name: 'Rod Kimbal', age: 30});
        assert.deepEqual(model.changes(), { name: [null, 'Rod Kimbal'], age: [null, 30] });

        model.persit();
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
    });
    
    it('#changedAttributes()', () => {
        let model = new Actor({name: 'Time', age: 30});
        model.persit();

        assert.equal(model.hasChanged(), false);

        model.setAttributes({name: 'Tom'});
        assert.equal(model.hasChanged(), true);

        model.setAttributes({name: 'Time'});
        assert.equal(model.hasChanged(), false);
        
        let actor = new Actor()
        actor.name = "Rod Kimbal";
        assert.deepEqual(actor.changedAttributes(), ['name']);
    });
    
    it('#hasChanged()', () => {
        let model = new Actor({name: 'Time', age: 30});
        model.persit();

        assert.equal(model.hasChanged(), false);

        model.setAttributes({name: 'Tom'});
        assert.equal(model.hasChanged(), true);

        model.setAttributes({name: 'Time'});
        assert.equal(model.hasChanged(), false);
    });
    
    it('#hasChanged(attributeName)', () => {
        let model = new Actor({name: 'Time', age: 30});
        model.persit();
        model.setAttributes({age: 28});

        assert.equal(model.hasChanged('name'), false);

        model.setAttributes({name: 'Tom'});
        assert.equal(model.hasChanged('name'), true);

        model.setAttributes({name: 'Time'});
        assert.equal(model.hasChanged('name'), false);
    });
    
})