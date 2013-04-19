module("Viking#config");

test("updates defaults on an obj with (obj, key, value) syntax", function() {
    var Klass = Backbone.Model.extend({
        defaults: { foo: 'bar', bat: 'bazz' }
    });
    
    Viking.config(Klass, 'foo', 'rab');
    
    deepEqual(Klass.prototype.defaults, {foo: 'rab', bat: 'bazz'});
});


test("updates defaults on an obj with (obj, attrs) syntax", function() {
    var Klass = Backbone.Model.extend({
        defaults: { foo: 'bar', bat: 'bazz' }
    });
    
    Viking.config(Klass, {foo: 'rab'});
    
    deepEqual(Klass.prototype.defaults, {foo: 'rab', bat: 'bazz'});
});