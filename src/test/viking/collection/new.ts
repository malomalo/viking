import * as Backbone from 'backbone';
import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../../viking';

module('Viking.Collection::new', {}, () => {

    test("([], {order: ORDER}) sets ordering by calling #order(ORDER)", async () => {
        await new Promise((resolve) => {
        
            var Collection = Viking.Collection.extend({
                order: function(order) {
                    assert.equal(order, 'data');
                    resolve();
                }
            });
        
            var c = new Collection([], { order: 'data' });
        });
    });
    
    test("([], {order: ORDER}) calls #order with the options {silent: true}", async () => {
        await new Promise((resolve) => {
            
            var Collection = Viking.Collection.extend({
                order: function(order, options) {
                    assert.deepEqual(options, {silent: true});
                    resolve();
                }
            });
        
            new Collection([], { order: 'data' });
        });
    });

});