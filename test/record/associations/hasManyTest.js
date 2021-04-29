import * as assert from 'assert';
import 'mocha';
import VikingRecord from 'viking/record';
import { hasMany } from 'viking/record/associations';

describe('Viking.Record::associations', () => {
    describe('hasMany(Parent)', () => {
        class Parent extends VikingRecord { }
        class Model extends VikingRecord {
            static associations = [hasMany(Parent)];
        }

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
        
        it("reload association", function (done) {
            let model = new Model({id: 24});
            model.parents.toArray().then(parents => {
                model.association('parents').reload();
                assert.ok(this.findRequest('GET', '/parents', { params: {where: {model_id: 24}, order: {id: 'desc'}} }));
            }).then(done, done)
            
            this.withRequest('GET', '/parents', { params: {where: {model_id: 24}, order: {id: 'desc'}} }, (xhr) => {
                xhr.respond(200, {}, '[{"id": 2, "name": "Viking"}]');
            });
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
                let model = new Model({id: 24})
                let parent = new Parent({id: 11})
                model.association('parents').addBang(parent)
        
                assert.equal(this.requests[0].url, 'http://example.com/models/24/parents/11')
                assert.equal(this.requests[0].method, 'POST')
            })
    
            it('updates target when loaded and record persisted', function (done) {
                let model = new Model({id: 24})
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
            })
            
            it('doesnt update target when not loaded', function (done) {
                let model = new Model({id: 24})
                let parent1 = new Parent({id: 11})
    
                model.parents.addBang(parent1).then(() => {
                    assert.deepStrictEqual(model.parents.target, [])
                    assert.ok(!model.parents.loaded)
                }).then(done, done)

                this.withRequest('POST', '/models/24/parents/11', {}, (xhr) => {
                    xhr.respond(201, {}, null);
                });
            })
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
            this.withRequest('GET', '/parents', {params: {where: {offspring_id: 24}, order: {id: 'desc'}}}, (xhr) => {
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
    // //     var assocation = new Viking.Model.BelongsToReflection('parent', { modelName: 'Region' });

    // //     assert.equal(assocation.name, 'parent');
    // //     assert.equal(assocation.macro, 'belongsTo');
    // //     assert.deepEqual(assocation.options, { modelName: 'Region' });
    // //     assert.deepEqual(assocation.modelName, new Viking.Model.Name('Region'));

    // //     delete Viking.context['Region'];
    // // });

    // // test("::new('subject', {polymorphic: true})", function () {
    // //     let Photo = Viking.Model.extend();
    // //     Viking.context['Photo'] = Photo;
    // //     var assocation = new Viking.Model.BelongsToReflection('subject', { polymorphic: true });
    // //     assert.equal(assocation.macro, 'belongsTo');
    // //     assert.equal(assocation.name, 'subject');
    // //     assert.deepEqual(assocation.options, { polymorphic: true });
    // //     assert.equal(assocation.modelName, undefined);

    // //     delete Viking.context['Photo'];
    // // });

});