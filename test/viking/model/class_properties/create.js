(function () {
    module("Viking.Model::create", {
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

    test("::create returns an new model", function() {
        var Model = Viking.Model.extend('model');
        
        var m = Model.create({name: "name"});
        ok(m instanceof Model);
    });

    test("::create calls save with options", function() {
        var Model = Viking.Model.extend('model');
        
        Model.prototype.save = function (attributes, options) {
            deepEqual(options, {option: 1});
        };
        
        var m = Model.create({name: "name"}, {option: 1});
    });

}());
