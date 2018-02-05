import * as Backbone from 'backbone';
import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../../../viking';

module('Viking.Model::reflectOnAssociation', {}, () => {

    test("::reflectOnAssociation() returns the assocation", function() {
        let Ship = Viking.Model.extend({ hasMany: ['ships'], belongsTo: [['carrier', {modelName: 'Ship'}]] });
        let ShipCollection = Viking.Collection.extend({ model: Ship });
        
        assert.equal('ships', Ship.reflectOnAssociation('ships').name);
        assert.equal('carrier', Ship.reflectOnAssociation('carrier').name);
        assert.equal(undefined, Ship.reflectOnAssociation('bird'));
    });

});