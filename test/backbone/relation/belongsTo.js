module("Backbone.Relation - belongsTo");

// getRelationshipDetails ----------------------------------------------------
test("getRelationshipDetails() for belongsTo 'model'", function() {
    Model = Backbone.Model.extend();
    
    deepEqual(
        Backbone.Model.getRelationshipDetails('belongsTo', 'model'),
        {key: 'model', type: Model}
    );
    
    delete Model;
});

test("getRelationshipDetails() for belongsTo ['carriers', {model: 'Ship'}]", function() {
    Ship = Backbone.Model.extend();

    deepEqual(
        Backbone.Model.getRelationshipDetails('belongsTo', 'carrier', {model: 'Ship'}),
        {key: 'carrier', type: Ship}
    );
    
    delete Ship;
});

test("coerceAttributes() initializes belongsTo relation with hash", function() {
    Ship = Backbone.Model.extend({
        belongsTo: ['ship']
    });
    var a = new Ship();

    var result = a.coerceAttributes({ship: {key: 'value'}});
    ok(result.ship instanceof Ship);
    deepEqual(result.ship.attributes, {key: 'value'});
    
    delete Ship;
});

test("coerceAttributes() initializes belongsTo relation with instance of model", function() {
    Ship = Backbone.Model.extend({
        belongsTo: ['ship']
    });
    var a = new Ship();
    var b = new Ship({key: 'value'});

    var result = a.coerceAttributes({ship: b});
    ok(result.ship === b);
        
    delete Ship;
});

// setting attributes on a model coerces relations
test("Using model.set(key, val) coerces belongsTo relations", function() {
    Ship = Backbone.Model.extend({
        belongsTo: ['ship']
    });
        
    var a = new Ship();
    a.set('ship', {});
    ok(a.get('ship') instanceof Ship);
    
    delete Ship;
});

test("Using model.set({key, val}) coerces belongsTo relations", function() {
    Ship = Backbone.Model.extend({
        belongsTo: ['ship']
    });
    
    var a = new Ship();
    a.set({ship: {}});
    ok(a.get('ship') instanceof Ship);
    
    delete Ship;
});

test("Using new Model(attrs) coerces belongsTo relations", function() {
    Ship = Backbone.Model.extend({
        belongsTo: ['ship']
    });
        
    var a = new Ship({'ship': {}});
    ok(a.get('ship') instanceof Ship);
    
    delete Ship;
});

// toJSON --------------------------------------------------------------------
test("#toJSON for belongsTo relation", function() {
    Ship = Backbone.Model.extend({
        belongsTo: ['ship']
    });
        
    var a = new Ship({'ship': {foo: 'bar'}, bat: 'baz'});
    
    deepEqual(a.toJSON(), {
        bat: 'baz',
        ship_attributes: {foo: 'bar'}
    });
    
    delete Ship;
});

test('#toJSON sets relation attributes to null if relation is null', function() {
    Ship = Backbone.Model.extend({
        belongsTo: ['ship']
    });
        
    var a = new Ship({'ship': null, bat: 'baz'});
    
    deepEqual(a.toJSON(), {
        bat: 'baz',
        ship_attributes: null
    });
    
    delete Ship;
});

test("#toJSON doesn't sets relation attributes to null if relation is falsely and not null", function() {
    Ship = Backbone.Model.extend({
        belongsTo: ['ship']
    });
        
    var a = new Ship({'ship': null, bat: 'baz'});
    
    deepEqual(a.toJSON(), {
        bat: 'baz',
        ship_attributes: null
    });
    
    delete Ship;
});