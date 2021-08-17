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
        
        it('afterRemove', function (done) {
            const relation = Model.where({parent_id: 11})

            relation.addEventListener('afterRemove', records => {
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
        
        it('afterLoad', function (done) {
            const relation = Model.where({parent_id: 11})

            relation.addEventListener('afterLoad', records => {
                assert.deepEqual(records.map(x => x.readAttribute('id')), [1]);
            });
            
            relation.load().then(() => done(), done);

            this.withRequest('GET', '/models', { params: { where: {parent_id: 11}, order: {id: 'desc'} } }, (xhr) => {
                xhr.respond(200, {}, '[{"id": 1}]');
            });
        })
    })
    
    describe('order', () => {
        it('single key', function () {
            let relation = Model.where({parent_id: 11}).order('created_at')
            relation = relation.reorder({created_at: 'desc'})
            
            relation.load()
            assert.ok(this.findRequest('GET', '/models', { params: { where: {parent_id: 11}, order: {created_at: 'desc'} } }));
        })
        
        it('hash', function () {
            let relation = Model.where({parent_id: 11}).order({created_at: 'asc'})
            
            relation.load()
            assert.ok(this.findRequest('GET', '/models', { params: { where: {parent_id: 11}, order: {created_at: 'asc'} } }));
        })
    })
    
    describe('reorder', () => {
        it('single key', function () {
            let relation = Model.where({parent_id: 11}).order('created_at')
            relation = relation.reorder('book_count')
            
            relation.load()
            assert.ok(this.findRequest('GET', '/models', { params: { where: {parent_id: 11}, order: {book_count: 'desc'} } }));
        })
        
        it('hash', function () {
            let relation = Model.where({parent_id: 11}).order({created_at: 'asc'})
            relation = relation.reorder({created_at: 'desc'})
            
            relation.load()
            assert.ok(this.findRequest('GET', '/models', { params: { where: {parent_id: 11}, order: {created_at: 'desc'} } }));
        })
    })
    
    describe('add', () => {
        it('single record', async function () {
            let relation = Model.where({parent_id: 11})
            relation.load()
            await this.withRequest('GET', '/models', { params: { where: {parent_id: 11}, order: {id: 'desc'} } }, (xhr) => {
                xhr.respond(200, {}, '[{"id": 1}, {"id": 2}]');
            });
            
            relation.add(new Model({id: 3}))
            
            assert.deepEqual(relation.target.map(x => x.readAttribute('id')), [1, 2, 3])
            
        })
    })
    
    describe('remove', () => {
        it('single record', async function () {
            let relation = Model.where({parent_id: 11})
            relation.load()
            await this.withRequest('GET', '/models', { params: { where: {parent_id: 11}, order: {id: 'desc'} } }, (xhr) => {
                xhr.respond(200, {}, '[{"id": 1}, {"id": 2}]');
            });
            
            await relation.remove(relation.target[1])
            assert.deepEqual(relation.target.map(x => x.readAttribute('id')), [1])
            
        })
    })
})