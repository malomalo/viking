(function () {
    module("Viking.Model#set - coercions");

    test("#set(key, val) does coercions", function() {
        Model = Viking.Model.extend({ coercions: {date: 'Date'} });
    
        var a = new Model();
        a.set('date', "2013-04-10T21:24:28+00:00");
        equal(a.get('date').valueOf(), new Date(1365629068000).valueOf());
    
        delete Model;
    });

    test("#set({key, val}) does coercions", function() {
        Model = Viking.Model.extend({ coercions: {date: 'Date'} });
    
        var a = new Model();
        a.set({date: "2013-04-10T21:24:28+00:00"});
        equal(a.get('date').valueOf(), new Date(1365629068000).valueOf());
    
        delete Model;
    });

}());