import * as assert from 'assert';
import 'mocha';
import {toParam, toQuery} from '../../src/viking/support/boolean';

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