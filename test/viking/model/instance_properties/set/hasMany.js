(function () {
    module("Viking.model#set - hasMany");

    // setting attributes on a model coerces relations
    test("#set(key, val) coerces hasMany relations", function() {
        Ship = Viking.Model.extend({ hasMany: ['ships'] });
        ShipCollection = Viking.Collection.extend({ model: Ship });

        var a = new Ship();
        a.set('ships', [{}, {}]);
        ok(a.get('ships') instanceof ShipCollection);
        equal(a.get('ships').length, 2);
        ok(a.get('ships').first() instanceof Ship);

        delete Ship;
        delete ShipCollection;
    });

    test("#set({key, val}) coerces hasMany relations", function() {
        Ship = Viking.Model.extend({ hasMany: ['ships'] });
        ShipCollection = Viking.Collection.extend({ model: Ship });

        var a = new Ship();
        a.set({ships: [{}, {}]});
        ok(a.get('ships') instanceof ShipCollection);
        equal(a.get('ships').length, 2);
        ok(a.get('ships').first() instanceof Ship);

        delete Ship;
        delete ShipCollection;
    });


    test("#set(belongsToRelation, data) updates the current collection and doesn't create a new one", function() {
        expect(6);

        Ship = Viking.Model.extend({ hasMany: ['ships'] });
        ShipCollection = Viking.Collection.extend({ model: Ship });

        var a = new Ship();
        a.set({ships: [{id: 1}, {}, {id: 3}]});
        a.get('ships').on("add", function() { ok(true); });
        a.get('ships').get(1).on("change", function() { ok(true); });
        a.get('ships').on("remove", function() { ok(true); });

        var oldCollection = a.get('ships');
        a.set({ships: [{id: 1, key: 'value'}, {id: 2}]});

        strictEqual(oldCollection, a.get('ships'));
        deepEqual([1, 2], a.get('ships').map(function(s) { return s.id; }));
        a.get('ships').off();
        a.get('ships').get(1).off();

        delete Ship;
        delete ShipCollection;
    });

    test("#set(hasManyRelation, data) updates the current collection and doesn't create a new one", function() {
      Ship = Viking.Model.extend({});
      ShipCollection = Viking.Collection.extend({ model: Ship });
      Fleet = Viking.Model.extend({ hasMany: ['ships']});

      var f = new Fleet();
      var s = new Ship();

      f.set({ships: [s]});
      strictEqual(s.collection, f.get('ships'));

      delete Ship;
      delete ShipCollection;
      delete Fleet;
    });
    
    test("#set({type: klass}) initilizes hasMany associations", function() {
        Ship = Viking.Model.extend('ship');
        ShipCollection = Viking.Collection.extend({ model: Ship });
        Account = Viking.Model.extend('account');
        Agent   = Account.extend('agent', { hasMany: ['ships'] });
        
        var account = new Account();
        ok(!(account instanceof Agent));
        account.set({type: 'agent'});
        ok(account instanceof Agent);
        ok(account.get('ships') instanceof ShipCollection);
        
        delete Ship;
        delete ShipCollection;
        delete Account;
        delete Agent;
    });


}());
