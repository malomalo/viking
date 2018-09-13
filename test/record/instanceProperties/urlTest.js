import 'mocha';
import * as assert from 'assert';
import VikingModel from 'viking/model';

describe('Viking.Model#url', () => {

    it("/pluralModelName/id by default", () => {
        class Model extends VikingModel { }
        let model = new Model({id: 42});
        assert.equal(model.url(), '/models/42');
    });

    it("/pluralModelName/slug by overriding #toParam()", () => {
        class Model extends VikingModel {
            toParam() {
                return 'slug';
            }
        }
        let model = new Model({id: 42});

        assert.equal(model.url(), '/models/slug');
    });

    it('id is uri encoding', () => {
        class MyModel extends VikingModel {
            static path = '/collection';
        }
        let model = new MyModel();
        // assert.equal(model.url(), '/collection');
        model.setAttributes({id: '+1+'});
        assert.equal(model.url(), '/collection/%2B1%2B');
    });

    // STI test
    it("returns an URL based on modelName of the baseModel", () => {
        class Ship extends VikingModel { }
        class Carrier extends Ship { }

        let carrier = new Carrier({id: 42});
        assert.equal(carrier.url(), '/ships/42');
    });

    it('url when using urlRoot as a function to determine urlRoot at runtime', () => {
        class Model extends VikingModel {
            urlRoot = function() {
                return '/nested/' + this.readAttribute('parentId') + '/collection';
            };
        }

        let model = new Model({parentId: 1});
        // assert.equal(model.url(), '/nested/1/collection');
        model.setAttributes({id: 2});
        assert.equal(model.url(), '/nested/1/collection/2');
    });

});

