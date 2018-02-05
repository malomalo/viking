import * as Backbone from 'backbone';
import * as _ from 'underscore';
import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../../../viking';

module('Viking.Model#set', {}, () => {

    test("#set({type: klass}) changes the object prototype of klass", function() {
        let Account = Viking.Model.extend('account');
        let Agent   = Account.extend('agent');
        
        var account = new Account();
        assert.ok(!(account instanceof Agent));
        account.set({type: 'agent'});
        
        assert.ok(account instanceof Agent);
    });

    test("#set({type: klass}) changes the modelName on instance to modelName of klass", function() {
        let Account = Viking.Model.extend('account');
        let Agent   = Account.extend('agent');
        
        var account = new Account();
        assert.ok(!(account instanceof Agent));
        account.set({type: 'agent'});
        
        assert.strictEqual(Agent.modelName, account.modelName);
        assert.propEqual(_.omit(account.modelName, 'model'), {
            name: 'Agent',
            element: 'agent',
            human: 'Agent',
            paramKey: 'agent',
            plural: 'agents',
            routeKey: 'agents',
            singular: 'agent',
            collection: 'agents',
            collectionName: 'AgentCollection'
        });
    });
    
    test("::set({type: string}) doesn't change the object prototype when inheritanceAttribute set to false", function() {
        var Ship = Viking.Model.extend('ship', {
            inheritanceAttribute: false
        });
        var Battleship = Ship.extend('battleship', {});
        
        var bship = new Battleship();
        bship.set({type: 'ship'});
        
        assert.strictEqual(Battleship, bship.baseModel);
    });

    test("#set({type: klass}) doesn't change the modelName on instance to modelName of klass when inheritanceAttribute set to false", function() {
        var Ship = Viking.Model.extend('ship', {
            inheritanceAttribute: false
        });
        var Battleship = Ship.extend('battleship', {});
        
        var bship = new Battleship();
        bship.set({type: 'ship'});
        
        assert.strictEqual(Battleship.modelName, bship.modelName);
    });
    
});
