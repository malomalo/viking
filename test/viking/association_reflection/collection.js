(function () {
    module("Viking.AssociationReflection#collection");

    test("#collection", function() {
        ChildCollection = Viking.Collection.extend();
        
        var assocation = new Viking.AssociationReflection('hasMany', 'children');
        equal(assocation.collection(), ChildCollection);
        
        delete ChildCollection;
    });
}());