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
    
}());