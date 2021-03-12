import * as assert from 'assert';
import 'mocha';
import VikingRecord from 'viking/record';
import { belongsTo } from 'viking/record/associations';

describe('Viking.Record::ssociations', () => {

    describe('BelongsTo Events', () => {
        class Parent extends VikingRecord { }
        class Model extends VikingRecord {
            static associations = [belongsTo(Parent)];
        }
        
        it("setting target fires add event", function (done){
            let model = new Model();
            let parent = new Parent({id: 24});
        
            model.association('parent').addEventListener('added', record => {
                assert.equal(record.readAttribute('id'), 24)
                done()
            })
        
            model.parent = parent
        })
        
        it("setting target fires add event on record", function (done){
            let model = new Model();
            let parent = new Parent({id: 24});
        
            parent.addEventListener('added', association => {
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
            
            model.association('parent').addEventListener('removed', record => {
                assert.equal(record.readAttribute('id'), 24)
                done()
            })
            
            model.parent = null
        })
        
        it("unsetting target fires remove event on record", function (done) {
            let model = new Model();
            let parent = new Parent({id: 24});
            model.parent = parent
            
            parent.addEventListener('removed', association => {
                assert.equal(association.owner, model);
                assert.equal(model.readAttribute('parent_id'), null)
                done()
            })
            
            model.parent = null
        })
        
        it("loading fires load event", function (done) {
            let model = new Model({parent_id: 24});
            
            model.association('parent').addEventListener('loaded', record => {
                assert.equal(record.readAttribute('id'), 24)
                done()
            })
            model.parent.id;
            this.withRequest('GET', '/parents', { params: {where: {id: 24}, order: {id: 'desc'}, limit: 1} }, (xhr) => {
                xhr.respond(200, {}, '[{"id": 24, "name": "Viking"}]');
            });
        })
    });
});