(function () {
    module("Boolean");

	test('#toParam()', function() {
		equal('true', (true).toParam());
		equal('false', (false).toParam());
	});

	test('#toQuery(key)', function() {
		equal('key=true', (true).toQuery('key'));
		equal('key=false', (false).toQuery('key'));
	});
}());