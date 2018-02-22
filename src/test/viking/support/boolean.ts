import * as Backbone from 'backbone';
import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../../viking';
import { toParam, toQuery } from '../../../viking/support/boolean';


module('Boolean', {}, () => {

	test('#toParam()', function() {
        assert.equal('true', toParam(true));
        assert.equal('false', toParam(false));
	});

	test('#toQuery(key)', function() {
        assert.equal('key=true', toQuery(true, 'key'));
        assert.equal('key=false', toQuery(false, 'key'));
	});
});