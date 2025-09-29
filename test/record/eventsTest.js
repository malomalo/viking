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
        let model = new Actor();
        
        model.addEventListener('changed', (record, changes) => {
            assert.strictEqual(record, model);
            assert.deepEqual(changes, {name: [null, 'Rob']});
            done();
        });
        model.setAttributes({name: 'Rob'});
    });
    
    it('change:[attribute]', (done) => {
        let model = new Actor();
        
        model.addEventListener('changed:name', (record, oldValue, newValue) => {
            assert.strictEqual(record, model);
            assert.equal(oldValue, null);
            assert.equal(newValue, 'Rob');
            done();
        });
        model.setAttributes({name: 'Rob'});
    });

    it('beforeCreate on new record', function (done) {
        let actor = new Actor({name: "Rod Kimbal"});
        
        actor.addEventListener('beforeCreate', (changes, options) => {
            try {
                assert.deepEqual(changes, {
                    name: [null, "Rod Kimbal"]
                });
            } catch (e) { done(e); }
            done();
        });

        actor.save();
    });

    it('beforeSave on new record', function (done) {
        let actor = new Actor({name: "Rod Kimbal"});
        
        actor.addEventListener('beforeSave', (changes, options) => {
            try {
                assert.deepEqual(changes, {
                    name: [null, "Rod Kimbal"]
                });
            } catch (e) { done(e); }
            done();
        });

        actor.save();
    });

    it('beforeSave on persisted record', function (done) {
        let actor = Actor.instantiate({name: "Rod Kimbal"});
        
        actor.addEventListener('beforeSave', (changes, options) => {
            try {
                assert.deepEqual(changes, {
                    name: ["Rod Kimbal", "Andy Sanberg"]
                });
            } catch (e) { done(e); }
            done();
        });

        actor.name = 'Andy Sanberg';
        actor.save();
    });

    it('beforeSync on new record via #save', function (done) {
        let actor = new Actor({name: "Rod Kimbal"});
        
        actor.addEventListener('beforeSync', (options) => {
            assert.ok(true);
            done();
        });

        actor.save();
    });
    
    it('beforeSync on persisted record via #save', function (done) {
        let actor = Actor.instantiate({id: 1, name: "Rod Kimbal"});
        
        actor.addEventListener('beforeSync', (options) => {
            assert.ok(true);
            done();
        });

        actor.name = 'Andy Sanberg';
        actor.save();
    });
    
    it('beforeSync on persisted record via #reload', function (done) {
        let actor = Actor.instantiate({id: 1, name: "Rod Kimbal"});
        
        actor.addEventListener('beforeSync', (options) => {
            assert.ok(true);
            done();
        });

        actor.reload();
    });

    it('afterCreate on new record', function (done) {
        let person = new Actor({name: "Rod Kimbal"});
        
        person.addEventListener('afterCreate', (savedChanges, options) => {
            try {
                assert.deepEqual(savedChanges, {
                    id: [null, 1],
                    name: [null, "Andy Sanberg"],
                    imdb_id: [null, "999"]
                });
            } catch (e) { done(e); }
            done();
        });

        person.name = "Andy Sanberg";
        person.save();

        this.withRequest('POST', '/actors', { body: {actor: {name: 'Andy Sanberg'}} }, (xhr) => {
            xhr.respond(200, {}, '{"id": 1, "name": "Andy Sanberg", "imdb_id": "999"}');
        });
    });
    
    it('afterSave on new record', function (done) {
        let person = new Actor({name: "Rod Kimbal"});
        
        person.addEventListener('afterSave', (savedChanges, options) => {
            try {
                assert.deepEqual(savedChanges, {
                    id: [null, 1],
                    name: [null, "Andy Sanberg"],
                    imdb_id: [null, "999"]
                });
            } catch (e) { done(e); }
            done();
        });

        person.name = "Andy Sanberg";
        person.save();

        this.withRequest('POST', '/actors', { body: {actor: {name: 'Andy Sanberg'}} }, (xhr) => {
            xhr.respond(200, {}, '{"id": 1, "name": "Andy Sanberg", "imdb_id": "999"}');
        });
    });
        
    it('afterSave on persisted record', function (done) {
        let person = Actor.instantiate({id: 1, name: "Rod Kimbal", imdb_id: "999"});
        
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
     
    it('afterSync on persisted record via save', function (done) {
        let person = Actor.instantiate({id: 1, name: "Rod Kimbal", imdb_id: "999"});
        
        person.addEventListener('afterSync', (savedChanges, options) => {
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

    it('afterSync on persisted record via reload', function (done) {
        let person = Actor.instantiate({id: 1, name: "Rod Kimbal", imdb_id: "999"});
        
        person.addEventListener('afterSync', (savedChanges, options) => {
            try {
                assert.deepEqual(savedChanges, {
                    name: ["Rod Kimbal", "Andy Sanberg"]
                });
            } catch (e) { done(e); }
            done();
        });

        person.reload();

        this.withRequest('GET', '/actors/1', {}, (xhr) => {
            xhr.respond(200, {}, '{"id": 1, "name": "Andy Sanberg", "imdb_id": "999"}');
        });
    });

    it('afterSync:[attribute] on new record via save', function (done) {
        let person = new Actor({name: "Rod Kimbal"});
        
        person.addEventListener('afterSync:name', (from, to) => {
            try {
                assert.equal(from, null);
                assert.equal(to, "Rod Kimbal");
            } catch (e) { done(e); }
            done();
        });

        person.save();

        this.withRequest('POST', '/actors', { body: {actor: {name: 'Rod Kimbal'}} }, (xhr) => {
            xhr.respond(200, {}, '{"id": 1, "name": "Rod Kimbal", "imdb_id": "999"}');
        });
    });

    it('afterSync:[attribute] on persisted record via save', function (done) {
        let person = Actor.instantiate({id: 1, name: "Rod Kimbal", imdb_id: "999"});
        
        person.addEventListener('afterSync:name', (from, to) => {
            try {
                assert.equal(from, "Rod Kimbal");
                assert.equal(to, "Andy Sanberg");
            } catch (e) { done(e); }
            done();
        });

        person.name = "Andy Sanberg";
        person.save();

        this.withRequest('PUT', '/actors/1', { body: {actor: {name: 'Andy Sanberg'}} }, (xhr) => {
            xhr.respond(200, {}, '{"id": 1, "name": "Andy Sanberg", "imdb_id": "999"}');
        });
    });

    it('afterSync:[attribute] on persisted record via reload', function (done) {
        let person = Actor.instantiate({id: 1, name: "Rod Kimbal", imdb_id: "999"});
        
        person.addEventListener('afterSync:name', (from, to) => {
            try {
                assert.equal(from, "Rod Kimbal");
                assert.equal(to, "Andy Sanberg");
            } catch (e) { done(e); }
            done();
        });

        person.reload();

        this.withRequest('GET', '/actors/1', {}, (xhr) => {
            xhr.respond(200, {}, '{"id": 1, "name": "Andy Sanberg", "imdb_id": "999"}');
        });
    });
    
    it('error', function(done) {

      const actor = new Actor({name: 'Fred'});
      
      actor.addEventListener('error', (response) => {
          assert.equal("something went wrong", response)
          done()
      })
      
      actor.save()
  
      this.withRequest('POST', '/actors', { body: {actor: {name: 'Fred'} } }, (xhr) => {
          xhr.respond(500, {}, 'something went wrong');
      });

    });
    
    it('invalid', function(done) {

      const actor = new Actor({name: 'Fred'});
      
      actor.addEventListener('invalid', () => {
          assert.deepEqual(actor.errors, {name: ["can only be Jimmy"]})
          done()
      })
      
      actor.save()
  
      this.withRequest('POST', '/actors', { body: {actor: {name: 'Fred'} } }, (xhr) => {
          xhr.respond(400, {
              'Content-Type': 'application/json'
          }, '{"id": null, "name": "Fred", "errors": {"name": ["can only be Jimmy"]}}');
      });

    });

});