import * as Backbone from 'backbone';
import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../../../../viking';

let model: any;
module('Viking.View.Helpers#formFor', {
    beforeEach: function() {
        let Model = Viking.Model.extend("model");
        model = new Model();
    }
}, () => {
    // formFor(model, options, content())
    // =================================
    test("formFor(model, content())", function() {
        assert.equal(Viking.View.Helpers.formFor(model, function() { return ''; }), '<form method="get"></form>');
    });

    test("formFor(model, {method: 'get'}, content())", function() {
        assert.equal( Viking.View.Helpers.formFor(model, {method: 'get'}, function() { return ''; }),
               '<form method="get"></form>');
    });
    
    test("formFor(model, {method: 'post'}, content())", function() {
        assert.equal( Viking.View.Helpers.formFor(model, {method: "post"}, function() { return ''; }),
               '<form method="post"></form>');
    });

    test("formFor(model, {method: 'patch'}, content())", function() {
        assert.equal( Viking.View.Helpers.formFor(model, {method: 'patch'}, function() { return ''; }),
               '<form method="post"><div style="margin:0;padding:0;display:inline"><input name="_method" type="hidden" value="patch"></div></form>');
    });

    test("formFor(model, {method: 'put'}, content())", function() {
        assert.equal( Viking.View.Helpers.formFor(model, {method: 'put'}, function() { return ''; }),
               '<form method="post"><div style="margin:0;padding:0;display:inline"><input name="_method" type="hidden" value="put"></div></form>');
    });

    test("formFor(model, {method: 'delete'}, content())", function() {
        assert.equal( Viking.View.Helpers.formFor(model, {method: 'delete'}, function() { return ''; }),
               '<form method="post"><div style="margin:0;padding:0;display:inline"><input name="_method" type="hidden" value="delete"></div></form>');
    });
    
    test("formFor(model, {multipart: true}, content())", function() {
        assert.equal( Viking.View.Helpers.formFor(model, {multipart: true}, function() { return ''; }),
               '<form enctype="multipart/form-data" method="post"></form>');
    });

    test("formFor(model, {multipart: true, method: 'patch'}, content())", function() {
        assert.equal( Viking.View.Helpers.formFor(model, {multipart: true, method: 'patch'}, function() { return ''; }),
               '<form enctype="multipart/form-data" method="post"><div style="margin:0;padding:0;display:inline"><input name="_method" type="hidden" value="patch"></div></form>');
    });

    test("formFor(model, {multipart: true, method: 'get'}, content())", function() {
        assert.equal( Viking.View.Helpers.formFor(model, {multipart: true, method: 'get'}, function() { return ''; }),
               '<form enctype="multipart/form-data" method="post"><div style="margin:0;padding:0;display:inline"><input name="_method" type="hidden" value="get"></div></form>');
    });

});