(function () {
    module("Viking.Model#set");

    test("#set({type: klass}) changes the object prototype of klass", function() {
        Account = Viking.Model.extend('account');
        Agent   = Account.extend('agent');
        
        var account = new Account();
        ok(!(account instanceof Agent));
        account.set({type: 'agent'});
        
        ok(account instanceof Agent);
        
        delete Account;
        delete Agent;
    });

    test("#set({type: klass}) changes the modelName on instance to modelName of klass", function() {
        Account = Viking.Model.extend('account');
        Agent   = Account.extend('agent');
        
        var account = new Account();
        ok(!(account instanceof Agent));
        account.set({type: 'agent'});
        
        strictEqual(Agent.modelName, account.modelName);
        strictEqual('agent', account.modelName);
        
        delete Account;
        delete Agent;
    });
    
    test("::set({type: string}) doesn't change the object prototype when inheritanceAttribute set to false", function() {
        var Ship = Viking.Model.extend('ship', {
            inheritanceAttribute: false
        });
        var Battleship = Ship.extend('battleship', {});
        
        var bship = new Battleship();
        bship.set({type: 'ship'});
        
        strictEqual(Battleship, bship.baseModel);
    });

    test("#set({type: klass}) doesn't change the modelName on instance to modelName of klass when inheritanceAttribute set to false", function() {
        var Ship = Viking.Model.extend('ship', {
            inheritanceAttribute: false
        });
        var Battleship = Ship.extend('battleship', {});
        
        var bship = new Battleship();
        bship.set({type: 'ship'});
        
        strictEqual(Battleship.modelName, bship.modelName);
    });
    
}());
