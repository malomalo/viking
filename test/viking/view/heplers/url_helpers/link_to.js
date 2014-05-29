(function () {
    module("Viking.View.Helpers#linkTo");

    test("linkTo(url)", function() {
        equal(
            Viking.View.Helpers.linkTo('http://example.com'),
            '<a href="http://example.com">http://example.com</a>'
        );
    });
    
    test("linkTo(url, content)", function() {
        equal(
            Viking.View.Helpers.linkTo('http://example.com', 'Example'),
            '<a href="http://example.com">Example</a>'
        );
    });
    
    test("linkTo(url, contentFunc)", function() {
        equal(
            Viking.View.Helpers.linkTo('http://example.com', function () { return 'Example'; }),
            '<a href="http://example.com">Example</a>'
        );
    });
    
    test("linkTo(url, content, options)", function() {
        equal(
            Viking.View.Helpers.linkTo('http://example.com', 'Example', {class: 'myclass'}),
            '<a class="myclass" href="http://example.com">Example</a>'
        );
    });
    
    test("linkTo(url, contentFunc, options)", function() {
        equal(
            Viking.View.Helpers.linkTo('http://example.com', function () { return 'Example'; }, {class: 'myclass'}),
            '<a class="myclass" href="http://example.com">Example</a>'
        );
    });
    
    test("linkTo(url, options)", function() {
        equal(
            Viking.View.Helpers.linkTo('http://example.com', {class: 'myclass'}),
            '<a class="myclass" href="http://example.com">http://example.com</a>'
        );
    });
    
    test("linkTo(url, options, content)", function() {
        equal(
            Viking.View.Helpers.linkTo('http://example.com', {class: 'myclass'}, 'Example'),
            '<a class="myclass" href="http://example.com">Example</a>'
        );
    });
    
    test("linkTo(url, options, contentFunc)", function() {
        equal(
            Viking.View.Helpers.linkTo('http://example.com', {class: 'myclass'}, function () { return 'Example'; }),
            '<a class="myclass" href="http://example.com">Example</a>'
        );
    });
    
    test("linkTo(Class)", function() {
        Workshop = Viking.Model.extend('workshop');
        workshopsUrl = function() { return '/workshops'; }
        
        equal(
            Viking.View.Helpers.linkTo(Workshop),
            '<a href="'+window.location.origin + '/workshops'+'">Workshops</a>'
        );
        
        delete Workshop;
        delete workshopsUrl;
    });

    test("linkTo(model)", function() {
        Workshop = Viking.Model.extend('workshop');
        workshopUrl = function(m) { return '/workshops/' + m.toParam(); }
        
        equal(
            Viking.View.Helpers.linkTo(new Workshop({id: 10})),
            '<a href="'+window.location.origin + '/workshops/10'+'">Workshop #10</a>'
        );
        
        delete Workshop;
        delete workshopUrl;
    });
    
}());