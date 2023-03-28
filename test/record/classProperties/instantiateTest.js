import * as assert from 'assert';
// import * as sinon from 'sinon';
import VikingRecord from '@malomalo/viking/record';
import { toQuery } from '@malomalo/viking/support/object';
import { ServerError } from '@malomalo/viking/errors';
import { hasMany, belongsTo } from '@malomalo/viking/record/associations';

describe('Viking.Record::instantiate', () => {

    it('with attributes', () => {
        class Ship extends VikingRecord { }
        
        let ship = Ship.instantiate({
            id: 1,
            name: 'Galactica'
        })
        
        assert.equal(ship.readAttribute('id'), 1);
        assert.equal(ship.readAttribute('name'), 'Galactica');
    });
    
    // it('with belongsTo Association', () => {
    //     class Fleet extends VikingRecord { }
    //     class Ship extends VikingRecord {
    //         static associations = [belongsTo(Fleet)];
    //     }
    //
    //     let ship = Ship.instantiate({
    //         id: 1,
    //         name: 'Galactica',
    //         fleet: {
    //             id: 1,
    //             name: 'Colonial Fleet'
    //         }
    //     })
    //
    //     assert.equal(ship.readAttribute('id'), 1);
    //     assert.equal(ship.readAttribute('name'), 'Galactica');
    //
    //     assert.equal(ship.readAttribute('id'), 1);
    //     assert.equal(ship.readAttribute('name'), 'Galactica');
    // });
    
    it('with hasMany Association', async () => {
        class Ship extends VikingRecord { }
        class Fleet extends VikingRecord {
            static associations = [hasMany(Ship)];
        }


        let fleet = Fleet.instantiate({
            id: 1,
            name: 'Colonial Fleet',
            ships: [
                {
                    id: 1,
                    name: 'Galactica'
                }
            ]
        });

        assert.equal(fleet.readAttribute('id'), 1);
        assert.equal(fleet.readAttribute('name'), 'Colonial Fleet');
        
        let ships = await fleet.ships.toArray()
        assert.equal(1, ships.length);
        assert.equal(ships[0].readAttribute('id'), 1);
        assert.equal(ships[0].readAttribute('name'), 'Galactica');
    });

});