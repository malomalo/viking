import 'mocha';
import assert from 'assert';
import {toParam, toQuery} from 'viking/support/boolean';

describe('VikingSupport.Boolean', () => {

    it('#toParam()', () => {
        assert.equal('true', toParam(true));
        assert.equal('false', toParam(false));
    });

    it('#toQuery(key)', () => {
        assert.equal('key=true', toQuery(true, 'key'));
        assert.equal('key=false', toQuery(false, 'key'));
    });

});