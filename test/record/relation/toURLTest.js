import assert from 'assert';
import VikingRecord from 'viking/record';

describe('Viking.Relation', () => {

    class Model extends VikingRecord {}

    describe('toURL', () => {

        it('returns the urlRoot with the default order params', () => {
            assert.strictEqual(
                Model.all().toURL(),
                '/models?order%5Bid%5D=desc'
            );
        });

        it('appends a query string built from the relation state', () => {
            const url = Model.where({parent_id: 11}).order('name').toURL();
            assert.strictEqual(
                url,
                '/models?where%5Bparent_id%5D=11&order%5Bname%5D=desc'
            );
        });

        it('merges option overrides over the generated params', () => {
            const url = Model.where({parent_id: 11}).toURL({page: 2});
            assert.strictEqual(
                url,
                '/models?where%5Bparent_id%5D=11&order%5Bid%5D=desc&page=2'
            );
        });

        it('allows options to override params generated from the relation', () => {
            const url = Model.where({parent_id: 11}).toURL({where: {parent_id: 42}});
            assert.strictEqual(
                url,
                '/models?where%5Bparent_id%5D=42&order%5Bid%5D=desc'
            );
        });

        it('plucks content_type from options and appends it as a file extension', () => {
            const url = Model.where({parent_id: 11}).toURL({content_type: 'csv'});
            assert.strictEqual(
                url,
                '/models.csv?where%5Bparent_id%5D=11&order%5Bid%5D=desc'
            );
        });

        it('converts mime-type style content_type to a file extension', () => {
            const url = Model.all().toURL({content_type: 'text/csv'});
            assert.strictEqual(url, '/models.csv?order%5Bid%5D=desc');
        });

        it('does not include content_type in the query string', () => {
            const url = Model.all().toURL({content_type: 'csv'});
            assert.ok(!url.includes('content_type'));
        });

        it('appends the extension before the query string', () => {
            const url = Model.where({parent_id: 11}).toURL({content_type: 'json'});
            assert.strictEqual(
                url,
                '/models.json?where%5Bparent_id%5D=11&order%5Bid%5D=desc'
            );
        });

    });

});
