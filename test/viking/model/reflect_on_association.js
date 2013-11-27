(function () {
    module("Viking.Model::reflect_on_association");

    test("::reflect_on_association() returns the assocation", function() {
        Ship = Viking.Model.extend({ hasMany: ['ships'], belongsTo: [['carrier', {model: 'Ship'}]] });
        ShipCollection = Viking.Collection.extend({ model: Ship });
        
        equal('ships', Ship.reflect_on_association('ships').name);
        equal('carrier', Ship.reflect_on_association('carrier').name);
        equal(undefined, Ship.reflect_on_association('bird'));
        
        delete Ship;
        delete ShipCollection;
    });
    
    module("Viking.Model#reflect_on_association");
    
    test("#reflect_on_association() is a reference to ::reflect_on_association()", function() {
        var Ship = Viking.Model.extend();

        strictEqual(Ship.reflect_on_association, (new Ship()).reflect_on_association)
    });

}());