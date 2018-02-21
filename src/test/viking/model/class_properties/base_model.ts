import * as Backbone from 'backbone';
import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../../../viking';

module('Viking.Model::baseModel', {}, () => {

    test("::baseModel get's set to self when extending Viking.Model", function() {
        var Ship = Viking.Model.extend('ship');

        assert.strictEqual(Ship, Ship.baseModel);
    });

    test("::baseModel get's set to self when extending an abstract Viking.Model", function() {
        var RussianShip = Viking.Model.extend('russianShip', {
            abstract: true
        });
        var Ship = RussianShip.extend('ship');

        assert.strictEqual(Ship, Ship.baseModel);
    });

    test("::baseModel get's set to parent Model when extending a Viking.Model", function() {
        var Ship = Viking.Model.extend('ship');
        var Carrier = Ship.extend('carrier');

        assert.strictEqual(Ship, Carrier.baseModel);
    });

});