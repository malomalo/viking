(function () {
    
    module("Viking.Model.HasOneReflection::new");

    test("::new('parent')", function() {
        Parent = Viking.Model.extend();
        
        var assocation = new Viking.Model.HasOneReflection('parent');
        
        equal(assocation.name, 'parent');
        equal(assocation.macro, 'hasOne');
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
    
    test("::new('children', { modelName: 'Region'})", function() {
        Region = Viking.Model.extend();
        
        var assocation = new Viking.Model.HasOneReflection('parent', {modelName: 'Region'});
        
        equal(assocation.name, 'parent');
        equal(assocation.macro, 'hasOne');
        deepEqual(assocation.options, {modelName: 'Region'});
        propEqual(assocation.modelName, new Viking.Model.Name('Region'));
        
        delete Region;
    });

    test("#klass", function() {
        Child = Viking.Model.extend();
        MultiWord = Viking.Model.extend();
        
        var assocation = new Viking.Model.HasOneReflection('child');
        equal(assocation.klass(), Child);
        
        var assocation = new Viking.Model.HasOneReflection('multi_word');
        equal(assocation.klass(), MultiWord);
        
        delete Child;
        delete MultiWord;
    });

}());