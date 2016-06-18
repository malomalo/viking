(function () {
    
    module("Viking.Model.HasOneReflection::new");

    test("::new('parent')", function() {
        let Parent = Viking.Model.extend('parent');
        
        var assocation = new Viking.Model.HasOneReflection('parent');
        
        equal(assocation.name, 'parent');
        equal(assocation.macro, 'hasOne');
        deepEqual(assocation.options, {});
        propEqual(_.omit(assocation.modelName, 'model'), {
            name: 'Parent',
            element: 'parent',
            human: 'Parent',
            paramKey: 'parent',
            plural: 'parents',
            routeKey: 'parents',
            singular: 'parent',
            collection: 'parents',
            collectionName: 'ParentCollection'
        });
    });
    
    test("::new('children', { modelName: 'Region'})", function() {
        let Region = Viking.Model.extend('region');
        
        var assocation = new Viking.Model.HasOneReflection('parent', {modelName: 'Region'});
        
        equal(assocation.name, 'parent');
        equal(assocation.macro, 'hasOne');
        deepEqual(assocation.options, {modelName: 'Region'});
        propEqual(assocation.modelName, new Viking.Model.Name('Region'));
    });

    test("#klass", function() {
        let Child = Viking.Model.extend('child');
        let MultiWord = Viking.Model.extend('multiWord');
        
        var assocation = new Viking.Model.HasOneReflection('child');
        equal(assocation.klass(), Child);
        
        var assocation = new Viking.Model.HasOneReflection('multi_word');
        equal(assocation.klass(), MultiWord);
    });

}());