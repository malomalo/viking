import * as Backbone from 'backbone';
import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../../../../viking';

let Ship = Viking.Model.extend({ hasMany: ['ships'] });
let ShipCollection = Viking.Collection.extend({ model: Ship });

module('Viking.Model#coerceAttributes - hasMany', {
    before() {
        Viking.context['Ship'] = Ship;
        Viking.context['ShipCollection'] = ShipCollection;
    },
    after() {
        delete Viking.context['Ship'];
        delete Viking.context['ShipCollection'];
    }
}, () => {

    test("#coerceAttributes initializes hasMany relation with array of hashes", function () {
        var a = new Ship();

        var result = a.coerceAttributes({ ships: [{ key: 'foo' }, { key: 'bar' }] });
        assert.ok(result.ships instanceof ShipCollection);
        assert.ok(result.ships.models[0] instanceof Ship);
        assert.ok(result.ships.models[1] instanceof Ship);
        assert.deepEqual(result.ships.models[0].attributes.key, 'foo');
        assert.deepEqual(result.ships.models[1].attributes.key, 'bar');
    });

    test("#coerceAttributes() initializes hasMany relation with array of models", function () {
        var a = new Ship();
        var models = [new Ship({ key: 'foo' }), new Ship({ key: 'bar' })];

        var result = a.coerceAttributes({ ships: models });
        assert.ok(result.ships instanceof ShipCollection);
        assert.ok(result.ships.models[0] === models[0]);
        assert.ok(result.ships.models[1] === models[1]);
    });

});
