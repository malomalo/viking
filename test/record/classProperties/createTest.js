import 'mocha';
import * as assert from 'assert';
import VikingRecord from 'viking/record';

describe('Viking.Record', () => {
    class Ship extends VikingRecord { }

    describe('::create', () => {

        it('valid record', function(done) {
          Ship.create({name: 'Voyager'}).then((ship) => {
            if (ship === null) {
                assert.fail("model expected");
                return;
            }
            assert.equal(ship.isNewRecord(), false);
            assert.equal(ship.readAttribute('id'), 12);
          }).then(done, done);
      
          this.withRequest('POST', '/ships', { body: {ship: {name: 'Voyager'}} }, (xhr) => {
              xhr.respond(200, {}, '{"id": 12, "name": "Viking"}');
          });
        });
    
        it('with include params', function(done) {
          Ship.create({name: 'Voyager'}, {params: { include: 'account' }}).then((ship) => {
            if (ship === null) {
                assert.fail("model expected");
                return;
            }
            assert.equal(ship.isNewRecord(), false);
            assert.equal(ship.readAttribute('id'), 12);
          }).then(done, done);
      
          this.withRequest('POST', '/ships', { body: {ship: {name: 'Voyager'} }, params: { include: 'account' } }, (xhr) => {
              xhr.respond(200, {}, '{"id": 12, "name": "Viking"}');
          });
        });
    
        it('invalid record', function(done) {

          Ship.create({name: 'Voyager'}).then((ship) => {
            if (ship === null) {
                assert.fail("model expected");
                return;
            }
            assert.equal(ship.isNewRecord(), true);
            assert.equal(ship.readAttribute('id'), null);
            assert.deepEqual({flag: "required"}, ship.errors)
          }).then(done, done);
      
          this.withRequest('POST', '/ships', { body: {ship: {name: 'Voyager'} } }, (xhr) => {
              xhr.respond(400, {'Content-Type': "application/json"}, '{"name": "Viking", "errors": {"flag": "required"}}');
          });

        });
    })


});