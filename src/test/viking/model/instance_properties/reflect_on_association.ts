import * as Backbone from 'backbone';
import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../../../viking';

module('Viking.Model#reflectOnAssociation', {}, () => {
    
    test("#reflectOnAssociation() is a reference to ::reflectOnAssociation()", function() {
        var Ship = Viking.Model.extend();

        assert.strictEqual(Ship.reflectOnAssociation, (new Ship()).reflectOnAssociation)
    });

});