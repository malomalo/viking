(function () {
    module("Viking.Model#reflectOnAssociation");
    
    test("#reflectOnAssociation() is a reference to ::reflectOnAssociation()", function() {
        var Ship = Viking.Model.extend();

        strictEqual(Ship.reflectOnAssociation, (new Ship()).reflectOnAssociation)
    });

}());