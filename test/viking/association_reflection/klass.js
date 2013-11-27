(function () {
    module("Viking.AssociationReflection#klass");

    test("#klass for `hasMany`", function() {
        ChildCollection = Viking.Collection.extend();
        
        var assocation = new Viking.AssociationReflection('hasMany', 'children');
        equal(assocation.klass(), ChildCollection);
        
        delete ChildCollection;
    });
    
    test("#klass for `belongsTo`", function() {
        Child = Viking.Model.extend();
        
        var assocation = new Viking.AssociationReflection('belongsTo', 'child');
        equal(assocation.klass(), Child);
        
        delete Child;
    });
    
    test("#klass for `hasOne`", function() {
        Child = Viking.Model.extend();
        
        var assocation = new Viking.AssociationReflection('hasOne', 'child');
        equal(assocation.klass(), Child);
        
        delete Child;
    });

}());