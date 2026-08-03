import assert from 'assert';
import VikingRecord from 'viking/record';
import { hasMany } from 'viking/record/associations';

describe('Viking.Record::associations', () => {
    describe('hasMany(Parent)', () => {
        class Parent extends VikingRecord { }
        class Model extends VikingRecord {
            static associations = [hasMany(Parent)];
        }

        describe('array methods', () => {
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

            it("includes checks membership of the association", function(done) {
                let model = new Model({id: 24});

                model.parents.load().then(async (parents) => {
                    assert.ok(await model.parents.includes(parents[0]));
                    assert.ok(!(await model.parents.includes(new Parent({id: 99}))));
                }).then(done, done);

                this.withRequest('GET', '/parents', { params: {where: {model_id: 24}, order: {id: 'desc'}} }, (xhr) => {
                    xhr.respond(200, {}, '[{"id": 2, "name": "Viking A"},{"id": 3, "name": "Viking B"}]');
                });
            });

            it("some tests if any record in the association matches", function(done) {
                let model = new Model({id: 24});

                model.parents.some((p) => p.readAttribute('id') === 3).then(async (result) => {
                    assert.strictEqual(result, true);
                    assert.strictEqual(await model.parents.some((p) => p.readAttribute('id') === 99), false);
                }).then(done, done);

                this.withRequest('GET', '/parents', { params: {where: {model_id: 24}, order: {id: 'desc'}} }, (xhr) => {
                    xhr.respond(200, {}, '[{"id": 2, "name": "Viking A"},{"id": 3, "name": "Viking B"}]');
                });
            });

            it("every tests if all records in the association match", function(done) {
                let model = new Model({id: 24});

                model.parents.every((p) => p.readAttribute('id') > 0).then(async (result) => {
                    assert.strictEqual(result, true);
                    assert.strictEqual(await model.parents.every((p) => p.readAttribute('id') > 2), false);
                }).then(done, done);

                this.withRequest('GET', '/parents', { params: {where: {model_id: 24}, order: {id: 'desc'}} }, (xhr) => {
                    xhr.respond(200, {}, '[{"id": 2, "name": "Viking A"},{"id": 3, "name": "Viking B"}]');
                });
            });

            it("reduce reduces the records in the association", function(done) {
                let model = new Model({id: 24});

                model.parents.reduce((acc, p) => acc + p.readAttribute('id'), 0).then((result) => {
                    assert.equal(result, 5);
                }).then(done, done);

                this.withRequest('GET', '/parents', { params: {where: {model_id: 24}, order: {id: 'desc'}} }, (xhr) => {
                    xhr.respond(200, {}, '[{"id": 2, "name": "Viking A"},{"id": 3, "name": "Viking B"}]');
                });
            });
        });
    });
});
