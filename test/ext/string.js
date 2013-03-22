module("Ext.String");

test("capitalize()", function() {
    equal("test".capitalize(), 'Test');
    equal("Test".capitalize(), 'Test');
});

test("anticapitalize()", function() {
    equal("Test".anticapitalize(), 'test');
    equal("test".anticapitalize(), 'test');
});

test("titleize()", function() {
    equal("man from the boondocks".titleize(), "Man From The Boondocks");
    equal("x-men: the last stand".titleize(), "X Men: The Last Stand");
    equal("TheManWithoutAPast".titleize(), "The Man Without A Past");
    equal("raiders_of_the_lost_ark".titleize(), "Raiders Of The Lost Ark");
});

test("humanize()", function() {
    equal("employee_salary".humanize(), "Employee salary");
    equal("author_id".humanize(), "Author");
    equal("the_man_without_a_past".humanize(), "The man without a past");
});

test("underscore()", function() {
    equal("ActiveModel".underscore(), "active_model");
    equal("ActiveModel::Errors".underscore(), "active_model/errors");
    equal("SSLError".underscore(), "ssl_error");
});

test("camelize()", function() {
    equal("active_model".camelize(), "ActiveModel");
    equal("active_model".camelize(false), "activeModel");
    equal("active_model/errors".camelize(), "ActiveModel::Errors");
    equal("active_model/errors".camelize(false), "activeModel::Errors");
});

test("booleanize()", function() {
    equal("true".booleanize(), true);
    equal("false".booleanize(), false);
    equal("other".booleanize(), false);
    equal("other".booleanize(true), true);
});

test("dasherize()", function() {
    equal("puni_puni".dasherize(), "puni-puni");
});

test("parameterize()", function() {
    equal("Donald E. Knuth".parameterize(), 'donald-e-knuth');
    equal("Donald E. Knuth".parameterize('_'), 'donald_e_knuth');
});


test("pluralize()", function() {
    equal("word".pluralize(), "words");
    equal("word".pluralize(1), "word");
    equal("word".pluralize(3, true), "3 words");
});

test("singularize()", function() {
    equal("words".singularize(), "word");
});