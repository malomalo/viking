(function () {
    module("Viking.Model#toJSON - coercions");

    test("toJSON coerces Date", function() {
        Model = Viking.Model.extend({ coercions: {date: 'Date'} });
        
        var a = new Model({ship: {foo: 'bar'}, date: "2013-04-10T21:24:28+00:00"});
    
        deepEqual(a.toJSON(), {
            ship: {foo: 'bar'},
            date: "2013-04-10T21:24:28.000Z"
        });
    
        delete Model;
    });
    
    test("toJSON coerces JSON Viking.Model", function() {
        var Model = Viking.Model.extend({ coercions: {key: 'JSON'} });
        var a = new Model({key: {'this': 'that'}});
        
        deepEqual( {'this': 'that'}, a.get('key').toJSON());
        deepEqual( {key: {'this': 'that'}}, a.toJSON());
    });
    

}());