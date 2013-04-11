module("Backbone.Relation");

// getRelationshipDetails ----------------------------------------------------
test("getRelationshipDetails() accepts `type, key, options` style arguments", function() {
    Ship = Backbone.Model.extend();
    
    deepEqual(
        Backbone.Model.getRelationshipDetails('belongsTo', 'model', {model: 'Ship'}),
        {key: 'model', type: Ship}
    );
    
    delete Ship;
});

test("getRelationshipDetails() accepts `type, [key, options]` style arguments", function() {
    Ship = Backbone.Model.extend();
    
    deepEqual(
        Backbone.Model.getRelationshipDetails('belongsTo', ['model', {model: 'Ship'}]),
        {key: 'model', type: Ship}
    );
    
    delete Ship;
});