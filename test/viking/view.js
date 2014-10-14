(function () {
    module("Viking.View", {
        setup : function() {
            Viking.View.templates = JST;
        }
    });
    
    test("inherits events", function() {
        var View = Viking.View.extend({
            events: {
                'click':    'click'
            }
        });
        var SubView = View.extend({
            events: {
                'hover':    'hover'
            }
        });
    
        deepEqual(SubView.prototype.events, {
            'hover':    'hover',
            'click':    'click'
        });
    });
    
    test("overrides inherited events", function() {
        var View = Viking.View.extend({
            events: {
                'click':    'click',
                'hover':    'hover'
            }
        });
        var SubView = View.extend({
            events: {
                'hover':    "newHover", 
            }
        });
    
        deepEqual(SubView.prototype.events, {
            'click':    'click',
            'hover':    'newHover'
        });
    });
    
    test('calls the original extend', function () {
        expect(1);
        
        var originalFunction = Backbone.View.extend;
        
        Backbone.View.extend = function () {
            ok(true);
        }
        
        Viking.View.extend();
        Backbone.View.extend = originalFunction;
    });

    test('renderTemplate with template set on view', function () {
        var View = Viking.View.extend({
            'template' : 'a/template/path'
        });

        equal(
            new View().renderTemplate(),
            '<h1>Some Title</h1>'
        );
    });
    test('renderTemplate without template set on view', function () {
        var template = undefined;
        var View = Viking.View.extend({
            'template' : template
        });

        throws(
            function() {
                new View().renderTemplate();
            },
            new Error('Template does not exist: ' + template)
        );
    });
    
}());
