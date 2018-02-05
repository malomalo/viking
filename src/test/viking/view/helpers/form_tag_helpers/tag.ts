import * as Backbone from 'backbone';
import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../../../../viking';

module('Viking.View.Helpers#tag', {}, () => {

    // tag(name, [options = {}, escape = true])
    // ========================================
    test("tag(name)", function() {
        assert.equal(Viking.View.Helpers.tag("br"), "<br>");
    });
    
    test("tag(name, options)", function() {
        assert.equal(Viking.View.Helpers.tag("input", {type: "text"}), '<input type="text">');
    });

    test("tag(name, options) options are escaped by default", function() {
        assert.equal(Viking.View.Helpers.tag("img", {src: "open & shut.png"}), '<img src="open &amp; shut.png">');
    });
    
    test("tag(name, options, false) options are not escaped", function() {
        assert.equal(Viking.View.Helpers.tag("img", {src: "open &amp; shut.png"}, false), '<img src="open &amp; shut.png">');
    });
    
    test("tag(name, boolean_options)", function() {
        assert.equal(Viking.View.Helpers.tag("input", {selected: true}), '<input selected>');
    });
    
    test("tag(name, data_options)", function() {
        assert.equal(Viking.View.Helpers.tag("div", {data: {name: 'Stephen', city_state: ["Chicago", "IL"]}}),
             '<div data-city_state="[&quot;Chicago&quot;,&quot;IL&quot;]" data-name="Stephen">');
    });
    
});