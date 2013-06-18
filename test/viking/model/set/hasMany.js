(function () {
    module("Viking.model#set - hasMany");

    // setting attributes on a model coerces relations
    test("#set(key, val) coerces hasMany relations", function() {
        Ship = Viking.Model.extend({ hasMany: ['ships'] });
        ShipCollection = Backbone.Collection.extend({ model: Ship });
    
        var a = new Ship();
        a.set('ships', [{}, {}]);
        ok(a.get('ships') instanceof ShipCollection);
        equal(a.get('ships').length, 2);
        ok(a.get('ships').first() instanceof Ship);
    
        delete Ship;
        delete ShipCollection;
    });

    test("#set({key, val}) coerces hasMany relations", function() {
        Ship = Viking.Model.extend({ hasMany: ['ships'] });
        ShipCollection = Backbone.Collection.extend({ model: Ship });
    
        var a = new Ship();
        a.set({ships: [{}, {}]});
        ok(a.get('ships') instanceof ShipCollection);
        equal(a.get('ships').length, 2);
        ok(a.get('ships').first() instanceof Ship);
    
        delete Ship;
        delete ShipCollection;
    });

}());