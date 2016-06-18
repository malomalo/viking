import Viking from '../../../../src/viking';

(function () {
    module("Viking.Model#toParam");

    test("#toParam() returns null on a model without an id", function() {
        var model = new Viking.Model();
    
        equal(null, model.toParam());
    });

    test("#toParam() returns id on a model with an id set", function() {
        var model = new Viking.Model({id: 42});
    
        equal(42, model.toParam());
    });

}());