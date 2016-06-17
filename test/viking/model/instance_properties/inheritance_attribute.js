(function () {
    module("Viking.Model#inheritanceAttribute");

    test("#inheritanceAttribute get set when extending a Model", function() {
        var Ship = Viking.Model.extend();
        var ship = new Ship();
        
        ok(ship.inheritanceAttribute);
    });
    
    test("::inheritanceAttribute default to `type`", function() {
        var Ship = Viking.Model.extend();
        var ship = new Ship();
                
        equal('type', ship.inheritanceAttribute);
    });
    
    test("::inheritanceAttribute override", function() {
        let Ship = Viking.Model.extend('ship', {
            inheritanceAttribute: 'class_name'
        });
        var ship = new Ship();
        
        equal('class_name', ship.inheritanceAttribute);
    });

}());