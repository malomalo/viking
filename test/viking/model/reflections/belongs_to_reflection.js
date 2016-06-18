(function () {
    
    module("Viking.Model.BelongsToReflection::new");

    test("::new('parent')", function() {
        let Parent = Viking.Model.extend('parent');
        
        var assocation = new Viking.Model.BelongsToReflection('parent');
        
        equal(assocation.name, 'parent');
        equal(assocation.macro, 'belongsTo');
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
    
    test("::new('children', { modelName: 'Region' })", function() {
        let Region = Viking.Model.extend('region');
        
        var assocation = new Viking.Model.BelongsToReflection('parent', { modelName: 'Region' });

        equal(assocation.name, 'parent');
        equal(assocation.macro, 'belongsTo');
        deepEqual(assocation.options, { modelName: 'Region'});
        deepEqual(assocation.modelName, new Viking.Model.Name('Region'));
    });
    
    test("::new('subject', {polymorphic: true})", function () {
        let Photo = Viking.Model.extend('photo');
        
        var assocation = new Viking.Model.BelongsToReflection('subject', {polymorphic: true});
        equal(assocation.macro, 'belongsTo');
        equal(assocation.name, 'subject');
        deepEqual(assocation.options, {polymorphic: true});
        equal(assocation.modelName, undefined);
    });

    test("#klass", function() {
        let Child = Viking.Model.extend('child');
        let MultiWord = Viking.Model.extend('multiWord');
                
        var assocation = new Viking.Model.BelongsToReflection('child');
        equal(assocation.klass(), Child);
        
        var assocation = new Viking.Model.BelongsToReflection('multi_word');
        equal(assocation.klass(), MultiWord);
    });
    
    test("#model", function() {
        let Child = Viking.Model.extend('child');
        
        var assocation = new Viking.Model.BelongsToReflection('child');
        equal(assocation.model(), Child);
    });
    

}());