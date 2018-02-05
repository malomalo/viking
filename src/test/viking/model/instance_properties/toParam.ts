import * as Backbone from 'backbone';
import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../../../viking';

module('Viking.Model#toParam', {}, () => {

    test("#toParam() returns null on a model without an id", function() {
        var model = new Viking.Model();
    
        assert.equal(null, model.toParam());
    });

    test("#toParam() returns id on a model with an id set", function() {
        var model = new Viking.Model({id: 42});
    
        assert.equal(42, model.toParam());
    });

});