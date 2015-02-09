(function () {
    module("Viking.model#set - belongsTo");

    // setting attributes on a model coerces relations
    test("#set(key, val) coerces belongsTo relations", function() {
        Ship = Viking.Model.extend({ belongsTo: ['ship'] });
        
        var a = new Ship();
        a.set('ship', {});
        ok(a.get('ship') instanceof Ship);
    
        delete Ship;
    });

    test("#set({key, val}) coerces belongsTo relations", function() {
        Ship = Viking.Model.extend({ belongsTo: ['ship'] });
    
        var a = new Ship();
        a.set({ship: {}});
        ok(a.get('ship') instanceof Ship);
    
        delete Ship;
    });

    test("#set(key, val) sets relation id", function() {
        Ship = Viking.Model.extend({ belongsTo: ['ship'] });
        var a = new Ship();
        
        a.set('ship', {id: 12});
        equal(12, a.get('ship_id'));
        
        a.set('ship', {});
        equal(null, a.get('ship_id'));
    
        delete Ship;
    });

    test("#set({key, val}) sets relation id", function() {
        Ship = Viking.Model.extend({ belongsTo: ['ship'] });
        var a = new Ship();
        
        a.set({ship: {id: 12}})
        equal(12, a.get('ship_id'));
        
        a.set({ship: {}});
        equal(null, a.get('ship_id'));
        
        delete Ship;
    });
    
    test("#unset(key) unsets relation id", function() {
        Ship = Viking.Model.extend({ belongsTo: ['ship'] });
        var a = new Ship();
        
        a.set('ship', {id: 12});
        equal(12, a.get('ship_id'));
        
        a.unset('ship');
        equal(null, a.get('ship_id'));
    
        delete Ship;
    });
    
    test("::set(key, val) sets polymorphic belongsTo relation & sets appropriate keys", function () {
        Account = Viking.Model.extend('account');
        Ship = Viking.Model.extend('ship');
        Photo = Viking.Model.extend({ belongsTo: [['subject', {polymorphic: true}]] });

        var a = new Photo();
        var ship = new Ship({id: 10});
        a.set({subject: ship});
        ok(a.get('subject') instanceof Ship);
        equal(a.get('subject_id'), 10);
        equal(a.get('subject_type'), 'ship');
        
        var account = new Account({id: 1});
        a.set({subject: account});
        ok(a.get('subject') instanceof Account);
        equal(a.get('subject_id'), 1);
        equal(a.get('subject_type'), 'account');
        
        delete Ship;
        delete Account;
        delete Photo;
    });
    
    test("::set({key: {}, key_type: KLASS}) coerces polymorphic belongsTo relations useing type declared in model", function () {
        Ship = Viking.Model.extend('ship');
        Photo = Viking.Model.extend({ belongsTo: [['subject', {polymorphic: true}]] });

        var a = new Photo();
        a.set({subject: {id: 10}, subject_type: 'ship'});
        ok(a.get('subject') instanceof Ship);
        equal(a.get('subject').get('id'), 10);
        equal(a.get('subject_type'), 'ship');
        
        delete Ship;
        delete Photo;
    });
    
}());