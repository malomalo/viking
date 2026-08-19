import assert from 'assert';
import VikingRecord from 'viking/record';
import { hasMany } from 'viking/record/associations';
import { extendClass } from 'viking/support/class';

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
                        phases: [{ name: 'Tom' }]
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
        
        it('a save queued behind another does not resubmit a just-created child', function (done) {
            // Regression: a second save issued before the first responds used
            // to freeze its request body up front, so it resubmitted the new
            // child without the id the first save assigned it — the server
            // rejected the duplicate. The queued save must build its body only
            // after the first lands, by which point the child is persisted and
            // no longer part of the payload.
            let model = Requirement.instantiate({id: 24});
            let phase = new Phase({ name: 'Tom' });

            let phaseCreates = 0;

            // First save creates the phase (sent without an id).
            this.onRequest('PUT', '/requirements/24', { body: {
                requirement: { phases: [{ name: 'Tom' }] }
            }}, (xhr) => {
                phaseCreates++;
                xhr.respond(201, {}, '{"id": 24, "phases": [{"id": "11", "name": "Tom", "requirement_id": 24}]}');
            });

            // The queued save is built only after the first lands, by which
            // point the phase is saved and drops out — the body is just the
            // parent's own change, never a second id-less phase. (Before the
            // fix this matched `phases: [{ name: 'Tom' }]` a second time.)
            this.onRequest('PUT', '/requirements/24', { body: {
                requirement: { reference: 'R-2' }
            }}, (xhr) => {
                xhr.respond(201, {}, '{"id": 24, "reference": "R-2"}');
            });

            model.phases.push(phase).then(() => {
                const first = model.save();
                // A distinct edit so the queued save still has something to send.
                model.setAttribute('reference', 'R-2');
                const second = model.save();

                Promise.all([first, second]).then(() => {
                    assert.ok(phase.isPersisted());
                    assert.equal(phase.readAttribute('id'), 11);
                    assert.equal(phaseCreates, 1);
                    assert.ok(!model.association('phases').needsSaved());
                }).then(done, done);
            });

            this.onRequest('GET', '/phases', { params: {
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
                xhr.respond(201, {}, '{"id": 24, "phases": [{"id": 11, "name": "Jerry", "requirement_id": 24}]}');
            });
        });
        
        it('updates deep subresource', function (done) {
            let model = Requirement.instantiate({
                id: 24,
                phases: [{
                    id: 11,
                    name: 'Preparation',
                    parts: [{
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
                xhr.respond(201, {}, '{"id": 24, "phases": [{"id": 11, "name": "Preparation", "parts": [{"name": "Bar", "id": 3}]}]}');
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
                    xhr.respond(201, {}, '{"id": 24, "phases": [{"id": 11, "name": "Tom", "requirement_id": 24}]}');
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
                    xhr.respond(201, {}, '{"id": 24, "phases": [{"id": 11, "name": "Jerry", "requirement_id": 24}]}');
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
                xhr.respond(201, {}, '[{"id": 99, "name": "Jerry", "requirement_id": 11}]')
            })
        })
    })
});