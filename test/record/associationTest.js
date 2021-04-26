import * as assert from 'assert';
import 'mocha';
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
console.error(model.phases)
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
        
    });
    
});