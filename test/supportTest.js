import 'mocha';
import * as assert from 'assert';
import {result} from 'viking/support';

describe('VikingSupport', () => {

    it('#result(obeject, key)', () => {
        const foo = {
            bar: 1,
            charlie: () => 2
        }
        assert.equal(1, result(foo, 'bar'));
        assert.equal(2, result(foo, 'charlie'));
    });
    
    it('#result(value)', () => {
        assert.equal(1, result(1));
        assert.equal(2, result(() => 2));
    });

});