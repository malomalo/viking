import assert from 'assert';
import VikingRecord from 'viking/record';
import { hasMany, belongsTo } from 'viking/record/associations';
import * as Errors from 'viking/errors';
import {extendClass} from 'viking/support/class';

describe('Viking.Record::associations', () => {

    describe('cyclical association', () => {
        class Requirement extends VikingRecord {
            static associations = [ hasMany(Phase) ]
        }
    
        function Phase () {
          var NewTarget = Object.getPrototypeOf(this).constructor;
          return Reflect.construct(VikingRecord, arguments, NewTarget);
        }

        extendClass('Phase', VikingRecord, Phase, {
          associations: [ belongsTo(Requirement) ]
        });


        it("load association", function(done) {
            let model = new Requirement({id: 24});
            model.phases.load().then((models) => {
                assert.equal(models.length, 1);
                assert.ok(models[0] instanceof Phase);
                assert.equal(models[0].readAttribute('id'), 24);
                assert.equal(models[0].readAttribute('name'), 'Viking');
            }).then(done, done);
            this.withRequest('GET', '/phases', { params: {where: {requirement_id: 24}, order: {id: 'desc'}} }, (xhr) => {
                xhr.respond(200, {}, '[{"id": 24, "name": "Viking"}]');
            });
        });
        
        it("clone association", function (done) {
            let model = new Requirement({id: 24});
            model.phases.load().then(models => {
                const clone = model.phases.clone()
                assert.ok(clone.loaded);
                assert.notEqual(clone.listenerId, model.phases.listenerId)
                assert.notEqual(clone.target[0].cid, model.phases.target[0].cid)
                assert.equal(clone.target[0].readAttribute('id'), model.phases.target[0].readAttribute('id'))
            }).then(done, done)
            
            this.withRequest('GET', '/phases', { params: {where: {requirement_id: 24}, order: {id: 'desc'}} }, (xhr) => {
                xhr.respond(200, {}, '[{"id": 24, "name": "Viking"}]');
            });
        })
        
        
    });
    
    describe('association function', () => {
        class Tool extends VikingRecord {}
        class Phase extends VikingRecord {}
        class Requirement extends VikingRecord {
            static associations = () => [ hasMany(Phase) ]
        }
        class DesignRequirement extends Requirement {
            static associations = [
                hasMany(Tool)
            ]
        }
        
        it("load association", () => {
            let record = new Requirement()
            assert.deepEqual(['phases'], Object.keys(record._associations))
        })
        
        it("nested extensions", () => {
            let record = new DesignRequirement()
            assert.deepEqual(['phases', 'tools'], Object.keys(record._associations))
        })
    })
});