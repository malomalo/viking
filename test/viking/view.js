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
    
    test("#remove() triggers a 'remove' event on the view", function() {
        expect(1);
    
        var view = new Viking.View();
        view.on('remove', function() { ok(true); });
        view.remove();
        view.off('remmove');
    });
    
    test('#bindEl() with a model', function() {
        expect(2);
        
        var model = new Viking.Model();
        var view = new Viking.View({model: model});
        
        view.$ = function (selector) {
            equal(selector, '.name')
            return {
                html: function (html) { equal(html, 'Dr. DJ'); }
            };
        }
        
        view.bindEl('name', '.name')
        model.set('name', 'Dr. DJ');
    });
    
    test('#bindEl() with a model with custom render', function() {
        expect(2);
        
        var model = new Viking.Model();
        var view = new Viking.View({model: model});
        
        view.$ = function (selector) {
            equal(selector, '.name')
            return {
                html: function (html) { equal(html, 'Name: Dr. DJ'); }
            };
        }
        
        view.bindEl('name', '.name', function(model) { return 'Name: ' + model.get('name'); })
        model.set('name', 'Dr. DJ');
    });

    
}());
