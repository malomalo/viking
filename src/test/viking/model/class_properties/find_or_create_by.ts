import * as Backbone from 'backbone';
import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../../../viking';

let xhr: any;
let requests: any[] = [];

module('Viking.Model::findOrCreateBy', {
    beforeEach: function() {
        requests = [];
        xhr = sinon.useFakeXMLHttpRequest();
        xhr.onCreate = (xhr: any) => requests.push(xhr);
    },
    afterEach: function() {
        xhr.restore();
    }
}, () => {
    test("::findOrCreateBy(attributes) find a model that exits", async () => {
        await new Promise((resolve) => {
        
            let Ship = Viking.Model.extend('ship');
            var relient = new Ship({name: 'Relient'});
        
            let ShipCollection = Viking.Collection.extend({
                fetch: function (options) {
                    options.success(new ShipCollection([relient]));
                }
            });
        
            Ship.findOrCreateBy({name: 'Relient'}, {
                success: function (model) {
                    assert.strictEqual(model, relient);
                    resolve();
                }
            });
        });
    });
    
    test("::findOrCreateBy(attributes) without a success callback finds a model that exits", async () => {
        let Ship = Viking.Model.extend('ship');
    
        let ShipCollection = Viking.Collection.extend({
            fetch: function (options) {
                options.success(new ShipCollection([{name: 'Relient'}]));
                assert.ok(false);
            }
        });
    
        Ship.findOrCreateBy({name: 'Relient'});
        assert.ok(true);
    });
    
    test("::findOrCreateBy(attributes) calls create when the model doesn't exist", async () => {
        await new Promise((resolve) => {
        
            let Ship = Viking.Model.extend('ship');
            let ShipCollection = Viking.Collection.extend({
                fetch: function (options) {
                    options.success(new ShipCollection([]));
                }
            });
        
            Ship.create = function (attributes, options) {
                assert.deepEqual(attributes, {name: 'Relient'});
                assert.deepEqual(options, {option: 1});
                resolve();
            };
        
            Ship.findOrCreateBy({name: 'Relient'}, {option: 1});
        });
    });
});