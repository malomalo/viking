import * as assert from 'assert';
import 'mocha';
import VikingRecord from 'viking/record';
import { belongsTo } from 'viking/record/associations';

describe('Viking.Record::Associations', () => {

    describe('BelongsTo Events', () => {
        class Parent extends VikingRecord { }
        class Model extends VikingRecord {
            static associations = [belongsTo(Parent)];
        }
        
        it("setting target fires add event", function (done){
            let model = new Model();
            let parent = new Parent({id: 24});
        
            model.association('parent').addEventListener('afterAdd', record => {
                assert.equal(record.readAttribute('id'), 24)
                done()
            })
        
            model.parent = parent
        })
        
        it("setting target when already set to that target does not fire add event", function (done){
            let model = new Model();
            let parent = new Parent({id: 24});
            
            model.parent = parent
        
            parent.addEventListener('afterAdd', association => {
                assert.ok(false)
            })
            
            model.parent = parent
            done()
        })
        
        it("setting target fires add event on record", function (done){
            let model = new Model();
            let parent = new Parent({id: 24});
        
            parent.addEventListener('afterAdd', association => {
                assert.equal(association.owner, model);
                assert.equal(model.readAttribute('parent_id'), 24)
                done()
            })
        
            model.parent = parent
        })
        
        it("unsetting target fires remove event", function (done) {
            let model = new Model();
            let parent = new Parent({id: 24});
            model.parent = parent
            
            model.association('parent').addEventListener('afterRemove', record => {
                assert.equal(record.readAttribute('id'), 24)
                done()
            })
            
            model.parent = null
        })
        
        it("unsetting target fires remove event on record", function (done) {
            let model = new Model();
            let parent = new Parent({id: 24});
            model.parent = parent
            
            parent.addEventListener('afterRemove', association => {
                assert.equal(association.owner, model);
                assert.equal(model.readAttribute('parent_id'), null)
                done()
            })
            
            model.parent = null
        })
        
        it("loading fires load event", function (done) {
            let model = new Model({parent_id: 24});
            
            model.association('parent').addEventListener('afterLoad', record => {
                assert.equal(record.readAttribute('id'), 24)
                done();
            })
            model.parent.id;
            this.withRequest('GET', '/parents', { params: {where: {id: 24}, order: {id: 'desc'}, limit: 1} }, (xhr) => {
                xhr.respond(200, {}, '[{"id": 24, "name": "Viking"}]');
            });
        })
        
        it("loading doesnt fire load event if loaded", function(done) {
            let model = new Model({parent_id: 24});
            let counter = 0;
            
            model.association('parent').addEventListener('afterLoad', record => {
                counter += 1
            })
            
            model.association('parent').load().then(() => {
                model.association('parent').load().then(r => {
                    assert.equal(1, counter);
                }).then(done, done);
            });
            
            this.withRequest('GET', '/parents', { params: {where: {id: 24}, order: {id: 'desc'}, limit: 1} }, (xhr) => {
                xhr.respond(200, {}, '[{"id": 24, "name": "Viking"}]');
            });
        })
        
        it("loading fires afterAdd event", function(done) {
            let model = new Model({parent_id: 24});
            
            model.association('parent').addEventListener('afterAdd', async record => {
                assert.equal(record.readAttribute('id'), 24)
                assert.equal(model.parent.readAttribute('id'), 24)
                done()
            })
            
            model.association('parent').load();
            this.withRequest('GET', '/parents', { params: {where: {id: 24}, order: {id: 'desc'}, limit: 1} }, (xhr) => {
                xhr.respond(200, {}, '[{"id": 24, "name": "Viking"}]');
            });
        })
        
        it("loading fires afterRemove event", function (done){
            let model = new Model({parent_id: 24});
            
            model.association('parent').addEventListener('afterRemove', record => {
                assert.equal(record.readAttribute('id'), 24)
                done()
            })
            
            model.association('parent').load();
            this.withRequest('GET', '/parents', { params: {where: {id: 24}, order: {id: 'desc'}, limit: 1} }, (xhr) => {
                xhr.respond(200, {}, '[{"id": 24, "name": "Viking"}]');
            });
            
            model.association('parent').reload();
            this.withRequest('GET', '/parents', { params: {where: {id: 24}, order: {id: 'desc'}, limit: 1} }, (xhr) => {
                xhr.respond(200, {}, '[]');
            });
        })
    });
});