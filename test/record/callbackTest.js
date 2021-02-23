import 'mocha';
import * as assert from 'assert';
import Record from 'viking/record';

describe('Viking.Record#callbacks', () => {

    class Actor extends Record {
        static schema = {
            id: {type: "integer"},
            name: {type: 'string'},
            imdb_id: {type: 'string'}
        }
    }
    
    it('change', (done) => {
        let model = new Record();
        
        model.addEventListener('change', (record, changes) => {
            assert.strictEqual(record, model);
            assert.deepEqual(changes, {name: [null, 'Rob']});
            done();
        });
        model.setAttributes({name: 'Rob'});
    });
    
    it('change:[attribute]', (done) => {
        let model = new Record();
        
        model.addEventListener('change:name', (record, oldValue, newValue) => {
            assert.strictEqual(record, model);
            assert.equal(oldValue, null);
            assert.equal(newValue, 'Rob');
            done();
        });
        model.setAttributes({name: 'Rob'});
    });

    it('saved', function (done) {
        Actor.create({name: "Rod Kimbal"}).then(person => {
            person.addEventListener('saved', (savedChanges, options) => {
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
    
    it('saved:[attribute]', function (done) {
        Actor.create({name: "Rod Kimbal"}).then(person => {

            person.addEventListener('saved:name', (from, to) => {
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