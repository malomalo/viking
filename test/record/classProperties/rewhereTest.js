import 'mocha';
import * as assert from 'assert';
import VikingRecord from 'viking/record';
import Relation from 'viking/record/relation';
import { toQuery } from 'viking/support/object';
import { ServerError } from 'viking/errors';

describe('Viking.Record::rewhere', () => {

    class Ship extends VikingRecord { }
    
    it('::where(predicate)', function(done) {
        let relation = Ship.where({id: [999]});
        
        relation.rewhere({id: [111, 888]}).load().then((models) => {
            assert.equal(models.length, 1);
            assert.ok(models[0] instanceof Ship);
            assert.equal(models[0].readAttribute('id'), 111);
        }).then(() => { done() }, done);
        
        this.withRequest('GET', '/ships', { params: { where: {id: [111, 888]}, order: {id: 'desc'} } }, (xhr) => {
            xhr.respond(200, {}, '[{"id": 111}]');
        });
    });
});