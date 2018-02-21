import * as Backbone from 'backbone';
import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../../../../viking';

module('Viking.model#unset - hasMany', {}, () => {

    // setting attributes on a model coerces relations
    test("#set(key) unsets a hasMany relationship", function () {
        let Ship = Viking.Model.extend({ hasMany: ['ships'] });
        let ShipCollection = Viking.Collection.extend({ model: Ship });

        Viking.context['Ship'] = Ship;
        Viking.context['ShipCollection'] = ShipCollection;

        var a = new Ship();
        a.set('ships', [{}, {}]);

        a.unset('ships');
        assert.ok(a.get('ships') instanceof ShipCollection);
        assert.equal(0, a.get('ships').length);

        delete Viking.context['Ship'];
        delete Viking.context['ShipCollection'];
    });

});
