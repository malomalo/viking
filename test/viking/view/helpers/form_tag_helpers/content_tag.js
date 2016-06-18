import Viking from '../../../../../src/viking';

(function () {
    module("Viking.View.Helpers#content_tag");

    // // contentTag(name, content, [options], [escape])
    // // ========================================
    test("contentTag(name, content)", function() {
        equal(Viking.View.Helpers.contentTag('p', 'Hello world & all!'), "<p>Hello world &amp; all!</p>")
    });
    
    test("contentTag(name, content, escape)", function() {
        equal(Viking.View.Helpers.contentTag("p", "Hello world & all!", false), "<p>Hello world & all!</p>");
    });
    
    test("contentTag(name, content, options)", function() {
        equal(Viking.View.Helpers.contentTag('p', 'Hello world & all!', {'class': "strong"}), '<p class="strong">Hello world &amp; all!</p>');
    });
    
    test("contentTag(name, content, options, escape)", function() {
        equal(Viking.View.Helpers.contentTag('p', 'Hello world & all!', {'class': "strong"}, false), '<p class="strong">Hello world & all!</p>');
    });
    
    test("contentTag(name, block)", function() {
        equal(Viking.View.Helpers.contentTag('p', function() { return "Hello world&!"; }), '<p>Hello world&amp;!</p>');
    });
    
    test("contentTag(name, options, block)", function() {
        equal(Viking.View.Helpers.contentTag('p', {'class': "strong"}, function() { return "Hello world&!"; }), '<p class="strong">Hello world&amp;!</p>');
    });
    
    test("contentTag(name, escape, block)", function() {
        equal(Viking.View.Helpers.contentTag('p', false, function() { return "Hello world&!"; }), '<p>Hello world&!</p>');
    });
    
    test("contentTag(name, options, escape, block)", function() {
        equal(Viking.View.Helpers.contentTag('p', {'class': "strong"}, false, function() { return "Hello world&!"; }), '<p class="strong">Hello world&!</p>');
    });

}());