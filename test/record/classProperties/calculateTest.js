import 'mocha';
import * as assert from 'assert';
import * as sinon from 'sinon';
import VikingModel from 'viking/model';
import { toQuery } from 'viking/support/object';
import { ServerError } from 'viking/errors';


describe('Viking.Model', () => {
    class Ship extends VikingModel { }

    it('::count', function(done) {
        Ship.count((count) => {
            assert.equal(count, 100);
        }).then(() => done(), done);

        this.withRequest('GET', '/ships/calculate', {order: {id: 'desc'}, select: {count: '*'} }, (xhr) => {
            xhr.respond(200, {}, '[100]');
        });
    });

    it('::sum', function(done) {
        Ship.sum('size', (count) => {
            assert.equal(count, 100);
        }).then(() => done(), done);

        this.withRequest('GET', '/ships/calculate', {order: {id: 'desc'}, select: {sum: 'size'} }, (xhr) => {
            xhr.respond(200, {}, '[100]');
        });
    });

});