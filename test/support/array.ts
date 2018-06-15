import * as assert from 'assert';
import 'mocha';
import {toParam, toQuery} from '../../src/viking/support/array';

describe('VikingSupport.Array', () => {

    it('#toParam()', () => {
        assert.equal('2013/myString/true', toParam([2013, 'myString', true]));
    });

    it('#toQuery(key)', () => {
        assert.equal('key%5B%5D=2013&key%5B%5D=myString&key%5B%5D=true&key%5B%5D=', toQuery([2013, 'myString', true, null], 'key'));
    });

});