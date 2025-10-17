import 'mocha';
import assert from 'assert';
import {ordinalize, toParam, toQuery} from 'viking/support/number';

describe('VikingSupport.Number', () => {

    it("1.ordinalize()", function() {
        assert.equal('1st', ordinalize(1));
    });

    it("2.ordinalize()", function() {
        assert.equal('2nd', ordinalize(2));
    });

    it("3.ordinalize()", function() {
        assert.equal('3rd', ordinalize(3));
    });

    it("4.ordinalize()", function() {
        assert.equal('4th', ordinalize(4));
    });

    it("100.ordinalize()", function() {
        assert.equal('100th', ordinalize(100));
    });

    it("1013.ordinalize()", function() {
        assert.equal('1013th', ordinalize(1013));
    });

    it('#toParam()', function() {
        assert.equal('1013', toParam(1013));
    });

    it('#toQuery(key)', function() {
        assert.equal('key=42', toQuery(42, 'key'));
    });

});