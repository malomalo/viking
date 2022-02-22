import * as assert from 'assert';
import 'mocha';
import VikingRecord from 'viking/record';
import { hasMany } from 'viking/record/associations';
import { extendClass } from 'viking/support/class';

describe('Viking.Record HasManyAssociation autosave', () => {
    
    class Phase extends VikingRecord { }
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
            }).then(done, done);

            this.withRequest('PUT', '/requirements/24', { body: {
                requirement: {
                    phases: [{ name: 'Jerry', id: 11 }]
                }
            }}, (xhr) => {
                xhr.respond(201, {}, '{"id": 24, "phases": [{"id": "11", "name": "Jerry", "requirement_id": 24}]}');
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
        
        it('shows needsSaved for during event callbacks', function (done) {
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
});