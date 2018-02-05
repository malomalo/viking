import * as Backbone from 'backbone';
import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../../../viking';

module('Viking.Model#urlRoot', {}, () => {

    test("#urlRoot is an alias to ::urlRoot", function() {
        var Model = Viking.Model.extend('model', {}, {
            urlRoot: function() {
                return 42;
            }
        });
    
        assert.equal((new Model()).urlRoot(), 42);
    });

});