import assert from 'assert';
import VikingRecord from 'viking/record';

describe('Viking.Relation', () => {

    class Model extends VikingRecord {}

    describe('array methods', () => {
        it('includes checks membership of the relation', function (done) {
            const relation = Model.where({parent_id: 11})

            relation.load().then(async (records) => {
                assert.strictEqual(await relation.includes(records[0]), true);
                assert.strictEqual(await relation.includes(new Model({id: 99})), false);
            }).then(done, done);

            this.withRequest('GET', '/models', { params: { where: {parent_id: 11}, order: {id: 'desc'} } }, (xhr) => {
                xhr.respond(200, {}, '[{"id": 1}, {"id": 2}]');
            });
        })

        it('some tests if any record matches', function (done) {
            const relation = Model.where({parent_id: 11})

            relation.some((r) => r.readAttribute('id') === 2).then(async (result) => {
                assert.strictEqual(result, true);
                assert.strictEqual(await relation.some((r) => r.readAttribute('id') === 99), false);
            }).then(done, done);

            this.withRequest('GET', '/models', { params: { where: {parent_id: 11}, order: {id: 'desc'} } }, (xhr) => {
                xhr.respond(200, {}, '[{"id": 1}, {"id": 2}]');
            });
        })

        it('every tests if all records match', function (done) {
            const relation = Model.where({parent_id: 11})

            relation.every((r) => r.readAttribute('id') > 0).then(async (result) => {
                assert.strictEqual(result, true);
                assert.strictEqual(await relation.every((r) => r.readAttribute('id') > 1), false);
            }).then(done, done);

            this.withRequest('GET', '/models', { params: { where: {parent_id: 11}, order: {id: 'desc'} } }, (xhr) => {
                xhr.respond(200, {}, '[{"id": 1}, {"id": 2}]');
            });
        })

        it('reduce reduces the records', function (done) {
            const relation = Model.where({parent_id: 11})

            relation.reduce((acc, r) => acc + r.readAttribute('id'), 0).then((result) => {
                assert.equal(result, 3);
            }).then(done, done);

            this.withRequest('GET', '/models', { params: { where: {parent_id: 11}, order: {id: 'desc'} } }, (xhr) => {
                xhr.respond(200, {}, '[{"id": 1}, {"id": 2}]');
            });
        })
    })
})
