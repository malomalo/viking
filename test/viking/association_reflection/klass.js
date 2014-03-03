(function () {
    module("Viking.AssociationReflection#klass");

    test("#klass for `hasMany`", function() {
        ChildCollection = Viking.Collection.extend();
        MultiWordCollection = Viking.Model.extend();
        
        var assocation = new Viking.AssociationReflection('hasMany', 'children');
        equal(assocation.klass(), ChildCollection);
        
        var assocation = new Viking.AssociationReflection('hasMany', 'multi_words');
        equal(assocation.klass(), MultiWordCollection);
        
        delete ChildCollection;
        delete MultiWordCollection;
    });
    
    test("#klass for `belongsTo`", function() {
        Child = Viking.Model.extend();
        MultiWord = Viking.Model.extend();
                
        var assocation = new Viking.AssociationReflection('belongsTo', 'child');
        equal(assocation.klass(), Child);
        
        var assocation = new Viking.AssociationReflection('belongsTo', 'multi_word');
        equal(assocation.klass(), MultiWord);
        
        delete Child;
        delete MultiWord;
    });
    
    test("#klass for `hasOne`", function() {
        Child = Viking.Model.extend();
        MultiWord = Viking.Model.extend();
        
        var assocation = new Viking.AssociationReflection('hasOne', 'child');
        equal(assocation.klass(), Child);
        
        var assocation = new Viking.AssociationReflection('hasOne', 'multi_word');
        equal(assocation.klass(), MultiWord);
        
        delete Child;
        delete MultiWord;
    });

}());