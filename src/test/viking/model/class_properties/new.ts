import * as Backbone from 'backbone';
import * as _ from 'underscore';
import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../../../viking';

module('Viking.Model::new', {}, () => {

    test('::new sets modelName on the instance', () => {
        const Ship = Viking.Model.extend('ship');

        assert.propEqual(_.omit((new Ship()).modelName, 'model'), {
            collection: 'ships',
            collectionName: 'ShipCollection',
            element: 'ship',
            human: 'Ship',
            name: 'Ship',
            paramKey: 'ship',
            plural: 'ships',
            routeKey: 'ships',
            singular: 'ship',
            title: 'Ship'
        });

        const Namespaced = {};
        const Model = Viking.Model.extend('namespaced/model');
        assert.propEqual(_.omit((new Model()).modelName, 'model'), {
            collection: 'namespaced_models',
            collectionName: 'Namespaced.ModelCollection',
            element: 'model',
            human: 'Model',
            name: 'Namespaced.Model',
            paramKey: 'namespaced_model',
            plural: 'namespaced_models',
            routeKey: 'namespaced_models',
            singular: 'namespaced_model',
            title: 'Model'
        });
    });

    test('::new sets associations on the instance as a refernce to the associations on the Class', () => {
        const Ship = Viking.Model.extend({ hasMany: [['ships', { collectionName: 'MyCollection' }]] });
        const MyCollection = Viking.Collection.extend();

        Viking.context['Ship'] = Ship;
        Viking.context['MyCollection'] = MyCollection;

        const myship = new Ship();
        assert.strictEqual(myship.associations, Ship.associations);

        delete Viking.context['Ship'];
        delete Viking.context['MyCollection'];
    });

    test('::new(attrs) does coercions', () => {
        const Model = Viking.Model.extend({
            schema: {
                date: { type: 'date' }
            }
        });

        const a = new Model({ date: '2013-04-10T21:24:28+00:00' });
        assert.equal(a.get('date').valueOf(), new Date(1365629068000).valueOf());
    });

    test('::new(attrs) coerces hasMany relations', () => {
        const Ship = Viking.Model.extend({ hasMany: ['ships'] });
        const ShipCollection = Viking.Collection.extend({ model: Ship });

        Viking.context['Ship'] = Ship;
        Viking.context['ShipCollection'] = ShipCollection;

        const a = new Ship({ ships: [{}, {}] });
        assert.ok(a.get('ships') instanceof ShipCollection);
        assert.equal(a.get('ships').length, 2);
        assert.ok(a.get('ships').first() instanceof Ship);

        delete Viking.context['Ship'];
        delete Viking.context['ShipCollection'];
    });

    test('::new(attrs) coerces belongsTo relations', () => {
        const Ship = Viking.Model.extend({ belongsTo: ['ship'] });

        Viking.context['Ship'] = Ship;
        const a = new Ship({ ship: {} });
        assert.ok(a.get('ship') instanceof Ship);
        delete Viking.context['Ship'];
    });

    test('::new(attrs) sets hasMany relations to an empty collection if not in attrs', () => {
        const Ship = Viking.Model.extend('ship', { hasMany: ['ships'] });
        const ShipCollection = Viking.Collection.extend({ model: Ship });

        Viking.context['Ship'] = Ship;
        Viking.context['ShipCollection'] = ShipCollection;

        const a = new Ship();
        assert.ok(a.get('ships') instanceof ShipCollection);
        assert.equal(a.get('ships').length, 0);

        delete Viking.context['Ship'];
        delete Viking.context['ShipCollection'];
    });

    // STI
    test('::new(attrs) on subtype sets the type to the submodel type', () => {
        const Account = Viking.Model.extend('account');
        const Agent = Account.extend('agent');

        const agent = new Agent();
        assert.equal('Agent', agent.get('type'));
    });

    test('::new(attrs) on model sets the type if there are submodels', () => {
        const Account = Viking.Model.extend('account');
        Viking.context['Account'] = Account;

        const Agent = Account.extend('agent');
        Viking.context['Agent'] = Agent;

        const account = new Account();
        assert.equal('Account', account.get('type'));

        delete Viking.context['Agent'];
        delete Viking.context['Account'];
    });

    test('::new(attrs) with type set to a sub-type returns subtype', () => {
        const Account = Viking.Model.extend('account');
        Viking.context['Account'] = Account;

        const Agent = Account.extend('agent');
        Viking.context['Agent'] = Agent;

        const agent = new Account({ type: 'agent' });
        assert.ok(agent instanceof Agent);
        assert.ok(agent instanceof Account);

        delete Viking.context['Agent'];
        delete Viking.context['Account'];
    });

    test('::new() with default type', () => {
        const Account = Viking.Model.extend('account', {
            defaults: {
                type: 'agent'
            }
        });
        Viking.context['Account'] = Account;

        const Agent = Account.extend('agent');
        Viking.context['Agent'] = Agent;

        const agent = new Account();
        assert.ok(agent instanceof Agent);

        delete Viking.context['Agent'];
        delete Viking.context['Account'];
    });

});
