(function () {
    module("Viking.Model#toJSON", {
        setup: function () {
            Ship = Viking.Model.extend({
                hasMany: ['ships'],
                belongsTo: ['ship'],
                schema: {
                    date: {type: 'date'}
                }
            });
            ShipCollection = Viking.Collection.extend({
                model: Ship
            });

            this.ship = new Ship({
                foo: 'bar',

                ship: {bat: 'baz', ship: {bing: 'bong', ships: []}},
                ships: [{ping: 'pong', ship: {bing: 'bong'}}, {ships: []}],

                date: "2013-04-10T21:24:28.000Z"
            });
        },
        teardown: function () {
            delete Ship;
            delete ShipCollection;
        }
    });

    test("#toJSON", function() {
        deepEqual(this.ship.toJSON(), {
            foo: 'bar',
            date: "2013-04-10T21:24:28.000Z"
        });
    });
    
    test("#toJSON supports arrays", function() {
        Ship = Viking.Model.extend({
            coercions: {date: ['Date', {array: true}]}
        });
        
        let ship = new Ship({
            date: ["2013-04-10T21:24:28.000Z"]
        });
        
        deepEqual(ship.toJSON(), {
            date: ["2013-04-10T21:24:28.000Z"]
        });
    });

    test('#toJSON include belongsTo', function() {
        deepEqual(this.ship.toJSON({include: 'ship'}), {
            foo: 'bar',
            date: "2013-04-10T21:24:28.000Z",
            ship_attributes: {bat: 'baz'}
        });
    });

    test("#toJSON doesn't include belongsTo that is undefined", function() {
        // undefined means probably not loaded
        this.ship.unset('ship');

        deepEqual(this.ship.toJSON({include: 'ship'}), {
            foo: 'bar',
            date: "2013-04-10T21:24:28.000Z"
        });
    });

    test("#toJSON includes belongsTo that is null", function() {
        // null probably means loaded, but set to null to remove
        this.ship.set('ship', null);

        deepEqual(this.ship.toJSON({include: 'ship'}), {
            foo: 'bar',
            date: "2013-04-10T21:24:28.000Z",
            ship_attributes: null
        });
    });

    test('#toJSON include belongsTo includes belongsTo', function () {
        deepEqual(this.ship.toJSON({include: {
            ship: {include: 'ship'}
        }}), {
            foo: 'bar',
            date: "2013-04-10T21:24:28.000Z",
            ship_attributes: {
                bat: 'baz',
                ship_attributes: {bing: 'bong'}
            }
        });
    });

    test('#toJSON include belongsTo includes hasMany', function () {
        deepEqual(this.ship.toJSON({include: {
            ship: {include: 'ships'}
        }}), {
            foo: 'bar',
            date: "2013-04-10T21:24:28.000Z",
            ship_attributes: {
                bat: 'baz',
                ships_attributes: []
            }
        });
    });

    test('#toJSON include hasMany', function() {
        deepEqual(this.ship.toJSON({include: 'ships'}), {
            foo: 'bar',
            date: "2013-04-10T21:24:28.000Z",
            ships_attributes: [{ping: 'pong'}, {}]
        });
    });

    test('#toJSON include hasMany includes belongsTo', function () {
        deepEqual(this.ship.toJSON({include: {
            ships: {include: 'ship'}
        }}), {
            foo: 'bar',
            date: "2013-04-10T21:24:28.000Z",
            ships_attributes: [{ping: 'pong', ship_attributes: {bing: 'bong'}}, {}]
        });
    });

    test('#toJSON include hasMany includes hasMany', function () {
        deepEqual(this.ship.toJSON({include: {
            ships: {include: 'ships'}
        }}), {
            foo: 'bar',
            date: "2013-04-10T21:24:28.000Z",
            ships_attributes: [{ping: 'pong', ships_attributes: []}, {ships_attributes: []}]
        });
    });

}());