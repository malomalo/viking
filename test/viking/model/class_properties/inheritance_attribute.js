(function () {
    module("Viking.Model::inheritanceAttribute");

    test("::inheritanceAttribute get set when extending a Model", function() {
        var Ship = Viking.Model.extend();
        
        ok(Ship.inheritanceAttribute);
    });
    
    test("::inheritanceAttribute default to `type`", function() {
        var Ship = Viking.Model.extend();
        
        equal('type', Ship.inheritanceAttribute);
    });
    
    test("::inheritanceAttribute override", function() {
        var Ship = Viking.Model.extend({
            inheritanceAttribute: 'class_name'
        });
        
        equal('class_name', Ship.inheritanceAttribute);
    });

}());