(function () {
    module("Viking.AssociationReflection::new - hasMany macro");

    test("::new('hasMany', 'children')", function() {
        ChildCollection = Viking.Collection.extend();
        
        var assocation = new Viking.AssociationReflection('hasMany', 'children');
        
        equal(assocation.name, 'children');
        equal(assocation.macro, 'hasMany');
        deepEqual(assocation.options, {});
        equal(assocation.collectionName, 'ChildCollection');
        
        delete ChildCollection;
    });
    
    test("::new('hasMany', 'children', {collection: 'MyCollection'})", function() {
        MyCollection = Viking.Collection.extend();
        
        var assocation = new Viking.AssociationReflection('hasMany', 'children', {collection: 'MyCollection'});
        
        equal(assocation.name, 'children');
        equal(assocation.macro, 'hasMany');
        deepEqual(assocation.options, {collection: 'MyCollection'});
        equal(assocation.collectionName, 'MyCollection');
        
        delete MyCollection;
    });
    
    test("::new('hasMany', 'children', {model: 'Region'})", function() {
        Region = Viking.Model.extend();
        RegionCollection = Viking.Collection.extend();
        
        var assocation = new Viking.AssociationReflection('hasMany', 'children', {model: 'Region'});
        
        equal(assocation.name, 'children');
        equal(assocation.macro, 'hasMany');
        deepEqual(assocation.options, {model: 'Region'});
        equal(assocation.collectionName, 'RegionCollection');
        
        delete Region;
        delete RegionCollection;
    });
    
    module("Viking.AssociationReflection::new - belongsTo macro");

    test("::new('belongsTo', 'parent')", function() {
        Parent = Viking.Model.extend();
        
        var assocation = new Viking.AssociationReflection('belongsTo', 'parent');
        
        equal(assocation.name, 'parent');
        equal(assocation.macro, 'belongsTo');
        deepEqual(assocation.options, {});
        equal(assocation.modelName, 'Parent');
        
        delete Parent;
    });
    
    test("::new('belongsTo', 'children', {model: 'Region'})", function() {
        Region = Viking.Model.extend();
        
        var assocation = new Viking.AssociationReflection('belongsTo', 'parent', {model: 'Region'});
        
        equal(assocation.name, 'parent');
        equal(assocation.macro, 'belongsTo');
        deepEqual(assocation.options, {model: 'Region'});
        equal(assocation.modelName, 'Region');
        
        delete Region;
    });
    
    module("Viking.AssociationReflection::new - hasOne macro");

    test("::new('hasOne', 'parent')", function() {
        Parent = Viking.Model.extend();
        
        var assocation = new Viking.AssociationReflection('hasOne', 'parent');
        
        equal(assocation.name, 'parent');
        equal(assocation.macro, 'hasOne');
        deepEqual(assocation.options, {});
        equal(assocation.modelName, 'Parent');
        
        delete Parent;
    });
    
    test("::new('hasOne', 'children', {model: 'Region'})", function() {
        Region = Viking.Model.extend();
        
        var assocation = new Viking.AssociationReflection('hasOne', 'parent', {model: 'Region'});
        
        equal(assocation.name, 'parent');
        equal(assocation.macro, 'hasOne');
        deepEqual(assocation.options, {model: 'Region'});
        equal(assocation.modelName, 'Region');
        
        delete Region;
    });

    module("Viking.AssociationReflection::new - unkown macro");

    test("::new('gobbles', 'food')", function() {
        try {
            new Viking.AssociationReflection('gobbles', 'food');
        } catch (e) {
            ok(e instanceof TypeError);
            equal(e.message, "Unkown Macro gobbles");
        }
    });

}());