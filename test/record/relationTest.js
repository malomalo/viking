import 'mocha';
import * as assert from 'assert';
import VikingRecord from 'viking/record';

describe('Viking.Relation', () => {

    class Model extends VikingRecord {}

    describe('events', () => {
        
        it('afterAdd', function (done) {
            const relation = Model.where({parent_id: 11})

            let onceFlag = false
            relation.addEventListener('afterAdd', records => {
                assert.ok(!onceFlag)
                assert.deepEqual(records.map(x => x.readAttribute('id')), [1]);
                onceFlag = true;
            });

            relation.load();

            this.withRequest('GET', '/models', { params: { where: {parent_id: 11}, order: {id: 'desc'} } }, (xhr) => {
                xhr.respond(200, {}, '[{"id": 1}]');
            });
            
            relation.reload().then(() => done(), done);
            

            this.withRequest('GET', '/models', { params: { where: {parent_id: 11}, order: {id: 'desc'} } }, (xhr) => {
                xhr.respond(200, {}, '[{"id": 1}]');
            });
        });
        
        it('afterRemove', function (done) {
            const relation = Model.where({parent_id: 11})

            relation.addEventListener('afterRemove', records => {
                assert.deepEqual(records.map(x => x.readAttribute('id')), [1]);
            });
            
            relation.load().then(() => {
                relation.addWhere({id: 2});
                this.withRequest('GET', '/models', { params: { where: {parent_id: 11, id: 2}, order: {id: 'desc'} } }, (xhr) => {
                    xhr.respond(200, {}, '[{"id": 2}]');
                });
            }).then(done, done);
            
            this.withRequest('GET', '/models', { params: { where: {parent_id: 11}, order: {id: 'desc'} } }, (xhr) => {
                xhr.respond(200, {}, '[{"id": 1}, {"id": 2}]');
            });
        })
        
        it('afterLoad', function (done) {
            const relation = Model.where({parent_id: 11})

            relation.addEventListener('afterLoad', records => {
                assert.deepEqual(records.map(x => x.readAttribute('id')), [1]);
            });
            
            relation.load().then(x => done(), done);

            this.withRequest('GET', '/models', { params: { where: {parent_id: 11}, order: {id: 'desc'} } }, (xhr) => {
                xhr.respond(200, {}, '[{"id": 1}]');
            });
        })
    })
})