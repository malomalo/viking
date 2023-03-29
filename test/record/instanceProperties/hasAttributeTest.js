import * as assert from 'assert';
import VikingRecord from '@malomalo/viking/record';

describe('Viking.Record#hasAttribute', () => {

    it('hasAttribute', () => {
        let model = new VikingRecord();

        assert.strictEqual(model.hasAttribute('name'), false);

        model.setAttributes({
            '0': 0,
            '1': 1,
            'true': true,
            'false': false,
            'empty': '',
            'name': 'name',
            'null': null,
            'undefined': undefined
        });

        assert.strictEqual(model.hasAttribute('0'), true);
        assert.strictEqual(model.hasAttribute('1'), true);
        assert.strictEqual(model.hasAttribute('true'), true);
        assert.strictEqual(model.hasAttribute('false'), true);
        assert.strictEqual(model.hasAttribute('empty'), true);
        assert.strictEqual(model.hasAttribute('name'), true);
        assert.strictEqual(model.hasAttribute('null'), true);
        assert.strictEqual(model.hasAttribute('undefined'), true);

        assert.strictEqual(model.hasAttribute('unkown'), false);
    });

});

