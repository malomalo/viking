(function () {
    module("Array");

	test('#toParam()', function() {
		equal('2013/myString/true', ([2013, 'myString', true]).toParam());
	});
	
	test('#toQuery(key)', function() {
		equal('key%5B%5D=2013&key%5B%5D=myString&key%5B%5D=true&key%5B%5D=', ([2013, 'myString', true, null]).toQuery('key'));
	});

}());