import 'mocha';
import assert from 'assert';
import * as sinon from 'sinon';
import VikingRecord from 'viking/record';
import { toQuery } from 'viking/support/object';
import { ServerError } from 'viking/errors';


describe('Viking.Record', () => {
    class Ship extends VikingRecord { }

    it('::count', function(done) {
        Ship.count().then((count) => {
            assert.equal(count, 100);
            done()
        }, done);

        this.withRequest('GET', '/ships/calculate', { params: {order: {id: 'desc'}, select: {count: '*'} } }, (xhr) => {
            xhr.respond(200, {}, '[100]');
        });
    });
    
    it('::count attribute', function(done) {
        Ship.count('model_id').then((count) => {
            assert.equal(count, 5);
            done()
        }, done);

        this.withRequest('GET', '/ships/calculate', { params: {order: {id: 'desc'}, select: {count: 'model_id'} } }, (xhr) => {
            xhr.respond(200, {}, '[5]');
        });
    });

    it('::count with groupBy', function(done) {
        Ship.groupBy('name').count().then((count) => {
            assert.deepEqual(count, {jon: 100});
        }).then(done, done);

        this.withRequest('GET', '/ships/calculate', { params: {order: {id: 'desc'}, group_by: 'name', select: {count: '*'} } }, (xhr) => {
            xhr.respond(200, {}, '{"jon": 100}');
        });
    });

    it('::sum', function(done) {
        Ship.sum('size').then((count) => {
            assert.equal(count, 100);
            done()
        }, done);

        this.withRequest('GET', '/ships/calculate', { params: {order: {id: 'desc'}, select: {sum: 'size'} } }, (xhr) => {
            xhr.respond(200, {}, '[100]');
        });
    });

});