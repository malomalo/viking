import * as Backbone from 'backbone';
import * as _ from 'underscore';
import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../../../viking';

module('Viking.Model::reflectOnAssociations', {}, () => {

    test("::reflectOnAssociations() returns all the assocations", function() {
        let Ship = Viking.Model.extend({ hasMany: ['ships'], belongsTo: [['carrier', {modelName: 'Ship'}]] });
        let ShipCollection = Viking.Collection.extend({ model: Ship });
        
        assert.ok(false);
        // TODO can't access association because not in global space
        // assert.deepEqual(['carrier', 'ships'], _.map(Ship.reflectOnAssociations(), function(a) { return a.name; }));
    });
    
    test("::reflectOnAssociations(macro) returns all macro assocations", function() {
        let Ship = Viking.Model.extend({ hasMany: ['ships'], belongsTo: [['carrier', {modelName: 'Ship'}]] });
        let ShipCollection = Viking.Collection.extend({ model: Ship });
        
        assert.ok(false);
        // TODO can't access association because not in global space
        // assert.deepEqual(['ships'], _.map(Ship.reflectOnAssociations('hasMany'), function(a) { return a.name; }));
    });

});