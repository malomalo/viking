import Viking from '../../../../src/viking';

(function () {
    module('Viking.View.Helpers#render', {
        setup : function() {
            Object.keys(JST).forEach(function (key) {
                Viking.View.templates[key] = JST[key];
            });
        }
    });

    test('rendering without template', function() {
        var template = undefined;
        throws(
            function() {
                Viking.View.Helpers.render();
            },
            new Error('Template does not exist: ' + template)
        );
    });

    test('rendering with nonexistent template', function() {
        var template = 'a/template/path/that/doesnt/exist';
        throws(
            function() {
                Viking.View.Helpers.render(template);
            },
            new Error('Template does not exist: ' + template)
        );
    });

    test('rendering template without locals', function() {
        var template = 'a/template/path';

        equal(
            Viking.View.Helpers.render(template),
            '<h1>Some Title</h1>'
        );
    });

    test('rendering template with locals', function() {
        var template = 'a/template/path/with/locals';

        equal(
            Viking.View.Helpers.render(template, {text : 'Some text'}),
            '<p>Some text</p>'
        );
    });

})();
