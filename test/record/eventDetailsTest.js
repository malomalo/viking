import assert from 'assert';
import VikingRecord from 'viking/record';
import { hasMany, hasOne, belongsTo } from 'viking/record/associations';

// Records the name and details (last argument) of every event fired on `bus`.
function recordDetails(bus) {
    const received = [];
    bus.addEventListener('*', (name, ...args) => {
        received.push([name, args[args.length - 1]]);
    });
    return received;
}

describe('Viking event details', () => {
    const details = {silentNotification: true};

    class Actor extends VikingRecord {
        static schema = {
            id: {type: 'integer'},
            name: {type: 'string'}
        }
    }

    describe('Record', () => {
        it('#save passes details, without request options, to every event', function (done) {
            const actor = Actor.instantiate({id: 1, name: 'Fred'});
            const received = recordDetails(actor);

            actor.name = 'Rod';
            received.length = 0;

            actor.save({silentNotification: true, headers: {'X-Test': '1'}, label: 'test'}).then(() => {
                assert.deepEqual(received, [
                    ['beforeSave', details],
                    ['beforeSync', details],
                    ['changed:name', details],
                    ['changed', details],
                    ['afterSave', details],
                    ['afterSync', details],
                    ['afterSync:name', details]
                ]);
            }).then(done, done);

            this.withRequest('PUT', '/actors/1', { body: {actor: {name: 'Rod'}} }, (xhr) => {
                xhr.respond(200, {}, '{"id": 1, "name": "Jimmy"}');
            });
        });

        it('#save passes details to beforeCreate and afterCreate', function (done) {
            const actor = new Actor({name: 'Fred'});
            const received = recordDetails(actor);

            actor.save({silentNotification: true}).then(() => {
                const names = received.map(([name]) => name);
                assert.ok(names.includes('beforeCreate'));
                assert.ok(names.includes('afterCreate'));
                received.forEach(([name, d]) => assert.deepEqual(d, details, name));
            }).then(done, done);

            this.withRequest('POST', '/actors', { body: {actor: {name: 'Fred'}} }, (xhr) => {
                xhr.respond(201, {}, '{"id": 2, "name": "Fred"}');
            });
        });

        it('#save passes details to record:afterSync on collections', function (done) {
            const relation = Actor.where({name: 'Fred'});

            relation.load().then(() => {
                const actor = relation.target[0];
                let syncDetails, attributeDetails;
                relation.addEventListener('record:afterSync', (r, changes, d) => { syncDetails = d; });
                relation.addEventListener('record:afterSync:name', (r, oldValue, newValue, d) => { attributeDetails = d; });

                actor.name = 'Rod';
                const saving = actor.save({silentNotification: true}).then(() => {
                    assert.deepEqual(syncDetails, details);
                    assert.deepEqual(attributeDetails, details);
                });

                this.withRequest('PUT', '/actors/1', { body: {actor: {name: 'Rod'}} }, (xhr) => {
                    xhr.respond(200, {}, '{"id": 1, "name": "Rod"}');
                });
                return saving;
            }).then(done, done);

            this.withRequest('GET', '/actors', { params: {where: {name: 'Fred'}, order: {id: 'desc'}} }, (xhr) => {
                xhr.respond(200, {}, '[{"id": 1, "name": "Fred"}]');
            });
        });

        it('#save passes details to invalid', function (done) {
            const actor = new Actor({name: 'Fred'});

            actor.addEventListener('invalid', (errors, d) => {
                assert.deepEqual(d, details);
                done();
            });
            actor.save({silentNotification: true});

            this.withRequest('POST', '/actors', { body: {actor: {name: 'Fred'}} }, (xhr) => {
                xhr.respond(400, {'Content-Type': 'application/json'}, '{"errors": {"name": ["can only be Jimmy"]}}');
            });
        });

        it('#save passes details to error', function (done) {
            const actor = new Actor({name: 'Fred'});

            actor.addEventListener('error', (response, d) => {
                assert.deepEqual(d, details);
                done();
            });
            actor.save({silentNotification: true});

            this.withRequest('POST', '/actors', { body: {actor: {name: 'Fred'}} }, (xhr) => {
                xhr.respond(500, {}, 'something went wrong');
            });
        });

        it('#update passes details to the local change events and the save events', function (done) {
            const actor = Actor.instantiate({id: 1, name: 'Fred'});
            const received = recordDetails(actor);

            actor.update({name: 'Rod'}, {silentNotification: true}).then(() => {
                assert.ok(received.length > 0);
                received.forEach(([name, d]) => assert.deepEqual(d, details, name));
            }).then(done, done);

            this.withRequest('PUT', '/actors/1', { body: {actor: {name: 'Rod'}} }, (xhr) => {
                xhr.respond(200, {}, '{"id": 1, "name": "Rod"}');
            });
        });

        it('#destroy passes details to beforeDestroy and afterDestroy', function (done) {
            const actor = Actor.instantiate({id: 1, name: 'Fred'});
            const received = recordDetails(actor);

            actor.destroy({silentNotification: true}).then(() => {
                assert.deepEqual(received, [
                    ['beforeDestroy', details],
                    ['afterDestroy', details]
                ]);
            }).then(done, done);

            this.withRequest('DELETE', '/actors/1', {}, (xhr) => {
                xhr.respond(204, {}, '');
            });
        });

        it('#reload passes details to the sync events', function (done) {
            const actor = Actor.instantiate({id: 1, name: 'Fred'});
            const received = recordDetails(actor);

            actor.reload({silentNotification: true}).then(() => {
                assert.ok(received.length > 0);
                received.forEach(([name, d]) => assert.deepEqual(d, details, name));
            }).then(done, done);

            this.withRequest('GET', '/actors/1', {}, (xhr) => {
                xhr.respond(200, {}, '{"id": 1, "name": "Rod"}');
            });
        });

        it('#revertChanges passes details to the change events', () => {
            const actor = Actor.instantiate({id: 1, name: 'Fred'});
            actor.name = 'Rod';
            const received = recordDetails(actor);

            actor.revertChanges({silentNotification: true});
            assert.deepEqual(received, [['changed:name', details], ['changed', details]]);
        });

        it('passes an empty object when no details are given', function (done) {
            const actor = Actor.instantiate({id: 1, name: 'Fred'});
            actor.name = 'Rod';
            const received = recordDetails(actor);

            actor.save().then(() => {
                received.forEach(([name, d]) => assert.deepEqual(d, {}, name));
            }).then(done, done);

            this.withRequest('PUT', '/actors/1', { body: {actor: {name: 'Rod'}} }, (xhr) => {
                xhr.respond(200, {}, '{"id": 1, "name": "Rod"}');
            });
        });
    });

    describe('Relation', () => {
        it('#load passes details to the load and add events', function (done) {
            const relation = Actor.where({name: 'Fred'});
            const received = recordDetails(relation);

            relation.load({silentNotification: true}).then(() => {
                assert.deepEqual(received, [
                    ['beforeLoad', details],
                    ['beforeSetTarget', details],
                    ['afterAdd', details],
                    ['afterLoad', details]
                ]);
            }).then(done, done);

            this.withRequest('GET', '/actors', { params: {where: {name: 'Fred'}, order: {id: 'desc'}} }, (xhr) => {
                xhr.respond(200, {}, '[{"id": 1, "name": "Fred"}]');
            });
        });

        it('#reload passes details to the change events of records updated in place', function (done) {
            const relation = Actor.where({name: 'Fred'});

            relation.load().then(() => {
                const actor = relation.target[0];
                let changedDetails;
                actor.addEventListener('changed', (r, changes, d) => { changedDetails = d; });

                const reloading = relation.reload({silentNotification: true}).then(() => {
                    assert.deepEqual(changedDetails, details);
                });
                this.withRequest('GET', '/actors', { params: {where: {name: 'Fred'}, order: {id: 'desc'}} }, (xhr) => {
                    xhr.respond(200, {}, '[{"id": 1, "name": "Rod"}]');
                });
                return reloading;
            }).then(done, done);

            this.withRequest('GET', '/actors', { params: {where: {name: 'Fred'}, order: {id: 'desc'}} }, (xhr) => {
                xhr.respond(200, {}, '[{"id": 1, "name": "Fred"}]');
            });
        });

        it('#setTarget passes details to the add and remove events', () => {
            const relation = Actor.all();
            const a = new Actor({id: 1});
            const b = new Actor({id: 2});
            relation.setTarget([a]);
            const received = recordDetails(relation);

            relation.setTarget([b], {silentNotification: true});
            assert.deepEqual(received, [
                ['beforeSetTarget', details],
                ['afterAdd', details],
                ['afterRemove', details]
            ]);
        });

        it('query methods pass details to their changed events', () => {
            const relation = Actor.all();
            const received = [];
            const listen = (r) => {
                r.addEventListener('changed', (key, value, d) => received.push([key, d]));
                return r;
            };

            listen(relation.spawn()).applyWhere({name: 'Fred'}, details);
            listen(relation.spawn()).applyRewhere({name: 'Fred'}, details);
            listen(relation.spawn()).setWhere({name: 'Fred'}, details);
            listen(relation.spawn()).applyOrder({name: 'asc'}, details);
            listen(relation.spawn()).setOrder({name: 'asc'}, details);
            listen(relation.spawn()).setLimit(5, details);
            listen(relation.spawn()).setOffset(5, details);
            listen(relation.spawn()).setReverseOrder(details);

            assert.deepEqual(received, [
                ['where', details], ['where', details], ['where', details],
                ['order', details], ['order', details],
                ['limit', details], ['offset', details], ['order', details]
            ]);
        });
    });

    describe('associations', () => {
        class Parent extends VikingRecord {
            static schema = { id: {type: 'integer'}, name: {type: 'string'} }
        }
        class Child extends VikingRecord {
            static schema = { id: {type: 'integer'}, model_id: {type: 'integer'} }
        }
        class Model extends VikingRecord {
            static schema = { id: {type: 'integer'}, parent_id: {type: 'integer'} }
            static associations = [belongsTo(Parent), hasMany(Child)];
        }

        it('hasMany#load passes details to the load and add events', function (done) {
            const model = Model.instantiate({id: 24});
            const association = model.association('children');
            const received = recordDetails(association);

            association.load({silentNotification: true}).then(() => {
                assert.deepEqual(received, [
                    ['beforeLoad', details],
                    ['beforeAdd', details],
                    ['afterAdd', details],
                    ['afterLoad', details]
                ]);
            }).then(done, done);

            this.withRequest('GET', '/children', { params: {where: {model_id: 24}, order: {id: 'desc'}} }, (xhr) => {
                xhr.respond(200, {}, '[{"id": 2, "model_id": 24}]');
            });
        });

        it('hasMany#setTarget passes details to the association and record events', () => {
            const model = Model.instantiate({id: 24, children: []});
            const child = new Child({id: 2});
            const received = recordDetails(model.association('children'));
            const childReceived = recordDetails(child);

            model.children = [child];
            received.length = 0;
            childReceived.length = 0;
            model.association('children').setTarget([], {silentNotification: true});

            assert.deepEqual(received, [
                ['beforeRemove', details],
                ['record:changed:model_id', details],
                ['record:changed', details],
                ['afterRemove', details]
            ]);
            assert.deepEqual(childReceived, [
                ['beforeRemove', details],
                ['changed:model_id', details],
                ['changed', details],
                ['afterRemove', details]
            ]);
        });

        it('hasOne#setTarget passes details to the association and record events', () => {
            class Profile extends VikingRecord {
                static schema = { id: {type: 'integer'}, owner_id: {type: 'integer'} }
            }
            class Owner extends VikingRecord {
                static schema = { id: {type: 'integer'} }
                static associations = [hasOne(Profile)];
            }
            const owner = Owner.instantiate({id: 7});
            const profile = new Profile({id: 1});
            const received = recordDetails(owner.association('profile'));
            const profileReceived = recordDetails(profile);

            owner.association('profile').setTarget(profile, {silentNotification: true});

            assert.deepEqual(received, [['beforeAdd', details], ['afterAdd', details]]);
            assert.deepEqual(profileReceived, [
                ['beforeAdd', details],
                ['changed:owner_id', details],
                ['changed', details],
                ['afterAdd', details]
            ]);
        });

        it('belongsTo#setTarget passes details through Record#setAttributes', () => {
            const model = Model.instantiate({id: 24});
            const parent = Parent.instantiate({id: 3, name: 'Alpha'});
            const received = recordDetails(model.association('parent'));
            const ownerReceived = recordDetails(model);

            model.setAttributes({parent}, {silentNotification: true});

            assert.deepEqual(received, [['beforeAdd', details], ['afterAdd', details]]);
            assert.deepEqual(ownerReceived, [['changed:parent_id', details], ['changed', details]]);
        });
    });
});
