import * as assert from 'assert';
import 'mocha';
import VikingRecord from 'viking/record';
import { hasAndBelongsToMany } from 'viking/record/associations';

describe('Viking.Record::associations', () => {

    describe('hasAndBelongsToMany(Model)', () => {
        class Parent extends VikingRecord { }
        class Model extends VikingRecord {
            static associations = [hasAndBelongsToMany(Parent)];
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

            this.withRequest('GET', '/parents', { params: {where: {models_parents: {model_id: 24}}, order: {id: 'desc'}} }, (xhr) => {
                xhr.respond(200, {}, '[{"id": 2, "name": "Viking"}]');
            });
        });

        describe('assigning the association', () => {

            it('to a model with an id', function() {
                let model = new Model({id: 13});
                let parents = [new Parent(), new Parent()];
                model.parents = parents;

                parents.forEach((m) => { assert.equal(m.readAttribute('model_id'), 13); });
                assert.ok(model._associations.parents.loaded);
                assert.deepStrictEqual(model._associations.parents.target, parents);
                let models = model.parents.toArray();
                assert.deepStrictEqual(models, parents);
                assert.equal(this.requests.length, 0);
            });

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