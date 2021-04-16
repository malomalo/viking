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
    this.xhr = sinon.useFakeXMLHttpRequest();
    this.xhr.onCreate = (xhr) => {
        this.requests.push(xhr);
    };

    this.withRequest = (method, url, options, callback) => {
        let match = this.findRequest(method, url, options);

        if (match) {
            callback(match);
            this.requests = this.requests.filter(xhr => xhr !== match);
        }
    };
    
    this.findRequest = (method, url, {params = null, body =  null} = {}) => {
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

        if (!match) {
            this.requests.forEach((xhr) => {
                console.error("\x1b[33m", "!!! MISSED REQUEST !!!!!")
                console.error("\x1b[33m", "\tREQUESTS\n\t\t" + [method, decodeURIComponent('http://example.com' + url), JSON.stringify(body)].filter(x => x).join("\t"));
                console.error("\x1b[33m", "\tQUEUE\n\t\t" + [xhr.method, decodeURIComponent(xhr.url), xhr.requestBody].filter(x => x).join("\t"));
                console.error("\x1b[33m", "!!!!!!!!!!!!!!!!!!!!!!!!");
            });
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