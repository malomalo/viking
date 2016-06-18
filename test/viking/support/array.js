import Viking from '../../../src/viking';

(function () {
    module("Array");

	test('#toParam()', function() {
		equal('2013/myString/true', ([2013, 'myString', true]).toParam());
	});
    
    test("#toParam() doesn't show up in iterators", function () {
        var objs = [];
        var array = [];
        
        _.each(array, function(value, key){
            objs.push(key);
        });
        
        ok(!_.include(objs, 'toParam'));
    });
    	
	test('#toQuery(key)', function() {
		equal('key%5B%5D=2013&key%5B%5D=myString&key%5B%5D=true&key%5B%5D=', ([2013, 'myString', true, null]).toQuery('key'));
	});
    
    test("#toQuery() doesn't show up in iterators", function () {
        var objs = [];
        var array = [];
        
        _.each(array, function(value, key){
            objs.push(key);
        });
        
        ok(!_.include(objs, 'toQuery'));
    });

}());