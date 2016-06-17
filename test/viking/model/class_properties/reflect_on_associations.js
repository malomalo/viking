import Viking from '../../../../src/viking';

(function () {
    module("Viking.Model::reflectOnAssociations");

    test("::reflectOnAssociations() returns all the assocations", function() {
        let Ship = Viking.Model.extend('ship', { hasMany: ['ships'], belongsTo: [['carrier', {modelName: 'Ship'}]] });
        let ShipCollection = Viking.Collection.extend({ model: Ship });
        
        deepEqual(['carrier', 'ships'], _.map(Ship.reflectOnAssociations(), function(a) { return a.name; }));
    });
    
    test("::reflectOnAssociations(macro) returns all macro assocations", function() {
        let Ship = Viking.Model.extend('ship', { hasMany: ['ships'], belongsTo: [['carrier', {modelName: 'Ship'}]] });
        let ShipCollection = Viking.Collection.extend({ model: Ship });
        
        deepEqual(['ships'], _.map(Ship.reflectOnAssociations('hasMany'), function(a) { return a.name; }));
    });

}());