import 'mocha';
import * as assert from 'assert';
import Model from 'viking/record';

describe('Viking.Record', () => {
    class Actor extends Model {
        static schema = {
            id: {type: "integer"},
            name: {type: 'string'},
            imdb_id: {type: 'string'}
        }
    }
    describe('::save', () => {

        it('update attribute', function (done) {
            Actor.create({name: "Rod Kimbal"}).then(person => {
                person.name = "Andy Sanberg"
                person.save().then(p => {
                    assert.equal(person.name, "Andy Sanberg")
                    assert.equal(person.imdb_id, "999")
                }).then(done, done)
            
                this.withRequest('PATCH', '/actors/1', { body: {actor: {name: 'Andy Sanberg'}} }, (xhr) => {
                    xhr.respond(200, {}, '{{"id": 1, "name": "Andy Sanberg", "imdb_id": "999"}');
                });
            })
        
            this.withRequest('POST', '/actors', { body: {actor: {name: 'Rod Kimbal'}} }, (xhr) => {
                xhr.respond(200, {}, '[{"id": 1, "name": "Rod Kimbal", "imdb_id": "999"}]');
            });
        });
        
        it('updating triggers saved event', function (done) {
            Actor.create({name: "Rod Kimbal"}).then(person => {
                person.addEventListener('saved:name', change => {
                    assert.equal(change[0], "Rod Kimbal")
                    assert.equal(change[1], "Andy Sanberg")
                    done()
                })
                
                person.name = "Andy Sanberg"
                person.save()
            
                this.withRequest('PATCH', '/actors/1', { body: {actor: {name: 'Andy Sanberg'}} }, (xhr) => {
                    xhr.respond(200, {}, '{{"id": 1, "name": "Andy Sanberg", "imdb_id": "999"}');
                });
            })
        
            this.withRequest('POST', '/actors', { body: {actor: {name: 'Rod Kimbal'}} }, (xhr) => {
                xhr.respond(200, {}, '[{"id": 1, "name": "Rod Kimbal", "imdb_id": "999"}]');
            });
        });
    })
    
})