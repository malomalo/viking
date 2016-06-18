import Viking from '../../../../src/viking';

(function () {
    module("Viking.Model#setErrors");
    
    test("#setErrors is a noop if the size of the errors is 0", function() {
        expect(0)
        
        var m = new Viking.Model();
        m.on('invalid', function(model, errors, options) { ok(false); });
        m.setErrors({});
        m.off('invalid');
    });

    test("#setErrors emits invalid event errors are set", function() {
        expect(1)
        
        var m = new Viking.Model();
        m.on('invalid', function(model, errors, options) { deepEqual(errors, {
            "address": { "city": ["cant be blank"] },
            "agents": [ { "email": ["cant be blank",  "is invalid" ] } ],
            "size": ["cant be blank", "is not a number" ]
        }); });

        m.setErrors({
            "address": { "city": ["cant be blank"] },
            "agents": [ { "email": ["cant be blank",  "is invalid" ] } ],
            "size": ["cant be blank", "is not a number" ]
        });
        m.off('invalid');
    });
    
}());