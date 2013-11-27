(function () {
    module("Viking.Model::reflect_on_associations");

    test("::reflect_on_associations() returns all the assocations", function() {
        Ship = Viking.Model.extend({ hasMany: ['ships'], belongsTo: [['carrier', {model: 'Ship'}]] });
        ShipCollection = Backbone.Collection.extend({ model: Ship });
        
        deepEqual(['ships', 'carrier'], _.map(Ship.reflect_on_associations(), function(a) { return a.name; }));
    
        delete Ship;
        delete ShipCollection;
    });
    
    test("::reflect_on_associations(macro) returns all macro assocations", function() {
        Ship = Viking.Model.extend({ hasMany: ['ships'], belongsTo: [['carrier', {model: 'Ship'}]] });
        ShipCollection = Backbone.Collection.extend({ model: Ship });
        
        deepEqual(['ships'], _.map(Ship.reflect_on_associations('hasMany'), function(a) { return a.name; }));
    
        delete Ship;
        delete ShipCollection;
    });

    module("Viking.Model#reflect_on_associations");
    
    test("#reflect_on_associations() is a reference to ::reflect_on_associations()", function() {
        var Ship = Viking.Model.extend();

        strictEqual(Ship.reflect_on_associations, (new Ship()).reflect_on_associations)
    });

}());