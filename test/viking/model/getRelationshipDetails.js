module("Viking.Model::getRelationshipDetails");

// getRelationshipDetails ----------------------------------------------------
test("::getRelationshipDetails accepts `type, key, options` style arguments", function() {
    Ship = Backbone.Model.extend();
    
    deepEqual(
        Viking.Model.getRelationshipDetails('belongsTo', 'model', {model: 'Ship'}),
        {key: 'model', type: Ship}
    );
    
    delete Ship;
});

test("::getRelationshipDetails accepts `type, [key, options]` style arguments", function() {
    Ship = Backbone.Model.extend();
    
    deepEqual(
        Viking.Model.getRelationshipDetails('belongsTo', ['model', {model: 'Ship'}]),
        {key: 'model', type: Ship}
    );
    
    delete Ship;
});