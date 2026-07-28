import assert from 'assert';
import VikingRecord from 'viking/record';

describe('Viking.Relation', () => {

    class Model extends VikingRecord {}

    describe('toPath', () => {

        it('returns the path with the default order params', () => {
            assert.strictEqual(
                Model.all().toPath(),
                '/models?order%5Bid%5D=desc'
            );
        });

        it('appends a query string built from the relation state', () => {
            const path = Model.where({parent_id: 11}).order('name').toPath();
            assert.strictEqual(
                path,
                '/models?where%5Bparent_id%5D=11&order%5Bname%5D=desc'
            );
        });

        it('merges option overrides over the generated params', () => {
            const path = Model.where({parent_id: 11}).toPath({page: 2});
            assert.strictEqual(
                path,
                '/models?where%5Bparent_id%5D=11&order%5Bid%5D=desc&page=2'
            );
        });

        it('allows options to override params generated from the relation', () => {
            const path = Model.where({parent_id: 11}).toPath({where: {parent_id: 42}});
            assert.strictEqual(
                path,
                '/models?where%5Bparent_id%5D=42&order%5Bid%5D=desc'
            );
        });

        it('plucks extension from options and appends it as a file extension', () => {
            const path = Model.where({parent_id: 11}).toPath({extension: 'csv'});
            assert.strictEqual(
                path,
                '/models.csv?where%5Bparent_id%5D=11&order%5Bid%5D=desc'
            );
        });

        it('does not include extension in the query string', () => {
            const path = Model.all().toPath({extension: 'csv'});
            assert.ok(!path.includes('extension'));
        });

        it('appends the extension before the query string', () => {
            const path = Model.where({parent_id: 11}).toPath({extension: 'json'});
            assert.strictEqual(
                path,
                '/models.json?where%5Bparent_id%5D=11&order%5Bid%5D=desc'
            );
        });

    });

});
