import 'mocha';
import * as assert from 'assert';
import VikingRecord from 'viking/record';

// describe('Viking.Relation', () => {
//     it('events', () => {
//         it('add', () => {
//             const relation = VikingRecord.where({parent_id: 11})
//
//             relation.toArray().then(() => {
//                 assert.equal(relation.target.map(x => x.readAttribute('id')), [1,2,3])
//             })
//
//             this.withRequest('GET', '/viking_records', { params: { where: {parent_id: 11}, order: {id: 'desc'} } }, (xhr) => {
//                 xhr.respond(200, {}, '[{"id": 1}, {"id": 2}, {"id": 3}]');
//             });
//         })
//     })
// })