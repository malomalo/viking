import Viking from '../../../../../src/viking';

(function () {
    module("Viking.Model#toJSON - belongsTo");

    test("#toJSON for belongsTo relation", function() {
        let Ship = Viking.Model.extend('ship', { belongsTo: ['ship'] });
        let a = new Ship({'ship': {foo: 'bar'}, bat: 'baz'});
    
        deepEqual(a.toJSON({include: 'ship'}), {
            bat: 'baz',
            ship_attributes: {foo: 'bar'}
        });
    });

    test('#toJSON sets relation attributes to null if relation is null', function() {
        let Ship = Viking.Model.extend('ship', { belongsTo: ['ship'] });
        let a = new Ship({'ship': null, bat: 'baz'});
    
        deepEqual(a.toJSON({include: 'ship'}), {
            bat: 'baz',
            ship_attributes: null
        });
    });

    test("#toJSON doesn't sets relation attributes to null if relation is falsely and not null", function() {
        let Ship = Viking.Model.extend('ship', { belongsTo: ['ship'] });
        let a = new Ship({'ship': null, bat: 'baz'});
    
        deepEqual(a.toJSON({include: 'ship'}), {
            bat: 'baz',
            ship_attributes: null
        });
    });

}());