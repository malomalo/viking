import Viking from '../../../../../src/viking';

(function () {
    module("Viking.Model#toJSON - hasMany");

    // toJSON --------------------------------------------------------------------
    test("#toJSON for hasMany relation", function() {
        let Ship = Viking.Model.extend('ship', {
            hasMany: ['ships']
        });
        let ShipCollection = Viking.Collection.extend({
            model: Ship
        });
        
        var a = new Ship({'ships': [{foo: 'bar'}], bat: 'baz'});
    
        deepEqual(a.toJSON({include: {'ships': {include: 'ships'}}}), {
            bat: 'baz',
            ships_attributes: [{
                foo: 'bar',
                ships_attributes: []
            }]
        });
    });

}());