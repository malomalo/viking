(function () {
    module("Viking.Model.HasManyReflection");

    test("::new('children')", function() {
        let ChildCollection = Viking.Collection.extend();
        
        var assocation = new Viking.Model.HasManyReflection('children');
        
        equal(assocation.name, 'children');
        equal(assocation.macro, 'hasMany');
        deepEqual(assocation.options, {});
        equal(assocation.collectionName, 'ChildCollection');

    });
    
    test("::new('children', {collectionName: 'MyCollection'})", function() {
        let MyCollection = Viking.Collection.extend();
        
        var assocation = new Viking.Model.HasManyReflection('children', {collectionName: 'MyCollection'});
        
        equal(assocation.name, 'children');
        equal(assocation.macro, 'hasMany');
        deepEqual(assocation.options, {collectionName: 'MyCollection'});
        equal(assocation.collectionName, 'MyCollection');
    });
    
    test("::new('children', { modelName: 'Region' })", function() {
        let Region = Viking.Model.extend('region');
        let RegionCollection = Viking.Collection.extend();
        
        var assocation = new Viking.Model.HasManyReflection('children', { modelName: 'Region' });
        
        equal(assocation.name, 'children');
        equal(assocation.macro, 'hasMany');
        deepEqual(assocation.options, { modelName: 'Region' });
        equal(assocation.collectionName, 'RegionCollection');
    });

    test("#collection", function() {
        let ChildCollection = Viking.Collection.extend();
        
        var assocation = new Viking.Model.HasManyReflection('children');
        equal(assocation.collection(), ChildCollection);
    });
    
    test("#klass", function() {
        let ChildCollection = Viking.Collection.extend();
        let MultiWordCollection = Viking.Model.extend('multiWord');
        
        var assocation = new Viking.Model.HasManyReflection('children');
        equal(assocation.klass(), ChildCollection);
        
        var assocation = new Viking.Model.HasManyReflection('multi_words');
        equal(assocation.klass(), MultiWordCollection);
    });

    
}());