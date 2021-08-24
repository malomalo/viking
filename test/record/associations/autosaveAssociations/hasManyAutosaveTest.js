import * as assert from 'assert';
import 'mocha';
import VikingRecord from 'viking/record';
import { hasMany } from 'viking/record/associations';
import {extendClass} from 'viking/support/class';

describe('Viking.Record::Associations', () => {

    describe('hasMany NestedAttributes', () => {
        class Requirement extends VikingRecord {
            static associations = [ hasMany('phases', Phase) ]
        }

        function Phase () {
            var NewTarget = Object.getPrototypeOf(this).constructor;
            return Reflect.construct(VikingRecord, arguments, NewTarget);
        }
        
        function Step () {
            var NewTarget = Object.getPrototypeOf(this).constructor;
            return Reflect.construct(VikingRecord, arguments, NewTarget);
        }

        extendClass('Phase', VikingRecord, Phase, {
            associations: [ hasMany('steps', Step) ]
        });
        extendClass('Step', VikingRecord, Step);
            
        describe('saving', () => {
            let model = new Requirement({id: 24});
            model.persist()
        
            let phase = new Phase({
                name: 'Tom'
            })
            model.phases.add(phase)
        
            it("create", function (done) {
                assert.ok(phase.isNewRecord())
                model.save({
                    include: { phases: true }
                }).then(() => {
                    phase = model.phases.first()
                    assert.equal(phase.readAttribute('id'), 11);
                    assert.ok(phase.isPersisted());
                }).then(done, done)
                this.withRequest('PUT', '/requirements/24', { body: {
                    requirement: {
                        phases_attributes: [{
                            name: 'Tom',
                            requirement_id: 24
                        }]
                    }
                }}, (xhr) => {
                    xhr.respond(201, {}, '{"id": 24, "phases": [{"id": "11", "name": "Tom", "requirement_id": 24}]}');
                })
            });
        
            it("update", function (done) {
                model.phases.loaded = true;
                phase.setAttribute('id', 11);
                phase.persist();
            
                phase.setAttribute('name', 'Jerry')
                assert.deepEqual(phase.changes(), {name: ['Tom', 'Jerry']})
                model.save({
                    include: { phases: {} }
                }).then(() => {
                    assert.deepEqual(phase.changes(), {})
                }).then(done, done)
            
                this.withRequest('PUT', '/requirements/24', { body: {
                    requirement: {
                        phases_attributes: [{
                            name: 'Jerry',
                            id: 11
                        }]
                    }
                }}, (xhr) => {
                    xhr.respond(201, {}, '{"id": 24, "phases": [{"id": "11", "name": "Jerry", "requirement_id": 24}]}');
                })
            })
            
            it("unchanged", function (done) {
                model.phases.loaded = true;
                phase.setAttribute('id', 11);
                phase.persist();
                
                model.save({
                    include: { phases: true }
                }).then(() => {
                    assert.ok(true);
                }).then(done, done)
                this.withRequest('PUT', '/requirements/24', { body: {
                    requirement: {}
                }}, (xhr) => {
                    xhr.respond(201, {}, '{"id": 24, "phases": [{"id": "11", "name": "Tom", "requirement_id": 24}]}');
                })
            });
        
            it("destroy", function (done) {
                model.phases.loaded = true;
                phase.setAttribute('id', 11);
                phase.persist();
            
            
                model.phases.remove(phase).then(() => {
                    model.save({
                        include: { phases: {} }
                    }).then(() => {
                        assert.ok(true)
                    }).then(done, done)
            
                    this.withRequest('PUT', '/requirements/24', { body: {
                        requirement: {
                            phases_attributes: [{
                                _destroyed: true,
                                id: 11
                            }]
                        }
                    }}, (xhr) => {
                        xhr.respond(201, {}, '{"id": 24, "phases": []}');
                    })
                })
            
            });
        })
        describe('saving deep', () => {
            let model = new Requirement({id: 24});
            model.persist()
        
            let phase = new Phase({
                name: 'Tom'
            })
            model.phases.add(phase)
            
            let step = new Step({
                name: 'Start'
            })
            phase.steps.add(step)
            
            it("create", function (done) {
                model.save({
                    include: { phases: {steps: true} }
                }).then(() => {
                    phase = model.phases.first()
                    step = phase.steps.first()
                    assert.equal(phase.readAttribute('id'), 11);
                    assert.equal(step.readAttribute('id'), 99);
                    assert.ok(phase.isPersisted());
                    assert.ok(step.isPersisted());
                }).then(done, done)
                this.withRequest('PUT', '/requirements/24', { body: {
                    requirement: {
                        phases_attributes: [{
                            name: 'Tom',
                            requirement_id: 24,
                            steps_attributes: [{
                                name: 'Start'
                            }]
                        }]
                    }
                }}, (xhr) => {
                    xhr.respond(201, {}, '{"id": 24, "phases": [{"id": "11", "name": "Tom", "requirement_id": 24, "steps": [{"id": "99", "name": "Start"}]}]}');
                })
            });
            it("update")
            it("destroy");
        })
        
        describe('saving unloaded', () => {
            it("create", function (done) {
                let model = new Requirement({id: 24});
                model.persist()
                
                model.save({
                    include: { phases: {steps: true} }
                }).then(() => {
                   assert.ok(true)
                }).then(done, done)
                this.withRequest('PUT', '/requirements/24', { body: {
                    requirement: {}
                }}, (xhr) => {
                    xhr.respond(201, {}, '{"id": 24, "phases": []}');
                })
            });
            it("update")
            it("destroy");
        })
    });
});