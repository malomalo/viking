module("Backbone.Relation - coercions");

// setting attributes on a model coerces attributes
test("Using model.set(key, val) does coercions", function() {
    Model = Backbone.Model.extend({
        coercions: {date: 'Date'}
    });
    
    var a = new Model();
    a.set('date', "2013-04-10T21:24:28+00:00");
    equal(a.get('date').valueOf(), new Date(1365629068000).valueOf());
    
    delete Model;
});

test("Using model.set({key, val}) does coercions", function() {
    Model = Backbone.Model.extend({
        coercions: {date: 'Date'}
    });
    
    var a = new Model();
    a.set({date: "2013-04-10T21:24:28+00:00"});
    equal(a.get('date').valueOf(), new Date(1365629068000).valueOf());
    
    delete Model;
});

test("Using new Model(attrs) does coercions", function() {
    Model = Backbone.Model.extend({
        coercions: {date: 'Date'}
    });
    
    var a = new Model({'date': "2013-04-10T21:24:28+00:00"});
    equal(a.get('date').valueOf(), new Date(1365629068000).valueOf());
    
    delete Model;
});

// coerceAttributes modifies the object passed in ----------------------------
test("coerceAttributes modifies the object passed in", function() {
    Model = Backbone.Model.extend({
        coercions: {date: 'Date'}
    });    
    var a = new Model();
    var attrs = {date: "2013-04-10T21:24:28+00:00"};
    a.coerceAttributes(attrs);
    
    deepEqual(attrs, {date: new Date(1365629068000)});
    equal(attrs.date.valueOf(), (new Date(1365629068000)).valueOf());
    
    delete Model;
});

// coercions and unsupported data type ---------------------------------------
test("coerceAttributes() thows error when can't coerce value", function() {
    expect(2);

    Model = Backbone.Model.extend({
        coercions: {date: 'Unkown'}
    });
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
test("coerceAttributes() coerces iso8601 string to date", function() {
    Model = Backbone.Model.extend({
        coercions: {date: 'Date'}
    });    
    var a = new Model();
    
    deepEqual(
        a.coerceAttributes({date: "2013-04-10T21:24:28+00:00"}),
        {date: new Date(1365629068000)}
    );
    equal(a.coerceAttributes({date: "2013-04-10T21:24:28+00:00"}).date.valueOf(), (new Date(1365629068000)).valueOf());
    
    delete Model;
});

test("coerceAttributes() coerces int(milliseconds since epoch) to date", function() {
    Model = Backbone.Model.extend({
        coercions: {date: 'Date'}
    });
    var a = new Model();
    
    deepEqual(
        a.coerceAttributes({date: 1365629126097}),
        {date: new Date(1365629126097)}
    );
    equal(a.coerceAttributes({date: 1365629126097}).date.valueOf(), (new Date(1365629126097)).valueOf());
    
    delete Model;
});

test("coerceAttributes() thows error when can't coerce value", function() {
    expect(2);
    
    Model = Backbone.Model.extend({
        coercions: {date: 'Date'}
    });
    var a = new Model();
    
    throws(function() { a.coerceAttributes({date: true}) }, TypeError);
    
    try {
        a.coerceAttributes({date: true})
    } catch (e) {
        equal(e.message, "boolean can't be coerced into Date");
    }
    
    delete Model;
});

// toJSON --------------------------------------------------------------------
test("toJSON for coercions", function() {
    Model = Backbone.Model.extend({
        coercions: {date: 'Date'}
    });
        
    var a = new Model({ship: {foo: 'bar'}, date: "2013-04-10T21:24:28+00:00"});
    
    deepEqual(a.toJSON(), {
        ship: {foo: 'bar'},
        date: "2013-04-10T21:24:28.000Z"
    });
    
    delete Model;
});