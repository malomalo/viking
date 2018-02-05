import * as Backbone from 'backbone';
import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../../../viking';

module('Viking.Model#updateAttributes', {}, () => {

    test("#updateAttributes(data) calls #save", async () => {
        await new Promise((resolve) => {
        
            var model = new Viking.Model();
            model.save = function (data, options) {
                assert.deepEqual(data, {key: 'value'});
                assert.deepEqual(options, {patch: true});
                resolve();
            }
        
            model.updateAttributes({key: 'value'});
        });
    });
    
    test("#updateAttributes(data, options) calls #save", async () => {
        await new Promise((resolve) => {
        
            var model = new Viking.Model();
            model.save = function (data, options) {
                assert.deepEqual(data, {key: 'value'});
                assert.deepEqual(options, {patch: true, option: 1});
                resolve();
            }
        
            model.updateAttributes({key: 'value'}, {option: 1});
        });
    });

});