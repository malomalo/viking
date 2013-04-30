module("Viking.Model#toJSON - coercions");

// toJSON --------------------------------------------------------------------
test("toJSON for coercions", function() {
    Model = Viking.Model.extend({ coercions: {date: 'Date'} });
        
    var a = new Model({ship: {foo: 'bar'}, date: "2013-04-10T21:24:28+00:00"});
    
    deepEqual(a.toJSON(), {
        ship: {foo: 'bar'},
        date: "2013-04-10T21:24:28.000Z"
    });
    
    delete Model;
});
