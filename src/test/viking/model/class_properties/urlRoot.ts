import * as Backbone from 'backbone';
import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../../../viking';

module('Viking.Model::urlRoot', {}, () => {

    test("::urlRoot returns an URL based on modelName", function() {
        var Model = Viking.Model.extend('model');
        assert.equal(Model.urlRoot(), '/models');

        var Model = Viking.Model.extend('namespaced/model');
        assert.equal(Model.urlRoot(), '/namespaced_models');
    });
    
    test("::urlRoot returns an URL based on #urlRoot set on the model", function () {
        var Model = Viking.Model.extend('model', {
            urlRoot: '/buoys'
        });
        assert.equal(Model.urlRoot(), '/buoys');
    });

    // STI test
    test("::urlRoot returns an URL based on modelName of the baseModel", function() {
        var Ship = Viking.Model.extend('ship');
        var Carrier = Ship.extend();
        
        assert.equal(Carrier.urlRoot(), '/ships');
    });

    test("::urlRoot returns an URL based on #urlRoot set on the baseModel", function () {
        var Ship = Viking.Model.extend('ship', {
            urlRoot: '/myships'
        });
        var Carrier = Ship.extend();

        assert.equal(Carrier.urlRoot(), '/myships');
    });


    test("::urlRoot returns an URL based on #urlRoot set on the sti model", function () {
        var Ship = Viking.Model.extend('ship');
        var Carrier = Ship.extend({
            urlRoot: '/carriers'
        });

        assert.equal(Carrier.urlRoot(), '/carriers');
    });

});