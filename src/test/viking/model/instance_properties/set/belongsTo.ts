import * as Backbone from 'backbone';
import 'qunit';
import * as sinon from 'sinon';

const { module, test, assert } = QUnit;

import { Viking } from '../../../../../viking';

module('Viking.model#set - belongsTo', {}, () => {

    // setting attributes on a model coerces relations
    test("#set(key, val) coerces belongsTo relations", function() {
        let Ship = Viking.Model.extend({ belongsTo: ['ship'] });
        
        var a = new Ship();
        a.set('ship', {});
        assert.ok(a.get('ship') instanceof Ship);
    });

    test("#set({key, val}) coerces belongsTo relations", function() {
        let Ship = Viking.Model.extend({ belongsTo: ['ship'] });
    
        var a = new Ship();
        a.set({ship: {}});
        assert.ok(a.get('ship') instanceof Ship);
    });

    test("#set(key, val) sets relation id", function() {
        let Ship = Viking.Model.extend({ belongsTo: ['ship'] });
        var a = new Ship();
        
        a.set('ship', {id: 12});
        assert.equal(12, a.get('ship_id'));
        
        a.set('ship', {});
        assert.equal(null, a.get('ship_id'));
    });

    test("#set({key, val}) sets relation id", function() {
        let Ship = Viking.Model.extend({ belongsTo: ['ship'] });
        var a = new Ship();
        
        a.set({ship: {id: 12}})
        assert.equal(12, a.get('ship_id'));
        
        a.set({ship: {}});
        assert.equal(null, a.get('ship_id'));
    });
    
    test("#unset(key) unsets relation id", function() {
        let Ship = Viking.Model.extend({ belongsTo: ['ship'] });
        var a = new Ship();
        
        a.set('ship', {id: 12});
        assert.equal(12, a.get('ship_id'));
        
        a.unset('ship');
        assert.equal(null, a.get('ship_id'));
    });
    
    test("::set(key, val) sets polymorphic belongsTo relation & sets appropriate keys", function () {
        let Account = Viking.Model.extend('account');
        let Ship = Viking.Model.extend('ship');
        let Photo = Viking.Model.extend({ belongsTo: [['subject', {polymorphic: true}]] });

        var a = new Photo();
        var ship = new Ship({id: 10});
        a.set({subject: ship});
        assert.ok(a.get('subject') instanceof Ship);
        assert.equal(a.get('subject_id'), 10);
        assert.equal(a.get('subject_type'), 'Ship');
        
        var account = new Account({id: 1});
        a.set({subject: account});
        assert.ok(a.get('subject') instanceof Account);
        assert.equal(a.get('subject_id'), 1);
        assert.equal(a.get('subject_type'), 'Account');
    });
    
    test("::set({key: {}, key_type: KLASS}) coerces polymorphic belongsTo relations useing type declared in model", function () {
        let Ship = Viking.Model.extend('ship');
        let Photo = Viking.Model.extend({ belongsTo: [['subject', {polymorphic: true}]] });

        var a = new Photo();
        a.set({subject: {id: 10}, subject_type: 'ship'});
        assert.ok(a.get('subject') instanceof Ship);
        assert.equal(a.get('subject').get('id'), 10);
        assert.equal(a.get('subject_type'), 'ship');
    });
    
});