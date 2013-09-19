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
    
    test("#setErrors calls #setErrors with errors on belongsTo relations", function() {
        expect(1)
        
        Ship = Viking.Model.extend({ belongsTo: ['ship'] });
        
        var a = new Ship({ship: {}});
        ok(a.get('ship') instanceof Ship);
        
        a.get('ship').setErrors = function(errors, options) {
            deepEqual(errors, {
                "size": ["cant be blank", "is not a number" ]
            });
        }
        a.setErrors({
            ship: {
                "size": ["cant be blank", "is not a number" ]
            }
        });
    
        delete Ship;
    });
    
    test("#setErrors calls #setErrors with errors on hasMany relations", function() {
        expect(2)
        
        Ship = Viking.Model.extend({ hasMany: ['ships'] });
        ShipCollection = Backbone.Collection.extend({ model: Ship });
    
        var a = new Ship({ships: [{}, {}, {}]});
        a.get('ships').at(0).setErrors = function(errors, options) {
            deepEqual(errors, {
                "size": ["cant be blank", "is not a number" ]
            });
        }
        a.get('ships').at(1).setErrors = function(errors, options) {
            ok(false);
        }
        a.get('ships').at(2).setErrors = function(errors, options) {
            deepEqual(errors, {
                "type": ["cant be blank"]
            });
        }

        a.setErrors({
            ships: [
                { "size": ["cant be blank", "is not a number" ] },
                { },
                { "type": ["cant be blank"] }
            ]
        });
    
        delete Ship;
        delete ShipCollection;
    });
    
}());