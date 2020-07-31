import * as assert from 'assert';
import 'mocha';
import VikingRecord from 'viking/record';
import { hasOne } from 'viking/record/associations';

describe('Viking.Record::associations', () => {

    describe('hasOne(Parent)', () => {
        class Parent extends VikingRecord { }
        class Model extends VikingRecord {
            static associations = [hasOne(Parent)];
        }

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

        it("allows chaining", function(done) {
            let model = new Model({id: 24});

            model.parent.readAttribute('name').then((n) => {
                assert.equal(n, 'Viking');
            }).then(done, done);

            this.withRequest('GET', '/parents', { params: {where: {model_id: 24}, order: {id: 'desc'}, limit: 1} }, (xhr) => {
                xhr.respond(200, {}, '[{"id": 24, "name": "Viking"}]');
            });
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
            it('to a model with an id', function(done) {
                let model = new Model({id: 42});
                let parent = new Parent({id: 13});
                model.parent = parent;

                assert.equal(parent.readAttribute('model_id'), 42);
                assert.ok(model._associations.parent.loaded);
                assert.strictEqual(model._associations.parent.target, parent);
                model.parent.then((model) => {
                    assert.strictEqual(model, parent);
                    done();
                });
                assert.equal(this.requests.length, 0);
            });

            it('to a model without an id', function(done) {
                let model = new Model();
                let parent = new Parent();
                model.parent = parent;

                assert.equal(parent.readAttribute('model_id'), null);
                assert.ok(model._associations.parent.loaded);
                assert.strictEqual(model._associations.parent.target, parent);
                model.parent.then((model) => {
                    assert.strictEqual(model, parent);
                    done();
                });
                assert.equal(this.requests.length, 0);
            });

            it('to null', function(done) {
                let model = new Model();
                model.parent = null;

                assert.ok(model._associations.parent.loaded);
                assert.strictEqual(model._associations.parent.target, null);
                model.parent.then((model) => {
                    assert.strictEqual(model, null);
                    done();
                });
                assert.equal(this.requests.length, 0);
            });
        });
    });
   
    describe('belongsTo(Parent, {foriegnKey: KEY})', () => {
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
            it('to a model with an id', function(done) {
                let model = new Model({id: 42});
                let parent = new Parent({id: 13});
                model.parent = parent;

                assert.equal(parent.readAttribute('child_id'), 42);
                assert.ok(model._associations.parent.loaded);
                assert.strictEqual(model._associations.parent.target, parent);
                model.parent.then((model) => {
                    assert.strictEqual(model, parent);
                    done();
                });
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