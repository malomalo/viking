import 'mocha';
import * as sinon from 'sinon';
import assert from 'assert';
import { toQuery }  from 'viking/support/object';
import Model        from 'viking/record';
import Connection   from 'viking/record/connection';

assert.tag = function (tag, name, attrsOrContent, content) {
    var attrs;
    
    if (typeof attrsOrContent === 'string') {
        content = attrsOrContent;
        attrs = undefined;
    } else {
        attrs = attrsOrContent;
    }
    
    assert.tagName(tag, name);

    if ( attrs === undefined || Object.entries(attrs).length === 0 ) {
        assert.noTagAttributes(tag);
    } else {
        assert.tagAttributes(tag, attrs);
    }
    
    if (content) {
        assert.equal(tag.innerHTML, content);
    }
}

assert.tagName = function (tag, name) {
    assert.equal(tag.tagName, name.toUpperCase());
}

assert.tagAttributes = function (tag, attrs) {
    Object.entries(attrs).forEach((k) => {
        if (k[1] === true) {
            assert.equal(tag.getAttribute(k[0]), '');
        } else {
            assert.equal(tag.getAttribute(k[0]), k[1]);
        }
    });
}

assert.noTagAttributes = function (tag) {
    assert.equal(Object.entries(tag.attributes).length, 0);
}

Model.connection = new Connection('http://example.com');

before(function() {
    this.requestCallbacks = [];

    function requestMatches(xhr, method, url, {params = null, body =  null} = {}) {
        let matchingURL = url;
        if (params && Object.keys(params).length > 0) { matchingURL += `?${toQuery(params)}`; }

        if (xhr.method === method && xhr.url === 'http://example.com' + matchingURL) {
            if (body) {
                if ((typeof body) !== 'string') {
                    return JSON.stringify(body) === xhr.requestBody;
                }
                return body === xhr.requestBody;
            } else {
                return true;
            }
        }
        
        return false;
    }
    
    this.onRequest = (method, url, options, callback) => {
        this.requestCallbacks.push([method, url, options, callback]);
    };
    
    this.click = function (element, options) {
        element.dispatchEvent(new MouseEvent('click', Object.assign({ bubbles: true }, options)))
    }
    
    this.xhr = sinon.useFakeXMLHttpRequest();
    this.xhr.onCreate = (xhr) => {
        if (this.requestCallbacks.length > 0) {
            // Do timeout here because this is when the request is created,
            // not sent
            setTimeout(() => { 
                let match = this.requestCallbacks.find(cb => requestMatches(xhr, cb[0], cb[1], cb[2]));
                if (match) {
                    this.requestCallbacks = this.requestCallbacks.filter(cb => cb !== match);
                    match[3](xhr);
                } else {
                    this.requests.push(xhr);
                }
            }, 0);
        } else {
            this.requests.push(xhr);
        }
    };
    
    this.withRequest = (method, url, options, callback) => {
        let match = this.findRequest(method, url, options);
        if (match) {
            callback(match);
            this.requests = this.requests.filter(xhr => xhr !== match);
        }
    };

    this.findRequest = (method, url, options) => {
        let match = this.requests.find((xhr) => xhr.sendFlag && !xhr.aborted && requestMatches(xhr, method, url, options));

        if (!match) {
            console.error("\x1b[33m", "!!! MISSED REQUESTS !!!!!")
            console.error("\x1b[33m", "\tREQUEST")
            console.error("\x1b[33m", "\t\t" + [method, decodeURIComponent('http://example.com' + url + `${ options?.params ? "?" + toQuery(options.params) : ""}`), JSON.stringify(options?.body)].filter(x => x).join("\t"));
            console.error("\x1b[33m", "\tQUEUE");
            this.requests.forEach((xhr) => {
                console.error("\x1b[33m", "\t\t" + [xhr.method, decodeURIComponent(xhr.url), xhr.requestBody].filter(x => x).join("\t"));
            });
            console.error("\x1b[33m", "!!!!!!!!!!!!!!!!!!!!!!!!");
        }
        
        return match;
    };

});

after(function () {
    this.xhr.restore();
});

beforeEach(function () {
    this.requests = [];
});