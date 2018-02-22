import * as Backbone from 'backbone';
import * as _ from 'underscore';
import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../../../viking';

module('Viking.model::extend', {}, () => {

    // setting attributes on a model coerces relations
    test("::extend acts like normal Backbone.Model", function () {
        var Model = Viking.Model.extend({ key: 'value' }, { key: 'value' });

        assert.equal(Model.key, 'value');
        assert.equal((new Model()).key, 'value');
    });

    test("::extend with modelName", function () {
        var Model = Viking.Model.extend('model');

        assert.propEqual(_.omit(Model.modelName, 'model'), {
            name: 'Model',
            element: 'model',
            human: 'Model',
            paramKey: 'model',
            plural: 'models',
            routeKey: 'models',
            singular: 'model',
            collection: 'models',
            collectionName: 'ModelCollection',
            title: 'Model'
        });
        assert.propEqual(_.omit((new Model()).modelName, 'model'), {
            name: 'Model',
            element: 'model',
            human: 'Model',
            paramKey: 'model',
            plural: 'models',
            routeKey: 'models',
            singular: 'model',
            collection: 'models',
            collectionName: 'ModelCollection',
            title: 'Model'
        });
    });

    test("::extend initalizes the assocations", function () {
        let Model = Viking.Model.extend('ship');

        assert.deepEqual(Model.associations, {});
    });

    test("::extend adds hasMany relationships to associations", function () {
        let Ship = Viking.Model.extend({ hasMany: ['ships'] });

        assert.equal(Ship.associations['ships'].name, 'ships');
        assert.equal(Ship.associations['ships'].macro, 'hasMany');
        assert.deepEqual(Ship.associations['ships'].options, {});
        assert.equal(Ship.associations['ships'].collectionName, 'ShipCollection');

    });

    test("::extend adds hasMany relationships with options to associations", function () {
        let Ship = Viking.Model.extend({ hasMany: [['ships', { collectionName: 'MyCollection' }]] });

        assert.equal(Ship.associations['ships'].name, 'ships');
        assert.equal(Ship.associations['ships'].macro, 'hasMany');
        assert.deepEqual(Ship.associations['ships'].options, { collectionName: 'MyCollection' });
        assert.equal(Ship.associations['ships'].collectionName, 'MyCollection');

    });

    test("::extend adds belongsTo relationships to associations", function () {
        let Ship = Viking.Model.extend({ belongsTo: ['ship'] });
        Viking.context['Ship'] = Ship;

        assert.equal(Ship.associations['ship'].name, 'ship');
        assert.equal(Ship.associations['ship'].macro, 'belongsTo');
        assert.deepEqual(Ship.associations['ship'].options, {});
        assert.propEqual(_.omit(Ship.associations['ship'].modelName, 'model'), {
            name: 'Ship',
            element: 'ship',
            human: 'Ship',
            paramKey: 'ship',
            plural: 'ships',
            routeKey: 'ships',
            singular: 'ship',
            collection: 'ships',
            collectionName: 'ShipCollection',
            title: 'Ship'
        });

        delete Viking.context['Ship'];
    });

    test("::extend adds belongsTo relationships with options to associations", function () {
        let Ship = Viking.Model.extend({ belongsTo: [['ship', { modelName: 'Carrier' }]] });
        Viking.context['Ship'] = Ship;

        assert.equal(Ship.associations['ship'].name, 'ship');
        assert.equal(Ship.associations['ship'].macro, 'belongsTo');
        assert.deepEqual(Ship.associations['ship'].options, { modelName: 'Carrier' });
        assert.propEqual(Ship.associations['ship'].modelName, new Viking.Model.Name('carrier'));

        delete Viking.context['Ship'];
    });

    // STI
    // ========================================================================

    test("::extend a Viking.Model unions the hasMany relationships", function () {
        let Key = Viking.Model.extend('key');
        let Comment = Viking.Model.extend('comment');
        let Account = Viking.Model.extend('account', { hasMany: ['comments'] });
        let Agent = Account.extend('agent', { hasMany: ['keys'] });
        
        Viking.context['Key'] = Key;
        Viking.context['Comment'] = Comment;

        assert.deepEqual(['comments'], _.map(Account.associations, function(a) { return a["name"]; }));
        assert.deepEqual(['comments', 'keys'], _.map(Agent.associations, function(a) { return a["name"]; }).sort());

    });

    test("::extend a Viking.Model unions the belongsTo relationships", function () {
        let State = Viking.Model.extend('state');
        let Region = Viking.Model.extend('region');
        let Account = Viking.Model.extend('account', { belongsTo: ['state'] });
        let Agent = Account.extend('agent', { belongsTo: ['region'] });

        Viking.context['State'] = State;
        Viking.context['Region'] = Region;

        assert.deepEqual(['state'], _.map(Account.associations, function(a) { return a["name"]; }));
        assert.deepEqual(['region', 'state'], _.map(Agent.associations, function(a) { return a["name"]; }).sort());

    });

    test("::extend a Viking.Model unions the schema", function () {
        let Account = Viking.Model.extend('account', {
            schema: {
                created_at: { type: 'date' }
            }
        });

        let Agent = Account.extend('agent', {
            schema: {
                name: { type: 'string' }
            }
        });

        assert.deepEqual(Account.prototype.schema, {
            created_at: { type: 'date' }
        });
        assert.deepEqual(Agent.prototype.schema, {
            created_at: { type: 'date' },
            name: { type: 'string' }
        });

    });

    test("::extend a Viking.Model adds itself to the descendants", function () {
        let Account = Viking.Model.extend('account');
        let Agent = Account.extend('agent');

        assert.deepEqual(Account.descendants, [Agent]);
        assert.deepEqual(Agent.descendants, []);

    });

});