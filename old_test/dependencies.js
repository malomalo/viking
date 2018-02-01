//= require jquery
//= require strftime
//= require underscore
//= require underscore.inflection
//= require backbone

var JST = {
    'a/template/path'               : _.template('<h1>Some Title</h1>'),
    'a/template/path/with/locals'   : _.template('<p><%= text %></p>')
};
