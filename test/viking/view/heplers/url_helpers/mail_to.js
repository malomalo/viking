(function () {
    module("Viking.View.Helpers#mailTo");

    test("mailTo(email)", function() {
        equal(
            Viking.View.Helpers.mailTo('me@domain.com'),
            '<a href="mailto:me@domain.com">me@domain.com</a>'
        );
    });
    
    test("mailTo(email, name)", function() {
        equal(
            Viking.View.Helpers.mailTo('me@domain.com', 'My email'),
            '<a href="mailto:me@domain.com">My email</a>'
        );
    });
    
    test("mailTo(email, options)", function() {
        equal(
            Viking.View.Helpers.mailTo('me@domain.com', {key: 'value'}),
            '<a href="mailto:me@domain.com" key="value">me@domain.com</a>'
        );
    });
    
    test("mailTo(email, name, options)", function() {
        equal(
            Viking.View.Helpers.mailTo('me@domain.com', 'My email', {
                cc: 'ccaddress@domain.com',
                subject: 'This is an example email'
            }),
            '<a href="mailto:me@domain.com?cc=ccaddress@domain.com&subject=This%20is%20an%20example%20email">My email</a>'
        );
    });
    
    test("mailTo(email, contentFunc)", function() {
        equal(
            Viking.View.Helpers.mailTo('me@domain.com', function () {
                return "<strong>Email me:</strong> <span>me@domain.com</span>";
            }),
            '<a href="mailto:me@domain.com"><strong>Email me:</strong> <span>me@domain.com</span></a>'
        );
    });
    
    test("mailTo(email, options, contentFunc)", function() {
        equal(
            Viking.View.Helpers.mailTo('me@domain.com', {key: 'value'}, function () {
                return "Email me";
            }),
            '<a href="mailto:me@domain.com" key="value">Email me</a>'
        );
    });
    
    test("mailTo(email, contentFunc, options)", function() {
        equal(
            Viking.View.Helpers.mailTo('me@domain.com', function () {
                return "Email me";
            }, {key: 'value'}),
            '<a href="mailto:me@domain.com" key="value">Email me</a>'
        );
    });
    
}());