import * as Backbone from 'backbone';
import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../../../viking';

let xhr: any;
let requests: any[] = [];

module('Viking.Model::findOrCreateBy', {
    afterEach() {
        xhr.restore();
    },
    beforeEach() {
        requests = [];
        xhr = sinon.useFakeXMLHttpRequest();
        xhr.onCreate = (xhr: any) => requests.push(xhr);
    }
}, () => {
    test('::findOrCreateBy(attributes) find a model that exits', async () => {
        await new Promise((resolve) => {
            const Ship = Viking.Model.extend('ship');
            const relient = new Ship({ name: 'Relient' });

            const ShipCollection = Viking.Collection.extend({
                fetch(options) {
                    options.success(new ShipCollection([relient]));
                }
            });

            window['Ship'] = Ship;
            window['ShipCollection'] = ShipCollection;

            Ship.findOrCreateBy({ name: 'Relient' }, {
                success(model) {
                    assert.strictEqual(model, relient);
                    resolve();
                }
            });

            delete window['Ship'];
            delete window['ShipCollection'];
        });
    });

    test('::findOrCreateBy(attributes) without a success callback finds a model that exits', async () => {
        const Ship = Viking.Model.extend('ship');
        const ShipCollection = Viking.Collection.extend({
            fetch(options) {
                options.success(new ShipCollection([{ name: 'Relient' }]));
                assert.ok(true);
            }
        });

        window['Ship'] = Ship;
        window['ShipCollection'] = ShipCollection;

        Ship.findOrCreateBy({ name: 'Relient' });
        assert.ok(true);

        delete window['Ship'];
        delete window['ShipCollection'];
    });

    test('::findOrCreateBy(attributes) calls create when the model doesn\'t exist', async () => {
        const Ship = Viking.Model.extend('ship');
        const ShipCollection = Viking.Collection.extend({
            fetch(options) {
                options.success(new ShipCollection([]));
            }
        });

        window['Ship'] = Ship;
        window['ShipCollection'] = ShipCollection;

        await new Promise((resolve) => {
            Ship.create = (attributes, options) => {
                assert.deepEqual(attributes, { name: 'Relient' });
                assert.deepEqual(options, { option: 1 });
                resolve();
            };

            Ship.findOrCreateBy({ name: 'Relient' }, { option: 1 });
        });

        delete window['Ship'];
        delete window['ShipCollection'];

    });
});
