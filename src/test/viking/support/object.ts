import * as Backbone from 'backbone';
import * as _ from 'underscore';
import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../../viking';

module('Object', {}, () => {

    test('#toParam()', function() {
        assert.ok(false);
        // TODO setup support methods
        // assert.equal('1=2013&2=myString&3=true&4&5=false', ({1: 2013, 2: 'myString', 3: true, 4: null, 5: false}).toParam());
    });
    
    test('#toParam(namespace)', function() {
        assert.ok(false);
        // TODO setup support methods
        // assert.equal('namespace%5B1%5D=2013&namespace%5B2%5D=myString&namespace%5B3%5D=true&namespace%5B4%5D&namespace%5B5%5D=false',
        //       ({1: 2013, 2: 'myString', 3: true, 4: null, 5: false}).toParam('namespace'));
    });
    
    test("#toParam() doesn't show up in iterators", function () {
        var objs = new Array;
        var obj = {};
        
        _.each(obj, function(value, key){
            objs.push(key);
        });
        
        assert.ok(!_.include(objs, 'toParam'));
    });
	
	test('#toQuery is an alias for #toParam', function() {
        assert.ok(false);
        // TODO setup support methods
        // assert.strictEqual(Object.prototype.toParam, Object.prototype.toQuery);
	});
    
    test("#toQuery() doesn't show up in iterators", function () {
        var objs = new Array;
        var obj = {};
        
        _.each(obj, function(value, key){
            objs.push(key);
        });
        
        assert.ok(!_.include(objs, 'toQuery'));
    });
    
});