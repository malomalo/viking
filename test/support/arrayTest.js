import assert from 'assert';
import {toParam, toQuery, toArray} from 'viking/support/array';

describe('VikingSupport.Array', () => {

    it('#toArray()', () => {
        const array = [1, 2];
        assert.strictEqual(toArray(array), array);
        assert.deepStrictEqual(toArray(5), [5]);
        assert.deepStrictEqual(toArray('abc'), ['abc']);
        assert.deepStrictEqual(toArray(null), [null]);
    });

    it('#toParam()', () => {
        assert.equal('2013/myString/true', toParam([2013, 'myString', true]));
    });

    it('#toQuery(key)', () => {
        assert.equal('key%5B%5D=2013&key%5B%5D=myString&key%5B%5D=true&key%5B%5D=', toQuery([2013, 'myString', true, null], 'key'));
    });

});