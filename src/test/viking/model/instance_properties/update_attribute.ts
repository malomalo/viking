import * as Backbone from 'backbone';
import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../../../viking';

module('Viking.Model#updateAttribute', {}, () => {

    test("#updateAttribute(key, data) calls #updateAttributes", async () => {
        await new Promise((resolve) => {
        
            var model = new Viking.Model();
            model.updateAttributes = function (data, options) {
                assert.deepEqual(data, {key: 'value'});
                assert.equal(undefined, options);
                resolve();
            }
        
            model.updateAttribute('key', 'value');
        });
    });
    
    test("#updateAttribute(key, data, options) calls #updateAttributes", async () => {
        await new Promise((resolve) => {
        
            var model = new Viking.Model();
            model.updateAttributes = function (data, options) {
                assert.deepEqual(data, {key: 'value'});
                assert.deepEqual(options, {option: 'key'});
                resolve();
            }
        
            model.updateAttribute('key', 'value', {option: 'key'});
        });
    });

});