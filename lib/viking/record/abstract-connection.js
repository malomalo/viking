import * as Errors  from '../errors.js';
import Types        from './types.js';
import {toQuery}    from '../support/object.js';
import {each, result}       from '../support.js';

// Abstract base class for server connections. Handles the transport layer:
// sending requests, headers, CSRF, CRUD-action-to-verb mapping, resource
// path resolution, and JSON (de)serialization defaults.
//
// It does not speak any particular server's query language. Adapters
// (e.g. StandardAPIConnection, JSONAPIConnection) implement the query
// parameter hooks and request body format; the hooks here throw
// NotImplementedError when a query clause is actually used.
export default class AbstractConnection {

    host;//: string;
    apiKey;//: string;
    _userAgent;//: string | null;
    headers = {};

    // constructor(url: string, options: { userAgent?: string; } = {})
    constructor(url, options = {}) {
        let {origin, pathname, username} = new URL(url);

        this.host = (origin + pathname).replace(/\/$/, '');
        this.apiKey = username;
        this._userAgent = options.userAgent ? options.userAgent : null;
        this.headers = options.headers || {};
    }

    // Returns the User-Agent of the client. Defaults to:
    // "viking-js/SUNSTONE_VERSION RUBY_VERSION-pPATCH_LEVEL PLATFORM"
    userAgent() {
        return [
            this._userAgent,
            `Viking/$s{VERSION}`,
            // javascript vm,
            // platform
        ].filter((n) => n);
    }

    // Serializes a request body for the wire. Called by sendRequest when the
    // body is an object (strings and FormData are sent as-is). Receives the
    // body and the XMLHttpRequest before it is sent, and returns
    // `{body, contentType}`: `body` is the string to send and `contentType`
    // is set as the Content-Type header. Override to change the encoding
    // (e.g. JSONAPIConnection uses the application/vnd.api+json media type).
    //
    // serializeRequestBody(body: any, request: XMLHttpRequest): {body: string, contentType: string}
    serializeRequestBody(body, request) {
        return { body: JSON.stringify(body), contentType: 'application/json' };
    }

    // Deserializes the response body of a successful (2xx) request. Receives
    // the XMLHttpRequest after it has loaded and returns the value passed to
    // the success callback / promise resolution. Not called for 204 or empty
    // responses, which resolve to null. Override to change the decoding or
    // reshape the response (e.g. JSONAPIConnection flattens the JSON:API
    // document into plain attribute objects).
    //
    // deserializeResponseBody(request: XMLHttpRequest): any
    deserializeResponseBody(request) {
        return JSON.parse(request.response);
    }

    // --- Query Parameter Hooks ---

    buildQueryParams(relation) {
        let params = {};
        this.setWhere(params, relation);
        this.setOrder(params, relation);
        this.setLimit(params, relation);
        this.setOffset(params, relation);
        this.setInclude(params, relation);
        this.setDistinct(params, relation);
        this.setGroupBy(params, relation);
        return params;
    }

    // The hooks below throw when the relation actually uses the clause, and
    // do nothing otherwise, so an adapter only has to implement the parts of
    // the query language its server supports.

    setWhere(params, relation) {
        if (relation._where.length > 0) {
            throw new Errors.NotImplementedError(`${this.constructor.name} does not implement setWhere`);
        }
    }

    setOrder(params, relation) {
        if (relation._order.length > 0) {
            throw new Errors.NotImplementedError(`${this.constructor.name} does not implement setOrder`);
        }
    }

    setLimit(params, relation) {
        if (relation._limit) {
            throw new Errors.NotImplementedError(`${this.constructor.name} does not implement setLimit`);
        }
    }

    setOffset(params, relation) {
        if (relation._offset) {
            throw new Errors.NotImplementedError(`${this.constructor.name} does not implement setOffset`);
        }
    }

    setInclude(params, relation) {
        if (relation._include.length > 0) {
            throw new Errors.NotImplementedError(`${this.constructor.name} does not implement setInclude`);
        }
    }

    setDistinct(params, relation) {
        if (relation._distinct) {
            throw new Errors.NotImplementedError(`${this.constructor.name} does not implement setDistinct`);
        }
    }

