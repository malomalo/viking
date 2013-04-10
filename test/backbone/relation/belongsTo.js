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