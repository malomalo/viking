import * as Backbone from 'backbone';
import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../../../viking';

module('Viking.Model#inheritanceAttribute', {}, () => {

    test("#inheritanceAttribute get set when extending a Model", function() {
        var Ship = Viking.Model.extend();
        var ship = new Ship();
        
        assert.ok(ship.inheritanceAttribute);
    });
    
    test("::inheritanceAttribute default to `type`", function() {
        var Ship = Viking.Model.extend();
        var ship = new Ship();
                
        assert.equal('type', ship.inheritanceAttribute);
    });
    
    test("::inheritanceAttribute override", function() {
        var Ship = Viking.Model.extend({
            inheritanceAttribute: 'class_name'
        });
        var ship = new Ship();
        
        assert.equal('class_name', ship.inheritanceAttribute);
    });

});