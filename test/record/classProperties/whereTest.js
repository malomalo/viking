import 'mocha';
import * as assert from 'assert';
import VikingModel from 'viking/model';
import { toQuery } from 'viking/support/object';
import { ServerError } from 'viking/errors';


describe('Viking.Model::where', () => {
    class Ship extends VikingModel { }

    it('where(predicate) returns a query with the predicate', function(done) {
        Ship.where({id: 10, name: 'name'}).limit(10).load().then((models) => {
            if (models === null) {
                assert.fail("model expected");
                return;
            }
            let model = models[0]
            assert.ok(model instanceof Ship);
            assert.equal(model.readAttribute('id'), 42);
        }).then(done, done);

        this.withRequest('GET', '/ships', { where: {id: 10, name: 'name'}, order: {id: 'desc'}, limit: 10 }, (xhr) => {
            xhr.respond(200, {}, '[{"id": 42}]');
        });
    });
    
    it('multiple additive wheres returns a query with the predicate', function(done) {
        Ship.where({id: 10, name: 'name'}).where({slug: 'test'}).limit(10).load().then((models) => {
            if (models === null) {
                assert.fail("model expected");
                return;
            }
            let model = models[0]
            assert.ok(model instanceof Ship);
            assert.equal(model.readAttribute('id'), 42);
        }).then(done, done);

        this.withRequest('GET', '/ships', { where: {id: 10, name: 'name', slug: 'test'}, order: {id: 'desc'}, limit: 10 }, (xhr) => {
            xhr.respond(200, {}, '[{"id": 42}]');
        });
    });
    
    it('multiple same key wheres returns a query with the predicate', function(done) {
        console.log(toQuery(Ship.where({crew: {size: 5}}).where({crew: {size: 10}}).limit(10)));
        Ship.where({crew: {size: 5}}).where({crew: {size: 10}}).limit(10).load().then((models) => {
            if (models === null) {
                assert.fail("model expected");
                return;
            }
            let model = models[0]
            assert.ok(model instanceof Ship);
            assert.equal(model.readAttribute('id'), 42);
        }).then(done, done);
        
        this.withRequest('GET', '/ships', { where: [{crew: {size: 5}}, 'AND', {crew: {size: 10}}], order: {id: 'desc'}, limit: 10 }, (xhr) => {
            xhr.respond(200, {}, '[{"id": 42}]');
        });
    });
    
    it('multiple deep wheres returns a query with the predicate', function(done) {
        Ship.where({crew: {size: 5}}).where({crew: {class: 'first'}}).limit(10).load().then((models) => {
            if (models === null) {
                assert.fail("model expected");
                return;
            }
            let model = models[0]
            assert.ok(model instanceof Ship);
            assert.equal(model.readAttribute('id'), 42);
        }).then(done, done);
        
        this.withRequest('GET', '/ships', { where: {crew: {size: 5, class: 'first'}}, order: {id: 'desc'}, limit: 10 }, (xhr) => {
            xhr.respond(200, {}, '[{"id": 42}]');
        });
    });

});