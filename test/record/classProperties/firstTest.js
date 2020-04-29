import 'mocha';
import * as assert from 'assert';
import * as sinon from 'sinon';
import VikingRecord from 'viking/record';
import { toQuery } from 'viking/support/object';
import { ServerError } from 'viking/errors';


describe('Viking.Record', () => {
    class Ship extends VikingRecord { }

    it('::first', function(done) {
        Ship.first().then((model) => {
            if (model === null) {
                assert.fail("model expected");
                return;
            }
            assert.ok(model instanceof Ship);
            assert.equal(model.readAttribute('id'), 12);
            assert.equal(model.readAttribute('name'), 'Viking');
        }).then(done, done);

        this.withRequest('GET', '/ships', { params: {order: {id: 'desc'}, limit: 1} }, (xhr) => {
            xhr.respond(200, {}, '[{"id": 12, "name": "Viking"}]');
        });
    });

//     test '::first!' do
//     webmock(:get, "/ships", { limit: 1, order: [{id: :asc}] }).to_return({
//       body: [].to_json
//     })

//     assert_raises ActiveRecord::RecordNotFound do
//       Ship.first!
//     end
//   end

    it('::last', function(done) {
        Ship.last().then((model) => {
            if (model === null) {
                assert.fail("model expected");
                return;
            }
            assert.ok(model instanceof Ship);
            assert.equal(model.readAttribute('id'), 12);
            assert.equal(model.readAttribute('name'), 'Viking');
        }).then(done, done);

        this.withRequest('GET', '/ships', { params: {order: {id: 'asc'}, limit: 1} }, (xhr) => {
            xhr.respond(200, {}, '[{"id": 12, "name": "Viking"}]');
        });
    });

});