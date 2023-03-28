import * as assert from 'assert';
import VikingRecord from '@malomalo/viking/record';
import { belongsTo } from '@malomalo/viking/record/associations';
import {extendClass} from '@malomalo/viking/support/class';

describe('Viking.Record belongsToAssociations autosave', () => {
    class User extends VikingRecord {
        
    }

    class Phase extends VikingRecord {
        static associations = [ belongsTo('user', User)]
    }

    class Requirement extends VikingRecord {
        static associations = [ belongsTo('phase', Phase) ]
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
            }).then(done, done);
            
            this.withRequest('PUT', '/requirements/24', { body: {
                requirement: { phase: { name: 'Tom' } }
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
            }).then(done, done);

            this.withRequest('PUT', '/requirements/24', { body: {
                requirement: { phase: { name: 'Jerry', id: 11 } }
            }}, (xhr) => {
                xhr.respond(201, {}, '{"id": 24, "phase": {"id": "11", "name": "Jerry"}}');
            });
        });
        
        it('updates deep subresource', function (done) {
            let model = Requirement.instantiate({
                id: 24, phase: {
                    id: 11, name: 'Preparation', user: {
                        id: 3, name: 'Tom'
                    }
                }
            });
            let phase = model.phase;
            let user = phase.user
            
            user.setAttribute('name', 'Jerry');
            
            assert.deepEqual(user.changes(), {name: ['Tom', 'Jerry']})
            model.save().then(() => {
                assert.equal(user.readAttribute('name'), 'Jerry');
                assert.deepEqual(user.changes(), {});
            }).then(done, done);

            this.withRequest('PUT', '/requirements/24', { body: {
                requirement: { phase: { user: {name: 'Jerry', id: 3}, id: 11 } }
            }}, (xhr) => {
                xhr.respond(201, {}, '{"id": 24, "phase": {"id": "11", "name": "Preparation", "user": {"name": "Jerry", "id": 3}}}');
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
                requirement: {
                    phase_id: null
                }
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
            }).then(done, done);
            
            this.withRequest('POST', '/requirements', { body: {
                requirement: { phase: { name: 'Tom' } }
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
            }).then(done, done);

            this.withRequest('POST', '/requirements', { body: {
                requirement: { phase_id: 11, phase: { name: 'Jerry', id: 11 } }
            }}, (xhr) => {
                xhr.respond(201, {}, '{"id": 24, "phase": {"id": "11", "name": "Jerry"}}');
            });
        });

        it('does nothing with unchanged subresources', function (done) {
            let model = new Requirement();
            let phase = Phase.instantiate({ id: 11, name: 'Tom' });
            model.phase = phase;

            model.setAttribute('planet', 'Venus');
            model.save().then(() => assert.ok(true)).then(done, done);

            this.withRequest('POST', '/requirements', { body: {
                requirement: { phase_id: 11, planet: 'Venus' }
            }}, (xhr) => {
                xhr.respond(201, {}, '{"id": 24, "planet": "Venus"}');
            });
        });
    });
});