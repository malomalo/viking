import * as assert from 'assert';
import 'mocha';
import VikingRecord from 'viking/record';
import { hasMany } from 'viking/record/associations';
import * as Errors from 'viking/errors';

describe('Viking.Record::associations', () => {
    describe('hasMany(Parent)', () => {
        class Parent extends VikingRecord { }
        class Model extends VikingRecord {
            static associations = [hasMany(Parent)];
        }

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

                this.withRequest('GET', '/parents', { params: {where: {model_id: 24}, order: {id: 'desc'}} }, (xhr) => {
                    xhr.respond(200, {}, '[{"id": 2, "name": "Viking"}]');
                });
            });

            it("sends one network request and return the same result to all callers of load while request is in flight", function(done) {
                let model = new Model({id: 24});

                let a = model.parents.load();
                let b = model.parents.load();
                
                this.withRequest('GET', '/parents', { params: {where: {model_id: 24}, order: {id: 'desc'}} }, (xhr) => {
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
        
        it('coalesces loads when a inflight load is happening', function (done) {
            let callback_order = [];
            let model = new Model({id: 24});

            let p1 = model.parents.load().then(() => { callback_order.push(1); });
            let p2 = model.parents.load().then(() => { callback_order.push(2); });
            
            this.withRequest('GET', '/parents', { params: {where: {model_id: 24}, order: {id: 'desc'}} }, (xhr) => {
                xhr.respond(200, {}, '[{"id": 2, "name": "Viking"}]');
            });
            
            Promise.all([p1,p2]).then(() => {
                assert.deepEqual(callback_order, [1,2]);
            }).then(done, done);
        });
        
        it("reload association", function (done) {
            let model = new Model({id: 24});
            model.parents.toArray().then(parents => {
                model.association('parents').reload().then(secondLoadParents => {
                    assert.deepEqual(parents.map(x => x.cid), secondLoadParents.map(x => x.cid))
                    assert.deepEqual(['Viking 2'], secondLoadParents.map(x => x.readAttribute('name')));
                    assert.deepEqual([{}], secondLoadParents.map(x => x.changes()));
                }).then(done, done);
                
                assert.ok(this.findRequest('GET', '/parents', { params: {where: {model_id: 24}, order: {id: 'desc'}} }));
                
                this.withRequest('GET', '/parents', { params: {where: {model_id: 24}, order: {id: 'desc'}} }, (xhr) => {
                    xhr.respond(200, {}, '[{"id": 2, "name": "Viking 2"}]');
                });
            })
            
            this.withRequest('GET', '/parents', { params: {where: {model_id: 24}, order: {id: 'desc'}} }, (xhr) => {
                xhr.respond(200, {}, '[{"id": 2, "name": "Viking"}]');
            });
        })
        
        it("add to association", async function () {
            let model = new Model()
            let parent = new Parent()
            let parent2 = new Parent()
            model.parents.instantiate([])
            
            await model.parents.add(parent)
            await model.parents.add(parent2)
            assert.deepEqual([parent.cid, parent2.cid], model.parents.target.map(x => x.cid))
        })
        
        it("forEach iterates over the association", function(done) {
            let model = new Model({id: 24});
            let loaded_parents = [];

            model.parents.forEach((p) => { loaded_parents.push(p) }).then(() => {
                assert.equal(loaded_parents.length, 2);
                assert.ok(loaded_parents[0] instanceof Parent);
                assert.equal(loaded_parents[0].readAttribute('id'), 2);
                assert.equal(loaded_parents[0].readAttribute('name'), 'Viking A');
                
                assert.ok(loaded_parents[1] instanceof Parent);
                assert.equal(loaded_parents[1].readAttribute('id'), 3);
                assert.equal(loaded_parents[1].readAttribute('name'), 'Viking B');
            }).then(done, done);

            this.withRequest('GET', '/parents', { params: {where: {model_id: 24}, order: {id: 'desc'}} }, (xhr) => {
                xhr.respond(200, {}, '[{"id": 2, "name": "Viking A"},{"id": 3, "name": "Viking B"}]');
            });
        });

        it("map maps over the association", function(done) {
            let model = new Model({id: 24});

            model.parents.map((p) => p.readAttribute('id')).then((ids) => {
                assert.deepEqual(ids, [2,3]);
            }).then(done, done);

            this.withRequest('GET', '/parents', { params: {where: {model_id: 24}, order: {id: 'desc'}} }, (xhr) => {
                xhr.respond(200, {}, '[{"id": 2, "name": "Viking A"},{"id": 3, "name": "Viking B"}]');
            });
        });

        describe('assigning the association', () => {
            it('to a model with an id', async function() {
                let model = new Model({id: 13});
                let parents = [new Parent(), new Parent()];
                model.parents = parents;

                parents.forEach((m) => { assert.equal(m.readAttribute('model_id'), 13); });
                assert.ok(model._associations.parents.loaded);
                assert.deepStrictEqual(model._associations.parents.target, parents);
                assert.deepStrictEqual(await model.parents.toArray(), parents);
                assert.equal(this.requests.length, 0);
            });

            // it('to a model without an id', function(done) {
                //     let model = new Model();
            //     let parent = new Parent();
            //     model.parent = parent;

            //     assert.equal(model.readAttribute('parent_id'), null);
            //     assert.ok(model._associations.parent.loaded);
            //     assert.strictEqual(model._associations.parent.target, parent);
            //     model.parent.then((model) => {
            //         assert.strictEqual(model, parent);
            //         done();
            //     });
            //     assert.equal(this.requests.length, 0);
            // });

            // it('to null', function(done) {
                //     let model = new Model();
            //     model.parent = null;

            //     assert.equal(model.readAttribute('parent_id'), null);
            //     assert.ok(model._associations.parent.loaded);
            //     assert.strictEqual(model._associations.parent.target, null);
            //     model.parent.then((model) => {
            //         assert.strictEqual(model, null);
            //         done();
            //     });
            //     assert.equal(this.requests.length, 0);
            // });
        });
        
        describe('addBang', () => {
            it('sends request', function () {
                let model = Model.instantiate({id: 24})
                let parent = Parent.instantiate({id: 11})
                model.association('parents').addBang(parent)
                
                assert.equal(this.requests[0].url, 'http://example.com/models/24/parents/11')
                assert.equal(this.requests[0].method, 'POST')
            });
    
            it('updates target when loaded and record persisted', function (done) {
                let model = Model.instantiate({id: 24})
                let parent1 = Parent.find(11)
                
                model.parents.load().then(() => {
                    parent1.then((p) => {
                        model.parents.addBang(p).then(() => {
                            assert.deepStrictEqual(model.parents.target, [p])
                        }).then(done, done)
                    
                        this.withRequest('POST', '/models/24/parents/11', {}, (xhr) => {
                            xhr.respond(201, {}, null);
                        });
                    }, done)
                
                    this.withRequest('GET', '/parents', { params: {where: {id: 11}, order: {id: 'desc'}, limit: 1} }, (xhr) => {
                        xhr.respond(200, {}, '[{"id": 11, "name": "Parent1"}]');
                    });
                })
                
                this.withRequest('GET', '/parents', { params: {where: {model_id: 24}, order: {id: 'desc'}} }, (xhr) => {
                    xhr.respond(200, {}, '[]');
                });
            });
            
            it('doesnt update target when not loaded', function (done) {
                let model = Model.instantiate({id: 24})
                let parent1 = Parent.instantiate({id: 11})
    
                model.parents.addBang(parent1).then(() => {
                    assert.deepStrictEqual(model.parents.target, [])
                    assert.ok(!model.parents.loaded)
                }).then(done, done)

                this.withRequest('POST', '/models/24/parents/11', {}, (xhr) => {
                    xhr.respond(201, {}, null);
                });
            });
            
            it('creates target', function (done) {
                let model = Model.instantiate({id: 24})
                let parent = new Parent({name: 'Tim Smith'})

                model.parents.addBang(parent).then(() => {
                    assert.equal(parent.readAttribute('model_id'), 24)
                    assert.equal(parent.readAttribute('name'), 'Tim Smith Modified')
                    done()
                }, done)
            
                this.withRequest('POST', '/models/24/parents', {
                    name: 'Tim Smith'
                }, (xhr) => {
                    xhr.respond(201, {}, '{"id": 1, "name": "Tim Smith Modified", "model_id": 24}');
                });
            });
            
            it('raises error when parent model is not persisted', function () {
                let model = new Model({id: 24})
                let parent = new Parent({name: 'Tim Smith'})

                assert.throws( () => model.parents.addBang(parent), Errors.RecordNotSaved );
            });
        })
    
        describe('removeBang', () => {
            it('sends request', function () {
                let model = new Model({id: 24})
                let parent = new Parent({id: 11})
                model.parent = [parent]
                model.parents.removeBang(parent)
            
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
            
            it('doesnt update target when not loaded', function () {
                // TODO
            })
        })
        
        describe('remove', () => {
            it('same record', async () => {
                let parent = new Parent({id: 11})
                let model = new Model({id: 24, parents: [parent]})
                
                await model.parents.remove(parent);
                assert.deepEqual(model.parents.target, []);
            })
        
            it('clone of record', async () => {
                let parent = new Parent({id: 11})
                let model = new Model({id: 24, parents: [parent]})
                
                let parentClone = parent.clone()
                await model.parents.remove(parentClone);
                assert.deepEqual(model.parents.target, []);
            })
        })
        
    });
    
    describe('hasMany(Parent, scope)', () => {
        it("ordering", function () {
            class Parent extends VikingRecord { }
            class Model extends VikingRecord {
                static associations = [hasMany(Parent, (r) => r.order({created_at: 'asc'}))];
            }
    
            let model = new Model({id: 24});
            model.parents.load();
            assert.ok(this.findRequest('GET', '/parents', {
                params: {
                    where: {model_id: 24},
                    order: {created_at: 'asc'}
                }
            }));
        });
    });
    
    describe('hasMany(Parent, {foriegnKey: KEY})', () => {
        class Parent extends VikingRecord { }
        class Child extends VikingRecord {
            static associations = [hasMany(Parent, {foreignKey: 'offspring_id'})];
        }

        it("load association", function(done) {
            let model = new Child({id: 24});

            model.parents.toArray().then((models) => {
                assert.ok(models[0] instanceof Parent);
                assert.equal(models[0].readAttribute('id'), 11);
                assert.equal(models[0].readAttribute('name'), 'Viking');
            }).then(done, done);
            this.withRequest('GET', '/parents', {params: {where: {offspring_id: 24}, order: {id: 'desc'}}}, (xhr) => {
                xhr.respond(200, {}, '[{"id": 11, "name": "Viking"}]');
            });

        });

        describe('assigning the association', (done) => {
            it('to a model with an id', function(done) {
                let child = new Child({id: 24});
                let parent = new Parent({id: 13});
                child.parents = [parent];
                
                assert.equal(parent.readAttribute('offspring_id'), 24);
                assert.ok(child._associations.parents.loaded);
                assert.strictEqual(child._associations.parents.target[0], parent);
                child.parents.toArray().then(models => {
                    assert.strictEqual(models[0], parent);
                }).then(done, done);
                assert.equal(this.requests.length, 0);
            });
        });
    });
    
    describe('hasMany(Parent, {as: NAME})', () => {
        class Parent extends VikingRecord { }
        class Child extends VikingRecord {
            static associations = [hasMany(Parent, {as: 'offspring'})];
        }

        it("load association", function(done) {
            let model = new Child({id: 24});

            model.parents.toArray().then((models) => {
                assert.ok(models[0] instanceof Parent);
                assert.equal(models[0].readAttribute('id'), 11);
                assert.equal(models[0].readAttribute('name'), 'Viking');
            }).then(done, done);
            this.withRequest('GET', '/parents', {params: {where: {offspring_id: 24, offspring_type: 'Child'}, order: {id: 'desc'}}}, (xhr) => {
                xhr.respond(200, {}, '[{"id": 11, "name": "Viking"}]');
            });

        });

        describe('assigning the association', (done) => {
            it('to a model with an id', function(done) {
                let model = new Child({id: 24});
                let parent = new Parent({id: 13});
                model.parents = [parent];

                assert.equal(parent.readAttribute('offspring_id'), 24);
                assert.ok(model._associations.parents.loaded);
                assert.strictEqual(model._associations.parents.target[0], parent);
                model.parents.toArray().then(models => {
                    assert.strictEqual(models[0], parent);
                }).then(done, done);
                assert.equal(this.requests.length, 0);
            });
        });
    });

    // // Model.reflectOnAssociation('parent');

    // // test("::new('children', { modelName: 'Region' })", function () {
    // //     let Region = Viking.Model.extend();
    // //     Viking.context['Region'] = Region;
    // //     var association = new Viking.Model.BelongsToReflection('parent', { modelName: 'Region' });

    // //     assert.equal(association.name, 'parent');
    // //     assert.equal(association.macro, 'belongsTo');
    // //     assert.deepEqual(association.options, { modelName: 'Region' });
    // //     assert.deepEqual(association.modelName, new Viking.Model.Name('Region'));

    // //     delete Viking.context['Region'];
    // // });

    // // test("::new('subject', {polymorphic: true})", function () {
    // //     let Photo = Viking.Model.extend();
    // //     Viking.context['Photo'] = Photo;
    // //     var association = new Viking.Model.BelongsToReflection('subject', { polymorphic: true });
    // //     assert.equal(association.macro, 'belongsTo');
    // //     assert.equal(association.name, 'subject');
    // //     assert.deepEqual(association.options, { polymorphic: true });
    // //     assert.equal(association.modelName, undefined);

    // //     delete Viking.context['Photo'];
    // // });

});