(function () {
    // TODO: Put somewhere else
    var JST = {
        'a/template/path'               : _.template('<h1>Some Title</h1>'),
        'a/template/path/with/locals'   : _.template('<p><%= text %></p>')
    };

    module('Viking.View.Helpers#render', {
        setup : function() {
            Viking.View.templates = JST;
        }
    });

    test('rendering without template', function() {
        throws(
            function() {
                Viking.View.Helpers.render();
            },
            new Viking.ArgumentError('Cannot render without template provided')
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
