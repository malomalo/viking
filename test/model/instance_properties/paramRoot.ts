import * as assert from 'assert';
import 'mocha';
import * as _ from 'lodash';
import {Model as VikingModel} from '../../../src/viking/model';

describe('Viking.Model#paramRoot', () => {

    it("returns underscored modelName", () => {
        class Model extends VikingModel {

        }
        let model = new Model();

        assert.equal(model.paramRoot(), 'model');

        // Model = Viking.Model.extend('namespaced/model');
        // model = new Model();
        // assert.equal(model.paramRoot(), 'namespaced_model');
    });

    it("instance.paramRoot returns underscored baseModel.modelName when used as STI", () => {
        class Boat extends VikingModel { }
        class Carrier extends Boat { }
        let model = new Carrier();

        assert.equal(model.paramRoot(), 'boat');
    });
});

