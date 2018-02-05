import * as Backbone from 'backbone';
import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../../../../viking';

module('Viking.View.Helpers#submit_tag', {}, () => {

    // // submitTag(value="Save", options)
    // // =================================
    test("submitTag()", function() {
        assert.equal(Viking.View.Helpers.submitTag(), '<input name="commit" type="submit" value="Save">');
    });
    
    test("submitTag(value)", function() {
        assert.equal(Viking.View.Helpers.submitTag("Edit this article"), '<input name="commit" type="submit" value="Edit this article">');
    });
    
    test("submitTag(value, options)", function() {
        assert.equal(Viking.View.Helpers.submitTag("Edit", {disabled: true, 'class': 'butn'}), '<input class="butn" disabled name="commit" type="submit" value="Edit">');
    });
    
    test("submitTag(value)", function() {
        assert.equal(Viking.View.Helpers.submitTag(null, {'class': 'btn'}), '<input class="btn" name="commit" type="submit" value="Save">');
    });

});