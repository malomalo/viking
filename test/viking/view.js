(function () {
    module("Viking.View");

    test("extend with no events in either child or parent", function() {
        var View = Viking.View.extend();
		var NewView = View.extend();
		
		var v = new NewView();
		equal(v.events, undefined);
    });

    test("extend with no events in child", function() {
        var View = Viking.View.extend({events: {one: 'two'}});
		var NewView = View.extend();
		
		var v = new NewView();
		deepEqual(v.events, {one: 'two'});
    });
	
    test("extend with no events in parent", function() {
        var View = Viking.View.extend();
		var NewView = View.extend({events: {one: 'two'}});
		
		var v = new NewView();
		deepEqual(v.events, {one: 'two'});
    });

    test("extend merges events in child with events in parent", function() {
        var View = Viking.View.extend({events: {one: 'two', five: 'six'}});
		var NewView = View.extend({events: {three: 'four', five: 'seven'}});
		
		var v = new NewView();
		deepEqual(v.events, {one: 'two', three: 'four', five: 'seven'});
    });

    test("extend with no initialize in either child or parent", function() {
        var View = Viking.View.extend();
		var NewView = View.extend();
		
		var v = new NewView();
		equal(v.initialize, Backbone.View.prototype.initialize);
    });

    test("extend with no initialize in child", function() {
		expect(1);
		
        var View = Viking.View.extend({initialize: function() { ok(true); }});
		var NewView = View.extend();
		
		var v = new NewView();
    });
	
    test("extend with no initialize in parent", function() {
		expect(1);
		
        var View = Viking.View.extend();
		var NewView = View.extend({initialize: function() { ok(true); }});
		
		var v = new NewView();
    });
	
    test("extend with initialize in both parent and child calls both initialize functions in order", function() {
		var array = [];
        var View = Viking.View.extend({initialize: function() { array.push(1); }});
		var NewView = View.extend({initialize: function() { array.push(2); }});
		
		var v = new NewView();
		deepEqual(array, [1,2]);
    });
	
}());