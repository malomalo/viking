(function () {
    module("Viking.Model.HasManyReflection");

    test("::new('children')", function() {
        ChildCollection = Viking.Collection.extend();
        
        var assocation = new Viking.Model.HasManyReflection('children');
        
        equal(assocation.name, 'children');
        equal(assocation.macro, 'hasMany');
        deepEqual(assocation.options, {});
        equal(assocation.collectionName, 'ChildCollection');
        
        delete ChildCollection;
    });
    
    test("::new('children', {collectionName: 'MyCollection'})", function() {
        MyCollection = Viking.Collection.extend();
        
        var assocation = new Viking.Model.HasManyReflection('children', {collectionName: 'MyCollection'});
        
        equal(assocation.name, 'children');
        equal(assocation.macro, 'hasMany');
        deepEqual(assocation.options, {collectionName: 'MyCollection'});
        equal(assocation.collectionName, 'MyCollection');
        
        delete MyCollection;
    });
    
    test("::new('children', { modelName: 'Region' })", function() {
        Region = Viking.Model.extend();
        RegionCollection = Viking.Collection.extend();
        
        var assocation = new Viking.Model.HasManyReflection('children', { modelName: 'Region' });
        
        equal(assocation.name, 'children');
        equal(assocation.macro, 'hasMany');
        deepEqual(assocation.options, { modelName: 'Region' });
        equal(assocation.collectionName, 'RegionCollection');
        
        delete Region;
        delete RegionCollection;
    });

    test("#collection", function() {
        ChildCollection = Viking.Collection.extend();
        
        var assocation = new Viking.Model.HasManyReflection('children');
        equal(assocation.collection(), ChildCollection);
        
        delete ChildCollection;
    });
    
    test("#klass", function() {
        ChildCollection = Viking.Collection.extend();
        MultiWordCollection = Viking.Model.extend();
        
        var assocation = new Viking.Model.HasManyReflection('children');
        equal(assocation.klass(), ChildCollection);
        
        var assocation = new Viking.Model.HasManyReflection('multi_words');
        equal(assocation.klass(), MultiWordCollection);
        
        delete ChildCollection;
        delete MultiWordCollection;
    });

    
}());