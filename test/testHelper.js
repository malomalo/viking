import 'mocha';
import * as sinon from 'sinon';
import { toQuery }  from 'viking/support/object';
import Model        from 'viking/record';
import Connection   from 'viking/record/connection';

Model.connection = new Connection('http://example.com');

before(function() {
    this.xhr = sinon.useFakeXMLHttpRequest();
    this.xhr.onCreate = (xhr) => {
        this.requests.push(xhr);
    };

    this.withRequest = (method, url, {params = null, body =  null} = {}, callback) => {
        if (params && Object.keys(params).length > 0) { url += `?${toQuery(params)}`; }

        let match = this.requests.find((xhr) => {
            if (xhr.method === method && xhr.url === 'http://example.com' + url) {
                if (body) {
                    if ((typeof body) !== 'string') {
                        return JSON.stringify(body) === xhr.requestBody;
                    }
                    return body === xhr.requestBody;
                } else {
                    return true;
                }
            }
            return ;
        });

        if (match) {
            callback(match);
        } else {
            this.requests.forEach((xhr) => {
                console.log(decodeURIComponent(xhr.url));
            });
        }
    };
});

after(function () {
    this.xhr.restore();
});

beforeEach(function () {
    this.requests = [];
});