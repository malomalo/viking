import * as assert from 'assert';
import 'mocha';
import VikingRecord from 'viking/record';
import { hasMany } from 'viking/record/associations';

describe('Viking.Record::ssociations', () => {

    describe('HasAndBelongsTo Events', () => {
        class Parent extends VikingRecord { }
        class Model extends VikingRecord {
            static associations = [hasMany(Parent)];
        }
        
        it("setting target fires add event", function (done){
            let model = new Model();
            let parent = new Parent({id: 24});
        
            model.association('parents').addEventListener('add', records => {
                assert.equal(records[0].readAttribute('id'), 24)
                done()
            })
        
            model.parents = [parent]
        })
        
        it("setting target fires add event on record", function (done){
            let model = new Model({id: 11});
            let parent = new Parent({id: 24});
        
            parent.addEventListener('add', association => {
                assert.equal(association.owner, model)
                done()
            })
        
            model.parents.push(parent)
        })
        
        it("unsetting target fires remove event", function (done) {
            let model = new Model();
            let parent = new Parent({id: 24});
            model.parents = [parent]
            
            model.association('parents').addEventListener('remove', records => {
                assert.equal(records[0].readAttribute('id'), 24)
                done()
            })
            
            model.parents = []
        })
        
        it("unsetting target fires remove event on record", function (done) {
            let model = new Model();
            let parent = new Parent({id: 24});
            model.parents = [parent]
            
            parent.addEventListener('remove', association => {
                assert.equal(association.owner, model)
                done()
            })
            
            model.parents = []
        })
        
        it("loading fires load event", function (done) {
            let model = new Model({id: 24});
            
            model.association('parents').addEventListener('load', records => {
                assert.equal(records[0].readAttribute('id'), 2)
                done()
            })
            model.parents.toArray();
            this.withRequest('GET', '/parents', { params: {where: {model_id: 24}, order: {id: 'desc'}} }, (xhr) => {
                xhr.respond(200, {}, '[{"id": 2, "name": "Viking"}]');
            });
        })
    });
});