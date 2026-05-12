import assert from 'assert';
import Connection from 'viking/record/connection';

describe('Viking.Record', () => {
    describe('Connection', () => {

        it('Automatically add the CSRF token', function () {
            document.head.innerHTML = '<meta name="csrf-token" content="ETZaIMiq">';
            
            let connection = new Connection('http://example.com');
            connection.get('/');
            
            this.withRequest('GET', '/', {}, (xhr) => {
                assert.equal(xhr.requestHeaders['X-CSRF-Token'], "ETZaIMiq");
            });
        });
        
        describe('headers', () => {
            it('function', function () {
                let connection = new Connection('http://example.com', {
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
                let connection = new Connection('http://example.com');
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
                let connection = new Connection('http://example.com');
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
                let connection = new Connection('http://example.com');
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
                let connection = new Connection('http://example.com');
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
                    let connection = new Connection('http://example.com');
                    let counter = 0;
                
                    connection.get('/', { preflight: response => counter++ });
                    assert.equal(counter, 1);
                    this.withRequest('GET', '/', {}, (xhr) => xhr.respond(201, {}, '{"foo": "bar"}'));
                    assert.equal(counter, 1);
                });
                
                it('with a function that returns a promise as a callback', function (done) {
                    let connection = new Connection('http://example.com');
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
                class CustomConnection extends Connection {
                    serializeRequestBody(body, request) {
                        return { data: { attributes: body } };
                    }
                }

                let connection = new CustomConnection('http://example.com');
                connection.post('/', { body: { name: 'Ben' } });

                this.withRequest('POST', '/', {}, (xhr) => {
                    assert.deepEqual(JSON.parse(xhr.requestBody), { data: { attributes: { name: 'Ben' } } });
                });
            });

            it('is not called for FormData bodies', function () {
                let called = false;
                class CustomConnection extends Connection {
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

        describe('buildQueryParams', () => {
            it('builds params with where', function () {
                let connection = new Connection('http://example.com');
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
                let connection = new Connection('http://example.com');
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
                let connection = new Connection('http://example.com');
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
                let connection = new Connection('http://example.com');
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
                let connection = new Connection('http://example.com');
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
                let connection = new Connection('http://example.com');
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
                let connection = new Connection('http://example.com');
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
                let connection = new Connection('http://example.com');
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
                let connection = new Connection('http://example.com');
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
                let connection = new Connection('http://example.com');
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
                let connection = new Connection('http://example.com');
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
                let connection = new Connection('http://example.com');
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
                let connection = new Connection('http://example.com');
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
                let connection = new Connection('http://example.com');
                let params = {};
                connection.setWhere(params, { _where: [{active: true}] });
                assert.deepEqual(params.where, {active: true});
            });

            it('does nothing for empty where', function () {
                let connection = new Connection('http://example.com');
                let params = {};
                connection.setWhere(params, { _where: [] });
                assert.equal(params.where, undefined);
            });
        });

        describe('setOrder', () => {
            it('uses default order when empty', function () {
                let connection = new Connection('http://example.com');
                let params = {};
                connection.setOrder(params, { _order: [], defaultOrder() { return {id: 'desc'}; } });
                assert.deepEqual(params.order, {id: 'desc'});
            });

            it('uses specified single order', function () {
                let connection = new Connection('http://example.com');
                let params = {};
                connection.setOrder(params, { _order: [{name: 'asc'}], defaultOrder() { return {id: 'desc'}; } });
                assert.deepEqual(params.order, {name: 'asc'});
            });
        });

        describe('setLimit', () => {
            it('sets limit when present', function () {
                let connection = new Connection('http://example.com');
                let params = {};
                connection.setLimit(params, { _limit: 25 });
                assert.equal(params.limit, 25);
            });

            it('does nothing when null', function () {
                let connection = new Connection('http://example.com');
                let params = {};
                connection.setLimit(params, { _limit: null });
                assert.equal(params.limit, undefined);
            });
        });

        describe('setOffset', () => {
            it('sets offset when present', function () {
                let connection = new Connection('http://example.com');
                let params = {};
                connection.setOffset(params, { _offset: 10 });
                assert.equal(params.offset, 10);
            });

            it('does nothing when null', function () {
                let connection = new Connection('http://example.com');
                let params = {};
                connection.setOffset(params, { _offset: null });
                assert.equal(params.offset, undefined);
            });
        });

        describe('setInclude', () => {
            it('sets include when present', function () {
                let connection = new Connection('http://example.com');
                let params = {};
                connection.setInclude(params, { _include: ['posts'] });
                assert.deepEqual(params.include, ['posts']);
            });

            it('does nothing when empty', function () {
                let connection = new Connection('http://example.com');
                let params = {};
                connection.setInclude(params, { _include: [] });
                assert.equal(params.include, undefined);
            });
        });

        describe('setDistinct', () => {
            it('sets boolean distinct', function () {
                let connection = new Connection('http://example.com');
                let params = {};
                connection.setDistinct(params, { _distinct: true });
                assert.equal(params.distinct, true);
            });

            it('sets distinct_on for non-boolean', function () {
                let connection = new Connection('http://example.com');
                let params = {};
                connection.setDistinct(params, { _distinct: ['name'] });
                assert.deepEqual(params.distinct_on, ['name']);
            });

            it('does nothing when null', function () {
                let connection = new Connection('http://example.com');
                let params = {};
                connection.setDistinct(params, { _distinct: null });
                assert.equal(params.distinct, undefined);
                assert.equal(params.distinct_on, undefined);
            });
        });

        describe('setGroupBy', () => {
            it('sets single group', function () {
                let connection = new Connection('http://example.com');
                let params = {};
                connection.setGroupBy(params, { _groupValues: ['status'] });
                assert.equal(params.group_by, 'status');
            });

            it('sets multiple groups', function () {
                let connection = new Connection('http://example.com');
                let params = {};
                connection.setGroupBy(params, { _groupValues: ['status', 'category'] });
                assert.deepEqual(params.group_by, ['status', 'category']);
            });

            it('does nothing when empty', function () {
                let connection = new Connection('http://example.com');
                let params = {};
                connection.setGroupBy(params, { _groupValues: [] });
                assert.equal(params.group_by, undefined);
            });
        });

        describe('formatRouteKey', () => {
            it('returns routeKey from the class by default', function () {
                let connection = new Connection('http://example.com');
                let klass = { modelName() { return { routeKey: 'blog_posts' }; } };
                assert.equal(connection.formatRouteKey(klass), 'blog_posts');
            });
        });

        describe('formatPath', () => {
            it('returns path unchanged by default', function () {
                let connection = new Connection('http://example.com');
                assert.equal(connection.formatPath('/blog_posts'), '/blog_posts');
            });
        });

        describe('method', () => {
            it('returns post for create', function () {
                let connection = new Connection('http://example.com');
                assert.equal(connection.method('create'), 'post');
            });

            it('returns get for read', function () {
                let connection = new Connection('http://example.com');
                assert.equal(connection.method('read'), 'get');
            });

            it('returns put for update', function () {
                let connection = new Connection('http://example.com');
                assert.equal(connection.method('update'), 'put');
            });

            it('returns delete for destroy', function () {
                let connection = new Connection('http://example.com');
                assert.equal(connection.method('destroy'), 'delete');
            });
        });

        describe('acceptHeader', () => {
            it('returns application/json by default', function () {
                let connection = new Connection('http://example.com');
                assert.equal(connection.acceptHeader(), 'application/json');
            });
        });

        describe('contentTypeHeader', () => {
            it('returns application/json by default', function () {
                let connection = new Connection('http://example.com');
                assert.equal(connection.contentTypeHeader(), 'application/json');
            });
        });

        describe('buildRequestBody', () => {
            it('wraps attributes under paramRoot by default', function () {
                let connection = new Connection('http://example.com');
                let record = { paramRoot() { return 'user'; } };
                let result = connection.buildRequestBody(record, {name: 'Ben'});
                assert.deepEqual(result, {user: {name: 'Ben'}});
            });
        });

        describe('parseErrors', () => {
            it('extracts errors from JSON response', function () {
                let connection = new Connection('http://example.com');
                let result = connection.parseErrors('{"errors":{"name":["is required"]}}', 'application/json');
                assert.deepEqual(result, {name: ['is required']});
            });
        });

        describe('buildAssociationPath', () => {
            it('builds path without record', function () {
                let connection = new Connection('http://example.com');
                let owner = {
                    modelName: { routeKey: 'users' },
                    readAttribute(attr) { return attr === 'id' ? 42 : null; }
                };
                assert.equal(connection.buildAssociationPath(owner, 'posts'), '/users/42/posts');
            });

            it('builds path with record', function () {
                let connection = new Connection('http://example.com');
                let owner = {
                    modelName: { routeKey: 'users' },
                    readAttribute(attr) { return attr === 'id' ? 42 : null; }
                };
                let record = {
                    readAttribute(attr) { return attr === 'id' ? 7 : null; }
                };
                assert.equal(connection.buildAssociationPath(owner, 'posts', record), '/users/42/posts/7');
            });
        });

        describe('subclass overrides', () => {
            it('custom headers flow through to sendRequest', function () {
                class DRFConnection extends Connection {
                    acceptHeader() { return 'application/vnd.api+json'; }
                    contentTypeHeader() { return 'application/vnd.api+json'; }
                }

                let connection = new DRFConnection('http://example.com');
                connection.post('/', { body: { name: 'Ben' } });

                this.withRequest('POST', '/', {}, (xhr) => {
                    assert.equal(xhr.requestHeaders['Accept'], 'application/vnd.api+json');
                    assert.equal(xhr.requestHeaders['Content-Type'], 'application/vnd.api+json;charset=utf-8');
                });
            });

            it('custom buildQueryParams restructures params', function () {
                class DRFConnection extends Connection {
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

            it('custom formatRouteKey and formatPath', function () {
                class DRFConnection extends Connection {
                    formatRouteKey(klass) { return klass.modelName().routeKey.replace(/_/g, '-'); }
                    formatPath(path) { return path.replace(/\/?$/, '/'); }
                }

                let connection = new DRFConnection('http://example.com');
                let klass = { modelName() { return { routeKey: 'blog_posts' }; } };
                assert.equal(connection.formatRouteKey(klass), 'blog-posts');
                assert.equal(connection.formatPath('/blog-posts'), '/blog-posts/');
            });

            it('custom method override', function () {
                class DRFConnection extends Connection {
                    method(action) {
                        if (action === 'update') return 'patch';
                        return super.method(action);
                    }
                }

                let connection = new DRFConnection('http://example.com');
                assert.equal(connection.method('update'), 'patch');
                assert.equal(connection.method('create'), 'post');
                assert.equal(connection.method('read'), 'get');
                assert.equal(connection.method('destroy'), 'delete');
            });

            it('custom buildRequestBody', function () {
                class DRFConnection extends Connection {
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
                class DRFConnection extends Connection {
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

            it('custom buildAssociationPath', function () {
                class DRFConnection extends Connection {
                    buildAssociationPath(owner, associationName, record) {
                        return '/' + [owner.modelName.routeKey, owner.readAttribute('id'), 'relationships', associationName].join('/');
                    }
                }

                let connection = new DRFConnection('http://example.com');
                let owner = {
                    modelName: { routeKey: 'users' },
                    readAttribute(attr) { return attr === 'id' ? 42 : null; }
                };
                assert.equal(connection.buildAssociationPath(owner, 'posts'), '/users/42/relationships/posts');
            });
        });

        describe('deserializeResponseBody', () => {
            it('override transforms response before success callback', function (done) {
                class CustomConnection extends Connection {
                    deserializeResponseBody(response, request) {
                        return response.data.attributes;
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
                class CustomConnection extends Connection {
                    deserializeResponseBody(response, request) {
                        return response.data.attributes;
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
                class CustomConnection extends Connection {
                    deserializeResponseBody(response, request) {
                        called = true;
                        return response;
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
