import assert from 'assert';
import JSONAPIConnection from 'viking/record/adapters/json-api-connection';
import DjangoJSONAPIConnection from 'viking/record/adapters/django-json-api-connection';
import Record from 'viking/record';

describe('Viking.Record', () => {
    describe('DjangoJSONAPIConnection', () => {

        it('is a JSONAPIConnection', function () {
            let connection = new DjangoJSONAPIConnection('http://example.com');
            assert.ok(connection instanceof JSONAPIConnection);
            assert.equal(connection.acceptHeader, 'application/vnd.api+json');
        });

        describe('path', () => {
            it('adds trailing slash to collection paths', function () {
                let connection = new DjangoJSONAPIConnection('http://example.com');
                function User() {}
                User.modelName = () => ({ plural: 'users' });
                assert.equal(connection.path(User), '/users/');
            });

            it('does not add trailing slash to member paths', function () {
                let connection = new DjangoJSONAPIConnection('http://example.com');
                function User() {}
                User.modelName = () => ({ plural: 'users' });
                let user = { constructor: User, toParam() { return '1'; } };
                assert.equal(connection.path(user), '/users/1');
            });

            it('builds JSON:API relationships paths', function () {
                let connection = new DjangoJSONAPIConnection('http://example.com');
                let MockClass = { modelName() { return { plural: 'blog_posts' }; } };
                let owner = {
                    constructor: MockClass,
                    primaryKey() { return 42; }
                };
                assert.equal(connection.path(owner, 'comments'), '/blog-posts/42/relationships/comments');
            });
        });

        describe('setWhere', () => {
            it('passes equality filters through', function () {
                let connection = new DjangoJSONAPIConnection('http://example.com');
                let params = {};
                connection.setWhere(params, { _where: [{ active: true }] });
                assert.deepEqual(params.filter, { active: true });
            });

            it('flattens comparison predicates to dot notation', function () {
                let connection = new DjangoJSONAPIConnection('http://example.com');
                let params = {};
                connection.setWhere(params, { _where: [{ age: { gt: 30 } }] });
                assert.deepEqual(params.filter, { 'age.gt': 30 });
            });

            it('flattens association paths', function () {
                let connection = new DjangoJSONAPIConnection('http://example.com');
                let params = {};
                connection.setWhere(params, { _where: [{ author: { name: { icontains: 'ben' } } }] });
                assert.deepEqual(params.filter, { 'author.name.icontains': 'ben' });
            });

            it('merges AND clauses into one filter object', function () {
                let connection = new DjangoJSONAPIConnection('http://example.com');
                let params = {};
                connection.setWhere(params, { _where: [{ name: 'Ben' }, 'AND', { age: { gte: 21 } }] });
                assert.deepEqual(params.filter, { name: 'Ben', 'age.gte': 21 });
            });

            it('maps bare arrays to the in lookup', function () {
                let connection = new DjangoJSONAPIConnection('http://example.com');
                let params = {};
                connection.setWhere(params, { _where: [{ id: [1, 2, 3] }] });
                assert.deepEqual(params.filter, { 'id.in': '1,2,3' });
            });

            it('comma-joins arrays already under a list lookup', function () {
                let connection = new DjangoJSONAPIConnection('http://example.com');
                let params = {};
                connection.setWhere(params, { _where: [{ id: { in: [1, 2, 3] }, age: { range: [18, 30] } }] });
                assert.deepEqual(params.filter, { 'id.in': '1,2,3', 'age.range': '18,30' });
            });

            it('maps null to the isnull lookup', function () {
                let connection = new DjangoJSONAPIConnection('http://example.com');
                let params = {};
                connection.setWhere(params, { _where: [{ deleted_at: null }] });
                assert.deepEqual(params.filter, { 'deleted_at.isnull': true });
            });

            it('throws on clauses that cannot be expressed as DJA filters', function () {
                let connection = new DjangoJSONAPIConnection('http://example.com');
                assert.throws(() => {
                    connection.setWhere({}, { _where: [{ name: 'Ben' }, 'OR', { age: 30 }] });
                }, /cannot be expressed/);
            });

            it('does nothing for empty where', function () {
                let connection = new DjangoJSONAPIConnection('http://example.com');
                let params = {};
                connection.setWhere(params, { _where: [] });
                assert.equal(params.filter, undefined);
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

            it('collection path uses hyphenated routes with trailing slash', function () {
                let connection = new DjangoJSONAPIConnection('http://example.com');

                class BlogPost extends Record {
                    static connection = connection;
                    static schema = { title: { type: 'string' } };
                }

                assert.equal(connection.path(BlogPost), '/blog-posts/');
            });

            it('commit uses POST to the collection path with trailing slash', function () {
                let connection = new DjangoJSONAPIConnection('http://example.com');

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
                });
            });

            it('sends predicate wheres as dot-notation filter params', function () {
                let connection = new DjangoJSONAPIConnection('http://example.com');

                class User extends Record {
                    static connection = connection;
                    static schema = { id: { type: 'integer' }, age: { type: 'integer' } };
                }

                User.where({ age: { gt: 30 } }).load();

                assert.ok(this.findRequest('GET', '/users/', {
                    params: { filter: { 'age.gt': 30 }, sort: '-id' }
                }));
            });

            it('paginates with page[limit] and page[offset]', function () {
                let connection = new DjangoJSONAPIConnection('http://example.com');

                class User extends Record {
                    static connection = connection;
                    static schema = { id: { type: 'integer' }, name: { type: 'string' } };
                }

                User.limit(25).offset(50).load();

                assert.ok(this.findRequest('GET', '/users/', {
                    params: { sort: '-id', page: { limit: 25, offset: 50 } }
                }));
            });
        });

    });
});
