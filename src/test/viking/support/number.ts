import * as Backbone from 'backbone';
import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../../viking';
import { toQuery, toParam, ordinalize } from '../../../viking/support/number';


module('Number', {}, () => {

    test("1.ordinalize()", function() {
        assert.equal('1st', ordinalize(1));
    });


    test("2.ordinalize()", function() {
        assert.equal('2nd', ordinalize(2));
    });

    test("3.ordinalize()", function() {
        assert.equal('3rd', ordinalize(3));
    });


    test("4.ordinalize()", function() {
        assert.equal('4th', ordinalize(4));
    });

    test("100.ordinalize()", function() {
        assert.equal('100th', ordinalize(100));
    });

    test("1013.ordinalize()", function() {
        assert.equal('1013th', ordinalize(1013));
    });
	
	test('#toParam()', function() {
        assert.equal('1013', toParam(1013));
	});
	
	test('#toQuery(key)', function() {
        assert.equal('key=42', toQuery(42, 'key'));
	});

});