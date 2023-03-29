import * as assert from 'assert';
import VikingRecord from '@malomalo/viking/record';
import { hasMany } from '@malomalo/viking/record/associations';
import { extendClass } from '@malomalo/viking/support/class';

describe('Viking.Record HasManyAssociation autosave', () => {
    
    class Part extends VikingRecord { }
    class Phase extends VikingRecord {
        static associations = [ hasMany('parts', Part) ]
    }
    class Requirement extends VikingRecord {
        static associations = [ hasMany('phases', Phase) ]
    }

    describe('on a persisted record', () => {
        it('creates the subresource', function (done) {
            let model = Requirement.instantiate({id: 24});
            let phase = new Phase({ name: 'Tom' });
            model.phases.push(phase).then(() => {
                assert.ok(phase.isNewRecord())
                model.save().then(() => {
                    assert.ok(phase.isPersisted());
                    assert.equal(phase.readAttribute('id'), 11);
                    assert.ok(!model.association('phases').needsSaved());
                }).then(done, done);

                this.withRequest('PUT', '/requirements/24', { body: {
                    requirement: {
                        phases: [{ name: 'Tom', requirement_id: 24 }]
                    }
                }}, (xhr) => {
                    xhr.respond(201, {}, '{"id": 24, "phases": [{"id": "11", "name": "Tom", "requirement_id": 24}]}');
                });
            });
            
            this.withRequest('GET', '/phases', { params: {
                where: { requirement_id: 24 },
                order: { id: 'desc'}  
            }}, (xhr) => {
                xhr.respond(201, {}, '[]');
            });
        });
        
        it('updates the subresource', function (done) {
            let model = Requirement.instantiate({id: 24, phases: [{ id: 11, name: 'Tom' }]});
            let phase = model.phases.first();

            phase.setAttribute('name', 'Jerry');
            assert.deepEqual(phase.changes(), {name: ['Tom', 'Jerry']})
            model.save().then(() => {
                assert.equal(phase.readAttribute('name'), 'Jerry');
                assert.ok(!phase.needsSaved())
                assert.deepEqual(phase.changes(), {});
                assert.ok(!model.association('phases').needsSaved());
            }).then(done, done);

            this.withRequest('PUT', '/requirements/24', { body: {
                requirement: {
                    phases: [{ name: 'Jerry', id: 11 }]
                }
            }}, (xhr) => {
                xhr.respond(201, {}, '{"id": 24, "phases": [{"id": "11", "name": "Jerry", "requirement_id": 24}]}');
            });
        });
        
        it('updates deep subresource', function (done) {
            let model = Requirement.instantiate({
                id: 24, phases: [{
                    id: 11, name: 'Preparation', parts: [{
                        id: 3, name: 'Cog'
                    }]
                }]
            });
            let phase = model.association('phases').target[0];
            let part = phase.association('parts').target[0];
            
            part.setAttribute('name', 'Bar');
            
            assert.deepEqual(part.changes(), {name: ['Cog', 'Bar']})
            model.save().then(() => {
                assert.equal(part.readAttribute('name'), 'Bar');
                assert.deepEqual(part.changes(), {});
                assert.ok(!phase.association('parts').needsSaved())
            }).then(done, done);

            this.withRequest('PUT', '/requirements/24', { body: {
                requirement: { phases: [{ parts: [{name: 'Bar', id: 3}], id: 11 }] }
            }}, (xhr) => {
                xhr.respond(201, {}, '{"id": 24, "phases": [{"id": "11", "name": "Preparation", "parts": [{"name": "Bar", "id": 3}]}]}');
            });
        });

        it('does nothing with unchanged subresources', function (done) {
            let model = Requirement.instantiate({id: 24, phases: [{ id: 11, name: 'Tom' }]});
            let phase = model.phases.first();

            model.setAttribute('planet', 'Venus');
            model.save().then(() => assert.ok(true)).then(done, done);

            this.withRequest('PUT', '/requirements/24', { body: {
                requirement: { planet: 'Venus' }
            }}, (xhr) => {
                xhr.respond(201, {}, '{"id": 24, "planet": "Venus"}');
            });
        });

        it('removes the relation', function (done) {
            let model = Requirement.instantiate({id: 24, phases: [{ id: 11, name: 'Tom' }]});
            let phase = model.phases.first();

            phase.setAttribute('name', 'Jerry');
            model.phases = [];

            model.save().then(() => assert.ok(true)).then(done, done);

            this.withRequest('PUT', '/requirements/24', { body: {
                requirement: { phases: [] }
            }}, (xhr) => {
                xhr.respond(201, {}, '{"id": 24, "phases": []}');
            });
        });
    });

    describe('on a new record', () => {
        it('creates the subresource', function (done) {
            let model = new Requirement();
            let phase = new Phase({name: 'Tom'});
            model.phases.push(phase).then(() => {
                assert.ok(phase.isNewRecord())
                model.save().then(() => {
                    assert.ok(phase.isPersisted());
                    assert.equal(phase.readAttribute('id'), 11);
                    assert.ok(!model.association('phases').needsSaved());
                }).then(done, done);

                this.withRequest('POST', '/requirements', { body: {
                    requirement: {
                        phases: [{ name: 'Tom' }]
                    }
                }}, (xhr) => {
                    xhr.respond(201, {}, '{"id": 24, "phases": [{"id": "11", "name": "Tom", "requirement_id": 24}]}');
                });
            });
        });

        it('updates the subresource', function (done) {
            let model = new Requirement();
            let phase = Phase.instantiate({ id: 11, name: 'Tom' });
            model.phases.push(phase).then(() => {
                phase.setAttribute('name', 'Jerry');
                assert.deepEqual(phase.changes(), {name: ['Tom', 'Jerry']})
                model.save().then(() => {
                    assert.equal(phase.readAttribute('name'), 'Jerry');
                    assert.deepEqual(phase.changes(), {});
                    assert.ok(!model.association('phases').needsSaved());
                }).then(done, done);

                this.withRequest('POST', '/requirements', { body: {
                    requirement: {
                        phases: [{ name: 'Jerry', id: 11 }]
                    }
                }}, (xhr) => {
                    xhr.respond(201, {}, '{"id": 24, "phases": [{"id": "11", "name": "Jerry", "requirement_id": 24}]}');
                });
            });
        });
    });
    
    describe('dirty', () => {
        it('shows not dirty for during event callbacks', function (done) {
            let model = new Requirement({id: 11});
            
            model.phases.addEventListener('afterAdd', () => {
                assert.ok(!model.phases.needsSaved());
                done()
            })
            model.phases.load()
            
            this.withRequest('GET', '/phases', {params: {
                where: {requirement_id: 11},
                order: {id: 'desc'}
            }}, xhr => {
                xhr.respond(201, {}, '[{"id": "99", "name": "Jerry", "requirement_id": 11}]')
            })
        })
    })
});