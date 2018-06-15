import * as assert from 'assert';
import * as sinon from 'sinon';
import 'mocha';
import { Model as VikingModel } from '../../../src/viking/model';
import { toQuery } from '../../../src/viking/support/object';
import { ServerError } from '../../../src/viking/errors';


describe('Viking.Model', () => {
    class Ship extends VikingModel { }

    it('::first', function(done) {
        Ship.first().then((model) => {
            assert.ok(model instanceof Ship);
            assert.equal(model.readAttribute('id'), 12);
            assert.equal(model.readAttribute('name'), 'Viking');
        }).then(done, done);

        this.withRequest('GET', '/ships', {order: {id: 'desc'}, limit: 1}, (xhr) => {
            xhr.respond(200, {}, '[{"id": 12, "name": "Viking"}]');
        });
    });

//     test '::first!' do
//     webmock(:get, "/ships", { limit: 1, order: [{id: :asc}] }).to_return({
//       body: [].to_json
//     })

//     assert_raises ActiveRecord::RecordNotFound do
//       Ship.first!
//     end
//   end

    it('::last', function(done) {
        Ship.last().then((model) => {
            assert.ok(model instanceof Ship);
            assert.equal(model.readAttribute('id'), 12);
            assert.equal(model.readAttribute('name'), 'Viking');
        }).then(done, done);

        this.withRequest('GET', '/ships', {order: {id: 'asc'}, limit: 1}, (xhr) => {
            xhr.respond(200, {}, '[{"id": 12, "name": "Viking"}]');
        });
    });


    it('::where on the same column multiple times', function(done) {
        Ship.where({id: {gt: 10}}).where({id: {gt: 11}}).load().then((models) => {
            assert.equal(models.length, 1);
            assert.ok(models[0] instanceof Ship);
            assert.equal(models[0].readAttribute('id'), 12);
            assert.equal(models[0].readAttribute('name'), 'Viking');
        }).then(done, done);

        this.withRequest('GET', '/ships', { where: [{id: {gt: 10}}, 'AND', {id: {gt: 11}}], order: {id: 'desc'} }, (xhr) => {
            xhr.respond(200, {}, '[{"id": 12, "name": "Viking"}]');
        });
    });

    it('::where(AND CONDITION)', function(done) {
        Ship.where({id: 10, name: 'name'}).first().then((model) => {
            assert.ok(model instanceof Ship);
            assert.equal(model.readAttribute('id'), 42);
        }).then(done, done);

        this.withRequest('GET', '/ships', { where: {id: 10, name: 'name'}, order: {id: 'desc'}, limit: 1 }, (xhr) => {
            xhr.respond(200, {}, '[{"id": 42}]');
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