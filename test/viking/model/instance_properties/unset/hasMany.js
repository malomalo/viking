(function () {
    module("Viking.model#unset - hasMany");

    // setting attributes on a model coerces relations
    test("#set(key) unsets a hasMany relationship", function() {
        Ship = Viking.Model.extend({ hasMany: ['ships'] });
        ShipCollection = Viking.Collection.extend({ model: Ship });

        var a = new Ship();
        a.set('ships', [{}, {}]);
        
        a.unset('ships');
        equal(a.get('ships'), undefined);

        delete Ship;
        delete ShipCollection;
    });

}());
