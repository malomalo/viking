import 'mocha';
import * as assert from 'assert';
import {toParam, toQuery} from 'viking/support/object';

describe('VikingSupport.Object', () => {

    it('#toParam()', () => {
        assert.equal('1=2013&2=myString&3=true&4&5=false', toParam({1: 2013, 2: 'myString', 3: true, 4: null, 5: false}));
    });

    it('#toParam(namespace)', () => {
        assert.equal('namespace%5B1%5D=2013&namespace%5B2%5D=myString&namespace%5B3%5D=true&namespace%5B4%5D&namespace%5B5%5D=false',
              toParam({1: 2013, 2: 'myString', 3: true, 4: null, 5: false}, 'namespace'));
    });

    it('#toQuery is an alias for #toParam', () => {
        assert.strictEqual(toParam, toQuery);
    });

});
