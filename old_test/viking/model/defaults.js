(function () {
    module("Viking#defaults");

    test("defaults with schema", function() {
        var Klass = Viking.Model.extend({
            schema: {
                foo: {'default': 'bar'},
                bat: {'default': 'bazz'}
            }
        });
    
        deepEqual(_.result(Klass.prototype, 'defaults'), {foo: 'bar', bat: 'bazz'});
    });

}());