// import * as assert from 'assert';
// import * as sinon from 'sinon';
// import 'mocha';
// import { Model as VikingModel } from '../../src/viking/model';
// import { Relation } from '../../src/viking/model/relation';
// import { toQuery } from '../../src/viking/support/object';
// import { ServerError } from '../../src/viking/errors';


// describe('Viking.Model', () => {
//     class Model extends VikingModel { }

//     beforeEach(() => {
//         this.requests = [];
//         this.withRequest = (method: string, url: string, params, callback) => {
//             if (Object.keys(params).length > 0) {
//                 url += `?${toQuery(params)}`;
//             }

//             let match = this.requests.find((xhr) => {
//                 return xhr.method === method && xhr.url === url;
//             });
//             if (match) {
//                 callback(match);
//             }
//         };
//         this.xhr = sinon.useFakeXMLHttpRequest();
//         this.xhr.onCreate = (xhr: any) => {
//             this.requests.push(xhr);
//         };
//     });

//     afterEach(() => {
//         this.xhr.restore();
//         this.onRequest = null;
//     });

//     it('by id', (done) => {
//         Model.find(12).then((model) => {
//             assert.ok(model instanceof Model);
//             assert.equal(model.readAttribute('id'), 12);
//             assert.equal(model.readAttribute('name'), 'Viking');
//         }).then(done, done);

//         this.withRequest('GET', '/models', {where: {id: 12}}, (xhr) => {
//             xhr.respond(200, {}, '[{"id": 12, "name": "Viking"}]');
//         });
//     });

//     it("triggers error callback", (done) => {
//         Model.find(12).then(assert.fail, (e) => {
//             assert.ok(e instanceof ServerError);
//             assert.equal('Server Error!', e.message);
//         }).then(done, done);

//         this.withRequest('GET', '/models', {where: {id: 12}}, (xhr) => {
//             xhr.respond(500, {}, 'Server Error!');
//         });
//     });

// });