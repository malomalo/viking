import Viking from '../../../../../src/viking';

(function () {
    module("Viking.View.Helpers#linkTo");

    test("linkTo(content, url)", function() {
        equal(
            Viking.View.Helpers.linkTo('Example', 'http://example.com'),
            '<a href="http://example.com">Example</a>'
        );
    });
    
    test("linkTo(contentFunc, url)", function() {
        equal(
            Viking.View.Helpers.linkTo(function () { return 'Example'; }, 'http://example.com'),
            '<a href="http://example.com">Example</a>'
        );
    });
    
    test("linkTo(content, url, options)", function() {
        equal(
            Viking.View.Helpers.linkTo('Example', 'http://example.com', {'class': 'myclass'}),
            '<a class="myclass" href="http://example.com">Example</a>'
        );
    });
    
    test("linkTo(contentFunc, url, options)", function() {
        equal(
            Viking.View.Helpers.linkTo(function () { return 'Example'; }, 'http://example.com', {'class': 'myclass'}),
            '<a class="myclass" href="http://example.com">Example</a>'
        );
    });
    
    test("linkTo(url, options, contentFunc)", function() {
        equal(
            Viking.View.Helpers.linkTo('http://example.com', {'class': 'myclass'}, function () { return 'Example'; }),
            '<a class="myclass" href="http://example.com">Example</a>'
        );
    });
    
    test("linkTo(content, model)", function() {
        let Workshop = Viking.Model.extend('workshop');
        let workshopPath = function(m) { return '/workshops/' + m.toParam(); }
        
        equal(
            Viking.View.Helpers.linkTo('Model', new Workshop({id: 10})),
            '<a href="'+ window.location.protocol + '//' + window.location.host + '/workshops/10'+'">Model</a>'
        );
    });
    
    test("linkTo(model, contentFunc)", function() {
        let Workshop = Viking.Model.extend('workshop');
        let workshopPath = function(m) { return '/workshops/' + m.toParam(); }
        
        equal(
            Viking.View.Helpers.linkTo(new Workshop({id: 10}), function () { return 'Example'; }),
            '<a href="' + window.location.protocol + '//' + window.location.host + '/workshops/10'+'">Example</a>'
        );
    });
    
    test("linkTo(model, options, contentFunc)", function() {
        let Workshop = Viking.Model.extend('workshop');
        let workshopPath = function(m) { return '/workshops/' + m.toParam(); }
        
        equal(
            Viking.View.Helpers.linkTo(new Workshop({id: 10}), {'class': 'myclass'}, function () { return 'Example'; }),
            '<a class="myclass" href="'+ window.location.protocol + '//' + window.location.host + '/workshops/10'+'">Example</a>'
        );
    });
    
}());