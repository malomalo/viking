import * as Backbone from 'backbone';
import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../../../../viking';

module('Viking.View.Helpers#linkTo', {}, () => {

    test("linkTo(content, url)", function () {
        assert.equal(
            Viking.View.Helpers.linkTo('Example', 'http://example.com'),
            '<a href="http://example.com">Example</a>'
        );
    });

    test("linkTo(contentFunc, url)", function () {
        assert.equal(
            Viking.View.Helpers.linkTo(function () { return 'Example'; }, 'http://example.com'),
            '<a href="http://example.com">Example</a>'
        );
    });

    test("linkTo(content, url, options)", function () {
        assert.equal(
            Viking.View.Helpers.linkTo('Example', 'http://example.com', { 'class': 'myclass' }),
            '<a class="myclass" href="http://example.com">Example</a>'
        );
    });

    test("linkTo(contentFunc, url, options)", function () {
        assert.equal(
            Viking.View.Helpers.linkTo(function () { return 'Example'; }, 'http://example.com', { 'class': 'myclass' }),
            '<a class="myclass" href="http://example.com">Example</a>'
        );
    });

    test("linkTo(url, options, contentFunc)", function () {
        assert.equal(
            Viking.View.Helpers.linkTo('http://example.com', { 'class': 'myclass' }, function () { return 'Example'; }),
            '<a class="myclass" href="http://example.com">Example</a>'
        );
    });

    test("linkTo(content, model)", function () {
        const Workshop = Viking.Model.extend('workshop');
        const workshopPath = (m) => '/workshops/' + m.toParam();

        Viking.context['Workshop'] = Workshop;
        Viking.context['workshopPath'] = workshopPath;

        assert.equal(
            Viking.View.Helpers.linkTo('Model', new Workshop({ id: 10 })),
            '<a href="' + window.location.protocol + '//' + window.location.host + '/workshops/10' + '">Model</a>'
        );

        delete Viking.context['Workshop'];
        delete Viking.context['workshopPath'];
    });

    test("linkTo(model, contentFunc)", function () {
        const Workshop = Viking.Model.extend('workshop');
        const workshopPath = (m) => '/workshops/' + m.toParam();

        Viking.context['Workshop'] = Workshop;
        Viking.context['workshopPath'] = workshopPath;

        assert.equal(
            Viking.View.Helpers.linkTo(new Workshop({ id: 10 }), function () { return 'Example'; }),
            '<a href="' + window.location.protocol + '//' + window.location.host + '/workshops/10' + '">Example</a>'
        );

        delete Viking.context['Workshop'];
        delete Viking.context['workshopPath'];
    });

    test("linkTo(model, options, contentFunc)", function () {
        const Workshop = Viking.Model.extend('workshop');
        const workshopPath = (m) => '/workshops/' + m.toParam();

        Viking.context['Workshop'] = Workshop;
        Viking.context['workshopPath'] = workshopPath;

        assert.equal(
            Viking.View.Helpers.linkTo(new Workshop({ id: 10 }), { 'class': 'myclass' }, function () { return 'Example'; }),
            '<a class="myclass" href="' + window.location.protocol + '//' + window.location.host + '/workshops/10' + '">Example</a>'
        );

        delete Viking.context['Workshop'];
        delete Viking.context['workshopPath'];
    });

});