(function () {
    module("Viking.Model#save", {
        setup: function() {
            this.requests = [];
            this.xhr = sinon.useFakeXMLHttpRequest();
            this.xhr.onCreate = _.bind(function(xhr) {
                this.requests.push(xhr);
            }, this);
        },
        teardown: function() {
            this.xhr.restore();
        }
    });

    test("#save calls setErrors when a 400 is returned", function() {
        expect(1)
        
        var Model = Viking.Model.extend('model');
    
        var m = new Model();
        m.setErrors = function(errors, options) {
            deepEqual(errors, {
                "address": { "city": ["cant be blank"] },
                "agents": [ { "email": ["cant be blank",  "is invalid" ] } ],
                "size": ["cant be blank", "is not a number" ]
            });
        }

        m.save();
        this.requests[0].respond(400, '[]', JSON.stringify({
            "errors": {
                "address": { "city": ["cant be blank"] },
                "agents": [ { "email": ["cant be blank",  "is invalid" ] } ],
                "size": ["cant be blank", "is not a number" ]
            }
        }));
    });
    
    test("#save calls the invalid callback when a 400 is returned", function() {
        expect(1)
        
        var Model = Viking.Model.extend('model');
    
        var m = new Model({foo: 'bar'});
        m.save(null, {
            invalid: function(model, errors, options) {
                deepEqual(errors, {
                    "address": { "city": ["cant be blank"] },
                    "agents": [ { "email": ["cant be blank",  "is invalid" ] } ],
                    "size": ["cant be blank", "is not a number" ]
                });
            }
        });
        
        this.requests[0].respond(400, '[]', JSON.stringify({
            "errors": {
                "address": { "city": ["cant be blank"] },
                "agents": [ { "email": ["cant be blank",  "is invalid" ] } ],
                "size": ["cant be blank", "is not a number" ]
            }
        }));
    });

}());