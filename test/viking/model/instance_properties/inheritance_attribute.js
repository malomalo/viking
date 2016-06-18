import Viking from '../../../../src/viking'
(function () {
    module("Viking.Model#inheritanceAttribute");

    test("#inheritanceAttribute get set when extending a Model", function() {
        let Ship = Viking.Model.extend('ship');
        let ship = new Ship();
        ok(ship.inheritanceAttribute);
    });
    
    test("::inheritanceAttribute default to `type`", function() {
        let Ship = Viking.Model.extend('ship');
        let ship = new Ship();
        equal('type', ship.inheritanceAttribute);
    });
    
    test("::inheritanceAttribute override", function() {
        let Ship = Viking.Model.extend('ship', {
            inheritanceAttribute: 'class_name'
        });
        let ship = new Ship();
        
        equal('class_name', ship.inheritanceAttribute);
    });

}());