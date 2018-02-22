import * as Backbone from 'backbone';
import * as _ from 'underscore';
import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../../viking';
import { toParam, toQuery } from '../../../viking/support/object';

module('Object', {}, () => {

    test('#toParam()', function() {
        assert.equal('1=2013&2=myString&3=true&4&5=false', toParam({1: 2013, 2: 'myString', 3: true, 4: null, 5: false}));
    });
    
    test('#toParam(namespace)', function() {
        assert.equal('namespace%5B1%5D=2013&namespace%5B2%5D=myString&namespace%5B3%5D=true&namespace%5B4%5D&namespace%5B5%5D=false',
              toParam({1: 2013, 2: 'myString', 3: true, 4: null, 5: false}, 'namespace'));
    });
	
	test('#toQuery is an alias for #toParam', function() {
        assert.strictEqual(toParam, toQuery);
	});
    
});