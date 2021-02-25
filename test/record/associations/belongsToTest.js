import * as assert from 'assert';
import 'mocha';
import VikingRecord from 'viking/record';
import { belongsTo } from 'viking/record/associations';

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

        it("allows chaining", function(done) {
            let model = new Model({parent_id: 24});

            model.parent.readAttribute('name').then((n) => {
                assert.equal(n, 'Viking');
            }).then(done, done);

            this.withRequest('GET', '/parents', { params: {where: {id: 24}, order: {id: 'desc'}, limit: 1} }, (xhr) => {
                xhr.respond(200, {}, '[{"id": 24, "name": "Viking"}]');
            });
        });

        it("doesn't send query if not foriegnKey present", function(done) {
            let model = new Model();

            model.parent.then((model) => {
                assert.strictEqual(model, null);
            }).then(done, done);
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
                    assert.equal(model.readAttribute('parent_id'), 11)
                    // TODO assert model.changes does not include parent_id
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
    
    describe('belongsTo({polymorphic: true})', () => {
        class Child extends VikingRecord {
            static associations = [
                belongsTo('guardian', {polymorphic: true})
            ];
        }
        it("load association", function(done) {
            let parent = new Parent({id: 24});
            let child = new Child({guardian: parent})
            
            assert.equal(child.readAttribute('guardian_id'), 24)
        });
    })
    
    

    // Model.reflectOnAssociation('parent');

    // test("::new('children', { modelName: 'Region' })", function () {
    //     let Region = Viking.Model.extend();
    //     Viking.context['Region'] = Region;
    //     var assocation = new Viking.Model.BelongsToReflection('parent', { modelName: 'Region' });

    //     assert.equal(assocation.name, 'parent');
    //     assert.equal(assocation.macro, 'belongsTo');
    //     assert.deepEqual(assocation.options, { modelName: 'Region' });
    //     assert.deepEqual(assocation.modelName, new Viking.Model.Name('Region'));

    //     delete Viking.context['Region'];
    // });

    // test("::new('subject', {polymorphic: true})", function () {
    //     let Photo = Viking.Model.extend();
    //     Viking.context['Photo'] = Photo;
    //     var assocation = new Viking.Model.BelongsToReflection('subject', { polymorphic: true });
    //     assert.equal(assocation.macro, 'belongsTo');
    //     assert.equal(assocation.name, 'subject');
    //     assert.deepEqual(assocation.options, { polymorphic: true });
    //     assert.equal(assocation.modelName, undefined);

    //     delete Viking.context['Photo'];
    // });
});