import * as assert from 'assert';
import VikingRecord from '@malomalo/viking/record';


describe('Viking.Record::limit', () => {
    class Model extends VikingRecord { }

    it('with limit', function(done) {
        Model.limit(12).load((models) => {
            if (models === null) {
                assert.fail("model expected");
                return;
            }
            assert.ok(Array.isArray(models));
            assert.equal(1, models.length);
            let model = models[0];
            assert.ok(model instanceof VikingRecord);
            assert.equal(model.readAttribute('id'), 12);
            assert.equal(model.readAttribute('name'), 'Viking');
        }).then(() => done(), done);

        this.withRequest('GET', '/models', { params: {order: {id: 'desc'}, limit: 12} }, (xhr) => {
            xhr.respond(200, {}, '[{"id": 12, "name": "Viking"}]');
        });
    });

});