import * as assert from 'assert';
// import * as sinon from 'sinon';
import 'mocha';
import VikingRecord from 'viking/record';
import { toQuery } from 'viking/support/object';
import { ServerError } from 'viking/errors';


describe('Viking.Record::find', () => {
    class Model extends VikingRecord { }

    // beforeEach(() => {
    //     this.requests = [];
    //     this.withRequest = (method: string, url: string, params, callback) => {
    //         if (Object.keys(params).length > 0) {
    //             url += `?${toQuery(params)}`;
    //         }

    //         let match = this.requests.find((xhr) => {
    //             console.log(xhr.url, url)
    //             return xhr.method === method && xhr.url === url;
    //         });
    //         if (match) {
    //             callback(match);
    //         }
    //     };
    //     this.xhr = sinon.useFakeXMLHttpRequest();
    //     this.xhr.onCreate = (xhr: any) => {
    //         this.requests.push(xhr);
    //     };
    // });

    // afterEach(() => {
    //     this.xhr.restore();
    //     this.onRequest = null;
    // });

    it('by id', function(done) {
        Model.find(12).then((model) => {
            if (model === null) {
                assert.fail("model expected");
                return;
            }
            assert.ok(model instanceof Model);
            assert.equal(model.readAttribute('id'), 12);
            assert.equal(model.readAttribute('name'), 'Viking');
        }).then(done, done);

        this.withRequest('GET', '/models', {where: {id: 12}, order: {id: 'desc'}, limit: 1}, (xhr) => {
            xhr.respond(200, {}, '[{"id": 12, "name": "Viking"}]');
        });
    });

});