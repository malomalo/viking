import * as assert from 'assert';
import 'mocha';
import VikingRecord from 'viking/record';
import { hasOne } from 'viking/record/associations';

describe('Viking.Record::associations', () => {

    describe('HasOne Events', () => {
        class Parent extends VikingRecord { }
        class Model extends VikingRecord {
            static associations = [hasOne(Parent)];
        }
        
        it("setting target fires add event", function (done){
            let model = new Model();
            let parent = new Parent({id: 24});
        
            model.association('parent').addEventListener('add', record => {
                assert.equal(record.readAttribute('id'), 24)
                done()
            })
        
            model.parent = parent
        })
        
        it("setting target fires add event on record", function (done){
            let model = new Model({id: 11});
            let parent = new Parent({id: 24});
        
            parent.addEventListener('add', association => {
                assert.equal(association.owner, model);
                assert.equal(parent.readAttribute('model_id'), 11)
                done()
            })
        
            model.parent = parent
        })
        
        it("unsetting target fires remove event", function (done) {
            let model = new Model();
            let parent = new Parent({id: 24});
            model.parent = parent
            
            model.association('parent').addEventListener('remove', record => {
                assert.equal(record.readAttribute('id'), 24)
                done()
            })
            
            model.parent = null
        })
        
        it("unsetting target fires remove event on record", function (done) {
            let model = new Model();
            let parent = new Parent({id: 24});
            model.parent = parent
            
            parent.addEventListener('remove', association => {
                assert.equal(association.owner, model);
                assert.equal(parent.readAttribute('model_id'), null)
                done()
            })
            
            model.parent = null
        })
        
        it("loading fires load event", function (done) {
            let model = new Model({id: 24});
            
            model.association('parent').addEventListener('load', record => {
                assert.equal(record.readAttribute('id'), 1)
                done()
            })
            model.parent.id;
            this.withRequest('GET', '/parents', { params: {where: {model_id: 24}, order: {id: 'desc'}, limit: 1} }, (xhr) => {
                xhr.respond(200, {}, '[{"id": 1, "name": "Viking"}]');
            });
        })
    });
});