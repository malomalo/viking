import 'mocha';
import * as assert from 'assert';
import Model from 'viking/record';

describe('Viking.Record#save', () => {
    class Actor extends Model {
        static schema = {
            id: {type: "integer"},
            name: {type: 'string'},
            imdb_id: {type: 'string'}
        }
    }
    
    it('on sends changed attribute(s)', function (done) {
        Actor.create({name: "Rod Kimbal"}).then(person => {
            person.name = "Andy Sanberg";
            assert.equal(person.id, 1);
            assert.equal(person.imdb_id, "999");
            
            person.save().then(p => {
                assert.equal(person.name, "Andy Sanberg")
            }).then(done, done);
        
            this.withRequest('PUT', '/actors/1', { body: {actor: {name: 'Andy Sanberg'}} }, (xhr) => {
                xhr.respond(200, {}, '{"id": 1, "name": "Andy Sanberg", "imdb_id": "999"}');
            });
        }).then(null,done)
    
        this.withRequest('POST', '/actors', { body: {actor: {name: 'Rod Kimbal'}} }, (xhr) => {
            xhr.respond(201, {}, '{"id": 1, "name": "Rod Kimbal", "imdb_id": "999"}');
        });
    });
    
    it('triggers a saved event with the saved changes', function (done) {
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
    
    it('triggers a saved event for each attribute that has changed/persisted', function (done) {
        Actor.create({name: "Rod Kimbal"}).then(person => {

            person.addEventListener('saved:name', (to, from) => {
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


})