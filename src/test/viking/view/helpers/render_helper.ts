import * as Backbone from 'backbone';
import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../../../viking';

module('Viking.View.Helpers#render', {
    beforeEach: function() {
        // TODO is this needed, if so need to figure out how to setup JST
        // Viking.View.templates = JST;
    }
}, () => {
    test('rendering without template', function() {
        var template = undefined;
        assert.throws(
            function() {
                Viking.View.Helpers.render();
            },
            new Error('Template does not exist: ' + template)
        );
    });

    test('rendering with nonexistent template', function() {
        var template = 'a/template/path/that/doesnt/exist';
        assert.throws(
            function() {
                Viking.View.Helpers.render(template);
            },
            new Error('Template does not exist: ' + template)
        );
    });

    test('rendering template without locals', function() {
        var template = 'a/template/path';

        assert.equal(
            Viking.View.Helpers.render(template),
            '<h1>Some Title</h1>'
        );
    });

    test('rendering template with locals', function() {
        var template = 'a/template/path/with/locals';

        assert.equal(
            Viking.View.Helpers.render(template, {text : 'Some text'}),
            '<p>Some text</p>'
        );
    });

});
