(function () {
    module("Number");

    test("1.ordinalize()", function() {
        equal('1st', (1).ordinalize());
    });


    test("2.ordinalize()", function() {
        equal('2nd', (2).ordinalize());
    });

    test("3.ordinalize()", function() {
        equal('3rd', (3).ordinalize());
    });


    test("4.ordinalize()", function() {
        equal('4th', (4).ordinalize());
    });

    test("100.ordinalize()", function() {
        equal('100th', (100).ordinalize());
    });

    test("1013.ordinalize()", function() {
        equal('1013th', (1013).ordinalize());
    });
	
	test('#toParam()', function() {
		equal('1013', (1013).toParam());
	});
	
	test('#toQuery(key)', function() {
		equal('key=42', (42).toQuery('key'));
	});

}());