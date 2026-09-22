import assert from 'assert';
import VikingModel from 'viking/model';

describe('Viking.Model#toJSON', () => {
    class Model extends VikingModel {
        static schema = {
            date:    {type: 'date'},
            integer: {type: 'integer'},
            string:  {type: 'string'}
        };
    }

    it('returns a copy of the attributes', () => {
        const record = new Model({date: '2013-04-10', integer: '5', string: 'foo'});

        assert.deepEqual(record.toJSON(), {
            date: new Date(2013, 3, 10),
            integer: 5,
            string: 'foo'
        });

        record.toJSON().integer = 10;
        assert.equal(record.readAttribute('integer'), 5);
    });

    it('JSON.stringify serializes the attributes rather than internal state', () => {
        const record = new Model({integer: 5, string: 'foo'});
        const json = JSON.parse(JSON.stringify(record));

        assert.deepEqual(json, {
            date: null,
            integer: 5,
            string: 'foo'
        });
    });
});
