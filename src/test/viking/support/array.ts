import * as Backbone from 'backbone';
import * as _ from 'underscore';
import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../../viking';

module('Array', {}, () => {

	test('#toParam()', function() {
        assert.ok(false);
        // TODO setup support methods
        // assert.equal('2013/myString/true', ([2013, 'myString', true]).toParam());
	});
    
    test("#toParam() doesn't show up in iterators", function () {
        var objs = new Array;
        var array = new Array;
        
        _.each(array, function(value, key){
            objs.push(key);
        });
        
        assert.ok(!_.include(objs, 'toParam'));
    });
    	
	test('#toQuery(key)', function() {
        assert.ok(false);
        // TODO setup support methods
        // assert.equal('key%5B%5D=2013&key%5B%5D=myString&key%5B%5D=true&key%5B%5D=', ([2013, 'myString', true, null]).toQuery('key'));
	});
    
    test("#toQuery() doesn't show up in iterators", function () {
        var objs = new Array;
        var array = new Array;
        
        _.each(array, function(value, key){
            objs.push(key);
        });
        
        assert.ok(!_.include(objs, 'toQuery'));
    });

});