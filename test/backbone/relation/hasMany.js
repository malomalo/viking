module("Backbone.Relation - hasMany");

// getRelationshipDetails ----------------------------------------------------
test("getRelationshipDetails() for hasMany 'models'", function() {
    ModelCollection = Backbone.Collection.extend();
    
    deepEqual(
        Backbone.Model.getRelationshipDetails('hasMany', 'models'),
        {key: 'models', type: ModelCollection}
    );
    
    delete ModelCollection;
});

test("getRelationshipDetails() for hasMany ['carriers', {model: 'Ship'}]", function() {
    Ship = Backbone.Model.extend();
    ShipCollection = Backbone.Collection.extend({model: Ship});
    
    deepEqual(
        Backbone.Model.getRelationshipDetails('hasMany', 'carriers', {model: 'Ship'}),
        {key: 'carriers', type: ShipCollection}
    );
    
    delete Ship;
    delete ShipCollection;
});

test("getRelationshipDetails() for hasMany ['carriers', {collection: 'ShipCollection'}]", function() {
    Ship = Backbone.Model.extend();
    ShipCollection = Backbone.Collection.extend({model: Ship});
    
    deepEqual(
        Backbone.Model.getRelationshipDetails('hasMany', 'carriers', {collection: 'ShipCollection'}),
        {key: 'carriers', type: ShipCollection}
    );
    
    delete Ship;
    delete ShipCollection;
});

test("coerceAttributes() initializes hasMany relation with array of hashes", function() {
    Ship = Backbone.Model.extend({
        hasMany: ['ships']
    });
    ShipCollection = Backbone.Collection.extend({
        model: Ship
    });
    
    var a = new Ship();

    var result = a.coerceAttributes({ships: [{key: 'foo'},{key: 'bar'}]});
    ok(result.ships instanceof ShipCollection);
    ok(result.ships.models[0] instanceof Ship);
    ok(result.ships.models[1] instanceof Ship);
    equal(result.ships.models[0].attributes.key, 'foo');
    ok(result.ships.models[0].attributes.ships instanceof ShipCollection);
    equal(result.ships.models[1].attributes.key, 'bar');
    ok(result.ships.models[1].attributes.ships instanceof ShipCollection);
    
    delete Ship;
    delete ShipCollection;
});

test("coerceAttributes() initializes hasMany relation with array of models", function() {
    Ship = Backbone.Model.extend({
        hasMany: ['ships']
    });
    ShipCollection = Backbone.Collection.extend({
        model: Ship
    });
    
    var a = new Ship();
    var models = [new Ship({key: 'foo'}), new Ship({key: 'bar'})];
    

    var result = a.coerceAttributes({ships: models});
    ok(result.ships instanceof ShipCollection);
    ok(result.ships.models[0] === models[0]);
    ok(result.ships.models[1] === models[1]);
    
    delete Ship;
    delete ShipCollection;
});

test("coerceAttributes() initializes hasMany relations with empty collection if not passed in attrs", function() {
    Ship = Backbone.Model.extend({
        hasMany: ['ships']
    });
    ShipCollection = Backbone.Collection.extend({
        model: Ship
    });
    
    var a = new Ship();

    var result = a.coerceAttributes({});
    ok(result.ships instanceof ShipCollection);
    equal(result.ships.length, 0);
    
    delete Ship;
    delete ShipCollection;
});

// setting attributes on a model coerces relations
test("Using model.set(key, val) coerces hasMany relations", function() {
    Ship = Backbone.Model.extend({
        hasMany: ['ships']
    });
    ShipCollection = Backbone.Collection.extend({
        model: Ship
    });
    
    var a = new Ship();
    a.set('ships', [{}, {}]);
    ok(a.get('ships') instanceof ShipCollection);
    equal(a.get('ships').length, 2);
    ok(a.get('ships').first() instanceof Ship);
    
    delete Ship;
    delete ShipCollection;
});

test("Using model.set({key, val}) coerces hasMany relations", function() {
    Ship = Backbone.Model.extend({
        hasMany: ['ships']
    });
    ShipCollection = Backbone.Collection.extend({
        model: Ship
    });
    
    var a = new Ship();
    a.set({ships: [{}, {}]});
    ok(a.get('ships') instanceof ShipCollection);
    equal(a.get('ships').length, 2);
    ok(a.get('ships').first() instanceof Ship);
    
    delete Ship;
    delete ShipCollection;
});

test("Using new Model(attrs) coerces hasMany relations", function() {
    Ship = Backbone.Model.extend({
        hasMany: ['ships']
    });
    ShipCollection = Backbone.Collection.extend({
        model: Ship
    });
    
    var a = new Ship({ships: [{}, {}]});
    ok(a.get('ships') instanceof ShipCollection);
    equal(a.get('ships').length, 2);
    ok(a.get('ships').first() instanceof Ship);
    
    delete Ship;
    delete ShipCollection;
});

test("If new Model(attrs) does not set hasMany relation, it is set to an empty collection", function() {
    Ship = Backbone.Model.extend({
        hasMany: ['ships']
    });
    ShipCollection = Backbone.Collection.extend({
        model: Ship
    });
    
    var a = new Ship();
    ok(a.get('ships') instanceof ShipCollection);
    equal(a.get('ships').length, 0);
    
    delete Ship;
    delete ShipCollection;
});

// toJSON --------------------------------------------------------------------
test("toJSON for hasMany relation", function() {
    Ship = Backbone.Model.extend({
        hasMany: ['ships']
    });
    ShipCollection = Backbone.Collection.extend({
        model: Ship
    });
        
    var a = new Ship({'ships': [{foo: 'bar'}], bat: 'baz'});
    
    deepEqual(a.toJSON(), {
        bat: 'baz',
        ships_attributes: [{
            foo: 'bar',
            ships_attributes: []
        }]
    });
    
    delete Ship;
    delete ShipCollection;
});