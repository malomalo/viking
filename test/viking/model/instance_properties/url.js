(function () {
    module("Viking.Model#url");

    test("#url /pluralModelName/id by default", function() {
        var Model = Viking.Model.extend('model');
        var model = new Model({id: 42});
    
        equal(model.url(), '/models/42');
    });
    
    test("#url /pluralModelName/slug by overriding #toParam()", function() {
        var Model = Viking.Model.extend('model');
        var model = new Model({id: 42});
        model.toParam = function () {
            return 'slug'
        }
    
        equal(model.url(), '/models/slug');
    });

}());