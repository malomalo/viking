import * as Backbone from 'backbone';
import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../../../viking';

module('Viking.Model#setErrors', {}, () => {
    
    test("#setErrors is a noop if the size of the errors is 0", function() {
        var m = new Viking.Model();
        m.on('invalid', function(model, errors, options) {
            assert.ok(false);
        });
        m.setErrors({});
        m.off('invalid');
        assert.ok(true);
    });

    test("#setErrors emits invalid event errors are set", function() {
        var m = new Viking.Model();
        m.on('invalid', function(model, errors, options) {
            assert.deepEqual(errors, {
                "address": { "city": ["cant be blank"] },
                "agents": [ { "email": ["cant be blank",  "is invalid" ] } ],
                "size": ["cant be blank", "is not a number" ]
            });
        });

        m.setErrors({
            "address": { "city": ["cant be blank"] },
            "agents": [ { "email": ["cant be blank",  "is invalid" ] } ],
            "size": ["cant be blank", "is not a number" ]
        });
        m.off('invalid');
    });
    
});