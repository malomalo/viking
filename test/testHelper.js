import 'mocha';
import * as sinon from 'sinon';
import { toQuery }  from 'viking/support/object';
import Model        from 'viking/model';
import Connection   from 'viking/record/connection';

Model.connection = new Connection('http://example.com');

before(function() {
    this.xhr = sinon.useFakeXMLHttpRequest();
    this.xhr.onCreate = (xhr) => {
        this.requests.push(xhr);
    };

    this.withRequest = (method, url, params, callback) => {
        if (Object.keys(params).length > 0) { url += `?${toQuery(params)}`; }

        let match = this.requests.find((xhr) => {
            // console.log(decodeURIComponent(xhr.url), decodeURIComponent(url));
            return xhr.method === method && xhr.url === 'http://example.com' + url;
        });

        if (match) {
            callback(match);
        } else {

        }
    };
});

after(function () {
    this.xhr.restore();
});

beforeEach(function () {
    this.requests = [];
});