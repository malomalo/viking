import assert from 'assert';
import AbstractConnection from 'viking/record/abstract-connection';
import VikingRecord from 'viking/record';
import Types from 'viking/record/types';
import Type from 'viking/record/type';

describe('Viking.Record', () => {
    describe('AbstractConnection', () => {

        describe('headers', () => {
            it('sends no default headers', function () {
                let connection = new AbstractConnection('http://example.com');
                connection.get('/');

                this.withRequest('GET', '/', {}, (xhr) => {
                    assert.equal(xhr.requestHeaders['Accept'], undefined);
                    assert.equal(xhr.requestHeaders['Api-Version'], undefined);
                });
            });

            it('per-request headers do not leak onto the connection', function () {
                let connection = new AbstractConnection('http://example.com', { headers: { foo: '1' } });

                connection.get('/', { headers: { bar: '2' } });
                this.withRequest('GET', '/', {}, (xhr) => {
                    assert.equal(xhr.requestHeaders.foo, '1');
                    assert.equal(xhr.requestHeaders.bar, '2');
                });

                connection.get('/');
                this.withRequest('GET', '/', {}, (xhr) => {
                    assert.equal(xhr.requestHeaders.foo, '1');
                    assert.equal(xhr.requestHeaders.bar, undefined);
                });

                assert.deepEqual(connection.headers, { foo: '1' });
            });

            it('function', function () {
                let connection = new AbstractConnection('http://example.com', {
                    headers: {
                        foo: '1',
                        bar: () => '2',
                        bop: undefined,
                        pop: null,
                        pip: ''
                    }
                });
            
                connection.get('/');
                const request = this.findRequest('GET', '/')
                assert.equal('1', request.requestHeaders.foo)
                assert.equal('2', request.requestHeaders.bar)
                assert.strictEqual(false, request.requestHeaders.hasOwnProperty('bop'))
                assert.strictEqual(false, request.requestHeaders.hasOwnProperty('pop'))
                assert.strictEqual(false, request.requestHeaders.hasOwnProperty('pip'))
            })
        })
        
        describe('callbacks', () => {
            it('success', function (done) {
                let connection = new AbstractConnection('http://example.com');
                let counter = 0;
                
                connection.get('/', {
                    success: response => {
                        counter++;
                    }
                });
                this.withRequest('GET', '/', {}, (xhr) => xhr.respond(400, {}, '{"foo": "bar"}'));
                
                connection.get('/', {
                    success: response => {
                        counter++;
                    }
                });
                this.withRequest('GET', '/', {}, (xhr) => xhr.respond(500, {}, '{"foo": "bar"}'));
                
                connection.get('/', {
                    success: response => {
                        assert.equal(response.foo, 'bar');
                        assert.equal(counter, 0);
                        done()
                    }
                });
                this.withRequest('GET', '/', {}, (xhr) => xhr.respond(201, {}, '{"foo": "bar"}'));
            });
            
            it('complete', function (done) {
                let connection = new AbstractConnection('http://example.com');
                let counter = 0;
                
                connection.get('/', {
                    complete: response => {
                        assert.equal(response, '{"foo": "bar"}');
                        counter++;
                    }
                });            
                this.withRequest('GET', '/', {}, (xhr) => xhr.respond(201, {}, '{"foo": "bar"}'));
                
                connection.get('/', {
                    complete: response => {
                        assert.equal(response, '{"foo": "bar"}');
                        counter ++;
                    }
                });            
                this.withRequest('GET', '/', {}, (xhr) => xhr.respond(400, {}, '{"foo": "bar"}'));
                
                connection.get('/', {
                    complete: response => {
                        assert.equal(response, '{"foo": "bar"}');
                        assert.equal(counter, 2)
                        done()
                    }
                });            
                this.withRequest('GET', '/', {}, (xhr) => xhr.respond(500, {}, '{"foo": "bar"}'));
            });
            
            it('invalid', function (done) {
                let connection = new AbstractConnection('http://example.com');
                let counter = 0;
                
                connection.get('/', {
                    invalid: request => {
                        counter++;
                    }
                });
                this.withRequest('GET', '/', {}, (xhr) => xhr.respond(201, {}, '{"foo": "bar"}'));
                
                connection.get('/', {
                    invalid: request => {
                        counter++;
                    }
                });
                this.withRequest('GET', '/', {}, (xhr) => xhr.respond(500, {}, '{"foo": "bar"}'));
                
                connection.get('/', {
                    invalid: request => {
                        assert.equal(request.response, '{"foo": "bar"}');
                        assert.equal(counter, 0);
                        done()
                    }
                });
                this.withRequest('GET', '/', {}, (xhr) => xhr.respond(400, {}, '{"foo": "bar"}'));
            });
            
            it('error', function (done) {
                let connection = new AbstractConnection('http://example.com');
                let counter = 0;
                
                connection.get('/', {
                    error: response => {
                        counter++;
                    }
                });
                this.withRequest('GET', '/', {}, (xhr) => xhr.respond(201, {}, '{"foo": "bar"}'));
                
                connection.get('/', {
                    error: response => {
                        counter++;
                    }
                });
                this.withRequest('GET', '/', {}, (xhr) => xhr.respond(400, {}, '{"foo": "bar"}'));
                
                connection.get('/', {
                    error: response => {
                        assert.equal(response, '{"foo": "bar"}');
                        assert.equal(counter, 0);
                        done()
                    }
                });
                this.withRequest('GET', '/', {}, (xhr) => xhr.respond(500, {}, '{"foo": "bar"}'));
            });
            
            describe('preflight', () => {
                it('with a function as a callback', function () {
                    let connection = new AbstractConnection('http://example.com');
                    let counter = 0;
                
                    connection.get('/', { preflight: response => counter++ });
                    assert.equal(counter, 1);
                    this.withRequest('GET', '/', {}, (xhr) => xhr.respond(201, {}, '{"foo": "bar"}'));
                    assert.equal(counter, 1);
                });
                
                it('with a function that returns a promise as a callback', function (done) {
                    let connection = new AbstractConnection('http://example.com');
                    let counter = 0;
                    let resolve_preflight = null;
                    const preflight_promise = new Promise((res, rej) => { resolve_preflight = res; }).then(() => {
                        assert.equal(counter, 0);
                        counter++;
                    });
                    
                    connection.get('/', { preflight: response => preflight_promise }).then(() => {
                        assert.equal(counter, 1);
                    }).then(done, done);

                    preflight_promise.then(() => {
                        this.withRequest('GET', '/', {}, (xhr) => xhr.respond(201, {}, '{"foo": "bar"}'));
                    })
                    
                    
                    assert.equal(counter, 0);
                    resolve_preflight()



                });

            });
            
        })

        describe('serializeRequestBody', () => {
            it('override transforms request body', function () {
                class CustomConnection extends AbstractConnection {
                    serializeRequestBody(body, request) {
                        return { body: JSON.stringify({ data: { attributes: body } }), contentType: 'application/json' };
                    }
                }

                let connection = new CustomConnection('http://example.com');
                connection.post('/', { body: { name: 'Ben' } });

                this.withRequest('POST', '/', {}, (xhr) => {
                    assert.deepEqual(JSON.parse(xhr.requestBody), { data: { attributes: { name: 'Ben' } } });
                });
            });

            it('override sets the request Content-Type', function () {
                class CustomConnection extends AbstractConnection {
                    serializeRequestBody(body, request) {
                        return { body: JSON.stringify(body), contentType: 'application/vnd.custom+json' };
                    }
                }

                let connection = new CustomConnection('http://example.com');
                connection.post('/', { body: { name: 'Ben' } });

                this.withRequest('POST', '/', {}, (xhr) => {
                    assert.equal(xhr.requestHeaders['Content-Type'], 'application/vnd.custom+json;charset=utf-8');
                });
            });

            it('is not called for FormData bodies', function () {
                let called = false;
                class CustomConnection extends AbstractConnection {
                    serializeRequestBody(body, request) {
                        called = true;
                        return body;
                    }
                }

                let connection = new CustomConnection('http://example.com');
                let formData = new FormData();
                formData.append('name', 'Ben');
                connection.post('/', { body: formData });

                this.withRequest('POST', '/', {}, () => {
                    assert.equal(called, false);
                });
            });
        });

        describe('query parameter hooks (abstract)', () => {
            const emptyRelation = {
                _where: [],
                _order: [],
                _limit: null,
                _offset: null,
                _include: [],
                _distinct: null,
                _groupValues: [],
                defaultOrder() { return {id: 'desc'}; }
            };

            it('builds empty params for an empty relation', function () {
                let connection = new AbstractConnection('http://example.com');
                assert.deepEqual(connection.buildQueryParams(emptyRelation), {});
            });

            it('throws NotImplementedError when a query clause is used', function () {
                let connection = new AbstractConnection('http://example.com');

                assert.throws(() => {
                    connection.buildQueryParams({...emptyRelation, _where: [{name: 'Ben'}]});
                }, /does not implement setWhere/);

                assert.throws(() => {
                    connection.buildQueryParams({...emptyRelation, _order: [{name: 'asc'}]});
                }, /does not implement setOrder/);

                assert.throws(() => {
                    connection.buildQueryParams({...emptyRelation, _limit: 10});
                }, /does not implement setLimit/);

                assert.throws(() => {
                    connection.buildQueryParams({...emptyRelation, _offset: 5});
                }, /does not implement setOffset/);

                assert.throws(() => {
                    connection.buildQueryParams({...emptyRelation, _include: ['posts']});
                }, /does not implement setInclude/);

                assert.throws(() => {
                    connection.buildQueryParams({...emptyRelation, _distinct: true});
                }, /does not implement setDistinct/);

                assert.throws(() => {
                    connection.buildQueryParams({...emptyRelation, _groupValues: ['status']});
                }, /does not implement setGroupBy/);
            });
        });

        describe('routeKey', () => {
            it('returns routeKey from the class by default', function () {
                let connection = new AbstractConnection('http://example.com');
                let klass = { baseClass() { return klass; }, modelName() { return { plural: 'blog_posts' }; } };
                assert.equal(connection.routeKey(klass), 'blog_posts');
            });
        });

        describe('actions', () => {
            it('create sends a POST request', function () {
                let connection = new AbstractConnection('http://example.com');
                connection.create('/users');
                assert.ok(this.findRequest('POST', '/users'));
            });

            it('read sends a GET request', function () {
                let connection = new AbstractConnection('http://example.com');
                connection.read('/users');
                assert.ok(this.findRequest('GET', '/users'));
            });

            it('update sends a PUT request', function () {
                let connection = new AbstractConnection('http://example.com');
                connection.update('/users/1');
                assert.ok(this.findRequest('PUT', '/users/1'));
            });

            it('destroy sends a DELETE request', function () {
                let connection = new AbstractConnection('http://example.com');
                connection.destroy('/users/1');
                assert.ok(this.findRequest('DELETE', '/users/1'));
            });
        });

        describe('defaultHeaders', () => {
            it('is empty by default; adapters declare their headers', function () {
                let connection = new AbstractConnection('http://example.com');
                assert.deepEqual(connection.defaultHeaders(), {});
                assert.equal(connection.acceptHeader, undefined);
            });
        });


        describe('buildRequestBody', () => {
            it('throws NotImplementedError', function () {
                let connection = new AbstractConnection('http://example.com');
                let record = { paramRoot() { return 'user'; } };
                assert.throws(() => {
                    connection.buildRequestBody(record, {name: 'Ben'});
                }, /does not implement buildRequestBody/);
            });
        });

        describe('attributesForSave', () => {
            it('returns only the changed attributes, in wire format', function () {
                let connection = new AbstractConnection('http://example.com');

                class Meeting extends VikingRecord {
                    static schema = { starts_on: { type: 'date' }, name: { type: 'string' } };
                }

                let meeting = Meeting.instantiate({ starts_on: '2020-01-15', name: 'Standup' });
                meeting.starts_on = new Date(2020, 1, 3);

                assert.deepEqual(connection.attributesForSave(meeting), { starts_on: '2020-02-03' });
            });
        });

        describe('dumpAttributes', () => {
            it('serializes attributes using the model schema and type registry', function () {
                let connection = new AbstractConnection('http://example.com');

                class Meeting extends VikingRecord {
                    static schema = { starts_on: { type: 'date' }, name: { type: 'string' } };
                }

                let dumped = connection.dumpAttributes(new Meeting(), {
                    starts_on: new Date(2020, 0, 15),
                    name: 'Standup'
                });
                assert.equal(dumped.starts_on, '2020-01-15');
                assert.equal(dumped.name, 'Standup');
            });

            it('passes through attributes not in the schema', function () {
                let connection = new AbstractConnection('http://example.com');

                class Meeting extends VikingRecord {
                    static schema = { name: { type: 'string' } };
                }

                let dumped = connection.dumpAttributes(new Meeting(), { location_id: 7 });
                assert.equal(dumped.location_id, 7);
            });

            it('serializes custom types via their dump', function () {
                Types.registry.measurement = class extends Type {
                    static dump(value) {
                        return value.value;
                    }
                };

                class Wall extends VikingRecord {
                    static schema = { width: { type: 'measurement' } };
                }

                let connection = new AbstractConnection('http://example.com');
                let dumped = connection.dumpAttributes(new Wall(), {
                    width: { value: 3, units: 'm' },
                    width_units: 'm'
                });
                assert.deepEqual(dumped, { width: 3, width_units: 'm' });
            });

            it('resolves dynamic type functions against the attributes and record', function () {
                class Setting extends VikingRecord {
                    static schema = {
                        value: {
                            type: (attributes, record = {}) => {
                                return attributes.type || record.readAttribute('type');
                            }
                        }
                    };
                }

                let connection = new AbstractConnection('http://example.com');
                let record = new Setting({ type: 'string', value: 9 });
                assert.deepEqual(connection.dumpAttributes(record, record.attributes), {
                    type: 'string',
                    value: '9'
                });
            });

            it('adapters can override how types are encoded', function () {
                class EpochConnection extends AbstractConnection {
                    dumpAttributes(record, attributes) {
                        const dumped = super.dumpAttributes(record, attributes);
                        const schema = record.constructor.schema;
                        Object.keys(dumped).forEach((key) => {
                            if (schema?.[key]?.type === 'date' && attributes[key]) {
                                dumped[key] = attributes[key].getTime();
                            }
                        });
                        return dumped;
                    }
                }

                class Meeting extends VikingRecord {
                    static schema = { starts_on: { type: 'date' } };
                }

                let date = new Date(2020, 0, 15);
                let connection = new EpochConnection('http://example.com');
                let dumped = connection.dumpAttributes(new Meeting(), { starts_on: date });
                assert.equal(dumped.starts_on, date.getTime());
            });
        });

        describe('parseErrors', () => {
            it('extracts errors from JSON response', function () {
                let connection = new AbstractConnection('http://example.com');
                let result = connection.parseErrors('{"errors":{"name":["is required"]}}', 'application/json');
                assert.deepEqual(result, {name: ['is required']});
            });
        });

        describe('path', () => {
            let connection = new AbstractConnection('http://example.com');

            describe('collection (class)', () => {
                it('returns a path based on modelName', () => {
                    class Model extends VikingRecord { }
                    assert.equal(connection.path(Model), '/models');

                    class MyModel extends VikingRecord { }
                    assert.equal(connection.path(MyModel), '/my_models');
                });

                it('returns a path based on #path set on the model', () => {
                    class Model extends VikingRecord {
                        static path = '/buoys';
                    }
                    assert.equal(connection.path(Model), '/buoys');
                });

                // STI
                it('returns a path based on modelName of the baseClass', () => {
                    class Ship extends VikingRecord { }
                    class Carrier extends Ship { }
                    assert.equal(connection.path(Carrier), '/ships');
                });

                it('returns a path based on #path set on the baseClass', () => {
                    class Ship extends VikingRecord {
                        static path = '/myships';
                    }
                    class Carrier extends Ship { }
                    assert.equal(connection.path(Carrier), '/myships');
                });

                it('returns a path based on #path set on the sti model', () => {
                    class Ship extends VikingRecord { }
                    class Carrier extends Ship {
                        static path = '/carriers';
                    }
                    assert.equal(connection.path(Carrier), '/carriers');
                });
            });

            describe('member (record)', () => {
                it('/pluralModelName/id by default', () => {
                    class Model extends VikingRecord { }
                    let model = new Model({id: 42});
                    assert.equal(connection.path(model), '/models/42');
                });

                it('/pluralModelName/slug by overriding #toParam()', () => {
                    class Model extends VikingRecord {
                        toParam() { return 'slug'; }
                    }
                    let model = new Model({id: 42});
                    assert.equal(connection.path(model), '/models/slug');
                });

                it('uri encodes the id', () => {
                    class MyModel extends VikingRecord {
                        static path = '/collection';
                    }
                    let model = new MyModel();
                    model.setAttributes({id: '+1+'});
                    assert.equal(connection.path(model), '/collection/%2B1%2B');
                });

                // STI
                it('returns a path based on modelName of the baseClass', () => {
                    class Ship extends VikingRecord { }
                    class Carrier extends Ship { }
                    let carrier = new Carrier({id: 42});
                    assert.equal(connection.path(carrier), '/ships/42');
                });
            });

            describe('association', () => {
                let User = class { static baseClass() { return User; } static modelName() { return { plural: 'users' }; } };

                it('builds an association path without record', function () {
                    let user = { constructor: User, toParam() { return '42'; } };
                    assert.equal(connection.path(user, 'posts'), '/users/42/posts');
                });

                it('builds an association path with record', function () {
                    let user = { constructor: User, toParam() { return '42'; } };
                    let post = { toParam() { return '7'; } };
                    assert.equal(connection.path(user, 'posts', post), '/users/42/posts/7');
                });
            });
        });

        describe('subclass overrides', () => {
            it('custom headers flow through to sendRequest', function () {
                class DRFConnection extends AbstractConnection {
                    defaultHeaders() {
                        return { ...super.defaultHeaders(), 'Accept': 'application/vnd.api+json' };
                    }
                    serializeRequestBody(body, request) {
                        return { body: JSON.stringify(body), contentType: 'application/vnd.api+json' };
                    }
                }

                let connection = new DRFConnection('http://example.com');
                connection.post('/', { body: { name: 'Ben' } });

                this.withRequest('POST', '/', {}, (xhr) => {
                    assert.equal(xhr.requestHeaders['Accept'], 'application/vnd.api+json');
                    assert.equal(xhr.requestHeaders['Content-Type'], 'application/vnd.api+json;charset=utf-8');
                });
            });

            it('custom buildQueryParams restructures params', function () {
                class DRFConnection extends AbstractConnection {
                    setWhere(params, relation) {
                        if (relation._where.length > 0) {
                            params.filter = relation._where.length === 1 ? relation._where[0] : relation._where;
                        }
                    }
                    setOrder(params, relation) {
                        if (relation._order.length > 0) {
                            params.sort = relation._order.map(o => {
                                let [key, dir] = Object.entries(o)[0];
                                return dir === 'desc' ? `-${key}` : key;
                            }).join(',');
                        }
                    }
                    setLimit(params, relation) {
                        if (relation._limit) {
                            if (!params.page) params.page = {};
                            params.page.size = relation._limit;
                        }
                    }
                    setOffset(params, relation) {
                        if (relation._offset) {
                            if (!params.page) params.page = {};
                            params.page.offset = relation._offset;
                        }
                    }
                }

                let connection = new DRFConnection('http://example.com');
                let relation = {
                    _where: [{name: 'Ben'}],
                    _order: [{name: 'asc'}, {age: 'desc'}],
                    _limit: 10,
                    _offset: 5,
                    _include: [],
                    _distinct: null,
                    _groupValues: [],
                    defaultOrder() { return {id: 'desc'}; }
                };
                let params = connection.buildQueryParams(relation);
                assert.deepEqual(params.filter, {name: 'Ben'});
                assert.equal(params.sort, 'name,-age');
                assert.deepEqual(params.page, {size: 10, offset: 5});
                assert.equal(params.where, undefined);
                assert.equal(params.order, undefined);
                assert.equal(params.limit, undefined);
                assert.equal(params.offset, undefined);
            });

            it('custom routeKey and path', function () {
                class DRFConnection extends AbstractConnection {
                    routeKey(klass) { return klass.modelName().plural.replace(/_/g, '-'); }
                    path(target, association, record) {
                        return super.path(target, association, record).replace(/\/?$/, '/');
                    }
                }

                let connection = new DRFConnection('http://example.com');
                function BlogPost() {}
                BlogPost.modelName = () => ({ plural: 'blog_posts' });
                assert.equal(connection.routeKey(BlogPost), 'blog-posts');
                assert.equal(connection.path(BlogPost), '/blog-posts/');
            });

            it('custom action override', function () {
                class DRFConnection extends AbstractConnection {
                    update(...args) {
                        return this.patch(...args);
                    }
                }

                let connection = new DRFConnection('http://example.com');
                connection.update('/users/1');
                assert.ok(this.findRequest('PATCH', '/users/1'));

                connection.create('/users');
                assert.ok(this.findRequest('POST', '/users'));
            });

            it('custom buildRequestBody', function () {
                class DRFConnection extends AbstractConnection {
                    buildRequestBody(record, attributes) {
                        return { data: { type: 'users', attributes } };
                    }
                }

                let connection = new DRFConnection('http://example.com');
                let record = { paramRoot() { return 'user'; } };
                assert.deepEqual(connection.buildRequestBody(record, {name: 'Ben'}), {
                    data: { type: 'users', attributes: {name: 'Ben'} }
                });
            });

            it('custom parseErrors', function () {
                class DRFConnection extends AbstractConnection {
                    parseErrors(responseText, contentType) {
                        const body = JSON.parse(responseText);
                        const errors = {};
                        body.errors.forEach(e => {
                            const field = e.source?.pointer?.split('/').pop() || 'base';
                            if (!errors[field]) errors[field] = [];
                            errors[field].push(e.detail);
                        });
                        return errors;
                    }
                }

                let connection = new DRFConnection('http://example.com');
                let responseText = JSON.stringify({
                    errors: [
                        { source: { pointer: '/data/attributes/name' }, detail: 'is required' },
                        { source: { pointer: '/data/attributes/name' }, detail: 'is too short' }
                    ]
                });
                let result = connection.parseErrors(responseText, 'application/vnd.api+json');
                assert.deepEqual(result, {name: ['is required', 'is too short']});
            });

            it('custom association path', function () {
                class DRFConnection extends AbstractConnection {
                    path(target, association, record) {
                        if (typeof target !== 'function' && association) {
                            return '/' + [target.modelName.plural, target.toParam(), 'relationships', association].join('/');
                        }
                        return super.path(target, association, record);
                    }
                }

                let connection = new DRFConnection('http://example.com');
                let owner = {
                    modelName: { plural: 'users' },
                    toParam() { return '42'; }
                };
                assert.equal(connection.path(owner, 'posts'), '/users/42/relationships/posts');
            });
        });

        describe('deserializeResponseBody', () => {
            it('override transforms response before success callback', function (done) {
                class CustomConnection extends AbstractConnection {
                    deserializeResponseBody(request) {
                        return JSON.parse(request.response).data.attributes;
                    }
                }

                let connection = new CustomConnection('http://example.com');
                connection.get('/', {
                    success: response => {
                        assert.deepEqual(response, { name: 'Ben' });
                        done();
                    }
                });
                this.withRequest('GET', '/', {}, (xhr) => xhr.respond(200, {}, '{"data":{"attributes":{"name":"Ben"}}}'));
            });

            it('transforms response on direct-resolve path', function (done) {
                class CustomConnection extends AbstractConnection {
                    deserializeResponseBody(request) {
                        return JSON.parse(request.response).data.attributes;
                    }
                }

                let connection = new CustomConnection('http://example.com');
                connection.get('/').then(response => {
                    assert.deepEqual(response, { name: 'Ben' });
                    done();
                });
                this.withRequest('GET', '/', {}, (xhr) => xhr.respond(200, {}, '{"data":{"attributes":{"name":"Ben"}}}'));
            });

            it('is skipped for 204 responses', function (done) {
                let called = false;
                class CustomConnection extends AbstractConnection {
                    deserializeResponseBody(request) {
                        called = true;
                        return super.deserializeResponseBody(request);
                    }
                }

                let connection = new CustomConnection('http://example.com');
                connection.delete('/').then(response => {
                    assert.equal(response, null);
                    assert.equal(called, false);
                    done();
                });
                this.withRequest('DELETE', '/', {}, (xhr) => xhr.respond(204, {}, ''));
            });
        });

    });
});
