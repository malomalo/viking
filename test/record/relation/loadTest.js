import * as assert from 'assert';
import VikingRecord from '@malomalo/viking/record';

describe('Viking.Relation', () => {

    class Model extends VikingRecord {}

    describe('load', () => {
        
        it('coalesces loads when a inflight load is happening', function (done) {
            const relation = Model.where({parent_id: 11})
            const callback_order = [];
            
            const p1 = relation.load().then(() => { callback_order.push(1); });
            const p2 = relation.load().then(() => { callback_order.push(2); });

            this.withRequest('GET', '/models', { params: { where: {parent_id: 11}, order: {id: 'desc'} } }, (xhr) => {
                xhr.respond(200, {}, '[{"id": 1}]');
            });
            
            Promise.all([p1,p2]).then(() => {
                assert.deepEqual(callback_order, [1,2]);
                done();
            });
        });

    })
    
})