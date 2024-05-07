import 'mocha';
import * as assert from 'assert';
import VikingRecord from 'viking/record';

describe('Viking.Relation', () => {

    class Model extends VikingRecord {}

    describe('load', () => {
        
        it('coalesces loads when a inflight load is happening', function (done) {
            const relation = Model.where({parent_id: 11})
            const callback_order = [];
            let beforeLoadCallbackCounter = 0;
            
            relation.addEventListener('beforeLoad', () => { beforeLoadCallbackCounter += 1 });
            const p1 = relation.load().then(() => { callback_order.push(1); });
            const p2 = relation.load().then(() => { callback_order.push(2); });

            this.withRequest('GET', '/models', { params: { where: {parent_id: 11}, order: {id: 'desc'} } }, (xhr) => {
                xhr.respond(200, {}, '[{"id": 1}]');
            });
            
            Promise.all([p1,p2]).then(() => {
                assert.strictEqual(beforeLoadCallbackCounter, 1);
                assert.deepEqual(callback_order, [1,2]);
            }).then(done, done);
        });

    })

    describe('reload', () => {
        
        it('cancels inflight request and fullfilles all promises with the new request', function (done) {
            const relation = Model.where({parent_id: 11})
            const callback_order = [];
            
            const p1 = relation.load().then((records) => { callback_order.push(1); return records; });
            const p2 = relation.reload().then((records) => { callback_order.push(2); return records; });

            this.withRequest('GET', '/models', { params: { where: {parent_id: 11}, order: {id: 'desc'} } }, (xhr) => {
                xhr.respond(200, {}, '[{"id": 3}]');
            });
            
            Promise.all([p1,p2]).then((v) => {
                assert.strictEqual(v[0][0], v[1][0]);
                assert.deepEqual(v.flat().map((r) => r.readAttribute('id')), [3, 3]);
                assert.deepEqual(callback_order, [1,2]);
            }).then(done, done);
        });

    })
    
})