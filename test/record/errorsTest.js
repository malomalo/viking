import 'mocha';
import * as assert from 'assert';
import VikingRecord from 'viking/record';

describe('Viking.Relation', () => {

    class Model extends VikingRecord {}

    describe('errors', () => {
        
        it('set on invalid', async function () {
            const record = new Model({
                name: 'Jerry'
            })
            
            record.save()

            await this.withRequest('POST', '/models', { body: {model: {name: 'Jerry'} } }, (xhr) => {
                xhr.respond(400, {
                    'Content-Type': 'application/json'
                }, '{"id": null, "name": "Jerry", "errors": {"name": ["can only be Jimmy"]}}');
            });
            
            assert.deepEqual({name: ['can only be Jimmy']}, record.errors)
        });
        
        it('resets on save', async function () {
            const record = new Model({
                name: 'Jerry'
            })
            record.errors = {name: ['can only be Jimmy']}
            
            record.setAttribute('name', 'Jimmy')
            record.save()
            await this.withRequest('POST', '/models', { body: {model: {name: 'Jimmy'} } }, (xhr) => {
                xhr.respond(200, {}, '{"id": 1, "name": "Jimmy"}');
            });
            
            assert.deepEqual({}, record.errors)
        });
    })
})