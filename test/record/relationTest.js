import 'mocha';
import * as assert from 'assert';
import VikingRecord from 'viking/record';

describe('Viking.Relation', () => {

    class Model extends VikingRecord {}

    describe('events', () => {
        
        it('added', function (done) {
            const relation = Model.where({parent_id: 11})

            let onceFlag = false
            relation.addEventListener('added', records => {
                assert.ok(!onceFlag)
                assert.deepEqual(records.map(x => x.readAttribute('id')), [1]);
                onceFlag = true;
            });

            relation.load().then(() => {
                relation.reload().then(() => {
                    assert.ok(true)
                    done()
                }, () => {
                    assert.ok(false)
                });

                this.withRequest('GET', '/models', { params: { where: {parent_id: 11}, order: {id: 'desc'} } }, (xhr) => {
                    xhr.respond(200, {}, '[{"id": 1}]');
                });
            });

            this.withRequest('GET', '/models', { params: { where: {parent_id: 11}, order: {id: 'desc'} } }, (xhr) => {
                xhr.respond(200, {}, '[{"id": 1}]');
            });
        });
        
        it('removed', function (done) {
            const relation = Model.where({parent_id: 11})

            relation.addEventListener('removed', records => {
                assert.deepEqual(records.map(x => x.readAttribute('id')), [1]);
            });
            
            relation.load().then(() => {
                relation.addWhere({id: 2});
                relation.load().then(() => done(), done)
                this.withRequest('GET', '/models', { params: { where: {parent_id: 11, id: 2}, order: {id: 'desc'} } }, (xhr) => {
                    xhr.respond(200, {}, '[{"id": 2}]');
                });
            });
            
            this.withRequest('GET', '/models', { params: { where: {parent_id: 11}, order: {id: 'desc'} } }, (xhr) => {
                xhr.respond(200, {}, '[{"id": 1}, {"id": 2}]');
            });
        })
        
        it('loaded', function (done) {
            const relation = Model.where({parent_id: 11})

            relation.addEventListener('loaded', records => {
                assert.deepEqual(records.map(x => x.readAttribute('id')), [1]);
            });
            
            relation.load().then(() => done(), done);

            this.withRequest('GET', '/models', { params: { where: {parent_id: 11}, order: {id: 'desc'} } }, (xhr) => {
                xhr.respond(200, {}, '[{"id": 1}]');
            });
        })
    })
})