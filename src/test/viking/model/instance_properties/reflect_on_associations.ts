import * as Backbone from 'backbone';
import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../../../viking';

module('Viking.Model#reflectOnAssociations', {}, () => {
    
    test("#reflectOnAssociations() is a reference to ::reflectOnAssociations()", function() {
        var Ship = Viking.Model.extend();

        assert.strictEqual(Ship.reflectOnAssociations, (new Ship()).reflectOnAssociations)
    });

});