    setGroupBy(params, relation) {
        if (relation._groupValues.length > 0) {
            throw new Errors.NotImplementedError(`${this.constructor.name} does not implement setGroupBy`);
        }
    }

    // --- Route and Body Hooks ---

    routeKey(klass) { return klass.baseClass().modelName().plural; }
    // Headers sent with every request. The abstract connection sends none;
    // adapters declare their server's headers (Accept, Api-Version, CSRF
    // tokens, ...).
    defaultHeaders() {
        return {};
    }

    // Response statuses that mean the request was understood but failed
    // validation; these fire the `invalid` callback (parsing the errors via
    // parseErrors) instead of rejecting. The abstract connection treats no
    // status as invalid; adapters declare their server's convention (e.g.
    // StandardAPIConnection uses 400, JSONAPIConnection 400 and 422).
    invalidStatuses = [];

    // Maps a failed response to the Error it rejects with. Adapters can
    // override statuses their server assigns different meaning to (e.g.
    // StandardAPIConnection maps 422 to ApiVersionUnsupported).
    errorForResponse(request) {
        if (request.status === 301) { return new Errors.MovedPermanently(); }
        if (request.status === 400) { return new Errors.BadRequest(); }
        if (request.status === 401) { return new Errors.Unauthorized(); }
        if (request.status === 403) { return new Errors.Forbidden(); }
        if (request.status === 404) { return new Errors.NotFound(); }
        if (request.status === 410) { return new Errors.Gone(); }
        if (request.status === 422) { return new Errors.UnprocessableEntity(); }
        if (request.status === 503) { return new Errors.ServiceUnavailable(); }
        if (request.status >= 500 && request.status < 599) { return new Errors.ServerError(request.response); }
        return new Errors.VikingError(`Unexpected response status ${request.status}`);
    }

    buildRequestBody(record, attributes) {
        throw new Errors.NotImplementedError(`${this.constructor.name} does not implement buildRequestBody`);
    }

    // Asserts that an association can be saved through its owner's request.
    // An association whose model uses a different connection belongs to
    // another service; its records cannot be created or referenced by a
    // request to this one.
    assertSameConnection(record, association) {
        const klass = association.reflection.model
            || (Array.isArray(association.target) ? association.target[0]?.constructor : association.target?.constructor);

        if (klass && klass.connection !== record.constructor.connection) {
            throw new Errors.ConnectionMismatch(`Cannot save the association "${association.reflection.name}" through ${record.constructor.name}; ${klass.name} uses a different connection`);
        }
    }

    // Returns the record's changed attributes in their wire format. Dirty
    // associations are not included; how (and whether) they are embedded in
    // the request is each adapter's decision (e.g. StandardAPIConnection
    // nests attributes, JSONAPIConnection sends resource identifiers under
    // relationships).
    //
    // attributesForSave(record: Record): Object
    attributesForSave(record) {
        const attributes = {};

        each(record.changedAttributes(), (key) => {
            attributes[key] = record.attributes[key];
        });

        return this.dumpAttributes(record, attributes);
    }

    // Converts a record's attributes to their wire format using the model's
    // schema and the type registry. Lives on the connection so an adapter
    // can override how types are encoded for its server (e.g. date or
    // decimal formats); the schema itself stays on the model.
    //
    // dumpAttributes(record: Record, attributes: Object): Object
    dumpAttributes(record, attributes) {
        const dump = {};
        const schema = record.constructor.schema;

        each(attributes, (key, value) => {
            if (schema && schema[key] && schema[key].type) {
                const type = result(schema[key], 'type', attributes, record);
                const Type = Types.registry[type];
                if (!Type) {
                    throw new TypeError("Coercion of " + type + " unsupported");
                }
                dump[key] = Type.get(value, schema[key]);
            } else {
                dump[key] = value;
            }
        });

        return dump;
    }

    // Parses an invalid response's body into an errors object keyed by
    // attribute, or returns null when the response is not in the server's
    // error format (each adapter knows its server's error media type).
    parseErrors(responseText, contentType) {
        throw new Errors.NotImplementedError(`${this.constructor.name} does not implement parseErrors`);
    }

