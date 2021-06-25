import * as assert from 'assert';
import 'mocha';
import VikingRecord from 'viking/record';
import { hasMany } from 'viking/record/associations';

describe('Viking.Record::ssociations', () => {

    describe('HasMany Events', () => {
        class Parent extends VikingRecord { }
        class Model extends VikingRecord {
            static associations = [hasMany(Parent)];
        }
        
        it("triggers a beforeLoad & afterLoad event if not loaded", function (done) {
            let model = new Model({id: 24});
            let counter = 1;
            
            model.association('parents').addEventListener('beforeLoad', records => {
                assert.equal(counter, 1);
                counter += 1;
                assert.deepEqual(records, []);
            });

            model.association('parents').addEventListener('afterLoad', records => {
                assert.equal(counter, 2);
                counter += 1;
                assert.equal(records[0].readAttribute('id'), 2);
            });
            
            model.parents.load().then(() => model.parents.load()).then(() => {
                assert.equal(counter, 3);
            }).then(done, done);
            
            this.withRequest('GET', '/parents', { params: {where: {model_id: 24}, order: {id: 'desc'}} }, (xhr) => {
                xhr.respond(200, {}, '[{"id": 2, "name": "Viking"}]');
            });
        });
        
        it("setting target fires add event", function (done){
            let model = new Model();
            let parent = new Parent({id: 24});
        
            model.association('parents').addEventListener('afterAdd', records => {
                assert.equal(records[0].readAttribute('id'), 24)
                done()
            })
        
            model.parents.push(parent)
        })
        
        it("adding target that's already in target does not fire add event", function (done){
            let model = new Model();
            let parent = new Parent({id: 24});
            
            model.parents = [parent]
        
            parent.addEventListener('afterAdd', association => {
                assert.ok(false)
            })
            
            model.parents.push(parent)
            done()
        })

        it("setting target fires add event on record", function (done){
            let model = new Model({id: 11});
            let parent = new Parent({id: 24});
        
            parent.addEventListener('afterAdd', association => {
                assert.equal(association.owner, model)
                assert.equal(parent.readAttribute('model_id'), 11)
                done()
            })
        
            model.parents.push(parent)
        })
        
        it("unsetting target fires remove event", function (done) {
            let model = new Model();
            let parent = new Parent({id: 24});
            model.parents = [parent]
            
            model.association('parents').addEventListener('afterRemove', records => {
                assert.equal(records[0].readAttribute('id'), 24)
                done()
            })
            
            model.parents = []
        })
        
        it("unsetting target fires remove event on record", function (done) {
            let model = new Model();
            let parent = new Parent({id: 24});
            model.parents = [parent]
            
            parent.addEventListener('afterRemove', association => {
                assert.equal(association.owner, model)
                assert.equal(parent.readAttribute('model_id'), null)
                done()
            })
            
            model.parents = []
        })
        
        it("loading fires load event", function (done) {
            let model = new Model({id: 24});
            
            model.association('parents').addEventListener('afterLoad', records => {
                assert.equal(records[0].readAttribute('id'), 2)
                done()
            })
            model.parents.toArray();
            this.withRequest('GET', '/parents', { params: {where: {model_id: 24}, order: {id: 'desc'}} }, (xhr) => {
                xhr.respond(200, {}, '[{"id": 2, "name": "Viking"}]');
            });
        })
        
        it("loading doesnt fire load event if loaded", function(done) {
            let model = new Model({id: 24});
            let counter = 0
            
            model.association('parents').addEventListener('afterLoad', records => {
                counter += 1
                assert.equal(1, counter)
            })
            
            model.association('parents').load().then(() => {
                model.association('parents').load().then(x => done(), x => done())
                this.withRequest('GET', '/parents', { params: {where: {model_id: 24}, order: {id: 'desc'}} }, (xhr) => {
                    xhr.respond(200, {}, '[{"id": 2, "name": "Viking"}]');
                });
            })
            this.withRequest('GET', '/parents', { params: {where: {model_id: 24}, order: {id: 'desc'}} }, (xhr) => {
                xhr.respond(200, {}, '[{"id": 2, "name": "Viking"}]');
            });
        })
        
        it("loading fires afterAdd event", function() {
            let model = new Model({id: 24});
            
            model.association('parents').addEventListener('afterAdd', record => {
                assert.equal(record.readAttribute('id'), 2)
            })
            
            model.association('parents').load().then(x => done());
            this.withRequest('GET', '/parents', { params: {where: {model_id: 24}, order: {id: 'desc'}} }, (xhr) => {
                xhr.respond(200, {}, '[{"id": 2, "name": "Viking"}]');
            });
        })
        
        it("loading fires afterRemove event", function (done){
            let model = new Model({id: 24});
            
            model.association('parents').addEventListener('afterRemove', records => {
                assert.deepEqual(records.map(x => x.readAttribute('id')), [2])
                done()
            })
            
            model.association('parents').load().then(() => {
                model.association('parents').reload();
                this.withRequest('GET', '/parents', { params: {where: {model_id: 24}, order: {id: 'desc'}} }, (xhr) => {
                    xhr.respond(200, {}, '[]');
                });
            });
            this.withRequest('GET', '/parents', { params: {where: {model_id: 24}, order: {id: 'desc'}} }, (xhr) => {
                xhr.respond(200, {}, '[{"id": 2, "name": "Viking"}]');
            });
        })
    });
});