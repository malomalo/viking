import * as Backbone from 'backbone';
import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../../../../viking';

module('Viking.View.Helpers#urlFor', {}, () => {

    test("urlFor(Class)", function () {
        let Workshop = Viking.Model.extend('workshop');
        let workshopsPath = function () {
            assert.ok(true); return '/workshops';
        }

        assert.equal(
            Viking.urlFor(Workshop),
            window.location.protocol + '//' + window.location.host + '/workshops'
        );
    });

    test("urlFor(new Class())", function () {
        let Workshop = Viking.Model.extend('workshop');
        let workshopsPath = function () {
            assert.ok(true); return '/workshops';
        }

        assert.equal(
            Viking.urlFor(new Workshop()),
            window.location.protocol + '//' + window.location.host + '/workshops'
        );
    });

    test("urlFor(model)", function () {
        let Workshop = Viking.Model.extend('workshop');
        let workshopPath = function (m) {
            assert.ok(true); return '/workshops/' + m.toParam();
        }

        assert.equal(
            Viking.urlFor(new Workshop({ id: 10 })),
            window.location.protocol + '//' + window.location.host + '/workshops/10'
        );
    });

    test("urlFor(STIModel)", function () {
        let Workshop = Viking.Model.extend('workshop');
        let SantaWorkshop = Workshop.extend('santa_workshop');
        let workshopPath = function (m) {
            assert.ok(true); return '/workshops/' + m.toParam();
        }

        assert.equal(
            Viking.urlFor(new SantaWorkshop({ id: 10 })),
            window.location.protocol + '//' + window.location.host + '/workshops/10'
        );
    });

    test("urlFor(class, {anchor: STRING})", function () {
        let Workshop = Viking.Model.extend('workshop');
        let workshopPath = function (m) { return '/workshops/' + m.toParam(); }

        assert.equal(
            Viking.urlFor(new Workshop({ id: 10 }), { anchor: 'location' }),
            window.location.protocol + '//' + window.location.host + '/workshops/10#location'
        );
    });

    test("urlFor(class, {onlyPath: true})", function () {
        let Workshop = Viking.Model.extend('workshop');
        let workshopPath = function (m) { return '/workshops/' + m.toParam(); }

        assert.equal(
            Viking.urlFor(new Workshop({ id: 10 }), { onlyPath: true }),
            '/workshops/10'
        );
    });

    test("urlFor(class, {trailingSlash: true})", function () {
        let Workshop = Viking.Model.extend('workshop');
        let workshopPath = function (m) { return '/workshops/' + m.toParam(); }

        assert.equal(
            Viking.urlFor(new Workshop({ id: 10 }), { trailingSlash: true }),
            window.location.protocol + '//' + window.location.host + '/workshops/10/'
        );
    });

    test("urlFor(class, {host: STRING})", function () {
        let Workshop = Viking.Model.extend('workshop');
        let workshopPath = function (m) { return '/workshops/' + m.toParam(); }

        assert.equal(
            Viking.urlFor(new Workshop({ id: 10 }), { host: 'example.com' }),
            window.location.protocol + '//example.com' + (window.location.port ? ':' : '') + window.location.port + '/workshops/10'
        );
    });

    test("urlFor(class, {port: NUMBER})", function () {
        let Workshop = Viking.Model.extend('workshop');
        let workshopPath = function (m) { return '/workshops/' + m.toParam(); }

        assert.equal(
            Viking.urlFor(new Workshop({ id: 10 }), { port: 9292 }),
            window.location.protocol + '//' + window.location.hostname + ':9292/workshops/10'
        );
    });

    test("urlFor(class, {protocol: STRING})", function () {
        let Workshop = Viking.Model.extend('workshop');
        let workshopPath = function (m) { return '/workshops/' + m.toParam(); }

        assert.equal(
            Viking.urlFor(new Workshop({ id: 10 }), { protocol: 'custom' }),
            'custom://' + window.location.hostname + (window.location.port ? ':' : '') + window.location.port + '/workshops/10'
        );
    });

    test("urlFor(class, {scriptName: STRING})", function () {
        let Workshop = Viking.Model.extend('workshop');
        let workshopPath = function (m) { return '/workshops/' + m.toParam(); }

        assert.equal(
            Viking.urlFor(new Workshop({ id: 10 }), { scriptName: '/base' }),
            window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' : '') + window.location.port + '/base/workshops/10'
        );
    });

    test('urlFor(class, {user: STRING, password: STRING})', () => {
        const Workshop = Viking.Model.extend('workshop');
        const workshopPath = (m) => '/workshops/' + m.toParam();

        Viking.context['Workshop'] = Workshop;
        Viking.context['workshopPath'] = Workshop;

        assert.equal(
            Viking.urlFor(new Workshop({ id: 10 }), { user: 'username', password: 'password' }),
            window.location.protocol
            + '//username:password@'
            + window.location.hostname
            + (window.location.port ? ':' : '')
            + window.location.port + '/workshops/10'
        );

        delete Viking.context['Workshop'];
        delete Viking.context['workshopPath'];
    });

    test('urlFor(string)', function () {
        assert.equal(
            Viking.urlFor('http://www.example.com'),
            'http://www.example.com'
        );
    });

});