    // Resolves the server path for a model class, record, or association.
    //   path(User)              -> '/users'
    //   path(user)              -> '/users/42'
    //   path(user, 'posts')     -> '/users/42/posts'
    //   path(user, 'posts', p)  -> '/users/42/posts/7'
    path(target, association, record) {
        const klass = typeof target === 'function' ? target : target.constructor;
        const base = klass.path || '/' + this.routeKey(klass);

        if (typeof target === 'function') return base;

        const parts = [base.replace(/\/$/, ''), encodeURIComponent(target.toParam())];
        if (association) {
            parts.push(association);
            if (record) parts.push(encodeURIComponent(record.toParam()));
        }
        return parts.join('/');
    }

    // get(path: string, params = {})
    get(path, options = {}) {
        return this.sendRequest('GET', path, options);
    }

    // post(path: string, body = null)
    post(path, options = {}) {
        return this.sendRequest('POST', path, options);
    }

    // put(path: string, body = null)
    put(path, options = {}) {
        return this.sendRequest('PUT', path, options);
    }

    // patch(path: string, body = null)
    patch(path, options = {}) {
        return this.sendRequest('PATCH', path, options);
    }

    // delete(path: string)
    delete(path, options = {}) {
        return this.sendRequest('DELETE', path, options);
    }

    // --- CRUD Actions ---
    // Adapters override these to change the HTTP verb used for an action.

    create(...args) {
        return this.post(...args);
    }

    read(...args) {
        return this.get(...args);
    }

    update(...args) {
        return this.put(...args);
    }

    destroy(...args) {
        return this.delete(...args);
    }

    // sendRequest(method: string, path: string, body = null)
    sendRequest(method, path, {preflight = null, params = null, body = null, headers = {}, success = null, invalid = null, error = null, complete = null, progress = null, label = null} = {}) {
        let resolve, reject;
        const promise = new Promise((res, rej) => { resolve = res; reject = rej; });

        if (params) {
            if (typeof params == "string") {
                path += `?${params}`;
            } else if (Object.keys(params).length > 0) {
                path += `?${toQuery(params)}`;
            }
        }
        
        let request = new XMLHttpRequest();
        request.open(method, `${this.host}${path}`, true);
        request.withCredentials = true;
        each(this.defaultHeaders(), (key, value) => {
            request.setRequestHeader(key, value);
        });

        if (body !== null && (typeof body) !== 'string' && !(body instanceof FormData)) {
            const serialized = this.serializeRequestBody(body, request);
            body = serialized.body;
            request.setRequestHeader('Content-Type', serialized.contentType);
        }

        each(Object.assign({}, this.headers, headers), (key, value) => {
            const headerValue = result(value);
            if (headerValue) {
                request.setRequestHeader(key, headerValue);
            }
        });

        let error_callback = () => {
            reject(this.errorForResponse(request));
        }

        request.addEventListener('load', async (event) => {
            try {
                if (request.status >= 200 && request.status <= 299) {
                    let response = request.status == 204 || !request.response ? null : this.deserializeResponseBody(request);

                    if (success) {
                        resolve(await success(response));
                    } else {
                        resolve(response);
                    }
                } else if (this.invalidStatuses.includes(request.status)) {
                    let return_value = invalid ? invalid(request, error_callback) : undefined;
                    if (return_value !== undefined) {
                        resolve(return_value);
                    } else {
                        error_callback();
                    }
                } else {
                    if (error) error(request.response)
                    error_callback();
                }
            
                if (complete) {
                    complete(request.response);
                }
            } catch (e) {
                reject(e);
            }
        });

        // There was a connection error of some sort
        // The `error`, `abort`, `timeout`, and `load` events are mutually
        // exclusive. Only one of them may happen.
        request.addEventListener('error', () => reject(new Errors.NetworkError()));
        request.addEventListener('abort', () => reject(new Errors.AbortError()));
        request.addEventListener('timeout', () => reject(new Errors.TimeoutError()));
        
        if(progress) {
            request.addEventListener('progress', progress);
        }

        request.responseType = 'text';
        if (preflight) {
            preflight = preflight(request);
            if (preflight instanceof Promise) {
                return preflight.then(() => {
                    request.send(body);
                    return promise;
                });
            }
        }

        request.send(body);
        request.then = (...args) => promise.then(...args);
        request.finally = (...args) => promise.finally(...args);
        return request;
    }

}
