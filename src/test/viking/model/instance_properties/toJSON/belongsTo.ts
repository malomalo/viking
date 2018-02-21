import * as Backbone from 'backbone';
import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../../../../viking';

let Ship = Viking.Model.extend({ belongsTo: ['ship'] });

module('Viking.Model#toJSON - belongsTo', {
    before() { Viking.context['Ship'] = Ship; },
    after() { delete Viking.context['Ship']; }
}, () => {

    test("#toJSON for belongsTo relation", function () {
        var a = new Ship({ 'ship': { foo: 'bar' }, bat: 'baz' });

        assert.deepEqual(a.toJSON({ include: 'ship' }), {
            bat: 'baz',
            ship_attributes: { foo: 'bar' }
        });
    });

    test('#toJSON sets relation attributes to null if relation is null', function () {
        var a = new Ship({ 'ship': null, bat: 'baz' });

        assert.deepEqual(a.toJSON({ include: 'ship' }), {
            bat: 'baz',
            ship_attributes: null
        });
    });

    test("#toJSON doesn't sets relation attributes to null if relation is falsely and not null", function () {
        var a = new Ship({ 'ship': null, bat: 'baz' });

        assert.deepEqual(a.toJSON({ include: 'ship' }), {
            bat: 'baz',
            ship_attributes: null
        });
    });

});