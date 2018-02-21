import * as Backbone from 'backbone';
import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../../../viking';

let ship: any;
let Ship: any;

module('Viking.Model#toJSON', {
    before() {
        Ship = Viking.Model.extend('ship', {
            hasMany: ['ships'],
            belongsTo: ['ship'],
            schema: {
                date: { type: 'date' }
            }
        });
        const ShipCollection = Viking.Collection.extend({
            model: Ship
        });

        Viking.context['Ship'] = Ship;
        Viking.context['ShipCollection'] = ShipCollection;
    },

    beforeEach: function () {
        ship = new Ship({
            foo: 'bar',

            ship: { bat: 'baz', ship: { bing: 'bong', ships: [] } },
            ships: [{ ping: 'pong', ship: { bing: 'bong' } }, { ships: [] }],

            date: "2013-04-10T21:24:28.000Z"
        });
    },

    after() {
        delete Viking.context['Ship'];
        delete Viking.context['ShipCollection'];
    }

}, () => {
    test("#toJSON", function () {
        assert.deepEqual(ship.toJSON(), {
            foo: 'bar',
            date: "2013-04-10T21:24:28.000Z"
        });
    });

    test("#toJSON supports arrays", function () {
        let Ship = Viking.Model.extend({
            coercions: { date: ['Date', { array: true }] }
        });

        var ship = new Ship({
            date: ["2013-04-10T21:24:28.000Z"]
        });

        assert.deepEqual(ship.toJSON(), {
            date: ["2013-04-10T21:24:28.000Z"]
        });
    });

    test('#toJSON include belongsTo', function () {
        assert.deepEqual(ship.toJSON({ include: 'ship' }), {
            foo: 'bar',
            date: "2013-04-10T21:24:28.000Z",
            ship_attributes: { bat: 'baz' }
        });
    });

    test("#toJSON doesn't include belongsTo that is undefined", function () {
        // undefined means probably not loaded
        ship.unset('ship');

        assert.deepEqual(ship.toJSON({ include: 'ship' }), {
            foo: 'bar',
            date: "2013-04-10T21:24:28.000Z"
        });
    });

    test("#toJSON includes belongsTo that is null", function () {
        // null probably means loaded, but set to null to remove
        ship.set('ship', null);

        assert.deepEqual(ship.toJSON({ include: 'ship' }), {
            foo: 'bar',
            date: "2013-04-10T21:24:28.000Z",
            ship_attributes: null
        });
    });

    test('#toJSON include belongsTo includes belongsTo', function () {
        assert.deepEqual(ship.toJSON({
            include: {
                ship: { include: 'ship' }
            }
        }), {
                foo: 'bar',
                date: "2013-04-10T21:24:28.000Z",
                ship_attributes: {
                    bat: 'baz',
                    ship_attributes: { bing: 'bong' }
                }
            });
    });

    test('#toJSON include belongsTo includes hasMany', function () {
        assert.deepEqual(ship.toJSON({
            include: {
                ship: { include: 'ships' }
            }
        }), {
                foo: 'bar',
                date: "2013-04-10T21:24:28.000Z",
                ship_attributes: {
                    bat: 'baz',
                    ships_attributes: []
                }
            }
        );
    });

    test('#toJSON include hasMany', function () {
        assert.deepEqual(ship.toJSON({ include: 'ships' }), {
            foo: 'bar',
            date: "2013-04-10T21:24:28.000Z",
            ships_attributes: [{ ping: 'pong' }, {}]
        });
    });

    test('#toJSON include hasMany includes belongsTo', function () {
        assert.deepEqual(ship.toJSON({
            include: {
                ships: { include: 'ship' }
            }
        }), {
                foo: 'bar',
                date: "2013-04-10T21:24:28.000Z",
                ships_attributes: [{ ping: 'pong', ship_attributes: { bing: 'bong' } }, {}]
            });
    });

    test('#toJSON include hasMany includes hasMany', function () {
        assert.deepEqual(ship.toJSON({
            include: {
                ships: { include: 'ships' }
            }
        }), {
                foo: 'bar',
                date: "2013-04-10T21:24:28.000Z",
                ships_attributes: [{ ping: 'pong', ships_attributes: [] }, { ships_attributes: [] }]
            });
    });

});
