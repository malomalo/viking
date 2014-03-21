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
    
}());
