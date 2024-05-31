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
                relation.applyWhere({id: 2});
                relation.load().then(() => done(), done)
                this.withRequest('GET', '/models', { params: { where: {parent_id: 11, id: 2}, order: {id: 'desc'} } }, (xhr) => {
                    xhr.respond(200, {}, '[{"id": 2}]');
                });
            });
            
            this.withRequest('GET', '/models', { params: { where: {parent_id: 11}, order: {id: 'desc'} } }, (xhr) => {
                xhr.respond(200, {}, '[{"id": 1}, {"id": 2}]');
            });
        })
        
        it('beforeSetTarget', function (done) {
            const relation = Model.where({parent_id: 11})

            relation.addEventListener('beforeSetTarget', response => {
                response[0].attributes.name = "foo"
            });
            relation.addEventListener('afterAdd', records => {
                assert.deepEqual(records.map(x => x.readAttribute('name')), ['foo']);
            });
            
            relation.load().then(() => done(), done)
            
            this.withRequest('GET', '/models', { params: { where: {parent_id: 11}, order: {id: 'desc'} } }, (xhr) => {
                xhr.respond(200, {}, '[{"id": 1}]');
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

        
        describe('changed', function () {
            it('*', function (done) {
                const relation = Model.where({parent_id: 11})

                relation.addEventListener('changed', (attribute, newValue) => {
                    assert.equal('limit', attribute);
                    assert.equal(11, newValue);
                    done()
                });
            
                relation.setLimit(11);
            })
        
            it('changed:limit', function (done) {
                const relation = Model.where({parent_id: 11})

                relation.addEventListener('changed:limit', (newValue) => {
                    assert.equal(11, newValue);
                    done()
                });
            
                relation.setLimit(11);
            })
            
            it('changed:offset', function (done) {
                const relation = Model.where({parent_id: 11})

                relation.addEventListener('changed:offset', (newValue) => {
                    assert.equal(2, newValue);
                    done()
                });
            
                relation.setOffset(2);
            })
            
            it('changed:order', function (done) {
                const relation = Model.where({parent_id: 11})

                relation.addEventListener('changed:order', (newValue) => {
                    assert.deepEqual(newValue, {timestamp: 'desc'});
                    done()
                });
            
                relation.setOrder({timestamp: 'desc'});
            })
            
            it('changed:where', function (done) {
                const relation = Model.where({parent_id: 11})

                relation.addEventListener('changed:where', (newValue) => {
                    assert.deepEqual(newValue, {created_on: {gt: '2020-01-01'}});
                    done()
                });
            
                relation.setWhere({created_on: {gt: '2020-01-01'}});
            })
            
            it('changed:distinct', function (done) {
                const relation = Model.where({parent_id: 11})

                relation.addEventListener('changed:distinct', (newValue) => {
                    assert.equal(newValue, true);
                    done()
                });
            
                relation.setDistinct();
            })
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
    
    describe('distinct', () => {
        it('no key', function () {
            let relation = Model.where({parent_id: 11}).distinct()
            
            relation.load()
            assert.ok(this.findRequest('GET', '/models', { params: { where: {parent_id: 11}, order: {id: 'desc'}, distinct: true } }));
        })
        
        it('single key', function () {
            let relation = Model.where({parent_id: 11}).distinct('session_id')
            
            relation.load()
            assert.ok(this.findRequest('GET', '/models', { params: { where: {parent_id: 11}, order: {id: 'desc'}, distinct_on: ['session_id'] } }));
        })
        
        it('dinstinct then spawn', function () {
            let relation = Model.where({parent_id: 11}).distinct().order('created_at')
            
            relation.load()
            assert.ok(this.findRequest('GET', '/models', { params: { where: {parent_id: 11}, order: {created_at: 'desc'}, distinct: true } }));
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
    
    describe('setTarget', () => {
        it('sets collection', function (done) {
            let relation = Model.where({parent_id: 11})
            relation.load().then(records => {
                assert.deepEqual([relation, relation], records.map(r => r.collection))
            }).finally(done)
            this.withRequest('GET', '/models', { params: { where: {parent_id: 11}, order: {id: 'desc'} } }, (xhr) => {
                xhr.respond(200, {}, '[{"id": 1}, {"id": 2}]');
            });
        })
    })
})