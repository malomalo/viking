import 'mocha';
import * as assert from 'assert';
import VikingModel from 'viking/model';
import Relation from 'viking/record/relation';
import { toQuery } from 'viking/support/object';
import { ServerError } from 'viking/errors';

describe('Viking.Model::where', () => {

    class Ship extends VikingModel { }
    
    it('::where(predicate)', function(done) {
        let relation = Ship.where({id: 10, name: 'name'});
        
        assert.ok(relation instanceof Relation);
        
        relation.load((models) => {
            assert.equal(models.length, 1);
            assert.ok(models[0] instanceof Ship);
            assert.equal(models[0].readAttribute('id'), 42);
        }).then(done, done);

        this.withRequest('GET', '/ships', { where: {id: 10, name: 'name'}, order: {id: 'desc'} }, (xhr) => {
            xhr.respond(200, {}, '[{"id": 42}]');
        });
    });
    
    it('multiple additive wheres returns a query with the predicate', function(done) {
        Ship.where({id: 10, name: 'name'}).where({slug: 'test'}).load((models) => {
            assert.equal(models.length, 1);
            assert.ok(models[0] instanceof Ship);
            assert.equal(models[0].readAttribute('id'), 42);
        }).then(done, done);

        this.withRequest('GET', '/ships', { where: {id: 10, name: 'name', slug: 'test'}, order: {id: 'desc'} }, (xhr) => {
            xhr.respond(200, {}, '[{"id": 42}]');
        });
    });

    it('::where on the same column multiple times', function(done) {
        Ship.where({id: {gt: 10}}).where({id: {gt: 11}}).load((models) => {
            assert.equal(models.length, 1);
            assert.ok(models[0] instanceof Ship);
            assert.equal(models[0].readAttribute('id'), 12);
            assert.equal(models[0].readAttribute('name'), 'Viking');
        }).then(done, done);

        this.withRequest('GET', '/ships', { where: [{id: {gt: 10}}, 'AND', {id: {gt: 11}}], order: {id: 'desc'} }, (xhr) => {
            xhr.respond(200, {}, '[{"id": 12, "name": "Viking"}]');
        });
    });
    
    it('::where on the same column multiple times that are mergable', function(done) {
        Ship.where({crew: {size: 5}}).where({crew: {class: 'first'}}).load((models) => {
            assert.equal(models.length, 1);
            assert.ok(models[0] instanceof Ship);
            assert.equal(models[0].readAttribute('id'), 42);
        }).then(() => { done() }, done);
        
        this.withRequest('GET', '/ships', { where: {crew: {size: 5, class: 'first'}}, order: {id: 'desc'} }, (xhr) => {
            xhr.respond(200, {}, '[{"id": 42}]');
        });
    });
    
    it('::where spawns on multiple uses', function(done) {
        let fleet = Ship.where({class: 'battleship'})
        
        Promise.all([
            fleet.where({id: 10}).load((models) => {
                assert.equal(models[0].readAttribute('id'), 10);
            }),
            fleet.where({id: 20}).load((models) => {
                assert.equal(models[0].readAttribute('id'), 20);
            })
        ]).then(() => { done() }, done);

        this.withRequest('GET', '/ships', { where: {class: 'battleship', id: 10}, order: {id: 'desc'} }, (xhr) => {
            xhr.respond(200, {}, '[{"id": 10}]');
        });

        this.withRequest('GET', '/ships', { where: {class: 'battleship', id: 20}, order: {id: 'desc'} }, (xhr) => {
            xhr.respond(200, {}, '[{"id": 20}]');
        });
    });
    
//   test '::where(AND CONDITION)' do
//     webmock(:get, "/ships", { where: {id: 10, name: 'name'}, limit: 1, order: [{id: :asc}] }).to_return({
//       body: [{id: 42}].to_json
//     })
    
//     arel_table = Ship.arel_table
//     assert_equal 42, Ship.where(arel_table[:id].eq(10).and(arel_table[:name].eq('name'))).first.id
//   end
  
//   test '::where(OR CONDITION)' do
//     webmock(:get, "/ships", { where: [{id: 10}, 'OR', {name: 'name'}], limit: 1, order: [{id: :asc}] }).to_return({
//       body: [{id: 42}].to_json
//     })

//     arel_table = Ship.arel_table
//     assert_equal 42, Ship.where(arel_table[:id].eq(10).or(arel_table[:name].eq('name'))).first.id
//   end

//   test '::where(AND & OR CONDITION)' do
//     webmock(:get, "/ships", { where: [{id: 10}, 'AND', [{id: 10}, 'OR', {name: 'name'}]], limit: 1, order: [{id: :asc}] }).to_return({
//       body: [{id: 42}].to_json
//     })

//     arel_table = Ship.arel_table
//     assert_equal 42, Ship.where(arel_table[:id].eq(10).and(arel_table[:id].eq(10).or(arel_table[:name].eq('name')))).first.id
//   end

//   test '::where(....big get request turns into post...)' do
//     name = 'q' * 3000
//     webmock(:post, "/ships").with(
//       headers: {'X-Http-Method-Override' => 'GET'},
//       body: {where: { name: name }, limit: 100, offset: 0 }.to_json
//     ).to_return(body: [{id: 42}].to_json)

//     assert_equal 42, Ship.where(name: name)[0].id
//   end

});