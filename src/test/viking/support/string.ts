import * as Backbone from 'backbone';
import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../../viking';
import { capitalize, anticapitalize, titleize, humanize, underscore, camelize, booleanize, dasherize, parameterize, pluralize, singularize, demodulize, constantize, rjust, ljust, toParam, toQuery } from '../../../viking/support/string';

module('String', {}, () => {

    test("capitalize()", function() {
        assert.equal(capitalize("test"), 'Test');
        assert.equal(capitalize("Test"), 'Test');
    });

    test("anticapitalize()", function() {
        assert.equal(anticapitalize("Test"), 'test');
        assert.equal(anticapitalize("test"), 'test');
    });

    test("titleize()", function() {
        assert.equal(titleize("man from the boondocks"), "Man From The Boondocks");
        assert.equal(titleize("x-men: the last stand"), "X Men: The Last Stand");
        assert.equal(titleize("TheManWithoutAPast"), "The Man Without A Past");
        assert.equal(titleize("raiders_of_the_lost_ark"), "Raiders Of The Lost Ark");
    });

    test("humanize()", function() {
        assert.equal(humanize("employee_salary"), "Employee salary");
        assert.equal(humanize("author_id"), "Author");
        assert.equal(humanize("the_man_without_a_past"), "The man without a past");
    });

    test("underscore()", function() {
        assert.equal(underscore("ActiveModel"), "active_model");
        assert.equal(underscore("ActiveModel.Errors"), "active_model/errors");
        assert.equal(underscore("SSLError"), "ssl_error");
    });

    test("camelize()", function() {
        assert.equal(camelize("active_model"), "ActiveModel");
        assert.equal(camelize("active_model", true), "ActiveModel");
        assert.equal(camelize("active_model", false), "activeModel");
        assert.equal(camelize("active_model/errors"), "ActiveModel.Errors");
        assert.equal(camelize("active_model/errors", true), "ActiveModel.Errors");
        assert.equal(camelize("active_model/errors", false), "activeModel.Errors");
    });

    test("booleanize()", function() {
        assert.equal(booleanize("true"), true);
        assert.equal(booleanize("false"), false);
        assert.equal(booleanize("other"), false);
        assert.equal(booleanize("other", true), true);
    });

    test("dasherize()", function() {
        assert.equal(dasherize("puni_puni"), "puni-puni");
    });

    test("parameterize()", function() {
        assert.equal(parameterize("Donald E. Knuth"), 'donald-e-knuth');
        assert.equal(parameterize("Donald E. Knuth", '_'), 'donald_e_knuth');
    });


    test("pluralize()", function() {
        assert.equal(pluralize("word"), "words");
        assert.equal(pluralize("word", 1), "word");
        assert.equal(pluralize("word", 3, true), "3 words");
    });

    test("singularize()", function() {
        assert.equal(singularize("words"), "word");
    });

    test('demodulize()', function () {
        assert.equal(demodulize("Namespaced.Module", ), 'Module');
        assert.equal(demodulize('Module'), 'Module');
        assert.equal(demodulize(''), '');
    });

	test("constantize()", function() {
        // TODO can't load Viking
        // assert.equal(constantize("Viking"), Viking);
        // assert.equal(constantize("Viking.Model"), Viking.Model);
        // assert.equal(constantize("Model", Viking), Viking.Model);
        assert.throws(
            function() { constantize("Unknown"); },
            Viking.NameError,
            "uninitialized variable Unknown"
        );
        assert.throws(
            function() { constantize("Unknown.Again"); },
            Viking.NameError,
            "uninitialized variable Unknown.Again"
        );
	});
    
    test("rjust()", function() {
        assert.equal(rjust("hello", 4), 'hello');
        assert.equal(rjust("hello", 10), '     hello');
        assert.equal(rjust('hello', 10, '-'), '-----hello');
        assert.equal(rjust('hello', 10, '1234'), '12341hello');

        // Test doesn't modify original
        var string = 'hello'
        rjust(string, 10)
        assert.equal(string, 'hello')
    });
    
    test("ljust()", function() {
        assert.equal(ljust("hello", 4), 'hello');
        assert.equal(ljust("hello", 10), 'hello     ');
        assert.equal(ljust('hello', 10, '-'), 'hello-----');
        assert.equal(ljust('hello', 10, '1234'), 'hello12341');

        // Test doesn't modify original
        var string = 'hello'
        ljust(string, 10)
        assert.equal(string, 'hello')
    });
	
	test('#toParam()', function() {
        assert.equal("myString", toParam("myString"));
	});
	
	test('#toQuery(key)', function() {
        assert.equal('key=gnirts', toQuery('gnirts', 'key'));
	});
	
});
