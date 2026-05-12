import * as Errors  from '../errors.js';
import {toQuery}    from '../support/object.js';
import {each, result}       from '../support.js';

export default class Connection {

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

    serializeRequestBody(body, request) {
        return body;
    }

    deserializeResponseBody(response, request) {
        return JSON.parse(response);
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

    setWhere(params, relation) {
        if (relation._where.length > 0) {
            params.where = relation._where.length === 1 ? relation._where[0] : relation._where;
        }
    }

    setOrder(params, relation) {
        let order = relation._order.length === 0 ? [relation.defaultOrder()] : relation._order;
        params.order = order.length === 1 ? order[0] : order;
    }

    setLimit(params, relation) {
        if (relation._limit) { params.limit = relation._limit; }
    }

    setOffset(params, relation) {
        if (relation._offset) { params.offset = relation._offset; }
    }

    setInclude(params, relation) {
        if (relation._include.length > 0) { params.include = relation._include; }
    }

    setDistinct(params, relation) {
        if (relation._distinct) {
            if (typeof relation._distinct === "boolean") {
                params.distinct = relation._distinct;
            } else {
                params.distinct_on = relation._distinct;
            }
        }
    }

    setGroupBy(params, relation) {
        if (relation._groupValues.length == 1) {
            params.group_by = relation._groupValues[0];
        } else if (relation._groupValues.length > 1) {
            params.group_by = relation._groupValues;
        }
    }

    // --- Route, Method, and Body Hooks ---

    formatRouteKey(klass) { return klass.baseClass().modelName().routeKey; }
    formatPath(path) { return path; }
    method(action) {
        switch (action) {
            case 'create':  return 'post';
            case 'read':    return 'get';
            case 'update':  return 'put';
            case 'destroy': return 'delete';
        }
    }
    acceptHeader() { return 'application/json'; }
    contentTypeHeader() { return 'application/json'; }

    buildRequestBody(record, attributes) {
        return { [record.paramRoot()]: attributes };
    }

    parseErrors(responseText, contentType) {
        return JSON.parse(responseText).errors;
    }

    buildAssociationPath(owner, associationName, record) {
        const parts = [owner.modelName.routeKey, owner.readAttribute('id'), associationName];
        if (record) parts.push(record.readAttribute('id'));
        return '/' + parts.join('/');
    }

    csrfToken() {
        return document.head.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
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
        request.setRequestHeader('Api-Version', '0.5.0');
        request.setRequestHeader('Accept', this.acceptHeader());

        if (body !== null && (typeof body) !== 'string' && !(body instanceof FormData)) {
            body = JSON.stringify(this.serializeRequestBody(body, request));
            request.setRequestHeader('Content-Type', this.contentTypeHeader())
        }

        const csrfToken = this.csrfToken();
        if (csrfToken) {
            request.setRequestHeader('X-CSRF-Token', csrfToken);
        }

        each(Object.assign(this.headers, headers), (key, value) => {
            const headerValue = result(value);
            if (headerValue) {
                request.setRequestHeader(key, headerValue);
            }
        });

        let error_callback = () => {
            if (request.status === 301) {
                reject(new Errors.MovedPermanently());
            } else if (request.status === 400) {
                reject(new Errors.BadRequest());
            } else if (request.status === 401) {
                reject(new Errors.Unauthorized());
            } else if (request.status === 403) {
                reject(new Errors.Forbidden());
            } else if (request.status === 404) {
                reject(new Errors.NotFound());
            } else if (request.status === 410) {
                reject(new Errors.Gone());
            } else if (request.status === 422) {
                reject(new Errors.ApiVersionUnsupported());
            } else if (request.status === 503) {
                reject(new Errors.ServiceUnavailable());
            } else if (request.status >= 500 && request.status < 599) {
                reject(new Errors.ServerError(request.response));
            } else {
                reject(new Errors.VikingError(`Unexpected response status ${request.status}`));
            }
        }

        request.addEventListener('load', async (...args) => {
            try {
                if (request.status >= 200 && request.status <= 299) {
                    let response = request.status == 204 || !request.response ? null : this.deserializeResponseBody(request.response, request);

                    if (success) {
                        resolve(await success(response));
                    } else {
                        resolve(response);
                    }
                } else if (request.status == 400) {
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
        request.addEventListener('error', reject);
        request.addEventListener('abort', reject);
        request.addEventListener('timeout', reject);
        
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
