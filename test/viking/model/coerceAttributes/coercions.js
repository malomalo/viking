module("Viking.Model#coerceAttributes - coercions");

// coerceAttributes modifies the object passed in ----------------------------
test("#coerceAttributes modifies the object passed in", function() {
    Model = Viking.Model.extend({ coercions: {date: 'Date'} });
    var a = new Model();
    var attrs = {date: "2013-04-10T21:24:28+00:00"};
    a.coerceAttributes(attrs);
    
    deepEqual(attrs, {date: new Date(1365629068000)});
    equal(attrs.date.valueOf(), (new Date(1365629068000)).valueOf());
    
    delete Model;
});

// coercions and unsupported data type ---------------------------------------
test("#coerceAttributes thows error when can't coerce value", function() {
    expect(2);

    Model = Viking.Model.extend({ coercions: {date: 'Unkown'} });
    var a = new Model();

    throws(function() { a.coerceAttributes({date: true}) }, TypeError);

    try {
        a.coerceAttributes({date: true})
    } catch (e) {
        equal(e.message, "Coercion of Unkown unsupported");
    }

    delete Model;
});

// coercing dates ------------------------------------------------------------
test("#coerceAttributes coerces iso8601 string to date", function() {
    Model = Viking.Model.extend({ coercions: {date: 'Date'} });
    var a = new Model();
    
    deepEqual(
        a.coerceAttributes({date: "2013-04-10T21:24:28+00:00"}),
        {date: new Date(1365629068000)}
    );
    equal(a.coerceAttributes({date: "2013-04-10T21:24:28+00:00"}).date.valueOf(), (new Date(1365629068000)).valueOf());
    
    delete Model;
});

test("#coerceAttributes coerces int(milliseconds since epoch) to date", function() {
    Model = Viking.Model.extend({ coercions: {date: 'Date'} });
    var a = new Model();
    
    deepEqual(
        a.coerceAttributes({date: 1365629126097}),
        {date: new Date(1365629126097)}
    );
    equal(a.coerceAttributes({date: 1365629126097}).date.valueOf(), (new Date(1365629126097)).valueOf());
    
    delete Model;
});

test("#coerceAttributes thows error when can't coerce value", function() {
    expect(2);
    
    Model = Viking.Model.extend({ coercions: {date: 'Date'} });
    var a = new Model();
    
    throws(function() { a.coerceAttributes({date: true}) }, TypeError);
    
    try {
        a.coerceAttributes({date: true})
    } catch (e) {
        equal(e.message, "boolean can't be coerced into Date");
    }
    
    delete Model;
});