import assert from 'assert';
import VikingRecord from 'viking/record';
import * as Errors from 'viking/errors';

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

        it('is async iterable', function (done) {
            const relation = Model.where({parent_id: 11})

            Array.fromAsync(relation).then((records) => {
                assert.deepEqual(records.map(r => r.readAttribute('id')), [1, 2]);
            }).then(done, done);

            this.withRequest('GET', '/models', { params: { where: {parent_id: 11}, order: {id: 'desc'} } }, (xhr) => {
                xhr.respond(200, {}, '[{"id": 1}, {"id": 2}]');
            });
        })

        it('can be async iterated more than once without re-fetching', function (done) {
            const relation = Model.where({parent_id: 11})

            // Only one request is stubbed; the first iteration loads, the
            // second serves from the loaded target or the test would hang
            // waiting on a second request.
            Array.fromAsync(relation).then(async (first) => {
                const ids = [];
                for await (const record of relation) {
                    ids.push(record.readAttribute('id'));
                }
                assert.deepEqual(ids, [1, 2]);
            }).then(done, done);

            this.withRequest('GET', '/models', { params: { where: {parent_id: 11}, order: {id: 'desc'} } }, (xhr) => {
                xhr.respond(200, {}, '[{"id": 1}, {"id": 2}]');
            });
        })

        it('is sync iterable when loaded and throws when not', function (done) {
            const relation = Model.where({parent_id: 11})

            assert.throws(() => Array.from(relation), Errors.VikingError);

            relation.load().then(() => {
                assert.deepEqual(Array.from(relation).map(r => r.readAttribute('id')), [1, 2]);
                assert.deepEqual([...relation].map(r => r.readAttribute('id')), [1, 2]);
            }).then(done, done);

            this.withRequest('GET', '/models', { params: { where: {parent_id: 11}, order: {id: 'desc'} } }, (xhr) => {
                xhr.respond(200, {}, '[{"id": 1}, {"id": 2}]');
            });
        })

        it('toJSON serializes the loaded records and throws when not loaded', function (done) {
            const relation = Model.where({parent_id: 11})

            assert.throws(() => JSON.stringify(relation), Errors.VikingError);

            relation.load().then(() => {
                assert.deepStrictEqual(relation.toJSON(), relation.target);
            }).then(done, done);

            this.withRequest('GET', '/models', { params: { where: {parent_id: 11}, order: {id: 'desc'} } }, (xhr) => {
                xhr.respond(200, {}, '[{"id": 1}, {"id": 2}]');
            });
        })

        it('has a toStringTag', function () {
            const relation = Model.where({parent_id: 11})

            assert.equal(Object.prototype.toString.call(relation), '[object Relation]');
        })
    })
})
