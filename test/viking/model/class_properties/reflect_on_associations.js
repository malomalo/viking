(function () {
    module("Viking.Model::reflectOnAssociations");

    test("::reflectOnAssociations() returns all the assocations", function() {
        Ship = Viking.Model.extend({ hasMany: ['ships'], belongsTo: [['carrier', {model: 'Ship'}]] });
        ShipCollection = Viking.Collection.extend({ model: Ship });
        
        deepEqual(['ships', 'carrier'], _.map(Ship.reflectOnAssociations(), function(a) { return a.name; }));
    
        delete Ship;
        delete ShipCollection;
    });
    
    test("::reflectOnAssociations(macro) returns all macro assocations", function() {
        Ship = Viking.Model.extend({ hasMany: ['ships'], belongsTo: [['carrier', {model: 'Ship'}]] });
        ShipCollection = Viking.Collection.extend({ model: Ship });
        
        deepEqual(['ships'], _.map(Ship.reflectOnAssociations('hasMany'), function(a) { return a.name; }));
    
        delete Ship;
        delete ShipCollection;
    });

}());