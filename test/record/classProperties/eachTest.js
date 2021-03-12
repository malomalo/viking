import 'mocha';
import * as assert from 'assert';
import VikingRecord from 'viking/record';

describe('Viking.Record', () => {
    class Ship extends VikingRecord { }

    it('::each', function(done) {
        let matches = [ {id: 32, name: 'Roger'}, {id: 92, name: 'Bob'} ];

        Ship.each((model) => {
            let m = matches.shift();
            if (m) {
                assert.equal(model.readAttribute('id'), m.id);
                assert.equal(model.readAttribute('name'), m.name);
            } else {
                assert.fail("unexpected model");
            }


        }).then(done, done);

        this.withRequest('GET', '/ships', { params: {order: {id: 'desc'}} }, (xhr) => {
            xhr.respond(200, {}, '[{"id": 32, "name": "Roger"},{"id": 92, "name": "Bob"}]');
        });
    });

});