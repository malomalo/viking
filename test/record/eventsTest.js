import 'mocha';
import * as assert from 'assert';
import Record from 'viking/record';

describe('Viking.Record#events', () => {

    class Actor extends Record {
        static schema = {
            id: {type: "integer"},
            name: {type: 'string'},
            imdb_id: {type: 'string'}
        }
    }
    
    it('change', (done) => {
        let model = new Record();
        
        model.addEventListener('changed', (record, changes) => {
            assert.strictEqual(record, model);
            assert.deepEqual(changes, {name: [null, 'Rob']});
            done();
        });
        model.setAttributes({name: 'Rob'});
    });
    
    it('change:[attribute]', (done) => {
        let model = new Record();
        
        model.addEventListener('changed:name', (record, oldValue, newValue) => {
            assert.strictEqual(record, model);
            assert.equal(oldValue, null);
            assert.equal(newValue, 'Rob');
            done();
        });
        model.setAttributes({name: 'Rob'});
    });

    it('afterSave', function (done) {
        Actor.create({name: "Rod Kimbal"}).then(person => {
            person.addEventListener('afterSave', (savedChanges, options) => {
                try {
                    assert.deepEqual(savedChanges, {
                        name: ["Rod Kimbal", "Andy Sanberg"]
                    });
                } catch (e) { done(e); }
                done();
            });

            person.name = "Andy Sanberg";
            person.save();

            this.withRequest('PUT', '/actors/1', { body: {actor: {name: 'Andy Sanberg'}} }, (xhr) => {
                xhr.respond(200, {}, '{"id": 1, "name": "Andy Sanberg", "imdb_id": "999"}');
            });
        });
        
        this.withRequest('POST', '/actors', { body: {actor: {name: 'Rod Kimbal'} } }, (xhr) => {
            xhr.respond(201, {}, '{"id": 1, "name": "Rod Kimbal", "imdb_id": "999"}');
        });
    });
    
    it('afterSave:[attribute]', function (done) {
        Actor.create({name: "Rod Kimbal"}).then(person => {

            person.addEventListener('afterSave:name', (from, to) => {
                try {
                    assert.equal(from, "Rod Kimbal");
                    assert.equal(to, "Andy Sanberg");
                } catch (e) { done(e); }
                done();
            })

            person.name = "Andy Sanberg";
            person.save();

            this.withRequest('PUT', '/actors/1', { body: {actor: {name: 'Andy Sanberg'}} }, (xhr) => {
                xhr.respond(200, {}, '{"id": 1, "name": "Andy Sanberg", "imdb_id": "999"}');
            });

        });
        
        this.withRequest('POST', '/actors', { body: {actor: {name: 'Rod Kimbal'} } }, (xhr) => {
            xhr.respond(201, {}, '{"id": 1, "name": "Rod Kimbal", "imdb_id": "999"}');
        });
    });

});