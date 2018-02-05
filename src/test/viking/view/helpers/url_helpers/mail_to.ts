import * as Backbone from 'backbone';
import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../../../../viking';

module('Viking.View.Helpers#mailTo', {}, () => {

    test("mailTo(email)", function() {
        assert.equal(
            Viking.View.Helpers.mailTo('me@domain.com'),
            '<a href="mailto:me@domain.com">me@domain.com</a>'
        );
    });
    
    test("mailTo(email, name)", function() {
        assert.equal(
            Viking.View.Helpers.mailTo('me@domain.com', 'My email'),
            '<a href="mailto:me@domain.com">My email</a>'
        );
    });
    
    test("mailTo(email, options)", function() {
        assert.equal(
            Viking.View.Helpers.mailTo('me@domain.com', {key: 'value'}),
            '<a href="mailto:me@domain.com" key="value">me@domain.com</a>'
        );
    });
    
    test("mailTo(email, name, options)", function() {
        assert.equal(
            Viking.View.Helpers.mailTo('me@domain.com', 'My email', {
                cc: 'ccaddress@domain.com',
                subject: 'This is an example email'
            }),
            '<a href="mailto:me@domain.com?cc=ccaddress@domain.com&subject=This%20is%20an%20example%20email">My email</a>'
        );
    });
    
    test("mailTo(email, contentFunc)", function() {
        assert.equal(
            Viking.View.Helpers.mailTo('me@domain.com', function () {
                return "<strong>Email me:</strong> <span>me@domain.com</span>";
            }),
            '<a href="mailto:me@domain.com"><strong>Email me:</strong> <span>me@domain.com</span></a>'
        );
    });
    
    test("mailTo(email, options, contentFunc)", function() {
        assert.equal(
            Viking.View.Helpers.mailTo('me@domain.com', {key: 'value'}, function () {
                return "Email me";
            }),
            '<a href="mailto:me@domain.com" key="value">Email me</a>'
        );
    });
    
    test("mailTo(email, contentFunc, options)", function() {
        assert.equal(
            Viking.View.Helpers.mailTo('me@domain.com', function () {
                return "Email me";
            }, {key: 'value'}),
            '<a href="mailto:me@domain.com" key="value">Email me</a>'
        );
    });
    
});