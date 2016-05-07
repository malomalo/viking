(function () {
    
    module("Viking.Model.BelongsToReflection::new");

    test("::new('parent')", function() {
        Parent = Viking.Model.extend();
        
        var assocation = new Viking.Model.BelongsToReflection('parent');
        
        equal(assocation.name, 'parent');
        equal(assocation.macro, 'belongsTo');
        deepEqual(assocation.options, {});
        propEqual(assocation.modelName, {
            name: 'Parent',
            element: 'parent',
            human: 'Parent',
            paramKey: 'parent',
            plural: 'parents',
            routeKey: 'parents',
            singular: 'parent',
            collection: 'parents'
        });
        
        delete Parent;
    });
    
    test("::new('children', { modelName: 'Region' })", function() {
        Region = Viking.Model.extend();
        
        var assocation = new Viking.Model.BelongsToReflection('parent', { modelName: 'Region' });

        equal(assocation.name, 'parent');
        equal(assocation.macro, 'belongsTo');
        deepEqual(assocation.options, { modelName: 'Region'});
        deepEqual(assocation.modelName, new Viking.Model.Name('Region'));
        
        delete Region;
    });
    
    test("::new('subject', {polymorphic: true})", function () {
        Photo = Viking.Model.extend();
        
        var assocation = new Viking.Model.BelongsToReflection('subject', {polymorphic: true});
        equal(assocation.macro, 'belongsTo');
        equal(assocation.name, 'subject');
        deepEqual(assocation.options, {polymorphic: true});
        equal(assocation.modelName, undefined);
        
        delete Photo
    });

    test("#klass", function() {
        Child = Viking.Model.extend();
        MultiWord = Viking.Model.extend();
                
        var assocation = new Viking.Model.BelongsToReflection('child');
        equal(assocation.klass(), Child);
        
        var assocation = new Viking.Model.BelongsToReflection('multi_word');
        equal(assocation.klass(), MultiWord);
        
        delete Child;
        delete MultiWord;
    });
    
    test("#model", function() {
        Child = Viking.Model.extend();
        
        var assocation = new Viking.Model.BelongsToReflection('child');
        equal(assocation.model(), Child);
        
        delete Child;
    });
    

}());