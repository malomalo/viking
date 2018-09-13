import 'mocha';
import * as assert from 'assert';
import VikingModel from 'viking/model';

describe('Viking.Model', () => {
    class Ship extends VikingModel { }

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

        this.withRequest('GET', '/ships', {order: {id: 'desc'}}, (xhr) => {
            xhr.respond(200, {}, '[{"id": 32, "name": "Roger"},{"id": 92, "name": "Bob"}]');
        });
    });

});