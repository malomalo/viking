import * as Backbone from 'backbone';
import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../../../viking';

module('Viking.Model#paramRoot', {}, () => {

    test("instance.paramRoot returns underscored modelName", function() {
        var Model = Viking.Model.extend('model');
        var model = new Model();
    
        assert.equal(model.paramRoot(), 'model');

        Model = Viking.Model.extend('namespaced/model');
        model = new Model();
        assert.equal(model.paramRoot(), 'namespaced_model');
    });
    
    test("instance.paramRoot returns underscored baseModel.modelName when used as STI", function() {
        var Boat = Viking.Model.extend('boat');
        var Carrier = Boat.extend('boat');
        var model = new Carrier();
    
        assert.equal(model.paramRoot(), 'boat');
    });

});