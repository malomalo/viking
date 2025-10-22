import assert from 'assert';
import VikingRecord from 'viking/record';

describe('Viking.Record#paramRoot', () => {

    it("returns underscored modelName", () => {
        class Model extends VikingRecord {

        }
        let model = new Model();

        assert.equal(model.paramRoot(), 'model');

        // Model = Viking.Model.extend('namespaced/model');
        // model = new Model();
        // assert.equal(model.paramRoot(), 'namespaced_model');
    });
    
    it("returns lowest modelName for namespace", () => {
        class Boat extends VikingRecord {
            static namespace = 'Navy';
        }
        let boat = new Boat();

        assert.equal(boat.paramRoot(), 'navy_boat');
    });

    it("instance.paramRoot returns underscored baseClass.modelName when used as STI", () => {
        class Boat extends VikingRecord { }
        class Carrier extends Boat { }
        let model = new Carrier();

        assert.equal(model.paramRoot(), 'boat');
    });
});

