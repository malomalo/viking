import * as assert from 'assert';
// import * as sinon from 'sinon';
import 'mocha';
import VikingModel from 'viking/model';
import { toQuery } from 'viking/support/object';
import { ServerError } from 'viking/errors';
import { hasMany, belongsTo } from 'viking/record/associations';

describe('Viking.Model::instantiate', () => {

    it('with attributes', () => {
        class Ship extends VikingModel { }
        
        let ship = Ship.instantiate({
            id: 1,
            name: 'Galactica'
        })
        
        assert.equal(ship.readAttribute('id'), 1);
        assert.equal(ship.readAttribute('name'), 'Galactica');
    });
    
    // it('with belongsTo Association', () => {
    //     class Fleet extends VikingModel { }
    //     class Ship extends VikingModel {
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
    
    it('with hasMany Association', (done) => {
        class Ship extends VikingModel { }
        class Fleet extends VikingModel {
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
        
        fleet.ships.load().then((ships) => {
            assert.equal(1, ships.length);
            assert.equal(ships[0].readAttribute('id'), 1);
            assert.equal(ships[0].readAttribute('name'), 'Galactica');
        }).then(() => { done(); }, done);

    });

});