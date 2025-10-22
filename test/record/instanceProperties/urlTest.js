import assert from 'assert';
import VikingRecord from 'viking/record';

describe('Viking.Record#url', () => {

    it("/pluralModelName/id by default", () => {
        class Model extends VikingRecord { }
        let model = new Model({id: 42});
        assert.equal(model.url(), '/models/42');
    });

    it("/pluralModelName/slug by overriding #toParam()", () => {
        class Model extends VikingRecord {
            toParam() {
                return 'slug';
            }
        }
        let model = new Model({id: 42});

        assert.equal(model.url(), '/models/slug');
    });

    it('id is uri encoding', () => {
        class MyModel extends VikingRecord {
            static path = '/collection';
        }
        let model = new MyModel();
        // assert.equal(model.url(), '/collection');
        model.setAttributes({id: '+1+'});
        assert.equal(model.url(), '/collection/%2B1%2B');
    });

    // STI test
    it("returns an URL based on modelName of the baseClass", () => {
        class Ship extends VikingRecord { }
        class Carrier extends Ship { }

        let carrier = new Carrier({id: 42});
        assert.equal(carrier.url(), '/ships/42');
    });

    it('url when using urlRoot as a function to determine urlRoot at runtime', () => {
        class Model extends VikingRecord {
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

