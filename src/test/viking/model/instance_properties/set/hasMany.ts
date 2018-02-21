import * as Backbone from 'backbone';
import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../../../../viking';

let Ship = Viking.Model.extend({ hasMany: ['ships'] });
let ShipCollection = Viking.Collection.extend({ model: Ship });

module('Viking.model#set - hasMany', {
    before() {
        Viking.context['Ship'] = Ship;
        Viking.context['ShipCollection'] = ShipCollection;
    },
    after() {
        delete Viking.context['Ship'];
        delete Viking.context['ShipCollection'];
    }
}, () => {

    // setting attributes on a model coerces relations
    test("#set(key, val) coerces hasMany relations", function () {
        var a = new Ship();
        a.set('ships', [{}, {}]);
        assert.ok(a.get('ships') instanceof ShipCollection);
        assert.equal(a.get('ships').length, 2);
        assert.ok(a.get('ships').first() instanceof Ship);
    });

    test("#set({key, val}) coerces hasMany relations", function () {
        var a = new Ship();
        a.set({ ships: [{}, {}] });
        assert.ok(a.get('ships') instanceof ShipCollection);
        assert.equal(a.get('ships').length, 2);
        assert.ok(a.get('ships').first() instanceof Ship);
    });


    test("#set(belongsToRelation, data) updates the current collection and doesn't create a new one", function () {
        var a = new Ship();
        a.set({ ships: [{ id: 1 }, {}, { id: 3 }] });
        a.get('ships').on("add", function () { assert.ok(true); });
        a.get('ships').get(1).on("change", function () { assert.ok(true); });
        a.get('ships').on("remove", function () { assert.ok(true); });

        var oldCollection = a.get('ships');
        a.set({ ships: [{ id: 1, key: 'value' }, { id: 2 }] });

        assert.strictEqual(oldCollection, a.get('ships'));
        assert.deepEqual([1, 2], a.get('ships').map(function (s) { return s.id; }));
        a.get('ships').off();
        a.get('ships').get(1).off();
    });

    test("#set(hasManyRelation, data) updates the current collection and doesn't create a new one", function () {
        let Fleet = Viking.Model.extend({ hasMany: ['ships'] });
        Viking.context['Fleet'] = Fleet;

        var f = new Fleet();
        var s = new Ship();

        f.set({ ships: [s] });
        assert.strictEqual(s.collection, f.get('ships'));

        delete Viking.context['Fleet'];
    });

    test("#set({type: klass}) initilizes hasMany associations", function () {
        let Account = Viking.Model.extend('account');
        let Agent = Account.extend('agent', { hasMany: ['ships'] });

        Viking.context['Account'] = Account;
        Viking.context['Agent'] = Agent;

        var account = new Account();
        assert.ok(!(account instanceof Agent));
        account.set({ type: 'agent' });
        assert.ok(account instanceof Agent);
        assert.ok(account.get('ships') instanceof ShipCollection);

        delete Viking.context['Account'];
        delete Viking.context['Agent'];
    });


});
