import assert from 'assert';
import JSONAPIConnection from 'viking/record/adapters/json-api-connection';
import Record from 'viking/record';
import { belongsTo, hasMany } from 'viking/record/associations';

describe('Viking.Record', () => {
    describe('JSONAPIConnection', () => {

        describe('headers', () => {
            it('acceptHeader returns JSON:API media type', function () {
                let connection = new JSONAPIConnection('http://example.com');
                assert.equal(connection.acceptHeader, 'application/vnd.api+json');
            });

            it('sets Accept header on requests', function () {
                let connection = new JSONAPIConnection('http://example.com');
                connection.get('/users/');

                this.withRequest('GET', '/users/', {}, (xhr) => {
                    assert.equal(xhr.requestHeaders['Accept'], 'application/vnd.api+json');
                });
            });

        });

        describe('routeKey', () => {
            it('replaces underscores with hyphens', function () {
                let connection = new JSONAPIConnection('http://example.com');
                let klass = { baseClass() { return this; }, modelName() { return { plural: 'blog_posts' }; } };
                assert.equal(connection.routeKey(klass), 'blog-posts');
            });

            it('handles single-word keys', function () {
                let connection = new JSONAPIConnection('http://example.com');
                let klass = { baseClass() { return this; }, modelName() { return { plural: 'users' }; } };
                assert.equal(connection.routeKey(klass), 'users');
            });

            it('handles multiple underscores', function () {
                let connection = new JSONAPIConnection('http://example.com');
                let klass = { baseClass() { return this; }, modelName() { return { plural: 'user_blog_posts' }; } };
                assert.equal(connection.routeKey(klass), 'user-blog-posts');
            });

            it('uses the baseClass for STI models', function () {
                let connection = new JSONAPIConnection('http://example.com');

                class CargoShip extends Record { }
                class Carrier extends CargoShip { }

                assert.equal(connection.routeKey(Carrier), 'cargo-ships');
                assert.equal(connection.path(Carrier), '/cargo-ships');

                let carrier = Carrier.instantiate({ id: 42 });
                carrier.setAttributes({ name: 'Maersk' });
                assert.equal(connection.buildRequestBody(carrier).data.type, 'cargo-ships');
            });
        });

        describe('path', () => {
            it('does not add a trailing slash to collection paths', function () {
                let connection = new JSONAPIConnection('http://example.com');
                function User() {}
                User.modelName = () => ({ plural: 'users' });
                User.baseClass = () => User;
                assert.equal(connection.path(User), '/users');
            });

            it('builds member paths', function () {
                let connection = new JSONAPIConnection('http://example.com');
                function User() {}
                User.modelName = () => ({ plural: 'users' });
                User.baseClass = () => User;
                let user = { constructor: User, toParam() { return '1'; } };
                assert.equal(connection.path(user), '/users/1');
            });
        });

        describe('actions', () => {
            it('update sends a PATCH request', function () {
                let connection = new JSONAPIConnection('http://example.com');
                connection.update('/users/1');
                assert.ok(this.findRequest('PATCH', '/users/1'));
            });

            it('inherits defaults for other actions', function () {
                let connection = new JSONAPIConnection('http://example.com');
                connection.create('/users');
                assert.ok(this.findRequest('POST', '/users'));

                connection.read('/users');
                assert.ok(this.findRequest('GET', '/users'));

                connection.destroy('/users/1');
                assert.ok(this.findRequest('DELETE', '/users/1'));
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
            it('maps limit to page.limit', function () {
                let connection = new JSONAPIConnection('http://example.com');
                let params = {};
                connection.setLimit(params, { _limit: 25 });
                assert.deepEqual(params.page, { limit: 25 });
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
                let params = { page: { limit: 25 } };
                connection.setOffset(params, { _offset: 10 });
                assert.deepEqual(params.page, { limit: 25, offset: 10 });
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
                assert.deepEqual(params.page, { limit: 25, offset: 50 });
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

        describe('buildRequestBody from record state', () => {
            it('composes changed attributes', function () {
                let connection = new JSONAPIConnection('http://example.com');

                class User extends Record {
                    static schema = { id: { type: 'integer' }, name: { type: 'string' }, email: { type: 'string' } };
                }

                let user = User.instantiate({ id: 42, name: 'Ben', email: 'ben@example.com' });
                user.name = 'Updated';

                assert.deepEqual(connection.buildRequestBody(user), {
                    data: {
                        id: '42',
                        type: 'users',
                        attributes: { name: 'Updated' }
                    }
                });
            });

            it('sends a dirty belongsTo as a resource identifier', function () {
                let connection = new JSONAPIConnection('http://example.com');

                class Author extends Record {
                    static schema = { id: { type: 'integer' }, name: { type: 'string' } };
                }
                class Post extends Record {
                    static schema = { id: { type: 'integer' }, title: { type: 'string' } };
                    static associations = [belongsTo('author', Author)];
                }

                let post = Post.instantiate({ id: 1, title: 'Hello' });
                post.author = Author.instantiate({ id: 7, name: 'Ben' });

                assert.deepEqual(connection.buildRequestBody(post), {
                    data: {
                        id: '1',
                        type: 'posts',
                        attributes: {},
                        relationships: {
                            author: { data: { type: 'authors', id: '7' } }
                        }
                    }
                });
            });

            it('sends a dirty hasMany as an array of resource identifiers', function () {
                let connection = new JSONAPIConnection('http://example.com');

                class Tag extends Record {
                    static schema = { id: { type: 'integer' }, name: { type: 'string' } };
                }
                class Post extends Record {
                    static schema = { id: { type: 'integer' }, title: { type: 'string' } };
                    static associations = [hasMany('tags', Tag)];
                }

                let post = Post.instantiate({ id: 1, title: 'Hello' });
                post.association('tags').setTarget([
                    Tag.instantiate({ id: 3, name: 'a' }),
                    Tag.instantiate({ id: 4, name: 'b' })
                ]);

                assert.deepEqual(connection.buildRequestBody(post), {
                    data: {
                        id: '1',
                        type: 'posts',
                        attributes: {},
                        relationships: {
                            tags: { data: [{ type: 'tags', id: '3' }, { type: 'tags', id: '4' }] }
                        }
                    }
                });
            });

            it('throws for an unpersisted associated record', function () {
                let connection = new JSONAPIConnection('http://example.com');

                class Author extends Record {
                    static schema = { id: { type: 'integer' }, name: { type: 'string' } };
                }
                class Post extends Record {
                    static schema = { id: { type: 'integer' }, title: { type: 'string' } };
                    static associations = [belongsTo('author', Author)];
                }

                let post = Post.instantiate({ id: 1 });
                post.author = new Author({ name: 'Ben' });

                assert.throws(() => connection.buildRequestBody(post), /save it first/);
            });

            it('throws when a relationship uses a different connection', function () {
                let connection = new JSONAPIConnection('http://example.com');
                let otherConnection = new JSONAPIConnection('http://other.example.com');

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
                post.author = Author.instantiate({ id: 7 });

                assert.throws(() => connection.buildRequestBody(post), /different connection/);
            });

            it('does not add relationships when explicit attributes are given', function () {
                let connection = new JSONAPIConnection('http://example.com');

                class Author extends Record {
                    static schema = { id: { type: 'integer' }, name: { type: 'string' } };
                }
                class Post extends Record {
                    static schema = { id: { type: 'integer' }, title: { type: 'string' } };
                    static associations = [belongsTo('author', Author)];
                }

                let post = Post.instantiate({ id: 1 });
                post.author = Author.instantiate({ id: 7 });

                let body = connection.buildRequestBody(post, { title: 'Explicit' });
                assert.deepEqual(body, {
                    data: { id: '1', type: 'posts', attributes: { title: 'Explicit' } }
                });
            });
        });

        describe('deserializeResponseBody', () => {
            it('flattens a single resource', function () {
                let connection = new JSONAPIConnection('http://example.com');
                let response = JSON.stringify({
                    data: {
                        id: '1',
                        type: 'users',
                        attributes: { name: 'Ben', email: 'ben@example.com' }
                    }
                });
                let result = connection.deserializeResponseBody({ response });
                assert.deepEqual(result, { id: '1', name: 'Ben', email: 'ben@example.com' });
            });

            it('flattens an array of resources', function () {
                let connection = new JSONAPIConnection('http://example.com');
                let response = JSON.stringify({
                    data: [
                        { id: '1', type: 'users', attributes: { name: 'Ben' } },
                        { id: '2', type: 'users', attributes: { name: 'Alice' } }
                    ]
                });
                let result = connection.deserializeResponseBody({ response });
                assert.deepEqual(result, [
                    { id: '1', name: 'Ben' },
                    { id: '2', name: 'Alice' }
                ]);
            });

            it('returns null/empty responses unchanged', function () {
                let connection = new JSONAPIConnection('http://example.com');
                assert.equal(connection.deserializeResponseBody({ response: 'null' }), null);
                assert.deepEqual(connection.deserializeResponseBody({ response: '{}' }), {});
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

            it('returns null for non-JSON responses', function () {
                let connection = new JSONAPIConnection('http://example.com');
                assert.equal(connection.parseErrors('<html></html>', 'text/html'), null);
                assert.equal(connection.parseErrors('error', null), null);
            });

            it('accepts plain application/json error responses', function () {
                let connection = new JSONAPIConnection('http://example.com');
                let responseText = JSON.stringify({
                    errors: [{ source: { pointer: '/data/attributes/name' }, detail: 'is required' }]
                });
                let result = connection.parseErrors(responseText, 'application/json');
                assert.deepEqual(result, { name: ['is required'] });
            });

            it('returns empty object when no errors', function () {
                let connection = new JSONAPIConnection('http://example.com');
                let responseText = JSON.stringify({});
                let result = connection.parseErrors(responseText, 'application/vnd.api+json');
                assert.deepEqual(result, {});
            });
        });

        describe('path (relationships)', () => {
            it('builds JSON:API relationships path', function () {
                let connection = new JSONAPIConnection('http://example.com');
                let MockClass = { baseClass() { return this; }, modelName() { return { plural: 'blog_posts' }; } };
                let owner = {
                    constructor: MockClass,
                    primaryKey() { return 42; }
                };
                assert.equal(connection.path(owner, 'comments'), '/blog-posts/42/relationships/comments');
            });

            it('ignores the record argument (relationships path has no target id)', function () {
                let connection = new JSONAPIConnection('http://example.com');
                let MockClass = { baseClass() { return this; }, modelName() { return { plural: 'users' }; } };
                let owner = {
                    constructor: MockClass,
                    primaryKey() { return 1; }
                };
                let record = { primaryKey() { return 99; } };
                assert.equal(connection.path(owner, 'posts', record), '/users/1/relationships/posts');
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

            it('collection path uses hyphenated routes', function () {
                let connection = new JSONAPIConnection('http://example.com');

                class BlogPost extends Record {
                    static connection = connection;
                    static schema = { title: { type: 'string' } };
                }

                assert.equal(connection.path(BlogPost), '/blog-posts');
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

                this.withRequest('POST', '/users', {}, (xhr) => {
                    let body = JSON.parse(xhr.requestBody);
                    assert.equal(body.data.type, 'users');
                    assert.deepEqual(body.data.attributes, { name: 'NewUser' });
                    assert.equal(body.data.id, undefined);
                });
            });

            it('commit sends dirty associations as relationships', function () {
                let connection = new JSONAPIConnection('http://example.com');

                class Author extends Record {
                    static connection = connection;
                    static schema = { id: { type: 'integer' }, name: { type: 'string' } };
                }
                class Post extends Record {
                    static connection = connection;
                    static schema = { id: { type: 'integer' }, title: { type: 'string' } };
                    static associations = [belongsTo('author', Author)];
                }

                let post = Post.instantiate({ id: 1, title: 'Hello' });
                post.title = 'Updated';
                post.author = Author.instantiate({ id: 7, name: 'Ben' });
                post.save();

                this.withRequest('PATCH', '/posts/1', {}, (xhr) => {
                    let body = JSON.parse(xhr.requestBody);
                    assert.deepEqual(body.data.attributes, { title: 'Updated' });
                    assert.deepEqual(body.data.relationships, {
                        author: { data: { type: 'authors', id: '7' } }
                    });
                });
            });

            it('parses validation errors from a 422 response', function (done) {
                let connection = new JSONAPIConnection('http://example.com');

                class User extends Record {
                    static connection = connection;
                    static schema = { id: { type: 'integer' }, name: { type: 'string' } };
                }

                let user = User.instantiate({ id: 1, name: 'Ben' });
                user.name = '';
                user.save().then((saved) => {
                    assert.equal(saved, false);
                    assert.deepEqual(user.errors, { name: ['is required'] });
                    done();
                }).catch(done);

                this.withRequest('PATCH', '/users/1', {}, (xhr) => {
                    xhr.respond(422, { 'Content-Type': 'application/vnd.api+json' }, JSON.stringify({
                        errors: [{ source: { pointer: '/data/attributes/name' }, detail: 'is required' }]
                    }));
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

                this.withRequest('GET', '/users', { params: { sort: '-id' } }, (xhr) => {
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
