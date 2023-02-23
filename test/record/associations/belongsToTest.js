import * as assert from 'assert';
import 'mocha';
import VikingRecord from 'viking/record';
import { hasMany, belongsTo } from 'viking/record/associations';
import * as Errors from 'viking/errors';

describe('Viking.Record::associations', () => {
    class Parent extends VikingRecord { }
    class Model extends VikingRecord {
        static associations = [
            belongsTo(Parent)
        ];
    }
    describe('belongsTo(Parent)', () => {

        it("load association", function(done) {
            let model = new Model({parent_id: 24});

            model.parent.then((model) => {
                assert.ok(model instanceof Parent);
                assert.equal(model.readAttribute('id'), 24);
                assert.equal(model.readAttribute('name'), 'Viking');
            }).then(done, done);
            this.withRequest('GET', '/parents', { params: {where: {id: 24}, order: {id: 'desc'}, limit: 1} }, (xhr) => {
                xhr.respond(200, {}, '[{"id": 24, "name": "Viking"}]');
            });
        });
        
        it("reload association", function (done) {
            let model = new Model({parent_id: 24});
            model.parent.then(p => {
                model.association('parent').reload().then(secondLoadParent => {
                    assert.equal(p.cid, secondLoadParent.cid)
                    assert.equal('Viking 2', secondLoadParent.readAttribute('name'));
                    assert.deepEqual({}, secondLoadParent.changes());
                }).then(done, done);
                
                this.withRequest('GET', '/parents', { params: {where: {id: 24}, order: {id: 'desc'}, limit: 1} }, (xhr) => {
                    xhr.respond(200, {}, '[{"id": 24, "name": "Viking 2"}]');
                });
            })
            
            this.withRequest('GET', '/parents', { params: {where: {id: 24}, order: {id: 'desc'}, limit: 1} }, (xhr) => {
                xhr.respond(200, {}, '[{"id": 24, "name": "Viking"}]');
            });
        })

        it("allows chaining", function(done) {
            let model = new Model({parent_id: 24});

            model.parent.readAttribute('name').then((n) => {
                assert.equal(n, 'Viking');
            }).then(done, done);

            this.withRequest('GET', '/parents', { params: {where: {id: 24}, order: {id: 'desc'}, limit: 1} }, (xhr) => {
                xhr.respond(200, {}, '[{"id": 24, "name": "Viking"}]');
            });
        });
        
        it("allows deep chaining", async function() {
            class A extends VikingRecord { }
            class B extends VikingRecord {
                static associations = [hasMany(A)];
            }
            class C extends VikingRecord {
                static associations = [belongsTo(B)];
            }

            this.onRequest('GET', '/bs', { params: {where: {id: 2}, order: {id: 'desc'}, limit: 1} }, (xhr) => {
                xhr.respond(200, {}, '[{"id": 5, "name": "B"}]');
            });
            this.onRequest('GET', '/as', { params: {where: {b_id: 5, x: 2}, order: {id: 'desc'} } }, (xhr) => {
                xhr.respond(200, {}, '[{"id": 1, "name": "A Up", "x": 2}]');
            });

            let model = new C({id: 3, b_id: 2})

            assert.deepEqual(
                [{id: 1, name: 'A Up', x: 2}],
                await model.b.as.where({x: 2}).map((x) => x.attributes)
            );
        });

        it("doesn't send query if not foriegnKey present", function() {
            let model = new Model();
            
            assert.strictEqual(model.parent,  null);
            assert.equal(this.requests.length, 0);
        });

        describe('assigning the association', () => {
            it('to a model with an id', function () {
                let model = new Model();
                let parent = new Parent({id: 13});
                model.parent = parent;

                assert.equal(model.readAttribute('parent_id'), 13);
                assert.ok(model._associations.parent.loaded);
                assert.strictEqual(model._associations.parent.target, parent);
                assert.strictEqual(model.parent, parent);
                assert.equal(this.requests.length, 0);
            });

            it('to a model without an id', function() {
                let model = new Model();
                let parent = new Parent();
                model.parent = parent;

                assert.equal(model.readAttribute('parent_id'), null);
                assert.ok(model._associations.parent.loaded);
                assert.strictEqual(model._associations.parent.target, parent);
                assert.strictEqual(model.parent, parent);
                assert.equal(this.requests.length, 0);
            });

            it('to null', function() {
                let model = new Model();
                model.parent = null;

                assert.equal(model.readAttribute('parent_id'), null);
                assert.ok(model._associations.parent.loaded);
                assert.strictEqual(model._associations.parent.target, null);
                assert.strictEqual(model.parent, null);
                assert.equal(this.requests.length, 0);
            });
        });
        
        describe('include', () => {
            it('instantiating null', function(done) {
                Model.includes('parent').find(24).then(model => {
                    assert.strictEqual(model.parent, null);
                }).then(done, done);
            
                this.withRequest('GET', '/models', { params: {where: {id: 24}, order: {id: 'desc'}, limit: 1, include: ['parent']} }, (xhr) => {
                    xhr.respond(200, {}, '[{"id": 24, "name": "Viking", "parent": null}]');
                });
            });
        });
        
        describe('addBang', () => {
            it('sends request', function () {
                let model = Model.instantiate({id: 24})
                let parent = Parent.instantiate({id: 11})
                model.association('parent').addBang(parent)
            
                assert.equal(this.requests[0].url, 'http://example.com/models/24/parent/11')
                assert.equal(this.requests[0].method, 'POST')
            });
        
            it('updates target', function (done) {
                let model = Model.instantiate({id: 24})
                let parent = Parent.instantiate({id: 11})

                model.association('parent').addBang(parent).then(() => {
                    assert.equal(model.parent.readAttribute('id'), 11)
                    assert.equal(model.readAttribute('parent_id'), 11)
                    // TODO assert model.changes does not include parent_id
                    done()
                }, done)
            
                this.withRequest('POST', '/models/24/parent/11', {}, (xhr) => {
                    xhr.respond(201, {}, null);
                });
            });
            
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
                model.parent = new Parent({id: 11})

                model.association('parent').removeBang(model.parent).then(() => {
                    assert.equal(model.parent, null)
                    assert.equal(model.readAttribute('parent_id'), null)
                    // TODO assert model.changes does not include parent_id
                    assert.equal(model.association('parent').loaded, true)
                    done()
                }, done)
            
                this.withRequest('DELETE', '/models/24/parent/11', {}, (xhr) => {
                    xhr.respond(201, {}, null);
                });
            })
        })
    });
    
    describe('belongsTo(name, Parent)', () => {
        class Parent extends VikingRecord { }
        class Model extends VikingRecord {
            static associations = [belongsTo('guardian', Parent)];
        }
        it("load association", function(done) {
            let model = new Model({guardian_id: 24});
            model.guardian.then((model) => {
                assert.ok(model instanceof Parent);
                assert.equal(model.readAttribute('id'), 24);
                assert.equal(model.readAttribute('name'), 'Viking');
            }).then(done, done);
            this.withRequest('GET', '/parents', { params: {where: {id: 24}, order: {id: 'desc'}, limit: 1} }, (xhr) => {
                xhr.respond(200, {}, '[{"id": 24, "name": "Viking"}]');
            });
        });

        describe('assigning the association', () => {
            it('to a model with an id', function() {
                let model = new Model();
                let guardian = new Parent({id: 13});
                model.guardian = guardian;

                assert.equal(model.readAttribute('guardian_id'), 13);
                assert.ok(model._associations.guardian.loaded);
                assert.strictEqual(model._associations.guardian.target, guardian);
                assert.strictEqual(model.guardian, guardian);
                assert.equal(this.requests.length, 0);
            });
        });
    });

    describe('belongsTo(Parent, scope)', () => {
        it("ordering", function() {
            class Parent extends VikingRecord { }
            class Model extends VikingRecord {
                static associations = [belongsTo(Parent, (r) => r.order({created_at: 'asc'}))];
            }

            let model = new Model({parent_id: 25});

            model._associations['parent'].load();
            assert.ok(this.findRequest('GET', '/parents', {
                params: {where: {id: 25}, order: {created_at: 'asc'}, limit: 1}
            }));
        });
    });

    describe('belongsTo(Parent, {foriegnKey: KEY})', () => {
        class Parent extends VikingRecord { }
        class Model extends VikingRecord {
            static associations = [belongsTo(Parent, {foreignKey: 'parental_id'})];
        }
        it("load association", function(done) {
            let model = new Model({parental_id: 24});

            model.parent.then((model) => {
                assert.ok(model instanceof Parent);
                assert.equal(model.readAttribute('id'), 24);
                assert.equal(model.readAttribute('name'), 'Viking');
            }).then(done, done);
            this.withRequest('GET', '/parents', { params: {where: {id: 24}, order: {id: 'desc'}, limit: 1} }, (xhr) => {
                xhr.respond(200, {}, '[{"id": 24, "name": "Viking"}]');
            });
        });

        describe('assigning the association', () => {
            it('to a model with an id', function() {
                let model = new Model();
                let parent = new Parent({id: 13});
                model.parent = parent;

                assert.equal(model.readAttribute('parental_id'), 13);
                assert.ok(model._associations.parent.loaded);
                assert.strictEqual(model._associations.parent.target, parent);
                assert.strictEqual(model.parent, parent);
                assert.equal(this.requests.length, 0);
            });
        });
    });
    
    describe('belongsTo({polymorphic: [ModelA, ModelB, ....]})', () => {
        class Country extends VikingRecord {}
        class Person extends VikingRecord {}
        class Company extends VikingRecord {}
        class Ship extends VikingRecord {
            static associations = [
                belongsTo('owner', {polymorphic: [Country, Person]})
            ];
        }
        
        it("load association", function(done) {
            let ship = new Ship({id: 3, owner_id: 31, owner_type: 'Country'});

            ship.owner.then((model) => {
                assert.ok(model instanceof Country);
                assert.equal(model.readAttribute('id'), 31);
                assert.equal(model.readAttribute('name'), 'საქართველო');
            }).then(done, done);
            this.withRequest('GET', '/countries', { params: {where: {id: 31}, order: {id: 'desc'}, limit: 1} }, (xhr) => {
                xhr.respond(200, {}, '[{"id": 31, "name": "საქართველო"}]');
            });
        });
        
        it("load association without a reference to the model", function(done) {
            let ship = new Ship({id: 3, owner_id: 31, owner_type: 'Company'});
            
            ship.owner.then(undefined, function (error) {
                assert.ok(error instanceof Errors.ClassNotFound);
                assert.equal(error.message, 'Could not find class "Company" in polymorphic relation Ship#owner');
            }).then(done, done);
        });
        
        it("assigning the association", function() {
            let person = Person.instantiate({id: 24});
            let ship = new Ship({id: 3, owner: person});
            
            assert.equal(ship.readAttribute('owner_id'), 24)
            assert.equal(ship.readAttribute('owner_type'), 'Person')
            assert.strictEqual(ship.owner, person);
            
            let company = Company.instantiate({id: 27});
            ship.owner = company;
            
            assert.equal(ship.readAttribute('owner_id'), 27)
            assert.equal(ship.readAttribute('owner_type'), 'Company')
            assert.strictEqual(ship.owner, company);
        });
        
        it("instantiating the association", function () {
            let ship = new Ship({id: 3, owner_type: 'Person', owner_id: 24, owner: {id: 24, name: 'Rod Kimbel'}})
            let person = ship.owner
            assert.equal(person.readAttribute('name'), 'Rod Kimbel')
        })
    })
    
});