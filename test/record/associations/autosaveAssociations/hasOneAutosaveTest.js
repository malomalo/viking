import * as assert from 'assert';
import 'mocha';
import VikingRecord from 'viking/record';
import { hasOne } from 'viking/record/associations';
import { extendClass } from 'viking/support/class';

describe('Viking.Record hasOneAssociations autosave', () => {

    class Phase extends VikingRecord { }
    class Requirement extends VikingRecord {
        static associations = [ hasOne('phase', Phase) ]
    }
    

    describe('on a persisted record', () => {
        it('creates the subresource', function (done) {
            let model = Requirement.instantiate({id: 24});
            let phase = new Phase({ name: 'Tom' });
            model.phase = phase
            
            assert.ok(phase.isNewRecord())
            model.save().then(() => {
                assert.equal(phase.readAttribute('id'), 11);
                assert.ok(phase.isPersisted());
                assert.ok(!model.association('phase').needsSaved());
            }).then(done, done);
            
            this.withRequest('PUT', '/requirements/24', { body: {
                requirement: {
                    phase: { name: 'Tom' }
                }
            }}, (xhr) => {
                xhr.respond(201, {}, '{"id": 24, "phase": {"id": "11", "name": "Tom"}}');
            })
        });
        
        it('updates the subresource', function (done) {
            let model = Requirement.instantiate({id: 24, phase: { id: 11, name: 'Tom' }});
            let phase = model.phase;

            phase.setAttribute('name', 'Jerry');

            assert.deepEqual(phase.changes(), {name: ['Tom', 'Jerry']})
            model.save().then(() => {
                assert.equal(phase.readAttribute('name'), 'Jerry');
                assert.deepEqual(phase.changes(), {});
                assert.ok(!model.association('phase').needsSaved());
            }).then(done, done);

            this.withRequest('PUT', '/requirements/24', { body: {
                requirement: {
                    phase: { name: 'Jerry', id: 11 }
                }
            }}, (xhr) => {
                xhr.respond(201, {}, '{"id": 24, "phase": {"id": "11", "name": "Jerry"}}');
            });
        });

        it('does nothing with unchanged subresources', function (done) {
            let model = Requirement.instantiate({id: 24, phase: { id: 11, name: 'Tom' }});
            let phase = model.phase;

            model.setAttribute('planet', 'Venus');
            model.save().then(() => assert.ok(true)).then(done, done);

            this.withRequest('PUT', '/requirements/24', { body: {
                requirement: { planet: 'Venus' }
            }}, (xhr) => {
                xhr.respond(201, {}, '{"id": 24, "planet": "Venus"}');
            });
        });

        it('removes the relation', function (done) {
            let model = Requirement.instantiate({id: 24, phase: { id: 11, name: 'Tom' }});
            let phase = model.phase;

            phase.setAttribute('name', 'Jerry');
            model.phase = null;

            model.save().then(() => assert.ok(true)).then(done, done);

            this.withRequest('PUT', '/requirements/24', { body: {
                requirement: { phase: null }
            }}, (xhr) => {
                xhr.respond(201, {}, '{"id": 24, "phase": null}');
            });
        })
    });

    describe('on a new record', () => {
        it('creates the subresource', function (done) {
            let model = new Requirement();
            let phase = new Phase({ name: 'Tom' });
            model.phase = phase

            assert.ok(phase.isNewRecord())
            model.save().then(() => {
                assert.equal(phase.readAttribute('id'), 11);
                assert.ok(phase.isPersisted());
                assert.ok(!model.association('phase').needsSaved());
            }).then(done, done);

            this.withRequest('POST', '/requirements', { body: {
                requirement: {
                    phase: { name: 'Tom' }
                }
            }}, (xhr) => {
                xhr.respond(201, {}, '{"id": 24, "phase": {"id": "11", "name": "Tom"}}');
            })
        });

        it('updates the subresource', function (done) {
            let model = new Requirement();
            let phase = Phase.instantiate({ id: 11, name: 'Tom' });
            model.phase = phase;

            phase.setAttribute('name', 'Jerry');
            assert.deepEqual(phase.changes(), {name: ['Tom', 'Jerry']})
            model.save().then(() => {
                assert.equal(phase.readAttribute('name'), 'Jerry');
                assert.deepEqual(phase.changes(), {});
                assert.ok(!model.association('phase').needsSaved());
            }).then(done, done);

            this.withRequest('POST', '/requirements', { body: {
                requirement: {
                    phase: { name: 'Jerry', id: 11 }
                }
            }}, (xhr) => {
                xhr.respond(201, {}, '{"id": 24, "phase": {"id": "11", "name": "Jerry"}}');
            });
        });

        it('does nothing with unchanged subresources', function (done) {
            let model = new Requirement();
            let phase = Phase.instantiate({ id: 11, name: 'Tom' });
            model.phase = phase;

            model.setAttribute('planet', 'Venus');
            model.save().then(() => {
                assert.equal(phase.readAttribute('requirement_id'), 24);
                assert.deepEqual(phase.changes(), {});
            }).then(done, done);

            this.withRequest('POST', '/requirements', { body: {
                requirement: { planet: 'Venus', phase: { id: 11 } }
            }}, (xhr) => {
                xhr.respond(201, {}, '{"id": 24, "planet": "Venus", "phase": { "id": 11, "requirement_id": 24 }}');
            });
        });
    });
    
    describe('dirty', () => {
        it('shows not dirty after load', function (done) {
            let model = new Requirement({id: 11});
            
            model.association('phase').addEventListener('afterAdd', () => {
                assert.ok(!model.association('phase').needsSaved());
                done()
            })
            model.phase.load()
            
            this.withRequest('GET', '/phases', {params: {
                where: {requirement_id: 11},
                order: {id: 'desc'},
                limit: 1
            }}, xhr => {
                xhr.respond(201, {}, '[{"id": "99", "name": "Jerry", "requirement_id": 11}]')
            })
        })
    })
});