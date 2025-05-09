import * as assert from 'assert';
import 'mocha';
import VikingRecord from 'viking/record';
import { hasOne, hasMany, belongsTo } from 'viking/record/associations';
import * as Errors from 'viking/errors';

describe('Viking.Record::associations', () => {

    class Parent extends VikingRecord { }
    class Model extends VikingRecord {
        static associations = [hasOne(Parent)];
    }
    
    describe('hasOne(Parent)', () => {
        it("load association", function(done) {
            let model = new Model({id: 24});

            model.parent.then((model) => {
                assert.ok(model instanceof Parent);
                assert.equal(model.readAttribute('id'), 1);
                assert.equal(model.readAttribute('name'), 'Viking');
            }).then(done, done);
            
            this.withRequest('GET', '/parents', { params: {where: {model_id: 24}, order: {id: 'desc'}, limit: 1} }, (xhr) => {
                xhr.respond(200, {}, '[{"id": 1, "name": "Viking"}]');
            });
        });
        
        it("load with polymorphic and sti", function(done) {
            class Attachment extends VikingRecord {}
            class SubModel extends Model {
                static associations = [hasOne(Attachment, {as: 'record'})]
            }
            
            let model = new SubModel({id: 24});

            model.attachment.then((attachment) => {
                assert.ok(attachment instanceof Attachment);
                assert.equal(attachment.readAttribute('id'), 1);
            }).then(done, done);
            
            this.withRequest('GET', '/attachments', { params: {where: {record_id: 24, record_type: 'Model'}, order: {id: 'desc'}, limit: 1} }, (xhr) => {
                xhr.respond(200, {}, '[{"id": 1}]');
            });
        });
        
        it("reload association", function (done) {
            let model = new Model({id: 24});
            model.parent.then(p => {
                model.association('parent').reload().then(updatedParent => {
                    assert.equal(p.cid, updatedParent.cid);
                    assert.equal('Viking 2', updatedParent.readAttribute('name'));
                    assert.deepEqual({}, updatedParent.changes());
                }).then(done, done);
                
                this.withRequest('GET', '/parents', { params: {where: {model_id: 24}, order: {id: 'desc'}, limit: 1} }, (xhr) => {
                    xhr.respond(200, {}, '[{"id": 1, "name": "Viking 2"}]');
                });
            })
            
            this.withRequest('GET', '/parents', { params: {where: {model_id: 24}, order: {id: 'desc'}, limit: 1} }, (xhr) => {
                xhr.respond(200, {}, '[{"id": 1, "name": "Viking"}]');
            });
        })

        it("allows chaining", function(done) {
            let model = new Model({id: 24});

            model.parent.readAttribute('name').then((n) => {
                assert.equal(n, 'Viking');
            }).then(done, done);

            this.withRequest('GET', '/parents', { params: {where: {model_id: 24}, order: {id: 'desc'}, limit: 1} }, (xhr) => {
                xhr.respond(200, {}, '[{"id": 24, "name": "Viking"}]');
            });
        });

        it("allows deep chaining", async function() {
            class A extends VikingRecord { }
            class B extends VikingRecord {
                static associations = [hasMany(A)];
            }
            class C extends VikingRecord {
                static associations = [hasOne(B)];
            }

            this.onRequest('GET', '/bs', { params: {where: {c_id: 3}, order: {id: 'desc'}, limit: 1} }, (xhr) => {
                xhr.respond(200, {}, '[{"id": 5, "name": "C"}]');
            });
            this.onRequest('GET', '/as', { params: {where: {b_id: 5, x: 2}, order: {id: 'desc'} } }, (xhr) => {
                xhr.respond(200, {}, '[{"id": 1, "name": "A Up", "x": 2}]');
            });

            let model = new C({id: 3})

            assert.deepEqual(
                [{id: 1, name: 'A Up', x: 2}],
                await model.b.as.where({x: 2}).map((x) => x.attributes)
            );
        });
        
        it("allows deep chaining with a null at end", function (done) {
            class A extends VikingRecord { }
            class B extends VikingRecord {
                static associations = [hasOne(A)];
            }
            class C extends VikingRecord {
                static associations = [belongsTo(B)];
            }

            this.onRequest('GET', '/bs', { params: {where: {id: 3}, order: {id: 'desc'}, limit: 1} }, (xhr) => {
                xhr.respond(200, {}, '[{"id": 3, "name": "C"}]');
            })

            this.onRequest('GET', '/as', { params: {where: {b_id: 3}, order: {id: 'desc'}, limit: 1 } }, (xhr) => {
                xhr.respond(200, {}, '[]');
            });
            
            let model = new C({id: 1, b_id: 3})
            model.b.a.then(n => {
                assert.equal(null, n)
            }).then(done, done)
            

        });

        it("return null if no parent", function(done) {
            let model = new Model({id: 24});

            model.parent.then((model) => {
                assert.strictEqual(model, null);
            }).then(done, done);

            this.withRequest('GET', '/parents', { params: {where: {model_id: 24}, order: {id: 'desc'}, limit: 1} }, (xhr) => {
                xhr.respond(200, {}, '[]');
            });
        });

        describe('assigning the association', () => {
            it('to a model with an id', function() {
                let model = new Model({id: 42});
                let parent = new Parent({id: 13});
                model.parent = parent;

                assert.equal(parent.readAttribute('model_id'), 42);
                assert.ok(model._associations.parent.loaded);
                assert.strictEqual(model._associations.parent.target, parent);
                assert.strictEqual(model.parent, parent);
                assert.equal(this.requests.length, 0);
            });

            it('to a model without an id', function() {
                let model = new Model();
                let parent = new Parent();
                model.parent = parent;

                assert.equal(parent.readAttribute('model_id'), null);
                assert.ok(model._associations.parent.loaded);
                assert.strictEqual(model._associations.parent.target, parent);
                assert.strictEqual(model.parent, parent);
                assert.equal(this.requests.length, 0);
            });

            it('to null', function() {
                let model = new Model();
                model.parent = null;

                assert.ok(model._associations.parent.loaded);
                assert.strictEqual(model._associations.parent.target, null);
                assert.strictEqual(model.parent, null);
                assert.equal(this.requests.length, 0);
            });
        });
        
        describe('addBang', () => {
            it('sends request', function () {
                let model = Model.instantiate({id: 24})
                let parent = Parent.instantiate({id: 11})
                model.association('parent').addBang(parent)
            
                assert.equal(this.requests[0].url, 'http://example.com/models/24/parent/11')
                assert.equal(this.requests[0].method, 'POST')
            })
        
            it('updates target', function (done) {
                let model = Model.instantiate({id: 24})
                let parent = Parent.instantiate({id: 11})

                model.association('parent').addBang(parent).then(() => {
                    assert.equal(model.parent.readAttribute('id'), 11)
                    assert.equal(parent.readAttribute('model_id'), 24)
                    done()
                }, done)
            
                this.withRequest('POST', '/models/24/parent/11', {}, (xhr) => {
                    xhr.respond(201, {}, null);
                });
            })
            
            it('creates target', function (done) {
                let model = Model.instantiate({id: 24})
                let parent = new Parent({name: 'Tim Smith'})

                model.association('parent').addBang(parent).then(() => {
                    assert.equal(model.parent.readAttribute('id'), 1)
                    assert.equal(parent.readAttribute('model_id'), 24)
                    assert.equal(parent.readAttribute('name'), 'Tim Smith Modified')
                    done()
                }, done)
            
                this.withRequest('POST', '/models/24/parent', {
                    name: 'Tim Smith'
                }, (xhr) => {
                    xhr.respond(201, {}, '{"id": 1, "name": "Tim Smith Modified", "model_id": 24}');
                });
            });
            
            it('raises error when parent model is not persisted', function () {
                let model = new Model({id: 24})
                let parent = new Parent({name: 'Tim Smith'})

                assert.throws( () => model.association('parent').addBang(parent), Errors.RecordNotSaved );
            });
        })
    
        describe('removeBang', () => {
            it('sends request', function () {
                let model = new Model({id: 24})
                model.parent = new Parent({id: 11})
                model.association('parent').removeBang(model.parent)
            
                assert.equal(this.requests[0].url, 'http://example.com/models/24/parent/11')
                assert.equal(this.requests[0].method, 'DELETE')
            })
        
            it('updates target', function (done) {
                let model = new Model({id: 24})
                let parent = new Parent({id: 11})
                model.parent = parent

                model.association('parent').removeBang(model.parent).then(() => {
                    assert.equal(model.parent, null)
                    assert.equal(parent.readAttribute('model_id'), null)
                    done()
                }, done)
            
                this.withRequest('DELETE', '/models/24/parent/11', {}, (xhr) => {
                    xhr.respond(201, {}, null);
                });
            })
        })
    });
   
    describe('hasOne(Parent, scope)', () => {
        it("ordering", function() {
            class Parent extends VikingRecord { }
            class Model extends VikingRecord {
                static associations = [hasOne(Parent, (r) => r.order({created_at: 'asc'}))];
            }

            let model = new Model({id: 25});

            model._associations['parent'].load();
            assert.ok(this.findRequest('GET', '/parents', {
                params: {where: {model_id: 25}, order: {created_at: 'asc'}, limit: 1}
            }));
        });
    });

    describe('hasOne(Parent, {foriegnKey: KEY})', () => {
        class Parent extends VikingRecord { }
        class Model extends VikingRecord {
            static associations = [hasOne(Parent, {foreignKey: 'child_id'})];
        }
   
        it("load association", function(done) {
            let model = new Model({id: 24});

            model.parent.then((model) => {
                assert.ok(model instanceof Parent);
                assert.equal(model.readAttribute('id'), 1);
                assert.equal(model.readAttribute('name'), 'Viking');
            }).then(done, done);
            
            this.withRequest('GET', '/parents', { params: {where: {child_id: 24}, order: {id: 'desc'}, limit: 1} }, (xhr) => {
                xhr.respond(200, {}, '[{"id": 1, "name": "Viking"}]');
            });
        });

        describe('assigning the association', () => {
            it('to a model with an id', function() {
                let model = new Model({id: 42});
                let parent = new Parent({id: 13});
                model.parent = parent;

                assert.equal(parent.readAttribute('child_id'), 42);
                assert.ok(model._associations.parent.loaded);
                assert.strictEqual(model._associations.parent.target, parent);
                assert.strictEqual(model.parent, parent);
                assert.equal(this.requests.length, 0);
            });
        });
    });
    
    describe('hasOne(Parent, {as: NAME})', () => {
        class Parent extends VikingRecord { }
        class Child extends VikingRecord {
            static associations = [hasOne(Parent, {as: 'offspring'})];
        }

        it("load association", function(done) {
            let model = new Child({id: 24});

            model.parent.then((model) => {
                assert.ok(model instanceof Parent);
                assert.equal(model.readAttribute('id'), 11);
                assert.equal(model.readAttribute('name'), 'Viking');
            }).then(done, done);
            this.withRequest('GET', '/parents', { params: {where: {offspring_id: 24, offspring_type: 'Child'}, order: {id: 'desc'}, limit: 1} }, (xhr) => {
                xhr.respond(200, {}, '[{"id": 11, "name": "Viking"}]');
            });

        });

        describe('assigning the association', () => {
            it('to a model with an id', function() {
                let model = new Child({id: 24});
                let parent = new Parent({id: 13});
                model.parent = parent;

                assert.equal(parent.readAttribute('offspring_id'), 24);
                assert.ok(model._associations.parent.loaded);
                assert.strictEqual(model._associations.parent.target, parent);
                assert.equal(this.requests.length, 0);
            });
        });
    });

    describe("Model.reflectOnAssociation('parent');", () => {
        it("::new('children', { modelName: 'Region' })", function () {
            class Region extends VikingRecord { 
                static associations = [hasOne('parent', Region, { foreignKey: 'child_id' })];
            }
        
            var association = Region.reflectOnAssociation('parent');

            assert.strictEqual(association.model, Region);
            assert.equal(association.name, 'parent');
            assert.equal(association.macro, 'hasOne');
            assert.equal(association.foreignKey(), 'child_id');
            assert.deepEqual(association.options, { foreignKey: 'child_id' });
        });
    });
});
