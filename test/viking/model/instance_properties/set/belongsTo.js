import Viking from './../../../../../src/viking';

(function () {
    module("Viking.model#set - belongsTo");

    // setting attributes on a model coerces relations
    test("#set(key, val) coerces belongsTo relations", function() {
        let Ship = Viking.Model.extend({ belongsTo: ['ship'] });
        
        var a = new Ship();
        a.set('ship', {});
        ok(a.get('ship') instanceof Ship);
    });

    test("#set({key, val}) coerces belongsTo relations", function() {
        let Ship = Viking.Model.extend({ belongsTo: ['ship'] });
    
        var a = new Ship();
        a.set({ship: {}});
        ok(a.get('ship') instanceof Ship);
    });

    test("#set(key, val) sets relation id", function() {
        let Ship = Viking.Model.extend({ belongsTo: ['ship'] });
        var a = new Ship();
        
        a.set('ship', {id: 12});
        equal(12, a.get('ship_id'));
        
        a.set('ship', {});
        equal(null, a.get('ship_id'));
    });

    test("#set({key, val}) sets relation id", function() {
        let Ship = Viking.Model.extend({ belongsTo: ['ship'] });
        var a = new Ship();
        
        a.set({ship: {id: 12}})
        equal(12, a.get('ship_id'));
        
        a.set({ship: {}});
        equal(null, a.get('ship_id'));
    });
    
    test("#unset(key) unsets relation id", function() {
        let Ship = Viking.Model.extend({ belongsTo: ['ship'] });
        var a = new Ship();
        
        a.set('ship', {id: 12});
        equal(12, a.get('ship_id'));
        
        a.unset('ship');
        equal(null, a.get('ship_id'));
    });
    
    test("::set(key, val) sets polymorphic belongsTo relation & sets appropriate keys", function () {
        let Account = Viking.Model.extend('account');
        let Ship = Viking.Model.extend('ship');
        let Photo = Viking.Model.extend({ belongsTo: [['subject', {polymorphic: true}]] });

        var a = new Photo();
        var ship = new Ship({id: 10});
        a.set({subject: ship});
        ok(a.get('subject') instanceof Ship);
        equal(a.get('subject_id'), 10);
        equal(a.get('subject_type'), 'Ship');
        
        var account = new Account({id: 1});
        a.set({subject: account});
        ok(a.get('subject') instanceof Account);
        equal(a.get('subject_id'), 1);
        equal(a.get('subject_type'), 'Account');
    });
    
    test("::set({key: {}, key_type: KLASS}) coerces polymorphic belongsTo relations useing type declared in model", function () {
        let Ship = Viking.Model.extend('ship');
        let Photo = Viking.Model.extend({ belongsTo: [['subject', {polymorphic: true}]] });

        var a = new Photo();
        a.set({subject: {id: 10}, subject_type: 'ship'});
        ok(a.get('subject') instanceof Ship);
        equal(a.get('subject').get('id'), 10);
        equal(a.get('subject_type'), 'ship');
    });
    
}());