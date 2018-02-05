import * as Backbone from 'backbone';
import * as _ from 'underscore';
import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../../../viking';

module('Viking.Model::new', {}, () => {

    test("::new sets modelName on the instance", function() {
        var Ship = Viking.Model.extend('ship');
        
        assert.propEqual(_.omit((new Ship).modelName, 'model'), {
            name: 'Ship',
            element: 'ship',
            human: 'Ship',
            paramKey: 'ship',
            plural: 'ships',
            routeKey: 'ships',
            singular: 'ship',
            collection: 'ships',
            collectionName: 'ShipCollection'
        });

        var Namespaced = {};
        var Model = Viking.Model.extend('namespaced/model');
        assert.propEqual(_.omit((new Model).modelName, 'model'), {
            'name': 'Namespaced.Model',
            singular: 'namespaced_model',
            plural: 'namespaced_models',
            routeKey: 'namespaced_models',
            paramKey: 'namespaced_model',
            human: 'Model',
            element: 'model',
            collection: 'namespaced_models',
            collectionName: 'Namespaced.ModelCollection'
        });
    });
    
    test("::new sets associations on the instance as a refernce to the associations on the Class", function() {
        let Ship = Viking.Model.extend({ hasMany: [['ships', {collectionName: 'MyCollection'}]] });
        let MyCollection = Viking.Collection.extend();
        
        var myship = new Ship();
        assert.strictEqual(myship.associations, Ship.associations);
    });
    
    test("::new(attrs) does coercions", function() {
        let Model = Viking.Model.extend({ schema: {
            date: {type: 'date'}
        } });
    
        var a = new Model({'date': "2013-04-10T21:24:28+00:00"});
        assert.equal(a.get('date').valueOf(), new Date(1365629068000).valueOf());
    });
    
    test("::new(attrs) coerces hasMany relations", function() {
        let Ship = Viking.Model.extend({ hasMany: ['ships'] });
        let ShipCollection = Viking.Collection.extend({ model: Ship });
    
        var a = new Ship({ships: [{}, {}]});
        assert.ok(a.get('ships') instanceof ShipCollection);
        assert.equal(a.get('ships').length, 2);
        assert.ok(a.get('ships').first() instanceof Ship);
    });

    test("::new(attrs) coerces belongsTo relations", function() {
        let Ship = Viking.Model.extend({ belongsTo: ['ship'] });
        
        var a = new Ship({'ship': {}});
        assert.ok(a.get('ship') instanceof Ship);
    });

    test("::new(attrs) sets hasMany relations to an empty collection if not in attrs", function() {
        let Ship = Viking.Model.extend('ship', { hasMany: ['ships'] });
        let ShipCollection = Viking.Collection.extend({ model: Ship });
    
        var a = new Ship();
        assert.ok(a.get('ships') instanceof ShipCollection);
        assert.equal(a.get('ships').length, 0);
    });
    
    // STI
    test("::new(attrs) on subtype sets the type to the submodel type", function() {
        let Account = Viking.Model.extend('account');
        let Agent = Account.extend('agent');
        
        var agent = new Agent();
        assert.equal('Agent', agent.get('type'));
    });
    
    test("::new(attrs) on model sets the type if there are submodels", function() {
        let Account = Viking.Model.extend('account');
        let Agent = Account.extend('agent');
        
        var account = new Account();
        assert.equal('Account', account.get('type'));
    });
    
    test("::new(attrs) with type set to a sub-type returns subtype", function() {
        let Account = Viking.Model.extend('account');
        let Agent = Account.extend('agent');
        
        var agent = new Account({type: 'agent'});
        assert.ok(agent instanceof Agent);
        assert.ok(agent instanceof Account);
    });
    
    test("::new() with default type", function() {
        let Account = Viking.Model.extend('account', {
            defaults: {
                type: 'agent'
            }
        });
        let Agent = Account.extend('agent');
        
        var agent = new Account();
        assert.ok(agent instanceof Agent);
    });
    
});