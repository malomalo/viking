(function () {
    module("Viking.Model#reflectOnAssociations");
    
    test("#reflectOnAssociations() is a reference to ::reflectOnAssociations()", function() {
        var Ship = Viking.Model.extend();

        strictEqual(Ship.reflectOnAssociations, (new Ship()).reflectOnAssociations)
    });

}());