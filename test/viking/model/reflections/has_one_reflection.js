(function () {
    
    module("Viking.Model.HasOneReflection::new");

    test("::new('parent')", function() {
        Parent = Viking.Model.extend();
        
        var assocation = new Viking.Model.HasOneReflection('parent');
        
        equal(assocation.name, 'parent');
        equal(assocation.macro, 'hasOne');
        deepEqual(assocation.options, {});
        equal(assocation.modelName, 'Parent');
        
        delete Parent;
    });
    
    test("::new('children', {model: 'Region'})", function() {
        Region = Viking.Model.extend();
        
        var assocation = new Viking.Model.HasOneReflection('parent', {model: 'Region'});
        
        equal(assocation.name, 'parent');
        equal(assocation.macro, 'hasOne');
        deepEqual(assocation.options, {model: 'Region'});
        equal(assocation.modelName, 'Region');
        
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