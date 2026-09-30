import assert from 'assert';
import VikingRecord from 'viking/record';
import { hasMany, hasOne, belongsTo } from 'viking/record/associations';

// Records the name and event parameters (last argument) of every event fired on `bus`.
function recordEventParameters(bus) {
    const received = [];
    bus.addEventListener('*', (name, ...args) => {
        received.push([name, args[args.length - 1]]);
    });
    return received;
}

describe('Viking eventParameters', () => {
    const eventParameters = {silentNotification: true};

    class Actor extends VikingRecord {
        static schema = {
            id: {type: 'integer'},
            name: {type: 'string'}
        }
    }

    describe('Record', () => {
        it('#save passes eventParameters, without request options, to every event', function (done) {
            const actor = Actor.instantiate({id: 1, name: 'Fred'});
            const received = recordEventParameters(actor);

            actor.name = 'Rod';
            received.length = 0;

            actor.save({silentNotification: true, headers: {'X-Test': '1'}, label: 'test'}).then(() => {
                assert.deepEqual(received, [
                    ['beforeSave', eventParameters],
                    ['beforeSync', eventParameters],
                    ['changed:name', eventParameters],
                    ['changed', eventParameters],
                    ['afterSave', eventParameters],
                    ['afterSync', eventParameters],
                    ['afterSync:name', eventParameters]
                ]);
            }).then(done, done);

            this.withRequest('PUT', '/actors/1', { body: {actor: {name: 'Rod'}} }, (xhr) => {
                xhr.respond(200, {}, '{"id": 1, "name": "Jimmy"}');
            });
        });

        it('#save passes eventParameters to beforeCreate and afterCreate', function (done) {
            const actor = new Actor({name: 'Fred'});
            const received = recordEventParameters(actor);

            actor.save({silentNotification: true}).then(() => {
                const names = received.map(([name]) => name);
                assert.ok(names.includes('beforeCreate'));
                assert.ok(names.includes('afterCreate'));
                received.forEach(([name, d]) => assert.deepEqual(d, eventParameters, name));
            }).then(done, done);

            this.withRequest('POST', '/actors', { body: {actor: {name: 'Fred'}} }, (xhr) => {
                xhr.respond(201, {}, '{"id": 2, "name": "Fred"}');
            });
        });

        it('#save passes eventParameters to record:afterSync on collections', function (done) {
            const relation = Actor.where({name: 'Fred'});

            relation.load().then(() => {
                const actor = relation.target[0];
                let syncEventParameters, attributeEventParameters;
                relation.addEventListener('record:afterSync', (r, changes, d) => { syncEventParameters = d; });
                relation.addEventListener('record:afterSync:name', (r, oldValue, newValue, d) => { attributeEventParameters = d; });

                actor.name = 'Rod';
                const saving = actor.save({silentNotification: true}).then(() => {
                    assert.deepEqual(syncEventParameters, eventParameters);
                    assert.deepEqual(attributeEventParameters, eventParameters);
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

        it('#save passes eventParameters to invalid', function (done) {
            const actor = new Actor({name: 'Fred'});

            actor.addEventListener('invalid', (errors, d) => {
                assert.deepEqual(d, eventParameters);
                done();
            });
            actor.save({silentNotification: true});

            this.withRequest('POST', '/actors', { body: {actor: {name: 'Fred'}} }, (xhr) => {
                xhr.respond(400, {'Content-Type': 'application/json'}, '{"errors": {"name": ["can only be Jimmy"]}}');
            });
        });

        it('#save passes eventParameters to error', function (done) {
            const actor = new Actor({name: 'Fred'});

            actor.addEventListener('error', (response, d) => {
                assert.deepEqual(d, eventParameters);
                done();
            });
            actor.save({silentNotification: true});

            this.withRequest('POST', '/actors', { body: {actor: {name: 'Fred'}} }, (xhr) => {
                xhr.respond(500, {}, 'something went wrong');
            });
        });

        it('#update passes eventParameters to the local change events and the save events', function (done) {
            const actor = Actor.instantiate({id: 1, name: 'Fred'});
            const received = recordEventParameters(actor);

            actor.update({name: 'Rod'}, {silentNotification: true}).then(() => {
                assert.ok(received.length > 0);
                received.forEach(([name, d]) => assert.deepEqual(d, eventParameters, name));
            }).then(done, done);

            this.withRequest('PUT', '/actors/1', { body: {actor: {name: 'Rod'}} }, (xhr) => {
                xhr.respond(200, {}, '{"id": 1, "name": "Rod"}');
            });
        });

        it('#destroy passes eventParameters to beforeDestroy and afterDestroy', function (done) {
            const actor = Actor.instantiate({id: 1, name: 'Fred'});
            const received = recordEventParameters(actor);

            actor.destroy({silentNotification: true}).then(() => {
                assert.deepEqual(received, [
                    ['beforeDestroy', eventParameters],
                    ['afterDestroy', eventParameters]
                ]);
            }).then(done, done);

            this.withRequest('DELETE', '/actors/1', {}, (xhr) => {
                xhr.respond(204, {}, '');
            });
        });

        it('#reload passes eventParameters to the sync events', function (done) {
            const actor = Actor.instantiate({id: 1, name: 'Fred'});
            const received = recordEventParameters(actor);

            actor.reload({silentNotification: true}).then(() => {
                assert.ok(received.length > 0);
                received.forEach(([name, d]) => assert.deepEqual(d, eventParameters, name));
            }).then(done, done);

            this.withRequest('GET', '/actors/1', {}, (xhr) => {
                xhr.respond(200, {}, '{"id": 1, "name": "Rod"}');
            });
        });

        it('#revertChanges passes eventParameters to the change events', () => {
            const actor = Actor.instantiate({id: 1, name: 'Fred'});
            actor.name = 'Rod';
            const received = recordEventParameters(actor);

            actor.revertChanges({silentNotification: true});
            assert.deepEqual(received, [['changed:name', eventParameters], ['changed', eventParameters]]);
        });

        it('passes an empty object when no eventParameters are given', function (done) {
            const actor = Actor.instantiate({id: 1, name: 'Fred'});
            actor.name = 'Rod';
            const received = recordEventParameters(actor);

            actor.save().then(() => {
                received.forEach(([name, d]) => assert.deepEqual(d, {}, name));
            }).then(done, done);

            this.withRequest('PUT', '/actors/1', { body: {actor: {name: 'Rod'}} }, (xhr) => {
                xhr.respond(200, {}, '{"id": 1, "name": "Rod"}');
            });
        });
    });

    describe('Relation', () => {
        it('#load passes eventParameters to the load and add events', function (done) {
            const relation = Actor.where({name: 'Fred'});
            const received = recordEventParameters(relation);

            relation.load({silentNotification: true}).then(() => {
                assert.deepEqual(received, [
                    ['beforeLoad', eventParameters],
                    ['beforeSetTarget', eventParameters],
                    ['afterAdd', eventParameters],
                    ['afterLoad', eventParameters]
                ]);
            }).then(done, done);

            this.withRequest('GET', '/actors', { params: {where: {name: 'Fred'}, order: {id: 'desc'}} }, (xhr) => {
                xhr.respond(200, {}, '[{"id": 1, "name": "Fred"}]');
            });
        });

        it('#reload passes eventParameters to the change events of records updated in place', function (done) {
            const relation = Actor.where({name: 'Fred'});

            relation.load().then(() => {
                const actor = relation.target[0];
                let changedEventParameters;
                actor.addEventListener('changed', (r, changes, d) => { changedEventParameters = d; });

                const reloading = relation.reload({silentNotification: true}).then(() => {
                    assert.deepEqual(changedEventParameters, eventParameters);
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

        it('#setTarget passes eventParameters to the add and remove events', () => {
            const relation = Actor.all();
            const a = new Actor({id: 1});
            const b = new Actor({id: 2});
            relation.setTarget([a]);
            const received = recordEventParameters(relation);

            relation.setTarget([b], {silentNotification: true});
            assert.deepEqual(received, [
                ['beforeSetTarget', eventParameters],
                ['afterAdd', eventParameters],
                ['afterRemove', eventParameters]
            ]);
        });

        it('query methods pass eventParameters to their changed events', () => {
            const relation = Actor.all();
            const received = [];
            const listen = (r) => {
                r.addEventListener('changed', (key, value, d) => received.push([key, d]));
                return r;
            };

            listen(relation.spawn()).applyWhere({name: 'Fred'}, eventParameters);
            listen(relation.spawn()).applyRewhere({name: 'Fred'}, eventParameters);
            listen(relation.spawn()).setWhere({name: 'Fred'}, eventParameters);
            listen(relation.spawn()).applyOrder({name: 'asc'}, eventParameters);
            listen(relation.spawn()).setOrder({name: 'asc'}, eventParameters);
            listen(relation.spawn()).setLimit(5, eventParameters);
            listen(relation.spawn()).setOffset(5, eventParameters);
            listen(relation.spawn()).setReverseOrder(eventParameters);

            assert.deepEqual(received, [
                ['where', eventParameters], ['where', eventParameters], ['where', eventParameters],
                ['order', eventParameters], ['order', eventParameters],
                ['limit', eventParameters], ['offset', eventParameters], ['order', eventParameters]
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

        it('hasMany#load passes eventParameters to the load and add events', function (done) {
            const model = Model.instantiate({id: 24});
            const association = model.association('children');
            const received = recordEventParameters(association);

            association.load({silentNotification: true}).then(() => {
                assert.deepEqual(received, [
                    ['beforeLoad', eventParameters],
                    ['beforeAdd', eventParameters],
                    ['afterAdd', eventParameters],
                    ['afterLoad', eventParameters]
                ]);
            }).then(done, done);

            this.withRequest('GET', '/children', { params: {where: {model_id: 24}, order: {id: 'desc'}} }, (xhr) => {
                xhr.respond(200, {}, '[{"id": 2, "model_id": 24}]');
            });
        });

        it('hasMany#setTarget passes eventParameters to the association and record events', () => {
            const model = Model.instantiate({id: 24, children: []});
            const child = new Child({id: 2});
            const received = recordEventParameters(model.association('children'));
            const childReceived = recordEventParameters(child);

            model.children = [child];
            received.length = 0;
            childReceived.length = 0;
            model.association('children').setTarget([], {silentNotification: true});

            assert.deepEqual(received, [
                ['beforeRemove', eventParameters],
                ['record:changed:model_id', eventParameters],
                ['record:changed', eventParameters],
                ['afterRemove', eventParameters]
            ]);
            assert.deepEqual(childReceived, [
                ['beforeRemove', eventParameters],
                ['changed:model_id', eventParameters],
                ['changed', eventParameters],
                ['afterRemove', eventParameters]
            ]);
        });

        it('hasOne#setTarget passes eventParameters to the association and record events', () => {
            class Profile extends VikingRecord {
                static schema = { id: {type: 'integer'}, owner_id: {type: 'integer'} }
            }
            class Owner extends VikingRecord {
                static schema = { id: {type: 'integer'} }
                static associations = [hasOne(Profile)];
            }
            const owner = Owner.instantiate({id: 7});
            const profile = new Profile({id: 1});
            const received = recordEventParameters(owner.association('profile'));
            const profileReceived = recordEventParameters(profile);

            owner.association('profile').setTarget(profile, {silentNotification: true});

            assert.deepEqual(received, [['beforeAdd', eventParameters], ['afterAdd', eventParameters]]);
            assert.deepEqual(profileReceived, [
                ['beforeAdd', eventParameters],
                ['changed:owner_id', eventParameters],
                ['changed', eventParameters],
                ['afterAdd', eventParameters]
            ]);
        });

        it('belongsTo#setTarget passes eventParameters through Record#setAttributes', () => {
            const model = Model.instantiate({id: 24});
            const parent = Parent.instantiate({id: 3, name: 'Alpha'});
            const received = recordEventParameters(model.association('parent'));
            const ownerReceived = recordEventParameters(model);

            model.setAttributes({parent}, {silentNotification: true});

            assert.deepEqual(received, [['beforeAdd', eventParameters], ['afterAdd', eventParameters]]);
            assert.deepEqual(ownerReceived, [['changed:parent_id', eventParameters], ['changed', eventParameters]]);
        });
    });
});
