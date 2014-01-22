(function () {
    module("Viking.Collection::new");

    test("([], {order: ORDER}) sets ordering by calling #order(ORDER)", function() {
        expect(1);
    
        var Collection = Viking.Collection.extend({
            order: function(order) { equal(order, 'data'); }
        });
    
        var c = new Collection([], { order: 'data' });
    });

}());