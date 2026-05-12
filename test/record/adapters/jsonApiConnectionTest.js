import assert from 'assert';
import Connection from 'viking/record/connection';
import JSONAPIConnection from 'viking/record/adapters/json-api-connection';
import Record from 'viking/record';

describe('Viking.Record', () => {
    describe('JSONAPIConnection', () => {

        describe('headers', () => {
            it('acceptHeader returns JSON:API media type', function () {
                let connection = new JSONAPIConnection('http://example.com');
                assert.equal(connection.acceptHeader(), 'application/vnd.api+json');
            });

            it('contentTypeHeader returns JSON:API media type', function () {
                let connection = new JSONAPIConnection('http://example.com');
                assert.equal(connection.contentTypeHeader(), 'application/vnd.api+json');
            });

            it('sets Accept header on requests', function () {
                let connection = new JSONAPIConnection('http://example.com');
                connection.get('/users/');

                this.withRequest('GET', '/users/', {}, (xhr) => {
                    assert.equal(xhr.requestHeaders['Accept'], 'application/vnd.api+json');
                });
            });

            it('sets Content-Type header on POST requests', function () {
                let connection = new JSONAPIConnection('http://example.com');
                connection.post('/users/', { body: { data: { type: 'users', attributes: { name: 'Ben' } } } });

                this.withRequest('POST', '/users/', {}, (xhr) => {
                    assert.equal(xhr.requestHeaders['Content-Type'], 'application/vnd.api+json;charset=utf-8');
                });
            });
        });

        describe('formatRouteKey', () => {
            it('replaces underscores with hyphens', function () {
                let connection = new JSONAPIConnection('http://example.com');
                let klass = { modelName() { return { routeKey: 'blog_posts' }; } };
                assert.equal(connection.formatRouteKey(klass), 'blog-posts');
            });

            it('handles single-word keys', function () {
                let connection = new JSONAPIConnection('http://example.com');
                let klass = { modelName() { return { routeKey: 'users' }; } };
                assert.equal(connection.formatRouteKey(klass), 'users');
            });

            it('handles multiple underscores', function () {
                let connection = new JSONAPIConnection('http://example.com');
                let klass = { modelName() { return { routeKey: 'user_blog_posts' }; } };
                assert.equal(connection.formatRouteKey(klass), 'user-blog-posts');
            });
        });

        describe('formatPath', () => {
            it('adds trailing slash', function () {
                let connection = new JSONAPIConnection('http://example.com');
                assert.equal(connection.formatPath('/users'), '/users/');
            });

            it('preserves existing trailing slash', function () {
                let connection = new JSONAPIConnection('http://example.com');
                assert.equal(connection.formatPath('/users/'), '/users/');
            });
        });

        describe('method', () => {
            it('returns patch for update', function () {
                let connection = new JSONAPIConnection('http://example.com');
                assert.equal(connection.method('update'), 'patch');
            });

            it('inherits defaults for other actions', function () {
                let connection = new JSONAPIConnection('http://example.com');
                assert.equal(connection.method('create'), 'post');
                assert.equal(connection.method('read'), 'get');
                assert.equal(connection.method('destroy'), 'delete');
            });
        });

        describe('setWhere', () => {
            it('maps where to filter param', function () {
                let connection = new JSONAPIConnection('http://example.com');
                let params = {};
                connection.setWhere(params, { _where: [{ active: true }] });
                assert.deepEqual(params.filter, { active: true });
                assert.equal(params.where, undefined);
            });

            it('handles multiple where clauses', function () {
                let connection = new JSONAPIConnection('http://example.com');
                let params = {};
                connection.setWhere(params, { _where: [{ name: 'Ben' }, 'AND', { age: 30 }] });
                assert.deepEqual(params.filter, [{ name: 'Ben' }, 'AND', { age: 30 }]);
            });

            it('does nothing for empty where', function () {
                let connection = new JSONAPIConnection('http://example.com');
                let params = {};
                connection.setWhere(params, { _where: [] });
                assert.equal(params.filter, undefined);
            });
        });

        describe('setOrder', () => {
            it('maps ascending order to sort string', function () {
                let connection = new JSONAPIConnection('http://example.com');
                let params = {};
                connection.setOrder(params, {
                    _order: [{ name: 'asc' }],
                    defaultOrder() { return { id: 'desc' }; }
                });
                assert.equal(params.sort, 'name');
                assert.equal(params.order, undefined);
            });

            it('maps descending order to sort string with minus prefix', function () {
                let connection = new JSONAPIConnection('http://example.com');
                let params = {};
                connection.setOrder(params, {
                    _order: [{ created_at: 'desc' }],
                    defaultOrder() { return { id: 'desc' }; }
                });
                assert.equal(params.sort, '-created_at');
            });

            it('joins multiple orders with comma', function () {
                let connection = new JSONAPIConnection('http://example.com');
                let params = {};
                connection.setOrder(params, {
                    _order: [{ name: 'asc' }, { age: 'desc' }],
                    defaultOrder() { return { id: 'desc' }; }
                });
                assert.equal(params.sort, 'name,-age');
            });

            it('uses default order when none specified', function () {
                let connection = new JSONAPIConnection('http://example.com');
                let params = {};
                connection.setOrder(params, {
                    _order: [],
                    defaultOrder() { return { id: 'desc' }; }
                });
                assert.equal(params.sort, '-id');
            });
        });

        describe('setLimit', () => {
            it('maps limit to page.size', function () {
                let connection = new JSONAPIConnection('http://example.com');
                let params = {};
                connection.setLimit(params, { _limit: 25 });
                assert.deepEqual(params.page, { size: 25 });
                assert.equal(params.limit, undefined);
            });

            it('does nothing when null', function () {
                let connection = new JSONAPIConnection('http://example.com');
                let params = {};
                connection.setLimit(params, { _limit: null });
                assert.equal(params.page, undefined);
            });
        });

        describe('setOffset', () => {
            it('maps offset to page.offset', function () {
                let connection = new JSONAPIConnection('http://example.com');
                let params = {};
                connection.setOffset(params, { _offset: 10 });
                assert.deepEqual(params.page, { offset: 10 });
                assert.equal(params.offset, undefined);
            });

            it('merges with existing page params', function () {
                let connection = new JSONAPIConnection('http://example.com');
                let params = { page: { size: 25 } };
                connection.setOffset(params, { _offset: 10 });
                assert.deepEqual(params.page, { size: 25, offset: 10 });
            });

            it('does nothing when null', function () {
                let connection = new JSONAPIConnection('http://example.com');
                let params = {};
                connection.setOffset(params, { _offset: null });
                assert.equal(params.page, undefined);
            });
        });

        describe('setInclude', () => {
            it('joins includes with comma', function () {
                let connection = new JSONAPIConnection('http://example.com');
                let params = {};
                connection.setInclude(params, { _include: ['posts', 'comments'] });
                assert.equal(params.include, 'posts,comments');
            });

            it('handles single include', function () {
                let connection = new JSONAPIConnection('http://example.com');
                let params = {};
                connection.setInclude(params, { _include: ['posts'] });
                assert.equal(params.include, 'posts');
            });

            it('does nothing when empty', function () {
                let connection = new JSONAPIConnection('http://example.com');
                let params = {};
                connection.setInclude(params, { _include: [] });
                assert.equal(params.include, undefined);
            });
        });

        describe('buildQueryParams aggregate', () => {
            it('builds complete JSON:API params', function () {
                let connection = new JSONAPIConnection('http://example.com');
                let relation = {
                    _where: [{ active: true }],
                    _order: [{ name: 'asc' }, { created_at: 'desc' }],
                    _limit: 25,
                    _offset: 50,
                    _include: ['posts', 'comments'],
                    _distinct: null,
                    _groupValues: [],
                    defaultOrder() { return { id: 'desc' }; }
                };
                let params = connection.buildQueryParams(relation);
                assert.deepEqual(params.filter, { active: true });
                assert.equal(params.sort, 'name,-created_at');
                assert.deepEqual(params.page, { size: 25, offset: 50 });
                assert.equal(params.include, 'posts,comments');
                // Rails-style keys should be absent
                assert.equal(params.where, undefined);
                assert.equal(params.order, undefined);
                assert.equal(params.limit, undefined);
                assert.equal(params.offset, undefined);
            });
        });

        describe('buildRequestBody', () => {
            it('wraps attributes in JSON:API data envelope', function () {
                let connection = new JSONAPIConnection('http://example.com');

                class User extends Record {
                    static schema = { name: { type: 'string' } };
                }

                let record = new User({ name: 'Ben' });
                let body = connection.buildRequestBody(record, { name: 'Ben' });
                assert.deepEqual(body, {
                    data: {
                        type: 'users',
                        attributes: { name: 'Ben' }
                    }
                });
            });

            it('includes id for persisted records', function () {
                let connection = new JSONAPIConnection('http://example.com');

                class User extends Record {
                    static schema = { id: { type: 'integer' }, name: { type: 'string' } };
                }

                let record = User.instantiate({ id: 42, name: 'Ben' });
                let body = connection.buildRequestBody(record, { name: 'Updated' });
                assert.equal(body.data.id, '42');
                assert.equal(body.data.type, 'users');
                assert.deepEqual(body.data.attributes, { name: 'Updated' });
            });

            it('hyphenates the type from routeKey', function () {
                let connection = new JSONAPIConnection('http://example.com');

                class BlogPost extends Record {
                    static schema = { title: { type: 'string' } };
                }

                let record = new BlogPost({ title: 'Hello' });
                let body = connection.buildRequestBody(record, { title: 'Hello' });
                assert.equal(body.data.type, 'blog-posts');
            });
        });

        describe('deserializeResponseBody', () => {
            it('flattens a single resource', function () {
                let connection = new JSONAPIConnection('http://example.com');
                let response = {
                    data: {
                        id: '1',
                        type: 'users',
                        attributes: { name: 'Ben', email: 'ben@example.com' }
                    }
                };
                let result = connection.deserializeResponseBody(response, {});
                assert.deepEqual(result, { id: '1', name: 'Ben', email: 'ben@example.com' });
            });

            it('flattens an array of resources', function () {
                let connection = new JSONAPIConnection('http://example.com');
                let response = {
                    data: [
                        { id: '1', type: 'users', attributes: { name: 'Ben' } },
                        { id: '2', type: 'users', attributes: { name: 'Alice' } }
                    ]
                };
                let result = connection.deserializeResponseBody(response, {});
                assert.deepEqual(result, [
                    { id: '1', name: 'Ben' },
                    { id: '2', name: 'Alice' }
                ]);
            });

            it('returns null/empty responses unchanged', function () {
                let connection = new JSONAPIConnection('http://example.com');
                assert.equal(connection.deserializeResponseBody(null, {}), null);
                assert.deepEqual(connection.deserializeResponseBody({}, {}), {});
            });
        });

        describe('parseErrors', () => {
            it('transforms JSON:API error array to field-keyed object', function () {
                let connection = new JSONAPIConnection('http://example.com');
                let responseText = JSON.stringify({
                    errors: [
                        { source: { pointer: '/data/attributes/name' }, detail: 'is required' },
                        { source: { pointer: '/data/attributes/name' }, detail: 'is too short' },
                        { source: { pointer: '/data/attributes/email' }, detail: 'is invalid' }
                    ]
                });
                let result = connection.parseErrors(responseText, 'application/vnd.api+json');
                assert.deepEqual(result, {
                    name: ['is required', 'is too short'],
                    email: ['is invalid']
                });
            });

            it('uses base for errors without source pointer', function () {
                let connection = new JSONAPIConnection('http://example.com');
                let responseText = JSON.stringify({
                    errors: [{ title: 'Something went wrong' }]
                });
                let result = connection.parseErrors(responseText, 'application/vnd.api+json');
                assert.deepEqual(result, { base: ['Something went wrong'] });
            });

            it('returns empty object when no errors', function () {
                let connection = new JSONAPIConnection('http://example.com');
                let responseText = JSON.stringify({});
                let result = connection.parseErrors(responseText, 'application/vnd.api+json');
                assert.deepEqual(result, {});
            });
        });

        describe('buildAssociationPath', () => {
            it('builds JSON:API relationships path', function () {
                let connection = new JSONAPIConnection('http://example.com');
                let MockClass = { modelName() { return { routeKey: 'blog_posts' }; } };
                let owner = {
                    constructor: MockClass,
                    modelName: { routeKey: 'blog_posts' },
                    readAttribute(attr) { return attr === 'id' ? 42 : null; }
                };
                assert.equal(connection.buildAssociationPath(owner, 'comments'), '/blog-posts/42/relationships/comments');
            });

            it('ignores the record argument (relationships path has no target id)', function () {
                let connection = new JSONAPIConnection('http://example.com');
                let MockClass = { modelName() { return { routeKey: 'users' }; } };
                let owner = {
                    constructor: MockClass,
                    modelName: { routeKey: 'users' },
                    readAttribute(attr) { return attr === 'id' ? 1 : null; }
                };
                let record = {
                    readAttribute(attr) { return attr === 'id' ? 99 : null; }
                };
                assert.equal(connection.buildAssociationPath(owner, 'posts', record), '/users/1/relationships/posts');
            });
        });

        describe('end-to-end with Record', () => {
            let originalConnection;

            before(function () {
                originalConnection = Record.connection;
            });

            after(function () {
                Record.connection = originalConnection;
            });

            it('urlRoot uses hyphenated routes with trailing slash', function () {
                let connection = new JSONAPIConnection('http://example.com');

                class BlogPost extends Record {
                    static connection = connection;
                    static schema = { title: { type: 'string' } };
                }

                assert.equal(BlogPost.urlRoot(), '/blog-posts/');
            });

            it('commit uses PATCH for updates', function () {
                let connection = new JSONAPIConnection('http://example.com');

                class User extends Record {
                    static connection = connection;
                    static schema = { id: { type: 'integer' }, name: { type: 'string' } };
                }

                let user = User.instantiate({ id: 1, name: 'Ben' });
                user.name = 'Updated';
                user.save();

                this.withRequest('PATCH', '/users/1', {}, (xhr) => {
                    let body = JSON.parse(xhr.requestBody);
                    assert.equal(body.data.type, 'users');
                    assert.deepEqual(body.data.attributes, { name: 'Updated' });
                });
            });

            it('commit uses POST for creates with JSON:API body', function () {
                let connection = new JSONAPIConnection('http://example.com');

                class User extends Record {
                    static connection = connection;
                    static schema = { name: { type: 'string' } };
                }

                let user = new User({ name: 'NewUser' });
                user.save();

                this.withRequest('POST', '/users/', {}, (xhr) => {
                    let body = JSON.parse(xhr.requestBody);
                    assert.equal(body.data.type, 'users');
                    assert.deepEqual(body.data.attributes, { name: 'NewUser' });
                    assert.equal(body.data.id, undefined);
                });
            });

            it('deserializes JSON:API response on load', function (done) {
                let connection = new JSONAPIConnection('http://example.com');

                class User extends Record {
                    static connection = connection;
                    static schema = { id: { type: 'integer' }, name: { type: 'string' } };
                }

                User.all().load().then((records) => {
                    assert.equal(records.length, 2);
                    assert.equal(records[0].name, 'Ben');
                    assert.equal(records[1].name, 'Alice');
                    done();
                }).catch(done);

                this.withRequest('GET', '/users/', { params: { sort: '-id' } }, (xhr) => {
                    xhr.respond(200, { 'Content-Type': 'application/vnd.api+json' }, JSON.stringify({
                        data: [
                            { id: '1', type: 'users', attributes: { name: 'Ben' } },
                            { id: '2', type: 'users', attributes: { name: 'Alice' } }
                        ]
                    }));
                });
            });
        });

    });
});
