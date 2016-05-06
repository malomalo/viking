(function () {
    module("Viking.Model::new");

    test("::new sets modelName on the instance", function() {
        var Ship = Viking.Model.extend('ship');
        
        deepEqual((new Ship).modelName, {
            className: 'Ship',
            paramKey:  'ship',
            plural:    'ships',
            routeKey:  'ships',
            singular:  'ship'
        });
    });
    
    test("::new sets associations on the instance as a refernce to the associations on the Class", function() {
        Ship = Viking.Model.extend({ hasMany: [['ships', {collection: 'MyCollection'}]] });
        MyCollection = Viking.Collection.extend();
        
        var myship = new Ship();
        strictEqual(myship.associations, Ship.associations);
        
        delete MyCollection;
        delete Ship;
    });
    
    test("::new(attrs) does coercions", function() {
        Model = Viking.Model.extend({ schema: {
            date: {type: 'date'}
        } });
    
        var a = new Model({'date': "2013-04-10T21:24:28+00:00"});
        equal(a.get('date').valueOf(), new Date(1365629068000).valueOf());
    
        delete Model;
    });
    
    test("::new(attrs) coerces hasMany relations", function() {
        Ship = Viking.Model.extend({ hasMany: ['ships'] });
        ShipCollection = Viking.Collection.extend({ model: Ship });
    
        var a = new Ship({ships: [{}, {}]});
        ok(a.get('ships') instanceof ShipCollection);
        equal(a.get('ships').length, 2);
        ok(a.get('ships').first() instanceof Ship);
    
        delete Ship;
        delete ShipCollection;
    });

    test("::new(attrs) coerces belongsTo relations", function() {
        Ship = Viking.Model.extend({ belongsTo: ['ship'] });
        
        var a = new Ship({'ship': {}});
        ok(a.get('ship') instanceof Ship);
    
        delete Ship;
    });

    test("::new(attrs) sets hasMany relations to an empty collection if not in attrs", function() {
        Ship = Viking.Model.extend('ship', { hasMany: ['ships'] });
        ShipCollection = Viking.Collection.extend({ model: Ship });
    
        var a = new Ship();
        ok(a.get('ships') instanceof ShipCollection);
        equal(a.get('ships').length, 0);
    
        delete Ship;
        delete ShipCollection;
    });
    
    // STI
    test("::new(attrs) on subtype sets the type to the submodel type", function() {
        Account = Viking.Model.extend('account');
        Agent = Account.extend('agent');
        
        var agent = new Agent();
        equal('Agent', agent.get('type'));
        
        delete Account;
        delete Agent;
    });
    
    test("::new(attrs) on model sets the type if there are submodels", function() {
        Account = Viking.Model.extend('account');
        Agent = Account.extend('agent');
        
        var account = new Account();
        equal('Account', account.get('type'));
        
        delete Account;
        delete Agent;
    });
    
    test("::new(attrs) with type set to a sub-type returns subtype", function() {
        Account = Viking.Model.extend('account');
        Agent = Account.extend('agent');
        
        var agent = new Account({type: 'agent'});
        ok(agent instanceof Agent);
        ok(agent instanceof Account);
        
        delete Account;
        delete Agent;
    });
    
    test("::new() with default type", function() {
        Account = Viking.Model.extend('account', {
            defaults: {
                type: 'agent'
            }
        });
        Agent = Account.extend('agent');
        
        var agent = new Account();
        ok(agent instanceof Agent);
        
        delete Account;
        delete Agent;
    });
    
}());