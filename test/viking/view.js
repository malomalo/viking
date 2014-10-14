(function () {
    module("Viking.View");
    
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
    
}());
