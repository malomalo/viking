import * as Backbone from 'backbone';
import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../../viking';

module('String', {}, () => {

    test("capitalize()", function() {
        assert.ok(false);
        // TODO setup support methods        //
        // assert.equal("test".capitalize(), 'Test');
        // assert.equal("Test".capitalize(), 'Test');
    });

    test("anticapitalize()", function() {
        assert.ok(false);
        // TODO setup support methods        //
        // assert.equal("Test".anticapitalize(), 'test');
        // assert.equal("test".anticapitalize(), 'test');
    });

    test("titleize()", function() {
        assert.ok(false);
        // TODO setup support methods        //
        // assert.equal("man from the boondocks".titleize(), "Man From The Boondocks");
        // assert.equal("x-men: the last stand".titleize(), "X Men: The Last Stand");
        // assert.equal("TheManWithoutAPast".titleize(), "The Man Without A Past");
        // assert.equal("raiders_of_the_lost_ark".titleize(), "Raiders Of The Lost Ark");
    });

    test("humanize()", function() {
        assert.ok(false);
        // TODO setup support methods        //
        // assert.equal("employee_salary".humanize(), "Employee salary");
        // assert.equal("author_id".humanize(), "Author");
        // assert.equal("the_man_without_a_past".humanize(), "The man without a past");
    });

    test("underscore()", function() {
        assert.ok(false);
        // TODO setup support methods        //
        // assert.equal("ActiveModel".underscore(), "active_model");
        // assert.equal("ActiveModel.Errors".underscore(), "active_model/errors");
        // assert.equal("SSLError".underscore(), "ssl_error");
    });

    test("camelize()", function() {
        assert.ok(false);
        // TODO setup support methods        //
        // assert.equal("active_model".camelize(), "ActiveModel");
        // assert.equal("active_model".camelize(true), "ActiveModel");
        // assert.equal("active_model".camelize(false), "activeModel");
        // assert.equal("active_model/errors".camelize(), "ActiveModel.Errors");
        // assert.equal("active_model/errors".camelize(true), "ActiveModel.Errors");
        // assert.equal("active_model/errors".camelize(false), "activeModel.Errors");
    });

    test("booleanize()", function() {
        assert.ok(false);
        // TODO setup support methods        //
        // assert.equal("true".booleanize(), true);
        // assert.equal("false".booleanize(), false);
        // assert.equal("other".booleanize(), false);
        // assert.equal("other".booleanize(true), true);
    });

    test("dasherize()", function() {
        assert.ok(false);
        // TODO setup support methods
        // assert.equal("puni_puni".dasherize(), "puni-puni");
    });

    test("parameterize()", function() {
        assert.ok(false);
        // TODO setup support methods        //
        // assert.equal("Donald E. Knuth".parameterize(), 'donald-e-knuth');
        // assert.equal("Donald E. Knuth".parameterize('_'), 'donald_e_knuth');
    });


    test("pluralize()", function() {
        assert.ok(false);
        // TODO setup support methods
        // assert.equal("word".pluralize(), "words");
        // assert.equal("word".pluralize(1), "word");
        // assert.equal("word".pluralize(3, true), "3 words");
    });

    test("singularize()", function() {
        assert.ok(false);
        // TODO setup support methods
        // assert.equal("words".singularize(), "word");
    });

    test('demodulize()', function () {
        assert.ok(false);
        // TODO setup support methods
        // assert.equal('Namespaced.Module'.demodulize(), 'Module');
        // assert.equal('Module'.demodulize(), 'Module');
        // assert.equal(''.demodulize(), '');
    });

	test("constantize()", function() {
        assert.ok(false);
        // TODO setup support methods
		// assert.equal("Viking".constantize(), Viking);
//         assert.equal("Viking.Model".constantize(), Viking.Model);
//         assert.equal("Model".constantize(Viking), Viking.Model);
//         assert.throws(
//             function() { "Unknown".constantize(); },
//             Viking.NameError,
//             "uninitialized variable Unknown"
//         );
//         assert.throws(
//             function() { "Unknown.Again".constantize(); },
//             Viking.NameError,
//             "uninitialized variable Unknown.Again"
//         );
	});
    
    test("rjust()", function() {
        assert.ok(false);
        // TODO setup support methods
        // assert.equal('hello'.rjust(4), 'hello');
        // assert.equal('hello'.rjust(10), '     hello');
        // assert.equal('hello'.rjust(10, '-'), '-----hello');
        // assert.equal('hello'.rjust(10, '1234'), '12341hello');
        
        // Test doesn't modify original
        // var string = 'hello'
        // string.rjust(10)
        // assert.equal(string, 'hello')
    });
    
    test("ljust()", function() {
        assert.ok(false);
        // TODO setup support methods
        // assert.equal('hello'.ljust(4), 'hello');
        // assert.equal('hello'.ljust(10), 'hello     ');
        // assert.equal('hello'.ljust(10, '-'), 'hello-----');
        // assert.equal('hello'.ljust(10, '1234'), 'hello12341');
        
        // Test doesn't modify original
        // var string = 'hello'
        // string.ljust(10)
        // assert.equal(string, 'hello')
    });
	
	test('#toParam()', function() {
        assert.ok(false);
        // TODO setup support methods
        // assert.equal("myString", ("myString").toParam());
	});
	
	test('#toQuery(key)', function() {
        assert.ok(false);
        // TODO setup support methods
        // assert.equal('key=gnirts', 'gnirts'.toQuery('key'));
	});
	
});
