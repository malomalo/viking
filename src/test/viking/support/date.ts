import * as Backbone from 'backbone';
import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../../viking';

module('Date', {}, () => {

    test("strftime", function() {
        var d = new Date(1363904818448);
    
        // TODO: turns out timezone in javascript are nonexist, well existent
        // but untouchable and any date you create is in the loacle timezone,
        // so this test fails when adding %Z on a server set to a timezone
        // other than PDT, also %I
        // assert.equal(d.strftime('%A %I %-m %Y %Z'), 'Thursday 03 3 2013 PDT');
        
        assert.ok(false);
        // TODO setup support methods
        // assert.equal(d.strftime('%A %-m %Y'), 'Thursday 3 2013');
    });
	
	test('#toParam()', function() {
        assert.ok(false);
        // TODO setup support methods
        // assert.equal('2013-03-21T22:26:58.448Z', (new Date(1363904818448)).toParam());
	});

	test('#toQuery(key)', function() {
        assert.ok(false);
        // TODO setup support methods
        // assert.equal('key=2013-03-21T22%3A26%3A58.448Z', (new Date(1363904818448)).toQuery('key'));
	});
	
});