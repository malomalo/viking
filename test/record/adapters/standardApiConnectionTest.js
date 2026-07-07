import assert from 'assert';
import AbstractConnection from 'viking/record/abstract-connection';
import StandardAPIConnection from 'viking/record/adapters/standard-api-connection';
import Record from 'viking/record';
import { belongsTo } from 'viking/record/associations';

describe('Viking.Record', () => {
    describe('StandardAPIConnection', () => {

        it('is an AbstractConnection', function () {
            let connection = new StandardAPIConnection('http://example.com');
            assert.ok(connection instanceof AbstractConnection);
            assert.equal(connection.acceptHeader, 'application/json');
        });

        describe('headers', () => {
            it('sends the Api-Version header', function () {
                let connection = new StandardAPIConnection('http://example.com');
                connection.get('/users');

                this.withRequest('GET', '/users', {}, (xhr) => {
                    assert.equal(xhr.requestHeaders['Api-Version'], '0.5.0');
                    assert.equal(xhr.requestHeaders['Accept'], 'application/json');
                });
            });

            it('automatically adds the CSRF token from the meta tag', function () {
                document.head.innerHTML = '<meta name="csrf-token" content="ETZaIMiq">';

                let connection = new StandardAPIConnection('http://example.com');
                connection.get('/');

                this.withRequest('GET', '/', {}, (xhr) => {
                    assert.equal(xhr.requestHeaders['X-CSRF-Token'], 'ETZaIMiq');
                });

                document.head.innerHTML = '';
            });
        });

        describe('buildQueryParams', () => {
            it('builds params with where', function () {
                let connection = new StandardAPIConnection('http://example.com');
                let relation = {
                    _where: [{name: 'Ben'}],
                    _order: [],
                    _limit: null,
                    _offset: null,
                    _include: [],
                    _distinct: null,
                    _groupValues: [],
                    defaultOrder() { return {id: 'desc'}; }
                };
                let params = connection.buildQueryParams(relation);
                assert.deepEqual(params.where, {name: 'Ben'});
            });

            it('builds params with multiple where clauses', function () {
                let connection = new StandardAPIConnection('http://example.com');
                let relation = {
                    _where: [{name: 'Ben'}, 'AND', {age: 30}],
                    _order: [],
                    _limit: null,
                    _offset: null,
                    _include: [],
                    _distinct: null,
                    _groupValues: [],
                    defaultOrder() { return {id: 'desc'}; }
                };
                let params = connection.buildQueryParams(relation);
                assert.deepEqual(params.where, [{name: 'Ben'}, 'AND', {age: 30}]);
            });

            it('uses default order when no order specified', function () {
                let connection = new StandardAPIConnection('http://example.com');
                let relation = {
                    _where: [],
                    _order: [],
                    _limit: null,
                    _offset: null,
                    _include: [],
                    _distinct: null,
                    _groupValues: [],
                    defaultOrder() { return {id: 'desc'}; }
                };
                let params = connection.buildQueryParams(relation);
                assert.deepEqual(params.order, {id: 'desc'});
            });

            it('uses specified order', function () {
                let connection = new StandardAPIConnection('http://example.com');
                let relation = {
                    _where: [],
                    _order: [{name: 'asc'}],
                    _limit: null,
                    _offset: null,
                    _include: [],
                    _distinct: null,
                    _groupValues: [],
                    defaultOrder() { return {id: 'desc'}; }
                };
                let params = connection.buildQueryParams(relation);
                assert.deepEqual(params.order, {name: 'asc'});
            });

            it('uses multiple orders', function () {
                let connection = new StandardAPIConnection('http://example.com');
                let relation = {
                    _where: [],
                    _order: [{name: 'asc'}, {age: 'desc'}],
                    _limit: null,
                    _offset: null,
                    _include: [],
                    _distinct: null,
                    _groupValues: [],
                    defaultOrder() { return {id: 'desc'}; }
                };
                let params = connection.buildQueryParams(relation);
                assert.deepEqual(params.order, [{name: 'asc'}, {age: 'desc'}]);
            });

            it('builds params with limit', function () {
                let connection = new StandardAPIConnection('http://example.com');
                let relation = {
                    _where: [],
                    _order: [],
                    _limit: 10,
                    _offset: null,
                    _include: [],
                    _distinct: null,
                    _groupValues: [],
                    defaultOrder() { return {id: 'desc'}; }
                };
                let params = connection.buildQueryParams(relation);
                assert.equal(params.limit, 10);
            });

            it('builds params with offset', function () {
                let connection = new StandardAPIConnection('http://example.com');
                let relation = {
                    _where: [],
                    _order: [],
                    _limit: null,
                    _offset: 5,
                    _include: [],
                    _distinct: null,
                    _groupValues: [],
                    defaultOrder() { return {id: 'desc'}; }
                };
                let params = connection.buildQueryParams(relation);
                assert.equal(params.offset, 5);
            });

            it('builds params with include', function () {
                let connection = new StandardAPIConnection('http://example.com');
                let relation = {
                    _where: [],
                    _order: [],
                    _limit: null,
                    _offset: null,
                    _include: ['posts', 'comments'],
                    _distinct: null,
                    _groupValues: [],
                    defaultOrder() { return {id: 'desc'}; }
                };
                let params = connection.buildQueryParams(relation);
                assert.deepEqual(params.include, ['posts', 'comments']);
            });

            it('builds params with boolean distinct', function () {
                let connection = new StandardAPIConnection('http://example.com');
                let relation = {
                    _where: [],
                    _order: [],
                    _limit: null,
                    _offset: null,
                    _include: [],
                    _distinct: true,
                    _groupValues: [],
                    defaultOrder() { return {id: 'desc'}; }
                };
                let params = connection.buildQueryParams(relation);
                assert.equal(params.distinct, true);
                assert.equal(params.distinct_on, undefined);
            });

            it('builds params with distinct_on', function () {
                let connection = new StandardAPIConnection('http://example.com');
                let relation = {
                    _where: [],
                    _order: [],
                    _limit: null,
                    _offset: null,
                    _include: [],
                    _distinct: ['name'],
                    _groupValues: [],
                    defaultOrder() { return {id: 'desc'}; }
                };
                let params = connection.buildQueryParams(relation);
                assert.equal(params.distinct, undefined);
                assert.deepEqual(params.distinct_on, ['name']);
            });

            it('builds params with single group_by', function () {
                let connection = new StandardAPIConnection('http://example.com');
                let relation = {
                    _where: [],
                    _order: [],
                    _limit: null,
                    _offset: null,
                    _include: [],
                    _distinct: null,
                    _groupValues: ['category'],
                    defaultOrder() { return {id: 'desc'}; }
                };
                let params = connection.buildQueryParams(relation);
                assert.equal(params.group_by, 'category');
            });

            it('builds params with multiple group_by', function () {
                let connection = new StandardAPIConnection('http://example.com');
                let relation = {
                    _where: [],
                    _order: [],
                    _limit: null,
                    _offset: null,
                    _include: [],
                    _distinct: null,
                    _groupValues: ['category', 'status'],
                    defaultOrder() { return {id: 'desc'}; }
                };
                let params = connection.buildQueryParams(relation);
                assert.deepEqual(params.group_by, ['category', 'status']);
            });

            it('omits unset params', function () {
                let connection = new StandardAPIConnection('http://example.com');
                let relation = {
                    _where: [],
                    _order: [],
                    _limit: null,
                    _offset: null,
                    _include: [],
                    _distinct: null,
                    _groupValues: [],
                    defaultOrder() { return {id: 'desc'}; }
                };
                let params = connection.buildQueryParams(relation);
                assert.equal(params.where, undefined);
                assert.equal(params.limit, undefined);
                assert.equal(params.offset, undefined);
                assert.equal(params.include, undefined);
                assert.equal(params.distinct, undefined);
                assert.equal(params.distinct_on, undefined);
                assert.equal(params.group_by, undefined);
                // order always has a value (default)
                assert.deepEqual(params.order, {id: 'desc'});
            });
        });

        describe('setWhere', () => {
            it('sets single where', function () {
                let connection = new StandardAPIConnection('http://example.com');
                let params = {};
                connection.setWhere(params, { _where: [{active: true}] });
                assert.deepEqual(params.where, {active: true});
            });

            it('does nothing for empty where', function () {
                let connection = new StandardAPIConnection('http://example.com');
                let params = {};
                connection.setWhere(params, { _where: [] });
                assert.equal(params.where, undefined);
            });
        });

        describe('setOrder', () => {
            it('uses default order when empty', function () {
                let connection = new StandardAPIConnection('http://example.com');
                let params = {};
                connection.setOrder(params, { _order: [], defaultOrder() { return {id: 'desc'}; } });
                assert.deepEqual(params.order, {id: 'desc'});
            });

            it('uses specified single order', function () {
                let connection = new StandardAPIConnection('http://example.com');
                let params = {};
                connection.setOrder(params, { _order: [{name: 'asc'}], defaultOrder() { return {id: 'desc'}; } });
                assert.deepEqual(params.order, {name: 'asc'});
            });
        });

        describe('setLimit', () => {
            it('sets limit when present', function () {
                let connection = new StandardAPIConnection('http://example.com');
                let params = {};
                connection.setLimit(params, { _limit: 25 });
                assert.equal(params.limit, 25);
            });

            it('does nothing when null', function () {
                let connection = new StandardAPIConnection('http://example.com');
                let params = {};
                connection.setLimit(params, { _limit: null });
                assert.equal(params.limit, undefined);
            });
        });

        describe('setOffset', () => {
            it('sets offset when present', function () {
                let connection = new StandardAPIConnection('http://example.com');
                let params = {};
                connection.setOffset(params, { _offset: 10 });
                assert.equal(params.offset, 10);
            });

            it('does nothing when null', function () {
                let connection = new StandardAPIConnection('http://example.com');
                let params = {};
                connection.setOffset(params, { _offset: null });
                assert.equal(params.offset, undefined);
            });
        });

        describe('setInclude', () => {
            it('sets include when present', function () {
                let connection = new StandardAPIConnection('http://example.com');
                let params = {};
                connection.setInclude(params, { _include: ['posts'] });
                assert.deepEqual(params.include, ['posts']);
            });

            it('does nothing when empty', function () {
                let connection = new StandardAPIConnection('http://example.com');
                let params = {};
                connection.setInclude(params, { _include: [] });
                assert.equal(params.include, undefined);
            });
        });

        describe('setDistinct', () => {
            it('sets boolean distinct', function () {
                let connection = new StandardAPIConnection('http://example.com');
                let params = {};
                connection.setDistinct(params, { _distinct: true });
                assert.equal(params.distinct, true);
            });

            it('sets distinct_on for non-boolean', function () {
                let connection = new StandardAPIConnection('http://example.com');
                let params = {};
                connection.setDistinct(params, { _distinct: ['name'] });
                assert.deepEqual(params.distinct_on, ['name']);
            });

            it('does nothing when null', function () {
                let connection = new StandardAPIConnection('http://example.com');
                let params = {};
                connection.setDistinct(params, { _distinct: null });
                assert.equal(params.distinct, undefined);
                assert.equal(params.distinct_on, undefined);
            });
        });

        describe('setGroupBy', () => {
            it('sets single group', function () {
                let connection = new StandardAPIConnection('http://example.com');
                let params = {};
                connection.setGroupBy(params, { _groupValues: ['status'] });
                assert.equal(params.group_by, 'status');
            });

            it('sets multiple groups', function () {
                let connection = new StandardAPIConnection('http://example.com');
                let params = {};
                connection.setGroupBy(params, { _groupValues: ['status', 'category'] });
                assert.deepEqual(params.group_by, ['status', 'category']);
            });

            it('does nothing when empty', function () {
                let connection = new StandardAPIConnection('http://example.com');
                let params = {};
                connection.setGroupBy(params, { _groupValues: [] });
                assert.equal(params.group_by, undefined);
            });
        });

        describe('buildRequestBody', () => {
            it('wraps attributes under paramRoot', function () {
                let connection = new StandardAPIConnection('http://example.com');
                let record = { paramRoot() { return 'user'; } };
                let result = connection.buildRequestBody(record, {name: 'Ben'});
                assert.deepEqual(result, {user: {name: 'Ben'}});
            });

            it('composes changed attributes and dirty associations from the record', function () {
                let connection = new StandardAPIConnection('http://example.com');

                class Author extends Record {
                    static schema = { id: { type: 'integer' }, name: { type: 'string' } };
                }
                class Post extends Record {
                    static schema = { id: { type: 'integer' }, title: { type: 'string' } };
                    static associations = [belongsTo('author', Author)];
                }

                let post = Post.instantiate({ id: 1, title: 'Hello' });
                post.title = 'Updated';
                post.author = new Author({ name: 'Ben' });

                assert.deepEqual(connection.buildRequestBody(post), {
                    post: {
                        title: 'Updated',
                        author: { name: 'Ben' }
                    }
                });
            });

            it('throws when a dirty association uses a different connection', function () {
                let connection = new StandardAPIConnection('http://example.com');
                let otherConnection = new StandardAPIConnection('http://other.example.com');

                class Author extends Record {
                    static connection = otherConnection;
                    static schema = { id: { type: 'integer' }, name: { type: 'string' } };
                }
                class Post extends Record {
                    static connection = connection;
                    static schema = { id: { type: 'integer' }, title: { type: 'string' } };
                    static associations = [belongsTo('author', Author)];
                }

                let post = Post.instantiate({ id: 1 });
                post.author = new Author({ name: 'Ben' });

                assert.throws(() => connection.buildRequestBody(post), /different connection/);
            });
        });

    });
});
