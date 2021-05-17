import * as assert from 'assert';
import 'mocha';
import VikingRecord from 'viking/record';
import { hasOne, hasMany } from 'viking/record/associations';

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
        
        it("reload association", function (done) {
            let model = new Model({id: 24});
            model.parent.then(p => {
                model.association('parent').reload().then(secondParent => {
                    assert.equal(p.cid, secondParent.cid)
                }).then(done, done);
                
                assert.ok(this.findRequest('GET', '/parents', { params: {where: {model_id: 24}, order: {id: 'desc'}, limit: 1} }));
                
                this.withRequest('GET', '/parents', { params: {where: {model_id: 24}, order: {id: 'desc'}, limit: 1} }, (xhr) => {
                    xhr.respond(200, {}, '[{"id": 1, "name": "Viking"}]');
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
                let model = new Model({id: 24})
                let parent = new Parent({id: 11})
                model.association('parent').addBang(parent)
            
                assert.equal(this.requests[0].url, 'http://example.com/models/24/parent/11')
                assert.equal(this.requests[0].method, 'POST')
            })
        
            it('updates target', function (done) {
                let model = new Model({id: 24})
                let parent = new Parent({id: 11})

                model.association('parent').addBang(parent).then(() => {
                    assert.equal(model.parent.readAttribute('id'), 11)
                    assert.equal(parent.readAttribute('model_id'), 24)
                    done()
                }, done)
            
                this.withRequest('POST', '/models/24/parent/11', {}, (xhr) => {
                    xhr.respond(201, {}, null);
                });
            })
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

    describe("Model.reflectOnAssociation('parent');", () => {
        it("::new('children', { modelName: 'Region' })", function () {
            class Region extends VikingRecord { 
                static associations = [hasOne('parent', Region, { foreignKey: 'child_id' })];
            }
        
            var assocation = Region.reflectOnAssociation('parent');

            assert.strictEqual(assocation.model, Region);
            assert.equal(assocation.name, 'parent');
            assert.equal(assocation.macro, 'hasOne');
            assert.equal(assocation.foreignKey(), 'child_id');
            assert.deepEqual(assocation.options, { foreignKey: 'child_id' });
        });
    });
});