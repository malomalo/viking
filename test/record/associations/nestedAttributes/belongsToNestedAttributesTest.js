import * as assert from 'assert';
import 'mocha';
import VikingRecord from 'viking/record';
import { belongsTo } from 'viking/record/associations';
import {extendClass} from 'viking/support/class';

describe('Viking.Record::Associations', () => {

    describe('belongsTo NestedAttributes', () => {
        class Requirement extends VikingRecord {
            static associations = [ belongsTo('phase', Phase) ]
        }

        function Phase () {
            var NewTarget = Object.getPrototypeOf(this).constructor;
            return Reflect.construct(VikingRecord, arguments, NewTarget);
        }

        extendClass('Phase', VikingRecord, Phase);
        
        describe('saving', () => {
            let model = new Requirement({id: 24});
            model.persist()
        
            let phase = new Phase({
                name: 'Tom'
            })
            model.phase = phase
        
            it("create", function (done) {
                assert.ok(phase.isNewRecord())
                model.save({
                    include: { phase: true }
                }).then(() => {
                    phase = model.phase;
                    assert.equal(phase.readAttribute('id'), 11);
                    assert.ok(phase.isPersisted());
                }).then(done, done)
                this.withRequest('PUT', '/requirements/24', { body: {
                    requirement: {
                        phase_attributes: {
                            name: 'Tom'
                        }
                    }
                }}, (xhr) => {
                    xhr.respond(201, {}, '{"id": 24, "phase": {"id": "11", "name": "Tom"}}');
                })
            });
        
            it("update", function (done) {
                model.association('phase').loaded = true;
                phase.setAttribute('id', 11);
                phase.persist();
            
                phase.setAttribute('name', 'Jerry')
                assert.deepEqual(phase.changes(), {name: ['Tom', 'Jerry']})
                model.save({
                    include: { phase: {} }
                }).then(() => {
                    assert.deepEqual(phase.changes(), {})
                }).then(done, done)
            
                this.withRequest('PUT', '/requirements/24', { body: {
                    requirement: {
                        phase_attributes: {
                            name: 'Jerry',
                            id: 11
                        }
                    }
                }}, (xhr) => {
                    xhr.respond(201, {}, '{"id": 24, "phase": {"id": "11", "name": "Jerry"}}');
                })
            })

            it("unchanged", function (done) {
                model.association('phase').loaded = true;
                phase.setAttribute('id', 11);
                phase.persist();
                
                model.save({
                    include: { phase: true }
                }).then(() => {
                    assert.ok(true);
                }).then(done, done)
                this.withRequest('PUT', '/requirements/24', { body: {
                    requirement: {}
                }}, (xhr) => {
                    xhr.respond(201, {}, '{"id": 24, "phase": {"id": "11", "name": "Tom"}}');
                })
            });
        
            it("destroy", function (done) {
                model.association('phase').loaded = true;
                phase.setAttribute('id', 11);
                phase.persist();
            
                model.phase = null
                
                model.save({
                    include: { phase: {} }
                }).then(() => {
                    assert.ok(true)
                }).then(done, done)
        
                this.withRequest('PUT', '/requirements/24', { body: {
                    requirement: {
                        phase_id: null,
                        phase_attributes: {
                            id: 11,
                            _destroyed: true
                        }
                    }
                }}, (xhr) => {
                    xhr.respond(201, {}, '{"id": 24, "phase": {}}');
                })
            
            });
        })
        describe('saving deep', () => {
            it("create", function () {});
            it("update", function () {})
            it("destroy", function () {});
        })
        
        describe('saving unloaded', () => {
            it("create", function () {});
            it("update", function () {})
            it("destroy", function () {});
        })
    });
});