import * as Backbone from 'backbone';
import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../../../../viking';

module('Viking.View.Helpers#password_field_tag', {}, () => {

    // // passwordFieldTag(name = "password", value = nil, options = {})
    // // ================================================================
    test("passwordFieldTag()", function () {
        assert.equal(Viking.View.Helpers.passwordFieldTag(), '<input id="password" name="password" type="password">');
    });

    test("passwordFieldTag(name)", function () {
        assert.equal(Viking.View.Helpers.passwordFieldTag('pass'), '<input id="pass" name="pass" type="password">');
    });

    test("passwordFieldTag(name, value)", function () {
        assert.equal(Viking.View.Helpers.passwordFieldTag('pass', 'secret'), '<input id="pass" name="pass" type="password" value="secret">');
    });

    test("passwordFieldTag(name, value, options)", function () {
        assert.equal(Viking.View.Helpers.passwordFieldTag('pin', '1234', { maxlength: 4, size: 6, 'class': "pin_input" }),
            '<input class="pin_input" id="pin" maxlength="4" name="pin" size="6" type="password" value="1234">');
    });

});