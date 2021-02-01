import 'mocha';
import * as assert from 'assert';
import VikingRecord from 'viking/record';

describe('Viking.Relation', () => {
    class Model extends VikingRecord {}
    describe('events', () => {
        it('add', function (done) {
            const relation = Model.where({parent_id: 11})

            relation.addEventListener('add', record => {
                assert.equal(record.readAttribute('id'), 1)
                done()
            })
            
            relation.load()

            this.withRequest('GET', '/models', { params: { where: {parent_id: 11}, order: {id: 'desc'} } }, (xhr) => {
                xhr.respond(200, {}, '[{"id": 1}]');
            });
        })
        
        it('remove', function (done) {
            const relation = Model.where({parent_id: 11})

            relation.addEventListener('remove', record => {
                assert.equal(record.readAttribute('id'), 1)
                done()
            });
            
            relation.load().then(() => {
                relation.addWhere({id: 2});
                relation.reload();
                this.withRequest('GET', '/models', { params: { where: {parent_id: 11, id: 2}, order: {id: 'desc'} } }, (xhr) => {
                    xhr.respond(200, {}, '[{"id": 2}]');
                });
            }, done);
            this.withRequest('GET', '/models', { params: { where: {parent_id: 11}, order: {id: 'desc'} } }, (xhr) => {
                xhr.respond(200, {}, '[{"id": 1}, {"id": 2}]');
            });
        })
    })
})