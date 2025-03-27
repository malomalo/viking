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

        describe('.setAttributes()', () => {
            it("doesn't change the order or persisted records", function(done) {
                let parent = Parent.instantiate({id: 1, name: 'Alpha'})
                let model = Model.instantiate({id: 24, parents: [parent]});

                model.parents.toArray().then((models) => {
                    assert.equal(models.length, 1);
                    let model = models[0];
                    assert.ok(model instanceof Parent);
                    assert.equal(model.readAttribute('id'), 1);
                    assert.equal(model.readAttribute('name'), 'Alpha');
                    assert.strictEqual(a, parent);
                })
                
                model.parents.setAttributes([
                    {id: 2, name: 'Bravo'},
                    {id: 1, name: 'Alpha'}
                ])
                
                model.parents.toArray().then((models) => {
                    assert.equal(models.length, 2);
                    let a = models[0];
                    assert.ok(a instanceof Parent);
                    assert.equal(a.readAttribute('id'), 2);
                    assert.equal(a.readAttribute('name'), 'Bravo');
                    
                    let b = models[1];
                    assert.ok(b instanceof Parent);
                    assert.equal(b.readAttribute('id'), 1);
                    assert.equal(b.readAttribute('name'), 'Alpha');
                    assert.strictEqual(b, parent);
                }).then(done, done);

                // this.withRequest('GET', '/parents', { params: {where: {model_id: 24}, order: {id: 'desc'}} }, (xhr) => {
                //     xhr.respond(200, {}, '[{"id": 2, "name": "Viking"}]');
                // });
            });

        });

    });
});