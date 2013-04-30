module("Viking.Model#toJSON - belongsTo");

test("#toJSON for belongsTo relation", function() {
    Ship = Viking.Model.extend({ belongsTo: ['ship'] });
        
    var a = new Ship({'ship': {foo: 'bar'}, bat: 'baz'});
    
    deepEqual(a.toJSON(), {
        bat: 'baz',
        ship_attributes: {foo: 'bar'}
    });
    
    delete Ship;
});

test('#toJSON sets relation attributes to null if relation is null', function() {
    Ship = Viking.Model.extend({ belongsTo: ['ship'] });
        
    var a = new Ship({'ship': null, bat: 'baz'});
    
    deepEqual(a.toJSON(), {
        bat: 'baz',
        ship_attributes: null
    });
    
    delete Ship;
});

test("#toJSON doesn't sets relation attributes to null if relation is falsely and not null", function() {
    Ship = Viking.Model.extend({ belongsTo: ['ship'] });
        
    var a = new Ship({'ship': null, bat: 'baz'});
    
    deepEqual(a.toJSON(), {
        bat: 'baz',
        ship_attributes: null
    });
    
    delete Ship;
});
