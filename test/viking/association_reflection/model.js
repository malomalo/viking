(function () {
    module("Viking.AssociationReflection#model");

    test("#model", function() {
        Child = Viking.Model.extend();
        
        var assocation = new Viking.AssociationReflection('belongsTo', 'child');
        equal(assocation.model(), Child);
        
        delete Child;
    });
}());