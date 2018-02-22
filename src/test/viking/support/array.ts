import * as Backbone from 'backbone';
import * as _ from 'underscore';
import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../../viking';
import { toParam, toQuery } from '../../../viking/support/array';

module('Array', {}, () => {

	test('#toParam()', function() {
        assert.equal('2013/myString/true', toParam([2013, 'myString', true]));
	});

    	
	test('#toQuery(key)', function() {
        assert.equal('key%5B%5D=2013&key%5B%5D=myString&key%5B%5D=true&key%5B%5D=', toQuery([2013, 'myString', true, null], 'key'));
	});

});