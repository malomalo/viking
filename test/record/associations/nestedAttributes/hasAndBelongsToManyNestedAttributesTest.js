import * as assert from 'assert';
import 'mocha';
import VikingRecord from 'viking/record';
import { hasAndBelongsToMany } from 'viking/record/associations';
import {extendClass} from 'viking/support/class';

describe('Viking.Record::Associations', () => {

    describe('hasAndBelongsToMany NestedAttributes', () => {
        class Requirement extends VikingRecord {
            static associations = [ hasAndBelongsToMany('phases', Phase) ]
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
                    xhr.respond(201, {}, '{"id": 24, "phases": [{"id": "11", "name": "Tom"}]}');
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
                    xhr.respond(201, {}, '{"id": 24, "phases": [{"id": "11", "name": "Jerry"}]}');
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