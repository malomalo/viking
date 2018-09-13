import 'mocha';
import * as assert from 'assert';
import VikingModel from 'viking/model';

describe('Viking.Model::urlRoot', () => {

    it("returns an URL based on modelName", () => {
        class Model extends VikingModel { }
        assert.equal(Model.urlRoot(), '/models');

        class MyModel extends VikingModel { }
        // var Model = Viking.Model.extend('namespaced/model');
        assert.equal(MyModel.urlRoot(), '/my_models');
    });

    it("returns an URL based on #path set on the model", () => {
        class Model extends VikingModel {
            static path = '/buoys';
        }
        assert.equal(Model.urlRoot(), '/buoys');
    });

    // STI test
    it("returns an URL based on modelName of the baseModel", () => {
        class Ship extends VikingModel { }
        class Carrier extends Ship { }

        assert.equal(Carrier.urlRoot(), '/ships');
    });

    it("returns an URL based on #path set on the baseModel", function () {
        class Ship extends VikingModel {
            static path = '/myships';
        }
        class Carrier extends Ship { }

        assert.equal(Carrier.urlRoot(), '/myships');
    });

    it("returns an URL based on #path set on the sti model", function () {
        class Ship extends VikingModel { }
        class Carrier extends Ship {
            static path = '/carriers';
        }

        assert.equal(Carrier.urlRoot(), '/carriers');
    });

});

