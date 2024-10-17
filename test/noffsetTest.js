import 'mocha';
import assert from 'assert';
import VikingRecord from 'viking/record';
import Relation from 'viking/record/relation';
import 'viking/noffset';

describe('Viking Noffset', () => {

    class Model extends VikingRecord {}

    it('nextPage', async function () {
        const models = Model.order({name: 'asc'})
        models.load()
        await this.withRequest('GET', '/models', { params: { order: {name: 'asc'} } }, (xhr) => {
            xhr.respond(200, {}, '[{"name": "Alex"}, {"name": "Ben"}, {"name": "Chris"}, {"name": "Jon"}]');
        });
        
        await models.nextPage()
        assert.request('GET', '/models', { params: { where: {name: {gt: 'Jon'}}, order: {name: 'asc'} } })
    })
    
    it('prevPage', async function () {
        const models = Model.order({name: 'asc'})
        models.load()
        await this.withRequest('GET', '/models', { params: { order: {name: 'asc'} } }, (xhr) => {
            xhr.respond(200, {}, '[{"name": "Alex"}, {"name": "Ben"}, {"name": "Chris"}, {"name": "Jon"}]');
        });
        
        await models.prevPage()
        assert.request('GET', '/models', { params: { where: {name: {lt: 'Alex'}}, order: {name: 'asc'} } })
    })
})