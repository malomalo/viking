import * as assert from 'assert';
import * as sinon from 'sinon';
import 'mocha';
import { toQuery } from '../src/viking/support/object';

before(function () {
    this.xhr = sinon.useFakeXMLHttpRequest();
    this.xhr.onCreate = (xhr: any) => {
        this.requests.push(xhr);
    };

    this.withRequest = (method: string, url: string, params, callback) => {
        if (Object.keys(params).length > 0) { url += `?${toQuery(params)}`; }

        let match = this.requests.find((xhr) => {
            console.log(decodeURIComponent(xhr.url), decodeURIComponent(url)); 
            return xhr.method === method && xhr.url === url;
        });

        if (match) {
            callback(match);
        } else {

        }
    };
});

beforeEach(function () {
    this.requests = [];
});


after(function () {
    this.xhr.restore();
});