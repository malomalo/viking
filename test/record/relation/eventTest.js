import assert from 'assert';
import VikingRecord from 'viking/record';

describe('Viking.Relation', () => {

    describe('events', () => {

        class NamedModel extends VikingRecord {
            static schema = { id: {type: 'integer'}, name: {type: 'string'} }
        }
      
        it('record:changed', function (done) {
            const relation = NamedModel.where({parent_id: 11})

            relation.load().then(() => {
                const record = relation.target[0]

                relation.addEventListener('record:changed', (r, changes) => {
                    assert.strictEqual(r, record);
                    assert.deepEqual(changes, {name: ['foo', 'bar']});
                    done();
                });

                record.setAttributes({name: 'bar'});
            });

            this.withRequest('GET', '/named_models', { params: { where: {parent_id: 11}, order: {id: 'desc'} } }, (xhr) => {
                xhr.respond(200, {}, '[{"id": 1, "name": "foo"}]');
            });
        })

        it('record:changed:[attribute]', function (done) {
            const relation = NamedModel.where({parent_id: 11})

            relation.load().then(() => {
                const record = relation.target[0]

                relation.addEventListener('record:changed:name', (r, oldValue, newValue) => {
                    assert.strictEqual(r, record);
                    assert.equal(oldValue, 'foo');
                    assert.equal(newValue, 'bar');
                    done();
                });

                record.setAttributes({name: 'bar'});
            });

            this.withRequest('GET', '/named_models', { params: { where: {parent_id: 11}, order: {id: 'desc'} } }, (xhr) => {
                xhr.respond(200, {}, '[{"id": 1, "name": "foo"}]');
            });
        })

        it('record:changed not fired after record removed from collection', function (done) {
            const relation = NamedModel.where({parent_id: 11})

            relation.load().then(() => {
                const record = relation.target[0]
                relation.remove(record)

                relation.addEventListener('record:changed', () => {
                    done(new Error('record:changed fired after removal'));
                });

                record.setAttributes({name: 'bar'});
                done();
            });

            this.withRequest('GET', '/named_models', { params: { where: {parent_id: 11}, order: {id: 'desc'} } }, (xhr) => {
                xhr.respond(200, {}, '[{"id": 1, "name": "foo"}]');
            });
        })

    })

})
