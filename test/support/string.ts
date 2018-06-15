import * as assert from 'assert';
import 'mocha';
import * as StringSupport from '../../src/viking/support/string';
import { NameError } from '../../src/viking/errors';

describe('VikingSupport.String', () => {

    it("capitalize()", function() {
        assert.equal(StringSupport.capitalize("test"), 'Test');
        assert.equal(StringSupport.capitalize("Test"), 'Test');
    });

    it("anticapitalize()", function() {
        assert.equal(StringSupport.anticapitalize("Test"), 'test');
        assert.equal(StringSupport.anticapitalize("test"), 'test');
    });

    it("titleize()", function() {
        assert.equal(StringSupport.titleize("man from the boondocks"), "Man From The Boondocks");
        assert.equal(StringSupport.titleize("x-men: the last stand"), "X Men: The Last Stand");
        assert.equal(StringSupport.titleize("TheManWithoutAPast"), "The Man Without A Past");
        assert.equal(StringSupport.titleize("raiders_of_the_lost_ark"), "Raiders Of The Lost Ark");
    });

    it("humanize()", function() {
        assert.equal(StringSupport.humanize("employee_salary"), "Employee salary");
        assert.equal(StringSupport.humanize("author_id"), "Author");
        assert.equal(StringSupport.humanize("the_man_without_a_past"), "The man without a past");
    });

    it("underscore()", function() {
        assert.equal(StringSupport.underscore("ActiveModel"), "active_model");
        assert.equal(StringSupport.underscore("ActiveModel.Errors"), "active_model/errors");
        assert.equal(StringSupport.underscore("SSLError"), "ssl_error");
    });

    it("camelize()", function() {
        assert.equal(StringSupport.camelize("active_model"), "ActiveModel");
        assert.equal(StringSupport.camelize("active_model", true), "ActiveModel");
        assert.equal(StringSupport.camelize("active_model", false), "activeModel");
        assert.equal(StringSupport.camelize("active_model/errors"), "ActiveModel.Errors");
        assert.equal(StringSupport.camelize("active_model/errors", true), "ActiveModel.Errors");
        assert.equal(StringSupport.camelize("active_model/errors", false), "activeModel.Errors");
    });

    it("booleanize()", function() {
        assert.strictEqual(StringSupport.booleanize("true"), true);
        assert.strictEqual(StringSupport.booleanize("false"), false);
        assert.strictEqual(StringSupport.booleanize("other"), false);
        assert.strictEqual(StringSupport.booleanize("other", true), true);
    });

    it("dasherize()", function() {
        assert.equal(StringSupport.dasherize("puni_puni"), "puni-puni");
    });

    it("parameterize()", function() {
        assert.equal(StringSupport.parameterize("Donald E. Knuth"), 'donald-e-knuth');
        assert.equal(StringSupport.parameterize("Donald E. Knuth", '_'), 'donald_e_knuth');
    });


    it("pluralize()", function() {
        assert.equal(StringSupport.pluralize("word"), "words");
        assert.equal(StringSupport.pluralize("word", 1), "word");
        assert.equal(StringSupport.pluralize("word", 3, true), "3 words");
    });

    it("singularize()", function() {
        assert.equal(StringSupport.singularize("words"), "word");
    });

    it('demodulize()', function () {
        assert.equal(StringSupport.demodulize("Namespaced.Module", ), 'Module');
        assert.equal(StringSupport.demodulize('Module'), 'Module');
        assert.equal(StringSupport.demodulize(''), '');
    });

    it("constantize()", function() {
        // TODO can't load Viking
        // assert.equal(constantize("Viking"), Viking);
        // assert.equal(constantize("Viking.Model"), Viking.Model);
        // assert.equal(constantize("Model", Viking), Viking.Model);
        assert.throws(
            function() { StringSupport.constantize("Unknown"); },
            NameError,
            "uninitialized variable Unknown"
        );
        assert.throws(
            function() { StringSupport.constantize("Unknown.Again"); },
            NameError,
            "uninitialized variable Unknown.Again"
        );
    });

    it("rjust()", function() {
        assert.equal(StringSupport.rjust("hello", 4), 'hello');
        assert.equal(StringSupport.rjust("hello", 10), '     hello');
        assert.equal(StringSupport.rjust('hello', 10, '-'), '-----hello');
        assert.equal(StringSupport.rjust('hello', 10, '1234'), '12341hello');

        // Test doesn't modify original
        let string = 'hello';
        StringSupport.rjust(string, 10);
        assert.equal(string, 'hello');
    });

    it("ljust()", function() {
        assert.equal(StringSupport.ljust("hello", 4), 'hello');
        assert.equal(StringSupport.ljust("hello", 10), 'hello     ');
        assert.equal(StringSupport.ljust('hello', 10, '-'), 'hello-----');
        assert.equal(StringSupport.ljust('hello', 10, '1234'), 'hello12341');

        // Test doesn't modify original
        let string = 'hello';
        StringSupport.ljust(string, 10);
        assert.equal(string, 'hello');
    });

    it('#toParam()', function() {
        assert.equal("myString", StringSupport.toParam("myString"));
    });

    it('#toQuery(key)', function() {
        assert.equal('key=gnirts', StringSupport.toQuery('gnirts', 'key'));
    });

});