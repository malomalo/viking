import * as Backbone from 'backbone';
import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../../viking';

module('Boolean', {}, () => {

	test('#toParam()', function() {
        assert.ok(false);
        // TODO setup support methods
        // assert.equal('true', (true).toParam());
        // assert.equal('false', (false).toParam());
	});

	test('#toQuery(key)', function() {
        assert.ok(false);
        // TODO setup support methods
        // assert.equal('key=true', (true).toQuery('key'));
        // assert.equal('key=false', (false).toQuery('key'));
	});
});