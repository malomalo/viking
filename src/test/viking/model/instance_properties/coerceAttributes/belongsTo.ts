import * as Backbone from 'backbone';
import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../../../../viking';

module('Viking.Model#coerceAttributes - belongsTo', {}, () => {

    test("#coerceAttributes initializes belongsTo relation with hash", function() {
        let Ship = Viking.Model.extend({ belongsTo: ['ship'] });
        var a = new Ship();

        var result = a.coerceAttributes({ship: {key: 'value'}});
        assert.ok(result.ship instanceof Ship);
        assert.deepEqual(result.ship.attributes, {key: 'value'});
    });

    test("#coerceAttributes initializes belongsTo relation with instance of model", function() {
        let Ship = Viking.Model.extend({ belongsTo: ['ship'] });
        var a = new Ship();
        var b = new Ship({key: 'value'});

        var result = a.coerceAttributes({ship: b});
        assert.ok(result.ship === b);
    });

});