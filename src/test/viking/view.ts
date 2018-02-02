import * as Backbone from 'backbone';
import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../viking';

module('Viking.View', {
    before: () => {
        Viking.View.templates = window['JST'];
    }
}, () => {

    test('inherits events', () => {
        const View = Viking.View.extend({
            events: {
                click: 'click'
            }
        });
        const SubView = View.extend({
            events: {
                hover: 'hover'
            }
        });

        assert.deepEqual(SubView.prototype.events, {
            click: 'click',
            hover: 'hover'
        });
    });

    test('overrides inherited events', () => {
        const View = Viking.View.extend({
            events: {
                click: 'click',
                hover: 'hover'
            }
        });
        const SubView = View.extend({
            events: {
                hover: 'newHover'
            }
        });

        assert.deepEqual(SubView.prototype.events, {
            click: 'click',
            hover: 'newHover'
        });
    });

    test('calls the original extend', () => {
        assert.expect(1);

        const originalFunction = Backbone.View.extend;

        Backbone.View.extend = () => {
            assert.ok(true);
        };

        Viking.View.extend();
        Backbone.View.extend = originalFunction;
    });

    test('renderTemplate with template set on view', () => {
        const View = Viking.View.extend({
            template: 'a/template/path'
        });

        assert.equal(
            new View().renderTemplate(),
            '<h1>Some Title</h1>'
        );
    });

    test('renderTemplate without template set on view', () => {
        const template = undefined;
        const View = Viking.View.extend({ template });

        assert.throws(
            () => new View().renderTemplate(),
            new Error('Template does not exist: ' + template)
        );
    });

    test("#remove() triggers a 'remove' event on the view", () => {
        assert.expect(1);

        const view = new Viking.View();
        view.on('remove', () => { assert.ok(true); });
        view.remove();
        view.off('remmove');
    });

    test('#bindEl() with a model', () => {
        assert.expect(2);

        const model = new Viking.Model();
        const view = new Viking.View({ model });

        view.$ = (selector) => {
            assert.equal(selector, '.name');
            return {
                html: (html) => { assert.equal(html, 'Dr. DJ'); }
            };
        };

        view.bindEl('name', '.name');
        model.set('name', 'Dr. DJ');
    });

    test('#bindEl() with a model with custom render', () => {
        assert.expect(2);

        const model = new Viking.Model();
        const view = new Viking.View({ model });

        view.$ = (selector) => {
            assert.equal(selector, '.name');
            return {
                html: (html) => { assert.equal(html, 'Name: Dr. DJ'); }
            };
        };

        view.bindEl('name', '.name', (model) => 'Name: ' + model.get('name'));
        model.set('name', 'Dr. DJ');
    });

});

