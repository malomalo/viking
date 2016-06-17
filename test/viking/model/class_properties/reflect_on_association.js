import Viking from '../../../../src/viking';

(function () {
    module("Viking.Model::reflectOnAssociation");

    test("::reflectOnAssociation() returns the assocation", function() {
        let Ship = Viking.Model.extend('ship', { hasMany: ['ships'], belongsTo: [['carrier', {modelName: 'Ship'}]] });
        let ShipCollection = Viking.Collection.extend({ model: Ship });
        
        equal('ships', Ship.reflectOnAssociation('ships').name);
        equal('carrier', Ship.reflectOnAssociation('carrier').name);
        equal(undefined, Ship.reflectOnAssociation('bird'));
    });

}());