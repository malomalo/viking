import * as Errors from 'viking/errors';
import {toQuery} from 'viking/support/object';

export default class Connection {

    host;//: string;
    apiKey;//: string;
    _userAgent;//: string | null;

    // constructor(url: string, options: { userAgent?: string; } = {})
    constructor(url, options = {}) {
        let {origin, username} = new URL(url);

        this.host = origin;
        this.apiKey = username;
        this._userAgent = options.userAgent ? options.userAgent : null;
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

    // get(path: string, params = {})
    get(path, params = {}) {
        if (Object.keys(params).length > 0) {
            path += `?${toQuery(params)}`;
        }

        return this.sendRequest('GET', path);
    }

    // post(path: string, body = null)
    post(path, body = null) {
        return this.sendRequest('POST', path, body);
    }

    // put(path: string, body = null)
    put(path, body = null) {
        return this.sendRequest('PUT', path, body);
    }

    // delete(path: string)
    delete(path) {
        return this.sendRequest('DELETE', path);
    }

    // sendRequest(method: string, path: string, body = null)
    sendRequest(method, path, body = null) {
        return new Promise((resolve, reject) => {
            let request = new XMLHttpRequest();
            request.open(method, `${this.host}${path}`, true);
            request.withCredentials = true;
            request.setRequestHeader('Api-Version', '0.1.0');
            request.setRequestHeader('Accept', 'application/json');

            request.addEventListener('load', () => {
                if (request.status >= 200 && request.status < 299) {
                    resolve(JSON.parse(request.response));
                } else if (request.status === 301) {
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
            });

            // There was a connection error of some sort
            request.addEventListener('error', reject);

            request.responseType = 'text';
            request.send(body);
        });
    }

}