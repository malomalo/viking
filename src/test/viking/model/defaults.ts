import * as Backbone from 'backbone';
import * as _ from 'underscore';
import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../../viking';

module('Viking#defaults', {}, () => {

    test("defaults with schema", function() {
        var Klass = Viking.Model.extend({
            schema: {
                foo: {'default': 'bar'},
                bat: {'default': 'bazz'}
            }
        });
    
        assert.deepEqual(_.result(Klass.prototype, 'defaults'), {foo: 'bar', bat: 'bazz'});
    });

});