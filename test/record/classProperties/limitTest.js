import * as assert from 'assert';
// import * as sinon from 'sinon';
import 'mocha';
import VikingModel from 'viking/model';
import { toQuery } from 'viking/support/object';
import { ServerError } from 'viking/errors';


describe('Viking.Model::limit', () => {
    class Model extends VikingModel { }

    it('with limit', function(done) {
        Model.limit(12).then((models) => {
            if (models === null) {
                assert.fail("model expected");
                return;
            }
            assert.ok(Array.isArray(models));
            assert.equal(1, models.length);
            let model = models[0];
            assert.ok(model instanceof VikingModel);
            assert.equal(model.readAttribute('id'), 12);
            assert.equal(model.readAttribute('name'), 'Viking');
        }).then(() => done(), done);

        this.withRequest('GET', '/models', {order: {id: 'desc'}, limit: 12}, (xhr) => {
            xhr.respond(200, {}, '[{"id": 12, "name": "Viking"}]');
        });
    });

});