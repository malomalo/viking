import * as Backbone from 'backbone';
import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../../../../viking';

module('Viking.View.Helpers#imageTag', {}, () => {

    test("imageTag(src)", function() {
        assert.equal( Viking.View.Helpers.imageTag('/assets/icon.png'), 
              '<img alt="Icon" src="/assets/icon.png">');
    });

    test("imageTag(src, options)", function() {
        assert.equal( Viking.View.Helpers.imageTag('/assets/icon.png', { size : '16x10', alt : 'A caption' }),
              '<img alt="A caption" height="10" src="/assets/icon.png" width="16">');
    });

    test("imageTag(src, options)", function() {
        assert.equal( Viking.View.Helpers.imageTag('/assets/icon.gif', { size : '16' }),
              '<img alt="Icon" height="16" src="/assets/icon.gif" width="16">');
    });

    test("imageTag(src, options)", function() {
        assert.equal( Viking.View.Helpers.imageTag('/icons/icon.gif', { height : '32', width: '32' }),
              '<img alt="Icon" height="32" src="/icons/icon.gif" width="32">');
    });

    test("imageTag(src, options)", function() {
        assert.equal( Viking.View.Helpers.imageTag('/icons/icon.gif', { 'class' : 'menu_icon' }),
              '<img alt="Icon" class="menu_icon" src="/icons/icon.gif">');
    });

});
