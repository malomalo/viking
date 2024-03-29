import * as assert from 'assert';
import 'mocha';
import VikingRecord from 'viking/record';
import { hasAndBelongsToMany } from 'viking/record/associations';
import * as Errors from 'viking/errors';

describe('Viking.Record::associations', () => {

    class Parent extends VikingRecord { }
    class Model extends VikingRecord {
        static associations = [hasAndBelongsToMany(Parent)];
    }

    describe('hasAndBelongsToMany(Model)', () => {
        
        describe('.load()', () => {
            it("load association", function(done) {
                let model = new Model({id: 24});

                model.parents.toArray().then((models) => {
                    assert.equal(models.length, 1);
                    let model = models[0];
                    assert.ok(model instanceof Parent);
                    assert.equal(model.readAttribute('id'), 2);
                    assert.equal(model.readAttribute('name'), 'Viking');
                }).then(done, done);

                this.withRequest('GET', '/parents', { params: {where: {models_parents: {model_id: 24}}, order: {id: 'desc'}} }, (xhr) => {
                    xhr.respond(200, {}, '[{"id": 2, "name": "Viking"}]');
                });
            });

            it("sends one network request and return the same result to all callers of load while request is in flight", function(done) {
                let model = new Model({id: 24});

                let a = model.parents.load();
                let b = model.parents.load();
                
                this.withRequest('GET', '/parents', { params: {where: {models_parents: {model_id: 24}}, order: {id: 'desc'}} }, (xhr) => {
                    xhr.respond(200, {}, '[{"id": 2, "name": "Viking"}]');
                });
                
                Promise.all([a, b]).then((values) => {
                    assert.deepStrictEqual(values[0], values[1]);
                    
                    // Ensure that these are the same exact array
                    values[0].pop()
                    assert.deepStrictEqual(values[0], []);
                    assert.deepStrictEqual(values[0], []);
                }).then(done, done);
            });
        });
        
        it("reload association", function (done) {
            let model = new Model({id: 24});
            
            model.parents.toArray().then(parents => {
                model.association('parents').reload().then(secondLoadParents => {
                    assert.deepEqual(parents.map(x => x.cid), secondLoadParents.map(x => x.cid))
                    assert.deepEqual(['Viking 2'], secondLoadParents.map(x => x.readAttribute('name')));
                    assert.deepEqual([{}], secondLoadParents.map(x => x.changes()));
                }).then(done, done);
                
                this.withRequest('GET', '/parents', { params: {where: {models_parents: {model_id: 24}}, order: {id: 'desc'}} }, (xhr) => {
                    xhr.respond(200, {}, '[{"id": 2, "name": "Viking 2"}]');
                });
            })
            
            this.withRequest('GET', '/parents', { params: {where: {models_parents: {model_id: 24}}, order: {id: 'desc'}} }, (xhr) => {
                xhr.respond(200, {}, '[{"id": 2, "name": "Viking"}]');
            });
        })

        describe('assigning the association', () => {

            it('to a model with an id', async function() {
                let model = new Model({id: 13});
                let parents = [new Parent(), new Parent()];
                model.parents = parents;

                assert.ok(model._associations.parents.loaded);
                assert.deepStrictEqual(model._associations.parents.target, parents);
                let models = await model.parents.toArray();
                assert.deepStrictEqual(models, parents);
                assert.equal(this.requests.length, 0);
            });

        });
        
        describe('addBang', () => {
            it('sends request', function () {
                let model = Model.instantiate({id: 24})
                let parent = Parent.instantiate({id: 11})
                model.association('parents').addBang(parent)
        
                assert.equal(this.requests[0].url, 'http://example.com/models/24/parents/11')
                assert.equal(this.requests[0].method, 'POST')
            })
    
            it('updates target when loaded and record persisted', function (done) {
                let model = Model.instantiate({id: 24})
                let parent1 = Parent.find(11)
                
                
                model.parents.load().then(() => {
                    parent1.then((p) => {
                        model.association('parents').addBang(p).then(() => {
                            assert.deepStrictEqual(model.parents.target.map(x => x.readAttribute('id')), [11])
                        }).then(done, done)
                    
                        this.withRequest('POST', '/models/24/parents/11', {}, (xhr) => {
                            xhr.respond(201, {}, null);
                        });
                    }, done)
                
                    this.withRequest('GET', '/parents', { params: {where: {id: 11}, order: {id: 'desc'}, limit: 1} }, (xhr) => {
                        xhr.respond(200, {}, '[{"id": 11, "name": "Parent1"}]');
                    });
                })
                
                this.withRequest('GET', '/parents', { params: {where: {models_parents: {model_id: 24}}, order: {id: 'desc'}} }, (xhr) => {
                    xhr.respond(200, {}, '[]');
                });
            })
            
            it('doesnt update target when not loaded', function (done) {
                let model = Model.instantiate({id: 24})
                let parent1 = Parent.instantiate({id: 11})
                
                model.association('parents').addBang(parent1).then(() => {
                    assert.deepStrictEqual(model.parents.target, [])
                    assert.ok(!model.parents.loaded)
                }).then(done, done)
        
                this.withRequest('POST', '/models/24/parents/11', {}, (xhr) => {
                    xhr.respond(201, {}, null);
                });
            })
            
            it('creates target', function (done) {
                let model = Model.instantiate({id: 24})
                let parent = new Parent({name: 'Tim Smith'})

                model.parents.load().then(() => {
                    model.parents.addBang(parent).then(() => {
                        assert.equal(parent.readAttribute('model_id'), 24)
                        assert.equal(parent.readAttribute('name'), 'Tim Smith Modified')
                        assert.equal(model.parents.target.length, 1)
                        done()
                    }, done)
            
                    this.withRequest('POST', '/models/24/parents', {
                        name: 'Tim Smith'
                    }, (xhr) => {
                        xhr.respond(201, {}, '{"id": 1, "name": "Tim Smith Modified", "model_id": 24}');
                    });
                })
                
                this.withRequest('GET', '/parents', { params: {where: {models_parents: {model_id: 24}}, order: {id: 'desc'}} }, (xhr) => {
                    xhr.respond(200, {}, '[]');
                });
            });
            
            it('raises error when parent model is not persisted', function () {
                let model = new Model({id: 24})
                let parent = new Parent({name: 'Tim Smith'})

                assert.throws( () => model.association('parents').addBang(parent), Errors.RecordNotSaved );
            });
        })

        describe('removeBang', () => {
            it('sends request', function () {
                let model = new Model({id: 24})
                let parent = new Parent({id: 11})
                model.parent = [parent]
                model.association('parents').removeBang(parent)
        
                assert.equal(this.requests[0].url, 'http://example.com/models/24/parents/11')
                assert.equal(this.requests[0].method, 'DELETE')
            })
    
            it('updates target', function (done) {
                let model = new Model({id: 24})
                let parent = new Parent({id: 11})
                model.parent = [parent]

                model.parents.removeBang(parent).then(() => {
                    assert.equal(model.parents.target.length, 0)
                }).then(done, done)
        
                this.withRequest('DELETE', '/models/24/parents/11', {}, (xhr) => {
                    xhr.respond(201, {}, null);
                });
            })
        })
    });
    
    describe('hasAndBelongsToMany(Parent, scope)', () => {
        it("ordering", function() {
            class Parent extends VikingRecord { }
            class Model extends VikingRecord {
                static associations = [hasAndBelongsToMany(Parent, (r) => r.order({created_at: 'asc'}))];
            }
        
            let model = new Model({id: 24});

            model.parents.load();
            assert.ok(this.findRequest('GET', '/parents', {
                params: {where: {models_parents: {model_id: 24}}, order: {created_at: 'asc'}}
            }));
        });
    });
    
    describe('hasAndBelongsToMany(Parent, {foriegnKey: KEY})', () => {
        class Parent extends VikingRecord { }
        class Model extends VikingRecord {
            static associations = [hasAndBelongsToMany(Parent, {foreignKey: 'modal_id'})];
        }

        it("load association", function(done) {
            let model = new Model({id: 24});
            
            model.parents.toArray().then((models) => {
                assert.equal(models.length, 1);
                let model = models[0];
                assert.ok(model instanceof Parent);
                assert.equal(model.readAttribute('id'), 24);
                assert.equal(model.readAttribute('name'), 'Viking');
            }).then(done, done);
            this.withRequest('GET', '/parents', { params: {where: {models_parents: {modal_id: 24}}, order: {id: 'desc'}} }, (xhr) => {
                xhr.respond(200, {}, '[{"id": 24, "name": "Viking"}]');
            });
        });
    });
    
    describe('hasAndBelongsToMany(Parent, {joinTable: KEY})', () => {
        class Parent extends VikingRecord { }
        class Model extends VikingRecord {
            static associations = [hasAndBelongsToMany(Parent, {joinTable: 'maxium_join'})];
        }

        it("load association", function(done) {
            let model = new Model({id: 24});
            
            model.parents.toArray().then((models) => {
                assert.equal(models.length, 1);
                let model = models[0];
                assert.ok(model instanceof Parent);
                assert.equal(model.readAttribute('id'), 24);
                assert.equal(model.readAttribute('name'), 'Viking');
            }).then(done, done);
            this.withRequest('GET', '/parents', { params: {where: {maxium_join: {model_id: 24}}, order: {id: 'desc'}} }, (xhr) => {
                xhr.respond(200, {}, '[{"id": 24, "name": "Viking"}]');
            });
        });
    });

});