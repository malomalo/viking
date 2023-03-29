import * as assert from 'assert';
import VikingRecord from '@malomalo/viking/record';

describe('Viking.Record::urlRoot', () => {

    it("returns an URL based on modelName", () => {
        class Model extends VikingRecord { }
        assert.equal(Model.urlRoot(), '/models');

        class MyModel extends VikingRecord { }
        // var Model = Viking.Record.extend('namespaced/model');
        assert.equal(MyModel.urlRoot(), '/my_models');
    });

    it("returns an URL based on #path set on the model", () => {
        class Model extends VikingRecord {
            static path = '/buoys';
        }
        assert.equal(Model.urlRoot(), '/buoys');
    });
    
    it("returns an URL based on #namespace set on the model", () => {
        class Boat extends VikingRecord {
            static namespace = 'Navy';
        }
        assert.equal(Boat.urlRoot(), '/navy/boats');
    });

    // STI test
    it("returns an URL based on modelName of the baseClass", () => {
        class Ship extends VikingRecord { }
        class Carrier extends Ship { }

        assert.equal(Carrier.urlRoot(), '/ships');
    });

    it("returns an URL based on #path set on the baseClass", function () {
        class Ship extends VikingRecord {
            static path = '/myships';
        }
        class Carrier extends Ship { }

        assert.equal(Carrier.urlRoot(), '/myships');
    });

    it("returns an URL based on #path set on the sti model", function () {
        class Ship extends VikingRecord { }
        class Carrier extends Ship {
            static path = '/carriers';
        }

        assert.equal(Carrier.urlRoot(), '/carriers');
    });

});

