import * as Backbone from 'backbone';
import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../../../../viking';

module('Viking.Model#toJSON - hasMany', {}, () => {

    // toJSON --------------------------------------------------------------------
    test("#toJSON for hasMany relation", function () {
        let Ship = Viking.Model.extend('ship', {
            hasMany: ['ships']
        });
        let ShipCollection = Viking.Collection.extend({
            model: Ship
        });

        Viking.context['Ship'] = Ship;
        Viking.context['ShipCollection'] = ShipCollection;

        var a = new Ship({ 'ships': [{ foo: 'bar' }], bat: 'baz' });

        assert.deepEqual(a.toJSON({ include: { 'ships': { include: 'ships' } } }), {
            bat: 'baz',
            ships_attributes: [{
                foo: 'bar',
                ships_attributes: []
            }]
        });

        delete Viking.context['Ship'];
        delete Viking.context['ShipCollection'];
    });

});