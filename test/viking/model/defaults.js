import Viking from '../../../src/viking';

(function () {
    module("Viking#defaults");

    test("defaults with schema", function() {
        var Klass = Viking.Model.extend('klass', {
            schema: {
                foo: {'default': 'bar'},
                bat: {'default': 'bazz'}
            }
        });

        deepEqual(_.result(Klass.prototype, 'defaults'), {foo: 'bar', bat: 'bazz'});
    });
}());
