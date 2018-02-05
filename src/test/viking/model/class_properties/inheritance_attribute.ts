import * as Backbone from 'backbone';
import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../../../viking';

module('Viking.Model::inheritanceAttribute', {}, () => {

    test("::inheritanceAttribute get set when extending a Model", function() {
        var Ship = Viking.Model.extend();
        
        assert.ok(Ship.inheritanceAttribute);
    });
    
    test("::inheritanceAttribute default to `type`", function() {
        var Ship = Viking.Model.extend();
        
        assert.equal('type', Ship.inheritanceAttribute);
    });
    
    test("::inheritanceAttribute override", function() {
        var Ship = Viking.Model.extend({
            inheritanceAttribute: 'class_name'
        });
        
        assert.equal('class_name', Ship.inheritanceAttribute);
    });
    
    test("::inheritanceAttribute set to false disabled STI", function() {
        var Ship = Viking.Model.extend({
            inheritanceAttribute: false
        });
        var Battleship = Ship.extend('battleship');
        
        var bship = new Battleship();
        assert.strictEqual(false, Ship.inheritanceAttribute);
        assert.strictEqual(Battleship, bship.baseModel);
    });

});