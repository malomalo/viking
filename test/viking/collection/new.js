import Viking from '../../../src/viking';

(function () {
    module("Viking.Collection::new");

    test("([], {order: ORDER}) sets ordering by calling #order(ORDER)", function() {
        expect(1);
        
        var Collection = Viking.Collection.extend({
            order: function(order) { equal(order, 'data'); }
        });
        
        var c = new Collection([], { order: 'data' });
    });
    
    test("([], {order: ORDER}) calls #order with the options {silent: true}", function() {
        expect(1);
    
        var Collection = Viking.Collection.extend({
            order: function(order, options) { deepEqual(options, {silent: true}); }
        });
        
        new Collection([], { order: 'data' });
    });

}());