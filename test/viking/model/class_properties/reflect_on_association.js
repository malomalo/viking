(function () {
    module("Viking.Model::reflectOnAssociation");

    test("::reflectOnAssociation() returns the assocation", function() {
        Ship = Viking.Model.extend({ hasMany: ['ships'], belongsTo: [['carrier', {model: 'Ship'}]] });
        ShipCollection = Viking.Collection.extend({ model: Ship });
        
        equal('ships', Ship.reflectOnAssociation('ships').name);
        equal('carrier', Ship.reflectOnAssociation('carrier').name);
        equal(undefined, Ship.reflectOnAssociation('bird'));
        
        delete Ship;
        delete ShipCollection;
    });

}());